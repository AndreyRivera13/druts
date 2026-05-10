import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 30 })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: DiscountType })
  discountType: DiscountType;

  @Column('decimal', { precision: 10, scale: 2 })
  discountValue: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  minimumPurchase: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  maximumDiscount: number;

  @Column({ nullable: true })
  maxUsages: number;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  perUserLimit: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get isExhausted(): boolean {
    return this.maxUsages ? this.usageCount >= this.maxUsages : false;
  }

  get isValid(): boolean {
    return this.isActive && !this.isExpired && !this.isExhausted;
  }
}
