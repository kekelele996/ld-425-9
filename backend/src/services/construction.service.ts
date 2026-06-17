import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionNode } from '../models/constructionNode.entity';
import { AuditCategory } from '../models/auditLog.entity';
import { AcceptanceStatus } from '../types/enums';
import { AuditLogService } from './auditLog.service';

const acceptanceLabel: Record<AcceptanceStatus, string> = {
  Pending: '待验收',
  Passed: '验收通过',
  Failed: '验收未通过'
};

const phaseLabel: Record<string, string> = {
  Demolition: '拆除工程',
  Plumbing: '水电工程',
  Carpentry: '木工工程',
  Tiling: '泥瓦工程',
  Painting: '油漆工程',
  Installation: '安装工程',
  SoftFurnishing: '软装工程'
};

@Injectable()
export class ConstructionService {
  constructor(
    @InjectRepository(ConstructionNode) private readonly repo: Repository<ConstructionNode>,
    private readonly auditLog: AuditLogService
  ) {}

  findAll() {
    return this.repo.find({ relations: ['project'], order: { plannedStartDate: 'ASC' } });
  }

  async inspect(id: string, acceptanceStatus: AcceptanceStatus, acceptanceNote: string, photos: string[], userId: string, userName?: string) {
    const node = await this.repo.findOneByOrFail({ id });
    node.acceptanceStatus = acceptanceStatus;
    node.acceptanceNote = acceptanceNote;
    node.acceptancePhotoUrls = photos;
    const result = await this.repo.save(node);
    await this.auditLog.record({
      userId,
      userName,
      action: 'inspect_construction',
      entity: 'ConstructionNode',
      entityId: id,
      projectId: node.projectId,
      category: AuditCategory.Construction,
      details: `${phaseLabel[node.name] || node.name} 验收结果：${acceptanceLabel[acceptanceStatus]}，备注：${acceptanceNote || '无'}`
    });
    return result;
  }
}
