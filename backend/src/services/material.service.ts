import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialItem } from '../models/materialItem.entity';
import { AuditCategory } from '../models/auditLog.entity';
import { PurchaseStatus } from '../types/enums';
import { calculateMaterialTotal } from '../utils/budgetCalculator';
import { AuditLogService } from './auditLog.service';

const statusLabel: Record<PurchaseStatus, string> = {
  NotPurchased: '未采购',
  Ordered: '已下单',
  Delivered: '已到货',
  Installed: '已安装'
};

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(MaterialItem) private readonly repo: Repository<MaterialItem>,
    private readonly auditLog: AuditLogService
  ) {}

  findAll() {
    return this.repo.find({ relations: ['project'], order: { room: 'ASC' } });
  }

  async updateStatus(id: string, purchaseStatus: PurchaseStatus, userId: string, userName?: string) {
    const item = await this.repo.findOneByOrFail({ id });
    item.purchaseStatus = purchaseStatus;
    item.totalPrice = calculateMaterialTotal(Number(item.quantity), Number(item.unitPrice));
    const result = await this.repo.save(item);
    await this.auditLog.record({
      userId,
      userName,
      action: 'update_material_purchase',
      entity: 'MaterialItem',
      entityId: id,
      projectId: item.projectId,
      category: AuditCategory.Material,
      details: `${item.name}（${item.spec}）采购状态更新为：${statusLabel[purchaseStatus]}`
    });
    return result;
  }
}
