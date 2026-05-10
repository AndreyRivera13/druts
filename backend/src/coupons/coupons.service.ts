import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, DiscountType } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon) private repo: Repository<Coupon>,
  ) {}

  async create(dto: Partial<Coupon>): Promise<Coupon> {
    const coupon = this.repo.create(dto);
    return this.repo.save(coupon);
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async validate(code: string, subtotal: number): Promise<{ coupon: Coupon; discountAmount: number }> {
    const coupon = await this.repo.findOne({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new NotFoundException('Cupón no encontrado');
    if (!coupon.isValid) throw new BadRequestException('El cupón no es válido o ha expirado');
    if (coupon.minimumPurchase && subtotal < Number(coupon.minimumPurchase)) {
      throw new BadRequestException(
        `Compra mínima requerida: $${coupon.minimumPurchase.toLocaleString()}`,
      );
    }

    let discountAmount =
      coupon.discountType === DiscountType.PERCENTAGE
        ? (subtotal * Number(coupon.discountValue)) / 100
        : Number(coupon.discountValue);

    if (coupon.maximumDiscount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscount));
    }

    return { coupon, discountAmount };
  }

  async incrementUsage(couponId: string): Promise<void> {
    await this.repo.increment({ id: couponId }, 'usageCount', 1);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Cupón no encontrado');
    await this.repo.remove(coupon);
  }
}
