import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PurchaseStatus } from '../types/enums';
import { RenovationProject } from './project.entity';

@Entity('material_items')
export class MaterialItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => RenovationProject, (project) => project.materials, { onDelete: 'CASCADE' })
  project: RenovationProject;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'varchar', length: 255 })
  spec: string;

  @Column({ type: 'varchar', length: 255 })
  brand: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalPrice: number;

  @Column({ type: 'varchar', length: 100 })
  purchaseStatus: PurchaseStatus;

  @Column({ type: 'varchar', length: 255 })
  supplier: string;

  @Column({ type: 'varchar', length: 255 })
  room: string;
}
