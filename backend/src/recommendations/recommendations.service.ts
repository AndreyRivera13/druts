import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';

/**
 * Recomendaciones basadas en filtrado colaborativo:
 * "Clientes que compraron X también compraron Y"
 * + Recomendaciones por historial del usuario
 * + Productos similares por categoría/marca
 */
@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private productsService: ProductsService,
  ) {}

  // Filtrado colaborativo: co-compras frecuentes
  async getFrequentlyBoughtTogether(productId: string, limit = 6): Promise<Product[]> {
    // Obtener órdenes que contienen este producto
    const ordersWithProduct = await this.itemRepo
      .createQueryBuilder('oi')
      .select('oi.order_id', 'orderId')
      .where('oi.product_id = :productId', { productId })
      .getRawMany();

    if (!ordersWithProduct.length) return this.getPopularProducts(limit);

    const orderIds = ordersWithProduct.map(o => o.orderId);

    // Obtener los demás productos comprados en esas órdenes
    const coProducts = await this.itemRepo
      .createQueryBuilder('oi')
      .select('oi.product_id', 'productId')
      .addSelect('COUNT(*)', 'count')
      .where('oi.order_id IN (:...orderIds)', { orderIds })
      .andWhere('oi.product_id != :productId', { productId })
      .groupBy('oi.product_id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    if (!coProducts.length) return this.getPopularProducts(limit);

    const ids = coProducts.map(p => p.productId);
    const products = await Promise.all(ids.map(id =>
      this.productsService.findOne(id).catch(() => null),
    ));
    return products.filter(Boolean);
  }

  // Recomendaciones por historial del usuario
  async getPersonalized(userId: string, limit = 8): Promise<Product[]> {
    const userOrders = await this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.product.category', 'items.product.brand'],
      take: 10,
      order: { createdAt: 'DESC' },
    });

    if (!userOrders.length) return this.getPopularProducts(limit);

    // Extraer categorías y marcas favoritas
    const categoryCount: Record<string, number> = {};
    const brandCount: Record<string, number> = {};
    const boughtProductIds = new Set<string>();

    for (const order of userOrders) {
      for (const item of order.items) {
        boughtProductIds.add(item.product?.id);
        const catId = item.product?.category?.id;
        const brandId = item.product?.brand?.id;
        if (catId) categoryCount[catId] = (categoryCount[catId] || 0) + 1;
        if (brandId) brandCount[brandId] = (brandCount[brandId] || 0) + 1;
      }
    }

    // Categoría y marca más compradas
    const topCategoryId = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topBrandId = Object.entries(brandCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    const result = await this.productsService.findAll({
      categoryId: topCategoryId,
      brandId: topBrandId,
      page: 1,
      limit: limit + boughtProductIds.size,
    });

    return result.data
      .filter(p => !boughtProductIds.has(p.id))
      .slice(0, limit);
  }

  // Similares por categoría
  async getSimilar(productId: string, limit = 6): Promise<Product[]> {
    const product = await this.productsService.findOne(productId);
    const result = await this.productsService.findAll({
      categoryId: product.category?.id,
      page: 1,
      limit: limit + 1,
    });
    return result.data.filter(p => p.id !== productId).slice(0, limit);
  }

  private async getPopularProducts(limit: number): Promise<Product[]> {
    return this.productsService.getBestSellers(limit);
  }

  // Estadísticas de recomendaciones para el panel admin
  async getInsights() {
    const topCoProducts = await this.itemRepo
      .createQueryBuilder('oi')
      .select('oi.product_id', 'productId')
      .addSelect('COUNT(*)', 'purchaseCount')
      .groupBy('oi.product_id')
      .orderBy('purchaseCount', 'DESC')
      .limit(10)
      .getRawMany();

    return { topProducts: topCoProducts };
  }
}
