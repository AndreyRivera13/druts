import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
@Index(['product', 'size', 'color'], { unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 10 })
  size: string;

  @Column({ length: 50 })
  color: string;

  @Column({ length: 7, nullable: true })
  colorHex: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 5 })
  lowStockThreshold: number;

  @Column({ nullable: true, length: 50 })
  sku: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  priceAdjustment: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get isLowStock(): boolean {
    return this.stock <= this.lowStockThreshold && this.stock > 0;
  }

  get isOutOfStock(): boolean {
    return this.stock === 0;
  }
}
