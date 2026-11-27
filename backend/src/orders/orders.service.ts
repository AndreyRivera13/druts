import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserRole } from '../users/entities/user.entity';

export type OrderRequester = { userId: string; role: string };

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private couponsService: CouponsService,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const variantRepo = manager.getRepository(ProductVariant);
      const productRepo = manager.getRepository(Product);
      const orderRepo = manager.getRepository(Order);

      const needed = new Map<string, { productId: string; quantity: number }>();
      for (const item of dto.items) {
        const prev = needed.get(item.variantId);
        if (prev) {
          if (prev.productId !== item.productId) {
            throw new BadRequestException(
              `La variante ${item.variantId} no corresponde al producto indicado`,
            );
          }
          prev.quantity += item.quantity;
        } else {
          needed.set(item.variantId, { productId: item.productId, quantity: item.quantity });
        }
      }

      const locked = new Map<string, { variant: ProductVariant; product: Product }>();
      for (const variantId of [...needed.keys()].sort()) {
        const variant = await variantRepo.findOne({
          where: { id: variantId },
          lock: { mode: 'pessimistic_write' },
          relations: ['product', 'product.images'],
        });
        if (!variant) {
          throw new BadRequestException(`Variante no encontrada: ${variantId}`);
        }

        const { productId, quantity } = needed.get(variantId);
        const product = variant.product
          ?? await productRepo.findOne({ where: { id: productId }, relations: ['images'] });
        if (!product || product.id !== productId) {
          throw new BadRequestException(`Variante no encontrada: ${variantId}`);
        }
        if (variant.stock < quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name} talla ${variant.size}`,
          );
        }
        locked.set(variantId, { variant, product });
      }

      let subtotal = 0;
      const items: Partial<OrderItem>[] = [];

      for (const itemDto of dto.items) {
        const { variant, product } = locked.get(itemDto.variantId);
        const unitPrice = Number(product.currentPrice) + Number(variant.priceAdjustment || 0);
        const lineSubtotal = unitPrice * itemDto.quantity;
        subtotal += lineSubtotal;

        items.push({
          product,
          variant,
          productName: product.name,
          size: variant.size,
          color: variant.color,
          quantity: itemDto.quantity,
          unitPrice,
          subtotal: lineSubtotal,
          productImageUrl: product.images?.find((i) => i.isPrimary)?.url,
        });
      }

      let discount = 0;
      let coupon = null;
      if (dto.couponCode) {
        const couponData = await this.couponsService.validate(dto.couponCode, subtotal, manager);
        discount = couponData.discountAmount;
        coupon = couponData.coupon;
      }

      const shippingCost = subtotal >= 200000 ? 0 : 12000;
      const total = subtotal - discount + shippingCost;
      const orderNumber = `CAL-${Date.now().toString(36).toUpperCase()}`;

      const order = orderRepo.create({
        orderNumber,
        user: { id: userId },
        items: items as OrderItem[],
        coupon,
        paymentMethod: dto.paymentMethod as PaymentMethod,
        subtotal,
        discount,
        shippingCost,
        total,
        shippingAddress: dto.shippingAddress,
        shippingCity: dto.shippingCity,
        shippingPhone: dto.shippingPhone,
        shippingRecipient: dto.shippingRecipient,
        notes: dto.notes,
      });

      const saved = await orderRepo.save(order);

      for (const [variantId, { quantity }] of needed) {
        const { variant } = locked.get(variantId);
        variant.stock -= quantity;
        await variantRepo.save(variant);
      }

      if (coupon) await this.couponsService.incrementUsage(coupon.id, manager);

      return saved;
    });
  }

  async findAll(page = 1, limit = 20, status?: OrderStatus) {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { user: { id: userId } },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string, requester: OrderRequester): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'coupon'],
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    const isOwner = order.user?.id === requester.userId;
    const isAdmin = requester.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para ver este pedido');
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus, trackingCode: string | undefined, requester: OrderRequester): Promise<Order> {
    const order = await this.findOne(id, requester);
    order.status = status;
    if (trackingCode) order.trackingCode = trackingCode;
    if (status === OrderStatus.DELIVERED) order.deliveredAt = new Date();
    return this.orderRepo.save(order);
  }

  async getSalesSummary(startDate: Date, endDate: Date) {
    const orders = await this.orderRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: OrderStatus.DELIVERED,
      },
    });

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
      avgOrderValue: orders.length
        ? orders.reduce((sum, o) => sum + Number(o.total), 0) / orders.length
        : 0,
    };
  }

  async getDailySales(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.orderRepo
      .createQueryBuilder('o')
      .select("DATE(o.createdAt) as date")
      .addSelect('COUNT(*) as orders')
      .addSelect('SUM(o.total) as revenue')
      .where('o.createdAt >= :since', { since })
      .andWhere('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('DATE(o.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }
}
