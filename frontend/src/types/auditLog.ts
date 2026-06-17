export enum AuditCategory {
  Design = 'Design',
  Material = 'Material',
  Construction = 'Construction',
  Budget = 'Budget',
  Project = 'Project'
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  projectId?: string;
  category: AuditCategory;
  details?: string;
  createdAt: string;
}

export const auditCategoryLabel: Record<AuditCategory, string> = {
  Design: '设计提交',
  Material: '材料采购',
  Construction: '施工验收',
  Budget: '预算调整',
  Project: '项目管理'
};

export const auditCategoryColor: Record<AuditCategory, string> = {
  Design: 'geekblue',
  Material: 'purple',
  Construction: 'green',
  Budget: 'orange',
  Project: 'blue'
};
