import { UserRole } from './enums';
import { AuditCategory } from '../models/auditLog.entity';

export interface RequestUser {
  id: string;
  role: UserRole;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuditContext {
  userId: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  projectId?: string;
  category: AuditCategory;
  details?: string;
}
