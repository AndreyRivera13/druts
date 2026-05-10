import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn,
} from 'typeorm';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { User } from '../../users/entities/user.entity';

export enum MovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
}

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Column()
  quantity: number;

  @Column()
  stockBefore: number;

  @Column()
  stockAfter: number;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  referenceId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
