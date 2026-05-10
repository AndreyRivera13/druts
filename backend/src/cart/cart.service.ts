import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private repo: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async getCart(userId: string) {
    const items = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['product', 'product.images', 'variant'],
      order: { addedAt: 'ASC' },
    });

    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.product.currentPrice) + Number(item.variant.priceAdjustment || 0);
      return sum + price * item.quantity;
    }, 0);

    return { items, subtotal, itemCount: items.reduce((n, i) => n + i.quantity, 0) };
  }

  async addItem(userId: string, productId: string, variantId: string, quantity = 1) {
    const product = await this.productsService.findOne(productId);
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) throw new NotFoundException('Variante no encontrada');
    if (variant.stock < quantity) throw new BadRequestException('Stock insuficiente');

    const existing = await this.repo.findOne({
      where: { user: { id: userId }, product: { id: productId }, variant: { id: variantId } },
    });

    if (existing) {
      if (variant.stock < existing.quantity + quantity) {
        throw new BadRequestException('Stock insuficiente');
      }
      existing.quantity += quantity;
      return this.repo.save(existing);
    }

    const item = this.repo.create({
      user: { id: userId },
      product: { id: productId },
      variant: { id: variantId },
      quantity,
    });
    return this.repo.save(item);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await this.repo.findOne({
      where: { id: itemId, user: { id: userId } },
      relations: ['variant'],
    });
    if (!item) throw new NotFoundException('Item no encontrado');
    if (quantity <= 0) return this.removeItem(userId, itemId);
    if (item.variant.stock < quantity) throw new BadRequestException('Stock insuficiente');
    item.quantity = quantity;
    return this.repo.save(item);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.repo.findOne({ where: { id: itemId, user: { id: userId } } });
    if (!item) throw new NotFoundException('Item no encontrado');
    await this.repo.remove(item);
    return { message: 'Item eliminado del carrito' };
  }

  async clearCart(userId: string) {
    await this.repo.delete({ user: { id: userId } });
    return { message: 'Carrito vaciado' };
  }
}
