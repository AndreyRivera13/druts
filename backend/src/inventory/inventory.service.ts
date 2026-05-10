import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement, MovementType } from './entities/inventory-movement.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement) private movementRepo: Repository<InventoryMovement>,
    private productsService: ProductsService,
  ) {}

  async registerMovement(dto: {
    variantId: string;
    type: MovementType;
    quantity: number;
    reason?: string;
    referenceId?: string;
    userId?: string;
  }): Promise<InventoryMovement> {
    const variant = await this.productsService['variantRepo'].findOne({
      where: { id: dto.variantId },
    });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    const stockBefore = variant.stock;
    let stockAfter = stockBefore;

    switch (dto.type) {
      case MovementType.ENTRY:
      case MovementType.RETURN:
        stockAfter = stockBefore + dto.quantity;
        break;
      case MovementType.EXIT:
        stockAfter = Math.max(0, stockBefore - dto.quantity);
        break;
      case MovementType.ADJUSTMENT:
        stockAfter = dto.quantity;
        break;
    }

    await this.productsService.updateVariantStock(dto.variantId, stockAfter);

    const movement = this.movementRepo.create({
      variant: { id: dto.variantId },
      type: dto.type,
      quantity: dto.quantity,
      stockBefore,
      stockAfter,
      reason: dto.reason,
      referenceId: dto.referenceId,
      createdBy: dto.userId ? { id: dto.userId } : null,
    });

    return this.movementRepo.save(movement);
  }

  async getMovements(variantId: string, limit = 50) {
    return this.movementRepo.find({
      where: { variant: { id: variantId } },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['createdBy'],
    });
  }

  async getAllMovements(page = 1, limit = 20) {
    const [data, total] = await this.movementRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['variant', 'variant.product', 'createdBy'],
    });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getAlerts() {
    const [lowStock, outOfStock] = await Promise.all([
      this.productsService.getLowStockVariants(),
      this.productsService.getOutOfStockVariants(),
    ]);
    return { lowStock, outOfStock };
  }
}
