import mongoose, { Schema, Document } from 'mongoose';
import { APPLICATION_STATUS, ApplicationStatus } from '../config/constants.js';

export interface ITimelineEvent {
  status: ApplicationStatus;
  timestamp: Date;
  updatedBy?: string;
  updaterRole?: string;
  remarks: string;
}

export interface IScholarshipApplication extends Document {
  applicationNumber: string; // e.g., SCH-2025-00142
  studentId: mongoose.Types.ObjectId; // References StudentProfile
  userId: mongoose.Types.ObjectId; // References User
  scholarshipId: mongoose.Types.ObjectId; // References Scholarship
  academicYear: string;
  status: ApplicationStatus;
  appliedDate: Date;
  reviewedDate?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewerNotes?: string;
  rejectionReason?: string;
  
  // Snapshot of student credentials at the time of application
  snapshot: {
    cgpa: number;
    attendancePercentage: number;
    familyIncome: number;
    category: string;
    department: string;
    course: string;
    year: number;
    semester: number;
    activeBacklogs: number;
  };

  // Eligibility evaluation summary computed during submission
  eligibilitySummary?: {
    isEligible: boolean;
    breakdown: Array<{
      criterion: string;
      satisfied: boolean;
      required: string;
      actual: string;
    }>;
  };

  timeline: ITimelineEvent[];
  isRenewal: boolean;
  previousApplicationId?: mongoose.Types.ObjectId;
  disbursementStatus?: 'PENDING' | 'DISBURSED' | 'FAILED';
  disbursementAmount?: number;
  disbursementDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    status: { type: String, enum: Object.values(APPLICATION_STATUS), required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String },
    updaterRole: { type: String },
    remarks: { type: String, required: true },
  },
  { _id: false }
);

const ScholarshipApplicationSchema = new Schema<IScholarshipApplication>(
  {
    applicationNumber: { type: String, required: true, unique: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scholarshipId: { type: Schema.Types.ObjectId, ref: 'Scholarship', required: true, index: true },
    academicYear: { type: String, required: true, default: '2025-2026' },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.SUBMITTED,
      index: true,
    },
    appliedDate: { type: Date, default: Date.now },
    reviewedDate: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewerNotes: { type: String },
    rejectionReason: { type: String },
    snapshot: {
      cgpa: { type: Number, default: 0 },
      attendancePercentage: { type: Number, default: 0 },
      familyIncome: { type: Number, default: 0 },
      category: { type: String, default: 'GENERAL' },
      department: { type: String, default: 'CSE' },
      course: { type: String, default: 'B.Tech' },
      year: { type: Number, default: 1 },
      semester: { type: Number, default: 1 },
      activeBacklogs: { type: Number, default: 0 },
    },
    eligibilitySummary: {
      isEligible: { type: Boolean, default: true },
      breakdown: [
        {
          criterion: String,
          satisfied: Boolean,
          required: String,
          actual: String,
        },
      ],
    },
    timeline: [TimelineEventSchema],
    isRenewal: { type: Boolean, default: false },
    previousApplicationId: { type: Schema.Types.ObjectId, ref: 'ScholarshipApplication' },
    disbursementStatus: { type: String, enum: ['PENDING', 'DISBURSED', 'FAILED'] },
    disbursementAmount: { type: Number },
    disbursementDate: { type: Date },
  },
  { timestamps: true }
);

export const ScholarshipApplication = mongoose.model<IScholarshipApplication>(
  'ScholarshipApplication',
  ScholarshipApplicationSchema
);
