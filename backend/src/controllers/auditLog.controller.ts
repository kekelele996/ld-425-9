import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuditLogService } from '../services/auditLog.service';
import { ok } from '../utils/response';
import { AuditCategory } from '../models/auditLog.entity';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Get()
  async list(@Query('categories') categories?: string) {
    const categoryList = categories
      ? (categories.split(',').filter(Boolean) as AuditCategory[])
      : undefined;
    return ok(await this.service.findAll(categoryList));
  }

  @Get('project/:projectId')
  async listByProject(
    @Param('projectId') projectId: string,
    @Query('categories') categories?: string
  ) {
    const categoryList = categories
      ? (categories.split(',').filter(Boolean) as AuditCategory[])
      : undefined;
    return ok(await this.service.findByProject(projectId, categoryList));
  }
}
