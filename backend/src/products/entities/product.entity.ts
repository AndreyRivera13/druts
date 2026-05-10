import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn, Index,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  UNISEX = 'U',
  KIDS = 'K',
}

@Entity('products')
@Index(['name', 'isActive'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ unique: true, length: 50 })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  salePrice: number;

  @ManyToOne(() => Category, (cat) => cat.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, (brand) => brand.products, { eager: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ type: 'enum', enum: Gender, default: Gender.UNISEX })
  gender: Gender;

  @Column({ nullable: true, length: 100 })
  material: string;

  @Column({ nullable: true, length: 50 })
  season: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: 0 })
  totalSold: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true, eager: true })
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (img) => img.product, { cascade: true, eager: true })
  images: ProductImage[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get currentPrice(): number {
    return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
  }

  get discountPercent(): number {
    if (!this.salePrice || this.salePrice >= this.price) return 0;
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }

  get totalStock(): number {
    return this.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  }
}
