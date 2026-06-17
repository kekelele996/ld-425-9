import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditCategory } from '../../models/auditLog.entity';
import { BudgetItem } from '../../models/budgetItem.entity';
import { ConstructionNode } from '../../models/constructionNode.entity';
import { DesignPhase } from '../../models/designPhase.entity';
import { MaterialItem } from '../../models/materialItem.entity';
import { RenovationProject } from '../../models/project.entity';
import { AcceptanceStatus, BudgetCategory, ConstructionPhase, DecorStyle, HouseType, PhaseStatus, ProjectStatus, PurchaseStatus } from '../../types/enums';
import { calculateMaterialTotal, calculateVariance } from '../../utils/budgetCalculator';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(RenovationProject) private readonly projectRepo: Repository<RenovationProject>,
    @InjectRepository(DesignPhase) private readonly designRepo: Repository<DesignPhase>,
    @InjectRepository(MaterialItem) private readonly materialRepo: Repository<MaterialItem>,
    @InjectRepository(BudgetItem) private readonly budgetRepo: Repository<BudgetItem>,
    @InjectRepository(ConstructionNode) private readonly constructionRepo: Repository<ConstructionNode>,
    @InjectRepository(AuditLog) private readonly auditLogRepo: Repository<AuditLog>
  ) {}

  async ensureSeedData() {
    if (await this.projectRepo.count()) {
      return;
    }
    const project = await this.projectRepo.save(this.projectRepo.create({
      name: '青梧里 12-803 全屋改造',
      houseType: HouseType.ThreeRoom,
      area: 118,
      decorStyle: DecorStyle.Nordic,
      address: '杭州市西湖区青梧里',
      ownerId: 'owner-001',
      designerId: 'designer-001',
      contractorId: 'contractor-001',
      status: ProjectStatus.InProgress,
      contractAmount: 368000,
      startDate: '2026-05-01',
      expectedEndDate: '2026-09-18'
    }));

    const [designs, materials, budgets, constructions] = await Promise.all([
      this.designRepo.save([
        this.designRepo.create({ projectId: project.id, name: '方案设计', designerId: 'designer-001', status: PhaseStatus.Approved, version: 3, description: '开放式客餐厅与收纳墙方案。', fileUrls: ['/uploads/design-plan.pdf'], reviewComment: '通过，厨房动线保留。', reviewerId: 'owner-001' }),
        this.designRepo.create({ projectId: project.id, name: '施工图', designerId: 'designer-001', status: PhaseStatus.InProgress, version: 2, description: '水电点位和吊顶节点深化中。', fileUrls: ['/uploads/construction-v2.pdf'] })
      ]),
      this.materialRepo.save([
        this.materialRepo.create({ projectId: project.id, name: '客厅木纹砖', category: '瓷砖', spec: '900x1800mm', brand: 'Monalisa', quantity: 48, unit: '片', unitPrice: 218, totalPrice: calculateMaterialTotal(48, 218), purchaseStatus: PurchaseStatus.Delivered, supplier: '城市建材仓', room: '客厅' }),
        this.materialRepo.create({ projectId: project.id, name: '哑光乳胶漆', category: '油漆', spec: '18L', brand: 'Nippon', quantity: 8, unit: '桶', unitPrice: 560, totalPrice: calculateMaterialTotal(8, 560), purchaseStatus: PurchaseStatus.Ordered, supplier: '安心涂料', room: '卧室' })
      ]),
      this.budgetRepo.save([
        this.budgetRepo.create({ projectId: project.id, category: BudgetCategory.Design, budgetAmount: 32000, actualCost: 32000, variance: calculateVariance(32000, 32000), note: '含效果图与施工图' }),
        this.budgetRepo.create({ projectId: project.id, category: BudgetCategory.Material, budgetAmount: 168000, actualCost: 153200, variance: calculateVariance(168000, 153200), note: '主材已完成 72%' }),
        this.budgetRepo.create({ projectId: project.id, category: BudgetCategory.Labor, budgetAmount: 98000, actualCost: 104500, variance: calculateVariance(98000, 104500), note: '水电增项导致超支' })
      ]),
      this.constructionRepo.save([
        this.constructionRepo.create({ projectId: project.id, name: ConstructionPhase.Demolition, plannedStartDate: '2026-05-01', plannedEndDate: '2026-05-08', actualStartDate: '2026-05-01', actualEndDate: '2026-05-07', status: 'Completed', acceptanceStatus: AcceptanceStatus.Passed, acceptancePhotoUrls: ['/uploads/demolition.jpg'], acceptanceNote: '拆改完成，垃圾清运合格。' }),
        this.constructionRepo.create({ projectId: project.id, name: ConstructionPhase.Plumbing, plannedStartDate: '2026-05-09', plannedEndDate: '2026-05-24', actualStartDate: '2026-05-10', status: 'Delayed', acceptanceStatus: AcceptanceStatus.Pending, acceptancePhotoUrls: [], acceptanceNote: '等待水压测试。' }),
        this.constructionRepo.create({ projectId: project.id, name: ConstructionPhase.Carpentry, plannedStartDate: '2026-05-25', plannedEndDate: '2026-06-12', status: 'Pending', acceptanceStatus: AcceptanceStatus.Pending, acceptancePhotoUrls: [], acceptanceNote: '材料到场后开工。' })
      ])
    ]);

    await this.auditLogRepo.save([
      this.auditLogRepo.create({ userId: 'system', userName: '系统', action: 'create_project', entity: 'RenovationProject', entityId: project.id, projectId: project.id, category: AuditCategory.Project, details: `项目「${project.name}」已创建，地址：${project.address}`, createdAt: new Date('2026-04-28T10:00:00') }),
      this.auditLogRepo.create({ userId: 'designer-001', userName: '林设计师', action: 'submit_design', entity: 'DesignPhase', entityId: designs[0].id, projectId: project.id, category: AuditCategory.Design, details: '方案设计 v1 提交审核', createdAt: new Date('2026-04-30T14:20:00') }),
      this.auditLogRepo.create({ userId: 'owner-001', userName: '王业主', action: 'reject_design', entity: 'DesignPhase', entityId: designs[0].id, projectId: project.id, category: AuditCategory.Design, details: '方案设计 审核未通过：厨房布局需要调整', createdAt: new Date('2026-05-02T09:15:00') }),
      this.auditLogRepo.create({ userId: 'designer-001', userName: '林设计师', action: 'submit_design', entity: 'DesignPhase', entityId: designs[0].id, projectId: project.id, category: AuditCategory.Design, details: '方案设计 v2 提交审核', createdAt: new Date('2026-05-04T16:30:00') }),
      this.auditLogRepo.create({ userId: 'contractor-001', userName: '张工头', action: 'inspect_construction', entity: 'ConstructionNode', entityId: constructions[0].id, projectId: project.id, category: AuditCategory.Construction, details: '拆除工程 验收结果：验收通过，备注：拆改完成，垃圾清运合格。', createdAt: new Date('2026-05-07T15:00:00') }),
      this.auditLogRepo.create({ userId: 'owner-001', userName: '王业主', action: 'approve_design', entity: 'DesignPhase', entityId: designs[0].id, projectId: project.id, category: AuditCategory.Design, details: '方案设计 审核通过：通过，厨房动线保留。', createdAt: new Date('2026-05-08T10:45:00') }),
      this.auditLogRepo.create({ userId: 'designer-001', userName: '林设计师', action: 'submit_design', entity: 'DesignPhase', entityId: designs[1].id, projectId: project.id, category: AuditCategory.Design, details: '施工图 v1 提交审核', createdAt: new Date('2026-05-10T11:20:00') }),
      this.auditLogRepo.create({ userId: 'demo-manager', userName: '李经理', action: 'update_material_purchase', entity: 'MaterialItem', entityId: materials[0].id, projectId: project.id, category: AuditCategory.Material, details: '客厅木纹砖（900x1800mm）采购状态更新为：已下单', createdAt: new Date('2026-05-11T09:00:00') }),
      this.auditLogRepo.create({ userId: 'demo-manager', userName: '李经理', action: 'adjust_budget', entity: 'BudgetItem', entityId: budgets[2].id, projectId: project.id, category: AuditCategory.Budget, details: '人工费 实际支出调整：98000 → 104500 元', createdAt: new Date('2026-05-15T14:30:00') }),
      this.auditLogRepo.create({ userId: 'demo-manager', userName: '李经理', action: 'update_material_purchase', entity: 'MaterialItem', entityId: materials[0].id, projectId: project.id, category: AuditCategory.Material, details: '客厅木纹砖（900x1800mm）采购状态更新为：已到货', createdAt: new Date('2026-05-20T10:15:00') }),
      this.auditLogRepo.create({ userId: 'designer-001', userName: '林设计师', action: 'submit_design', entity: 'DesignPhase', entityId: designs[1].id, projectId: project.id, category: AuditCategory.Design, details: '施工图 v2 提交审核', createdAt: new Date('2026-06-01T13:40:00') }),
      this.auditLogRepo.create({ userId: 'demo-manager', userName: '李经理', action: 'update_material_purchase', entity: 'MaterialItem', entityId: materials[1].id, projectId: project.id, category: AuditCategory.Material, details: '哑光乳胶漆（18L）采购状态更新为：已下单', createdAt: new Date('2026-06-05T16:00:00') })
    ]);
  }
}
