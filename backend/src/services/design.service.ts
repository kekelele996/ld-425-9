import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesignPhase } from '../models/designPhase.entity';
import { AuditCategory } from '../models/auditLog.entity';
import { PhaseStatus } from '../types/enums';
import { AuditLogService } from './auditLog.service';

@Injectable()
export class DesignService {
  constructor(
    @InjectRepository(DesignPhase) private readonly repo: Repository<DesignPhase>,
    private readonly auditLog: AuditLogService
  ) {}

  findAll() {
    return this.repo.find({ relations: ['project'], order: { version: 'DESC' } });
  }

  async submit(id: string, userId: string, userName?: string) {
    const phase = await this.repo.findOneByOrFail({ id });
    phase.status = PhaseStatus.InProgress;
    phase.version += 1;
    const result = await this.repo.save(phase);
    await this.auditLog.record({
      userId,
      userName,
      action: 'submit_design',
      entity: 'DesignPhase',
      entityId: id,
      projectId: phase.projectId,
      category: AuditCategory.Design,
      details: `${phase.name} v${phase.version} 提交审核`
    });
    return result;
  }

  async review(id: string, approved: boolean, comment: string, reviewerId: string, reviewerName?: string) {
    const phase = await this.repo.findOneByOrFail({ id });
    phase.status = approved ? PhaseStatus.Approved : PhaseStatus.Revision;
    phase.reviewComment = comment;
    phase.reviewerId = reviewerId;
    const result = await this.repo.save(phase);
    await this.auditLog.record({
      userId: reviewerId,
      userName: reviewerName,
      action: approved ? 'approve_design' : 'reject_design',
      entity: 'DesignPhase',
      entityId: id,
      projectId: phase.projectId,
      category: AuditCategory.Design,
      details: `${phase.name} ${approved ? '审核通过' : '审核未通过'}：${comment}`
    });
    return result;
  }
}
