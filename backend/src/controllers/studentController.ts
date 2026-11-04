import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { StudentDocument } from '../models/Document.js';
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

export const getStudentDashboardData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const applications = await ScholarshipApplication.find({ studentId: profile._id })
      .populate('scholarshipId')
      .sort({ appliedDate: -1 });

    // Evaluate 6-month validity for approved applications
    const now = new Date();
    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
    for (const app of applications) {
      if (app.status === 'APPROVED') {
        const approvalDate = app.reviewedDate || app.updatedAt || app.createdAt;
        const expiry = app.expiryDate || new Date(approvalDate.getTime() + sixMonthsMs);
        const isExpired = now.getTime() > expiry.getTime();
        if (app.isExpired !== isExpired || !app.expiryDate) {
          app.isExpired = isExpired;
          app.expiryDate = expiry;
          await app.save();
        }
      }
    }

    const documents = await StudentDocument.find({ studentId: profile._id }).sort({ updatedAt: -1 });
    const verifiedDocuments = documents.filter((d) => d.status === 'VERIFIED').length;
    const hasReuploadRequired = documents.some((d) => d.status === 'REUPLOAD_REQUIRED');
    const hasSubmittedApplication = applications.length > 0;
    const latestApplication = applications[0] || null;
    const isApproved = latestApplication?.status === 'APPROVED' && profile.isProfileComplete === true;

    let onboardingStage: 'DOCUMENTS_REQUIRED' | 'PENDING_VERIFICATION' | 'ACTION_REQUIRED' | 'APPROVED' =
      'PENDING_VERIFICATION';

    if (documents.length === 0 || !hasSubmittedApplication) {
      onboardingStage = 'DOCUMENTS_REQUIRED';
    } else if (hasReuploadRequired || latestApplication?.status === 'ADDITIONAL_DOCUMENTS_REQUIRED') {
      onboardingStage = 'ACTION_REQUIRED';
    } else if (isApproved) {
      onboardingStage = 'APPROVED';
    } else {
      onboardingStage = 'PENDING_VERIFICATION';
    }

    return res.status(200).json({
      success: true,
      data: {
        profile,
        applications,
        documents,
        latestApplication,
        onboardingStage,
        isVerified: isApproved,
        kpis: {
          activeApplications: applications.filter((a) => a.status !== 'REJECTED').length,
          verifiedDocuments,
          totalDocuments: documents.length,
          requiredDocumentsCount: 6,
          isVerified: isApproved,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
