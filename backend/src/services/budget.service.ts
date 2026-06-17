import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetItem } from '../models/budgetItem.entity';
import { AuditCategory } from '../models/auditLog.entity';
import { BudgetCategory } from '../types/enums';
import { calculateVariance } from '../utils/budgetCalculator';
import { AuditLogService } from './auditLog.service';

const categoryLabel: Record<BudgetCategory, string> = {
  Design: '设计费',
  Material: '材料费',
  Labor: '人工费',
  Furniture: '家具费',
  Appliance: '家电费',
  Other: '其他费用'
};

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(BudgetItem) private readonly repo: Repository<BudgetItem>,
    private readonly auditLog: AuditLogService
  ) {}

  findAll() {
    return this.repo.find({ relations: ['project'], order: { category: 'ASC' } });
  }

  async adjustActualCost(id: string, actualCost: number, userId: string, userName?: string) {
    const item = await this.repo.findOneByOrFail({ id });
    const oldActual = Number(item.actualCost);
    item.actualCost = actualCost;
    item.variance = calculateVariance(Number(item.budgetAmount), actualCost);
    const result = await this.repo.save(item);
    await this.auditLog.record({
      userId,
      userName,
      action: 'adjust_budget',
      entity: 'BudgetItem',
      entityId: id,
      projectId: item.projectId,
      category: AuditCategory.Budget,
      details: `${categoryLabel[item.category]} 实际支出调整：${oldActual} → ${actualCost} 元`
    });
    return result;
  }
}
