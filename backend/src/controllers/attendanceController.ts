import { Response, NextFunction } from 'express';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AttendanceService } from '../services/attendanceService.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';

export const getStudentAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;
    const analytics = await AttendanceService.getStudentAnalytics(studentId);
    const profile = await StudentProfile.findById(studentId);

    return res.status(200).json({
      success: true,
      data: {
        student: profile,
        analytics,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLowAttendanceStudents = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const students = await StudentProfile.find();
    const lowAttendanceList: any[] = [];

    for (const student of students) {
      const records = await AttendanceRecord.find({ studentId: student._id });
      let total = 0;
      let attended = 0;
      records.forEach((r) => {
        total += r.totalClasses;
        attended += r.attendedClasses;
      });

      const pct = total > 0 ? Math.round((attended / total) * 1000) / 10 : 100;

      if (pct < 75) {
        const { neededToAttend } = AttendanceService.calculateRecoveryNeeded(attended, total, 75);
        lowAttendanceList.push({
          studentId: student._id,
          name: `${student.firstName} ${student.lastName}`,
          rollNumber: student.rollNumber,
          department: student.department,
          semester: student.semester,
          percentage: pct,
          totalClasses: total,
          attendedClasses: attended,
          difference: Math.round((75 - pct) * 10) / 10,
          classesNeededForRecovery: neededToAttend,
          risk: pct < 60 ? 'CRITICAL' : 'WARNING',
        });
      }
    }

    // Sort lowest attendance first
    lowAttendanceList.sort((a, b) => a.percentage - b.percentage);

    return res.status(200).json({
      success: true,
      data: lowAttendanceList,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAttendanceRecord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId, subjectCode, totalClasses, attendedClasses } = req.body;

    let record = await AttendanceRecord.findOne({ studentId, subjectCode });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    record.totalClasses = Number(totalClasses);
    record.attendedClasses = Number(attendedClasses);
    await record.save();

    await logAudit({
      req,
      action: 'ATTENDANCE_RECORD_UPDATED',
      entityType: 'AttendanceRecord',
      entityId: (record._id as any).toString(),
      description: `Updated attendance for subject ${subjectCode}: ${attendedClasses}/${totalClasses}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const sendLowAttendanceWarnings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const students = await StudentProfile.find();
    let sentCount = 0;

    for (const student of students) {
      const records = await AttendanceRecord.find({ studentId: student._id });
      let total = 0;
      let attended = 0;
      records.forEach((r) => {
        total += r.totalClasses;
        attended += r.attendedClasses;
      });
      const pct = total > 0 ? Math.round((attended / total) * 1000) / 10 : 100;

      if (pct < 75) {
        const { neededToAttend } = AttendanceService.calculateRecoveryNeeded(attended, total, 75);

        await Notification.create({
          recipientId: student.userId,
          title: '⚠️ Critical Attendance Warning',
          message: `Your current cumulative attendance is ${pct}%, which is below the mandatory 75% scholarship threshold. You must attend the next ${neededToAttend} consecutive classes to recover compliance.`,
          type: 'ATTENDANCE',
          link: '/student/attendance',
        });
        sentCount += 1;
      }
    }

    await logAudit({
      req,
      action: 'ATTENDANCE_WARNINGS_DISPATCHED',
      entityType: 'Notification',
      description: `Dispatched low attendance warnings to ${sentCount} students.`,
    });

    return res.status(200).json({
      success: true,
      message: `Successfully dispatched warnings to ${sentCount} students with low attendance.`,
    });
  } catch (error) {
    next(error);
  }
};
