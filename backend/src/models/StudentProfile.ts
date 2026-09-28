import mongoose, { Schema, Document } from 'mongoose';
import { CATEGORIES } from '../config/constants.js';

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string; // GNDEC Unique ID (e.g., URN/CRN)
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  department: string;
  departmentId?: mongoose.Types.ObjectId;
  course: string; // e.g. B.Tech, M.Tech, MCA
  year: number; // 1, 2, 3, 4
  semester: number; // 1 to 8
  category: string; // GENERAL, SC, ST, OBC, EWS, MINORITY, PWD
  familyIncome: number; // Annual in INR
  cgpa: number;
  activeBacklogs: number;
  totalBacklogs: number;
  
  // Bank details for direct benefit disbursement
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };

  // Guardian Info
  guardian?: {
    name?: string;
    relation?: string;
    phone?: string;
    occupation?: string;
    annualIncome?: number;
  };

  // Safe QR Verification Token
  qrVerificationToken: string;
  isProfileComplete: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    studentId: { type: String, required: true, unique: true, index: true },
    rollNumber: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    department: { type: String, required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    course: { type: String, required: true, default: 'B.Tech' },
    year: { type: Number, required: true, min: 1, max: 5 },
    semester: { type: Number, required: true, min: 1, max: 10 },
    category: { type: String, enum: CATEGORIES, required: true, default: 'GENERAL' },
    familyIncome: { type: Number, required: true, default: 0 },
    cgpa: { type: Number, default: 0.0, min: 0.0, max: 10.0 },
    activeBacklogs: { type: Number, default: 0, min: 0 },
    totalBacklogs: { type: Number, default: 0, min: 0 },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
    },
    guardian: {
      name: String,
      relation: String,
      phone: String,
      occupation: String,
      annualIncome: Number,
    },
    qrVerificationToken: { type: String, required: true, unique: true, index: true },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
