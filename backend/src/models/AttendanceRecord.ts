import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord extends Document {
  studentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  department: string;
  semester: number;
  academicYear: string;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number; // dynamically computed or cached
  sessions: Array<{
    date: Date;
    status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'OD';
    remarks?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, default: '2025-2026' },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    totalClasses: { type: Number, required: true, default: 0 },
    attendedClasses: { type: Number, required: true, default: 0 },
    percentage: { type: Number, default: 100 },
    sessions: [
      {
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['PRESENT', 'ABSENT', 'LEAVE', 'OD'], default: 'PRESENT' },
        remarks: String,
      },
    ],
  },
  { timestamps: true }
);

AttendanceRecordSchema.pre('save', function (next) {
  if (this.totalClasses > 0) {
    this.percentage = Math.round((this.attendedClasses / this.totalClasses) * 1000) / 10;
  } else {
    this.percentage = 100;
  }
  next();
});

export const AttendanceRecord = mongoose.model<IAttendanceRecord>(
  'AttendanceRecord',
  AttendanceRecordSchema
);
