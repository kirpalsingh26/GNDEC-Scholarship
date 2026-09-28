import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { DOCUMENT_STATUS, DOCUMENT_TYPES, DocumentStatus, DocumentType } from '../config/constants.js';

export interface IDocOcrResult {
  extractedStudentName?: string;
  extractedDocType?: string;
  extractedCertificateNo?: string;
  extractedIssueDate?: string;
  extractedExpiryDate?: string;
  issuingAuthority?: string;
  extractedIncome?: number;
  extractedCaste?: string;
  nameMatchConfidence?: number; // 0 to 100
  validationFlags?: {
    isExpired?: boolean;
    nameMismatch?: boolean;
    typeMismatch?: boolean;
    lowConfidence?: boolean;
  };
  rawTextPreview?: string;
}

export interface IDocumentVersion {
  versionNumber: number;
  fileName: string;
  originalName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
  status: DocumentStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifierName?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  rejectionComments?: string;
  ocrData?: IDocOcrResult;
}

export interface IDocument extends MongooseDoc {
  studentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  documentType: DocumentType;
  title: string;
  currentVersion: number;
  status: DocumentStatus;
  versions: IDocumentVersion[];
  expiryDate?: Date;
  certificateNumber?: string;
  latestVerifiedVersion?: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentVersionSchema = new Schema<IDocumentVersion>(
  {
    versionNumber: { type: Number, required: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.PENDING,
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifierName: { type: String },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    rejectionComments: { type: String },
    ocrData: {
      extractedStudentName: String,
      extractedDocType: String,
      extractedCertificateNo: String,
      extractedIssueDate: String,
      extractedExpiryDate: String,
      issuingAuthority: String,
      extractedIncome: Number,
      extractedCaste: String,
      nameMatchConfidence: Number,
      validationFlags: {
        isExpired: Boolean,
        nameMismatch: Boolean,
        typeMismatch: Boolean,
        lowConfidence: Boolean,
      },
      rawTextPreview: String,
    },
  },
  { _id: true }
);

const DocumentSchema = new Schema<IDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'ScholarshipApplication', index: true },
    documentType: {
      type: String,
      enum: Object.values(DOCUMENT_TYPES),
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    currentVersion: { type: Number, default: 1 },
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.PENDING,
      index: true,
    },
    versions: [DocumentVersionSchema],
    expiryDate: { type: Date },
    certificateNumber: { type: String },
    latestVerifiedVersion: { type: Number },
  },
  { timestamps: true }
);

export const StudentDocument = mongoose.model<IDocument>('StudentDocument', DocumentSchema);
