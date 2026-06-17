export const apiPaths = {
  projects: '/projects',
  designs: '/designs',
  materials: '/materials',
  budgets: '/budgets',
  construction: '/construction',
  auditLogs: '/audit-logs',
  auditLogsByProject: (projectId: string) => `/audit-logs/project/${projectId}`
};
