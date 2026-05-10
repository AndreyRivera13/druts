import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    private productsService: ProductsService,
    private couponsService: CouponsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    let subtotal = 0;
    const items: Partial<OrderItem>[] = [];

    for (const itemDto of dto.items) {
      const product = await this.productsService.findOne(itemDto.productId);
      const variant = product.variants.find(v => v.id === itemDto.variantId);
      if (!variant) throw new BadRequestException(`Variante no encontrada: ${itemDto.variantId}`);
      if (variant.stock < itemDto.quantity) {
        throw new BadRequestException(`Stock insuficiente para ${product.name} talla ${variant.size}`);
      }

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
        productImageUrl: product.images?.find(i => i.isPrimary)?.url,
      });
    }

    let discount = 0;
    let coupon = null;
    if (dto.couponCode) {
      const couponData = await this.couponsService.validate(dto.couponCode, subtotal);
      discount = couponData.discountAmount;
      coupon = couponData.coupon;
    }

    const shippingCost = subtotal >= 200000 ? 0 : 12000;
    const total = subtotal - discount + shippingCost;
    const orderNumber = `CAL-${Date.now().toString(36).toUpperCase()}`;

    const order = this.orderRepo.create({
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

    const saved = await this.orderRepo.save(order);

    // Descontar stock
    for (const itemDto of dto.items) {
      await this.productsService.updateVariantStock(
        itemDto.variantId,
        (await this.productsService.findOne(itemDto.productId))
          .variants.find(v => v.id === itemDto.variantId).stock - itemDto.quantity,
      );
    }

    if (coupon) await this.couponsService.incrementUsage(coupon.id);

    return saved;
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

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'coupon'],
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus, trackingCode?: string): Promise<Order> {
    const order = await this.findOne(id);
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
