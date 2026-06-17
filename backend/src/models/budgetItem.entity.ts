import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BudgetCategory } from '../types/enums';
import { RenovationProject } from './project.entity';

@Entity('budget_items')
export class BudgetItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => RenovationProject, (project) => project.budgets, { onDelete: 'CASCADE' })
  project: RenovationProject;

  @Column({ type: 'varchar', length: 100 })
  category: BudgetCategory;

  @Column('decimal', { precision: 12, scale: 2 })
  budgetAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  actualCost: number;

  @Column('decimal', { precision: 12, scale: 2 })
  variance: number;

  @Column({ type: 'text' })
  note: string;
}
