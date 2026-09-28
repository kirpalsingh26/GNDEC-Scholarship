import mongoose, { Schema, Document } from 'mongoose';
import { CATEGORIES, DocumentType, DOCUMENT_TYPES } from '../config/constants.js';

export interface IScholarshipRule {
  minCgpa?: number;
  minAttendance?: number;
  maxFamilyIncome?: number;
  allowedCategories?: string[];
  allowedDepartments?: string[];
  allowedCourses?: string[];
  allowedYears?: number[];
  maxBacklogs?: number;
  genderRestriction?: 'ALL' | 'FEMALE_ONLY' | 'MALE_ONLY';
}

export interface IScholarship extends Document {
  title: string;
  code: string;
  provider: string; // e.g. "Govt of Punjab", "GNDEC Alumni Association", "Central Sector Scheme", "Tata Trust"
  type: 'MERIT' | 'MEANS' | 'MERIT_CUM_MEANS' | 'RESERVATION' | 'SPECIAL_SCHEME';
  description: string;
  amount: number; // e.g. 50000 per year
  frequency: 'ONE_TIME' | 'ANNUAL' | 'SEMESTER';
  academicYear: string; // e.g. "2025-2026"
  deadline: Date;
  startDate: Date;
  isRenewable: boolean;
  totalSeats?: number;
  availableSeats?: number;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
  requiredDocuments: DocumentType[];
  rules: IScholarshipRule;
  instructions?: string;
  contactEmail?: string;
  disbursedAmountTotal?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScholarshipSchema = new Schema<IScholarship>(
  {
    title: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    provider: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['MERIT', 'MEANS', 'MERIT_CUM_MEANS', 'RESERVATION', 'SPECIAL_SCHEME'],
      default: 'MERIT_CUM_MEANS',
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ['ONE_TIME', 'ANNUAL', 'SEMESTER'], default: 'ANNUAL' },
    academicYear: { type: String, required: true, default: '2025-2026' },
    deadline: { type: Date, required: true, index: true },
    startDate: { type: Date, default: Date.now },
    isRenewable: { type: Boolean, default: false },
    totalSeats: { type: Number },
    availableSeats: { type: Number },
    status: { type: String, enum: ['ACTIVE', 'UPCOMING', 'CLOSED'], default: 'ACTIVE', index: true },
    requiredDocuments: [
      {
        type: String,
        enum: Object.values(DOCUMENT_TYPES),
      },
    ],
    rules: {
      minCgpa: { type: Number, default: 0 },
      minAttendance: { type: Number, default: 75 },
      maxFamilyIncome: { type: Number, default: 0 }, // 0 means no income cap
      allowedCategories: [{ type: String, enum: CATEGORIES }],
      allowedDepartments: [{ type: String }],
      allowedCourses: [{ type: String }],
      allowedYears: [{ type: Number }],
      maxBacklogs: { type: Number, default: 0 },
      genderRestriction: { type: String, enum: ['ALL', 'FEMALE_ONLY', 'MALE_ONLY'], default: 'ALL' },
    },
    instructions: { type: String },
    contactEmail: { type: String },
    disbursedAmountTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Scholarship = mongoose.model<IScholarship>('Scholarship', ScholarshipSchema);
