import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PhaseStatus } from '../types/enums';
import { RenovationProject } from './project.entity';

@Entity('design_phases')
export class DesignPhase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => RenovationProject, (project) => project.designPhases, { onDelete: 'CASCADE' })
  project: RenovationProject;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  designerId: string;

  @Column({ type: 'varchar', length: 100 })
  status: PhaseStatus;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-json' })
  fileUrls: string[];

  @Column({ type: 'text', nullable: true })
  reviewComment?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewerId?: string;
}
