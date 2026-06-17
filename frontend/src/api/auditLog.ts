import { apiPaths } from '../constants/apiPaths';
import { AuditCategory, AuditLog } from '../types/auditLog';
import { request } from '../utils/request';

export const auditLogApi = {
  list: (categories?: AuditCategory[]) => {
    const query = categories && categories.length > 0
      ? `?categories=${categories.join(',')}`
      : '';
    return request.get<unknown, AuditLog[]>(`${apiPaths.auditLogs}${query}`);
  },

  listByProject: (projectId: string, categories?: AuditCategory[]) => {
    const query = categories && categories.length > 0
      ? `?categories=${categories.join(',')}`
      : '';
    return request.get<unknown, AuditLog[]>(`${apiPaths.auditLogsByProject(projectId)}${query}`);
  }
};
