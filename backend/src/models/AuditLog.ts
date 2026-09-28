import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorName: string;
  actorEmail?: string;
  actorRole: string;
  action: string; // e.g. "APPLICATION_APPROVED", "DOCUMENT_VERIFIED", "RULE_UPDATED", "ATTENDANCE_IMPORTED"
  entityType: string; // "Application", "Document", "Scholarship", "Attendance", "User"
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String, required: true },
    actorEmail: { type: String },
    actorRole: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  description?: string;
  updatedBy?: string;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const SystemSetting = mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);

export interface IScholarshipDisbursement extends Document {
  applicationId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  scholarshipId: mongoose.Types.ObjectId;
  amount: number;
  financialYear: string;
  disbursementMode: 'DIRECT_BANK_TRANSFER' | 'CHEQUE' | 'COLLEGE_FEE_WAIVER';
  transactionReference: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED' | 'RECONCILED';
  processedDate?: Date;
  bankAckNumber?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisbursementSchema = new Schema<IScholarshipDisbursement>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'ScholarshipApplication', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    scholarshipId: { type: Schema.Types.ObjectId, ref: 'Scholarship', required: true, index: true },
    amount: { type: Number, required: true },
    financialYear: { type: String, default: '2025-2026' },
    disbursementMode: { type: String, default: 'DIRECT_BANK_TRANSFER' },
    transactionReference: { type: String, required: true, unique: true },
    status: { type: String, enum: ['PENDING', 'PROCESSED', 'FAILED', 'RECONCILED'], default: 'PROCESSED' },
    processedDate: { type: Date, default: Date.now },
    bankAckNumber: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const ScholarshipDisbursement = mongoose.model<IScholarshipDisbursement>(
  'ScholarshipDisbursement',
  DisbursementSchema
);
