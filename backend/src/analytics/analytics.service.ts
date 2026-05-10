import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getDashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalOrders, todayOrders, monthOrders, lastMonthOrders,
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalProducts, totalUsers, pendingOrders,
    ] = await Promise.all([
      this.orderRepo.count(),
      this.orderRepo.count({ where: { createdAt: Between(today, new Date()) } }),
      this.orderRepo.count({ where: { createdAt: Between(thisMonth, new Date()) } }),
      this.orderRepo.count({ where: { createdAt: Between(lastMonth, lastMonthEnd) } }),
      this.orderRepo.createQueryBuilder('o').select('SUM(o.total)', 'sum')
        .where('o.status != :c', { c: OrderStatus.CANCELLED }).getRawOne(),
      this.orderRepo.createQueryBuilder('o').select('SUM(o.total)', 'sum')
        .where('o.createdAt >= :m', { m: thisMonth })
        .andWhere('o.status != :c', { c: OrderStatus.CANCELLED }).getRawOne(),
      this.orderRepo.createQueryBuilder('o').select('SUM(o.total)', 'sum')
        .where('o.createdAt BETWEEN :s AND :e', { s: lastMonth, e: lastMonthEnd })
        .andWhere('o.status != :c', { c: OrderStatus.CANCELLED }).getRawOne(),
      this.productRepo.count({ where: { isActive: true } }),
      this.userRepo.count(),
      this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
    ]);

    return {
      orders: { total: totalOrders, today: todayOrders, thisMonth: monthOrders },
      revenue: {
        total: Number(totalRevenue?.sum || 0),
        thisMonth: Number(monthRevenue?.sum || 0),
        lastMonth: Number(lastMonthRevenue?.sum || 0),
        monthGrowth: lastMonthRevenue?.sum
          ? (((monthRevenue?.sum || 0) - (lastMonthRevenue?.sum || 0)) / (lastMonthRevenue?.sum || 1)) * 100
          : 0,
      },
      products: totalProducts,
      users: totalUsers,
      pendingOrders,
      monthOrders,
      lastMonthOrders,
      orderGrowth: lastMonthOrders
        ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0,
    };
  }

  async getTopProducts(limit = 10) {
    return this.itemRepo
      .createQueryBuilder('oi')
      .select('oi.product_id', 'productId')
      .addSelect('oi.productName', 'name')
      .addSelect('SUM(oi.quantity)', 'unitsSold')
      .addSelect('SUM(oi.subtotal)', 'revenue')
      .groupBy('oi.product_id')
      .addGroupBy('oi.productName')
      .orderBy('unitsSold', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getSalesByCategory() {
    return this.itemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .innerJoin('p.category', 'cat')
      .select('cat.name', 'category')
      .addSelect('SUM(oi.quantity)', 'unitsSold')
      .addSelect('SUM(oi.subtotal)', 'revenue')
      .groupBy('cat.id')
      .addGroupBy('cat.name')
      .orderBy('revenue', 'DESC')
      .getRawMany();
  }

  async getSalesByBrand() {
    return this.itemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .innerJoin('p.brand', 'brand')
      .select('brand.name', 'brand')
      .addSelect('SUM(oi.quantity)', 'unitsSold')
      .addSelect('SUM(oi.subtotal)', 'revenue')
      .groupBy('brand.id')
      .addGroupBy('brand.name')
      .orderBy('revenue', 'DESC')
      .getRawMany();
  }

  async getMonthlySales(year?: number) {
    const targetYear = year || new Date().getFullYear();
    return this.orderRepo
      .createQueryBuilder('o')
      .select('EXTRACT(MONTH FROM o.createdAt)', 'month')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('SUM(o.total)', 'revenue')
      .where('EXTRACT(YEAR FROM o.createdAt) = :year', { year: targetYear })
      .andWhere('o.status != :c', { c: OrderStatus.CANCELLED })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async getSalesBySize() {
    return this.itemRepo
      .createQueryBuilder('oi')
      .select('oi.size', 'size')
      .addSelect('SUM(oi.quantity)', 'unitsSold')
      .groupBy('oi.size')
      .orderBy('unitsSold', 'DESC')
      .getRawMany();
  }

  async getTopCustomers(limit = 10) {
    return this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.user', 'u')
      .select('u.id', 'userId')
      .addSelect('u.name', 'name')
      .addSelect('u.email', 'email')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('SUM(o.total)', 'totalSpent')
      .groupBy('u.id')
      .addGroupBy('u.name')
      .addGroupBy('u.email')
      .orderBy('totalSpent', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
