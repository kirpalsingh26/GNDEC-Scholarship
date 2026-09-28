import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicRecord extends Document {
  studentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  semester: number;
  academicYear: string;
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  earnedCredits: number;
  backlogs: number;
  subjects: Array<{
    subjectCode: string;
    subjectName: string;
    credits: number;
    internalMarks: number;
    externalMarks: number;
    totalMarks: number;
    maxMarks: number;
    grade: string;
    gradePoints: number;
    status: 'PASS' | 'FAIL' | 'ABSENT';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicRecordSchema = new Schema<IAcademicRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, default: '2025-2026' },
    sgpa: { type: Number, required: true, default: 0 },
    cgpa: { type: Number, required: true, default: 0 },
    totalCredits: { type: Number, default: 24 },
    earnedCredits: { type: Number, default: 24 },
    backlogs: { type: Number, default: 0 },
    subjects: [
      {
        subjectCode: String,
        subjectName: String,
        credits: Number,
        internalMarks: Number,
        externalMarks: Number,
        totalMarks: Number,
        maxMarks: { type: Number, default: 100 },
        grade: String,
        gradePoints: Number,
        status: { type: String, enum: ['PASS', 'FAIL', 'ABSENT'], default: 'PASS' },
      },
    ],
  },
  { timestamps: true }
);

export const AcademicRecord = mongoose.model<IAcademicRecord>('AcademicRecord', AcademicRecordSchema);
