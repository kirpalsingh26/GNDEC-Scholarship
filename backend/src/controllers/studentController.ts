import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceService } from '../services/attendanceService.js';
import { logAudit } from '../utils/auditLogger.js';

export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const { phone, address, familyIncome, bankDetails, guardian, category } = req.body;

    if (phone) profile.phone = phone;
    if (address) profile.address = { ...profile.address, ...address };
    if (familyIncome !== undefined) profile.familyIncome = Number(familyIncome);
    if (category) profile.category = category;
    if (bankDetails) profile.bankDetails = { ...profile.bankDetails, ...bankDetails };
    if (guardian) profile.guardian = { ...profile.guardian, ...guardian };

    profile.isProfileComplete = true;
    await profile.save();

    await logAudit({
      req,
      action: 'STUDENT_PROFILE_UPDATED',
      entityType: 'StudentProfile',
      entityId: (profile._id as any).toString(),
      description: `Student updated profile: ${profile.firstName} ${profile.lastName} (${profile.rollNumber})`,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendanceAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const analytics = await AttendanceService.getStudentAnalytics((profile._id as any).toString());
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
};

export const getMyAcademicRecords = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const records = await AcademicRecord.find({ studentId: profile._id }).sort({ semester: 1 });
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};
