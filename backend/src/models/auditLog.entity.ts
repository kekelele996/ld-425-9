import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AuditCategory {
  Design = 'Design',
  Material = 'Material',
  Construction = 'Construction',
  Budget = 'Budget',
  Project = 'Project'
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  userName: string;

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ type: 'varchar', length: 255 })
  entity: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entityId?: string;

  @Column({ nullable: true, type: 'uuid' })
  projectId?: string;

  @Column({ type: 'varchar', length: 100, default: AuditCategory.Project })
  category: AuditCategory;

  @Column({ nullable: true, type: 'text' })
  details?: string;

  @CreateDateColumn()
  createdAt: Date;
}
