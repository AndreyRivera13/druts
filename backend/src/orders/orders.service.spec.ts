import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { OrdersService } from './orders.service';
import { Order, PaymentMethod } from './entities/order.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';

describe('OrdersService.findOne (IDOR)', () => {
  let service: OrdersService;
  const orderRepo = { findOne: jest.fn(), findAndCount: jest.fn(), save: jest.fn() };
  const itemRepo = {};
  const couponsService = { validate: jest.fn(), incrementUsage: jest.fn() };
  const dataSource = { transaction: jest.fn() };

  const owner = Object.assign(new User(), {
    id: 'owner-id',
    email: 'owner@druts.co',
    password: '$2b$10$hash-del-dueño',
    role: UserRole.CUSTOMER,
  });

  const order = Object.assign(new Order(), {
    id: 'order-1',
    orderNumber: 'CAL-ABC',
    user: owner,
    items: [],
  });

  beforeEach(() => {
    orderRepo.findOne.mockReset();
    service = new OrdersService(
      orderRepo as any,
      couponsService as any,
      dataSource as any,
    );
  });

  it('permite al dueño ver su pedido', async () => {
    orderRepo.findOne.mockResolvedValue(order);
    const result = await service.findOne('order-1', { userId: 'owner-id', role: 'customer' });
    expect(result.id).toBe('order-1');
  });

  it('permite a un admin ver cualquier pedido', async () => {
    orderRepo.findOne.mockResolvedValue(order);
    const result = await service.findOne('order-1', { userId: 'admin-id', role: 'admin' });
    expect(result.id).toBe('order-1');
  });

  it('bloquea a otro usuario (IDOR)', async () => {
    orderRepo.findOne.mockResolvedValue(order);
    await expect(
      service.findOne('order-1', { userId: 'intruso-id', role: 'customer' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lanza NotFound si el pedido no existe', async () => {
    orderRepo.findOne.mockResolvedValue(null);
    await expect(
      service.findOne('missing', { userId: 'owner-id', role: 'customer' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no expone el hash de contraseña del usuario al serializar el pedido', () => {
    const plain = instanceToPlain(order) as any;
    expect(plain.user.password).toBeUndefined();
    expect(plain.user.email).toBe('owner@druts.co');
  });
});

describe('OrdersService.create (stock transaccional)', () => {
  let service: OrdersService;
  let variant: ProductVariant;
  let product: Product;
  let savedVariantStock: number;
  const couponsService = { validate: jest.fn(), incrementUsage: jest.fn() };

  function setup(stock: number) {
    product = Object.assign(new Product(), {
      id: 'prod-1',
      name: 'Tenis',
      price: 100000,
      salePrice: null,
      images: [{ url: '/img.png', isPrimary: true }],
    });
    variant = Object.assign(new ProductVariant(), {
      id: 'var-1',
      size: '42',
      color: 'Negro',
      stock,
      priceAdjustment: 0,
      product,
    });
    savedVariantStock = stock;

    const variantRepo = {
      findOne: jest.fn().mockResolvedValue(variant),
      save: jest.fn(async (v: ProductVariant) => {
        savedVariantStock = v.stock;
        return v;
      }),
    };
    const productRepo = {
      findOne: jest.fn().mockResolvedValue(product),
    };
    const orderRepo = {
      create: jest.fn((data) => Object.assign(new Order(), data, { id: 'new-order' })),
      save: jest.fn(async (order: Order) => order),
    };
    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === ProductVariant) return variantRepo;
        if (entity === Product) return productRepo;
        if (entity === Order) return orderRepo;
        throw new Error(`repositorio inesperado: ${entity?.name}`);
      }),
    };
    const dataSource = {
      transaction: jest.fn(async (cb) => cb(manager)),
    };

    service = new OrdersService({} as any, couponsService as any, dataSource as any);
    return { variantRepo, orderRepo, manager, dataSource };
  }

  const dto = {
    items: [{ productId: 'prod-1', variantId: 'var-1', quantity: 2 }],
    paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
    shippingAddress: 'Calle 1',
    shippingCity: 'Cúcuta',
    shippingPhone: '3001112233',
    shippingRecipient: 'Ana',
  };

  it('descuenta el stock dentro de la transacción con bloqueo pesimista', async () => {
    const { variantRepo, dataSource } = setup(5);

    const saved = await service.create('user-1', dto);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(variantRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'var-1' },
        lock: { mode: 'pessimistic_write' },
      }),
    );
    expect(savedVariantStock).toBe(3);
    expect(saved.id).toBe('new-order');
    expect(saved.total).toBe(200000); // envío gratis a partir de 200000
  });

  it('rechaza la compra si no hay stock suficiente y no descuenta', async () => {
    const { variantRepo } = setup(1);

    await expect(service.create('user-1', dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(variantRepo.save).not.toHaveBeenCalled();
    expect(savedVariantStock).toBe(1);
  });

  it('agrupa cantidades del mismo variante antes de validar stock', async () => {
    setup(3);
    const sameVariantTwice = {
      ...dto,
      items: [
        { productId: 'prod-1', variantId: 'var-1', quantity: 2 },
        { productId: 'prod-1', variantId: 'var-1', quantity: 2 },
      ],
    };
    await expect(service.create('user-1', sameVariantTwice)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(savedVariantStock).toBe(3);
  });
});
