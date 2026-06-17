import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { AuditLog, AuditCategory } from '../models/auditLog.entity';
import { AuditContext } from '../types/interfaces';

@Injectable()
export class AuditLogService {
  constructor(@InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>) {}

  async record(context: AuditContext) {
    return this.repo.save(this.repo.create(context));
  }

  async findByProject(projectId: string, categories?: AuditCategory[]) {
    const where: FindOptionsWhere<AuditLog> = { projectId };
    if (categories && categories.length > 0) {
      where.category = In(categories);
    }
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }

  async findAll(categories?: AuditCategory[]) {
    const where: FindOptionsWhere<AuditLog> = {};
    if (categories && categories.length > 0) {
      where.category = In(categories);
    }
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }
}
