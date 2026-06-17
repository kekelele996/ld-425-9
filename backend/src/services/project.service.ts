import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RenovationProject } from '../models/project.entity';
import { AuditCategory } from '../models/auditLog.entity';
import { AuditLogService } from './auditLog.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(RenovationProject) private readonly repo: Repository<RenovationProject>,
    private readonly auditLog: AuditLogService
  ) {}

  findAll() {
    return this.repo.find({ relations: ['constructionNodes', 'budgets'], order: { startDate: 'DESC' } });
  }

  async create(data: Partial<RenovationProject>, userId: string, userName?: string) {
    const result = await this.repo.save(this.repo.create(data));
    await this.auditLog.record({
      userId,
      userName,
      action: 'create_project',
      entity: 'RenovationProject',
      entityId: result.id,
      projectId: result.id,
      category: AuditCategory.Project,
      details: `项目「${result.name}」已创建，地址：${result.address}`
    });
    return result;
  }
}
