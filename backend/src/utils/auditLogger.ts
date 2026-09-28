import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';

export interface LogAuditParams {
  req?: AuthRequest;
  actorId?: any;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export const logAudit = async (params: LogAuditParams): Promise<void> => {
  try {
    const actorName =
      params.actorName ||
      (params.req?.user ? params.req.user.name : 'System');
    const actorEmail =
      params.actorEmail ||
      (params.req?.user ? params.req.user.email : 'system@scholarsphere.local');
    const actorRole =
      params.actorRole ||
      (params.req?.user ? params.req.user.role : 'SYSTEM');
    const actorId =
      params.actorId ||
      (params.req?.user ? params.req.user._id : undefined);

    const ipAddress =
      params.req?.headers['x-forwarded-for']?.toString() ||
      params.req?.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = params.req?.headers['user-agent'] || 'Direct-API';

    await AuditLog.create({
      actorId,
      actorName,
      actorEmail,
      actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      description: params.description,
      metadata: params.metadata,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
