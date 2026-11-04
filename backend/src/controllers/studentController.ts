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

export const saveMyAcademicRecord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const {
      semester,
      academicYear,
      sgpa,
      cgpa,
      totalCredits,
      earnedCredits,
      backlogs,
      subjects,
    } = req.body;

    if (!semester) {
      return res.status(400).json({ success: false, message: 'Semester is required.' });
    }

    // Process and validate subjects
    const processedSubjects = (subjects || []).map((sub: any) => {
      const internalMarks = Number(sub.internalMarks) || 0;
      const externalMarks = Number(sub.externalMarks) || 0;
      const totalMarks = sub.totalMarks !== undefined ? Number(sub.totalMarks) : internalMarks + externalMarks;
      const maxMarks = Number(sub.maxMarks) || 100;
      const credits = Number(sub.credits) || 4;

      let grade = sub.grade;
      let gradePoints = Number(sub.gradePoints);
      let status = sub.status || 'PASS';

      if (!grade) {
        if (totalMarks >= 90) {
          grade = 'O';
          gradePoints = 10;
        } else if (totalMarks >= 80) {
          grade = 'A+';
          gradePoints = 9;
        } else if (totalMarks >= 70) {
          grade = 'A';
          gradePoints = 8;
        } else if (totalMarks >= 60) {
          grade = 'B+';
          gradePoints = 7;
        } else if (totalMarks >= 50) {
          grade = 'B';
          gradePoints = 6;
        } else if (totalMarks >= 40) {
          grade = 'C';
          gradePoints = 5;
        } else {
          grade = 'F';
          gradePoints = 0;
          status = 'FAIL';
        }
      }

      return {
        subjectCode: sub.subjectCode || 'BTCS-101',
        subjectName: sub.subjectName || 'Course Subject',
        credits,
        internalMarks,
        externalMarks,
        totalMarks,
        maxMarks,
        grade,
        gradePoints: gradePoints !== undefined ? gradePoints : 0,
        status,
      };
    });

    const computedBacklogs =
      backlogs !== undefined
        ? Number(backlogs)
        : processedSubjects.filter((s: any) => s.status === 'FAIL').length;

    let computedSgpa = Number(sgpa) || 0;
    if (!computedSgpa && processedSubjects.length > 0) {
      const totalCreds = processedSubjects.reduce((sum: number, s: any) => sum + s.credits, 0);
      const totalPoints = processedSubjects.reduce(
        (sum: number, s: any) => sum + s.credits * (s.gradePoints || 0),
        0
      );
      computedSgpa = totalCreds > 0 ? parseFloat((totalPoints / totalCreds).toFixed(2)) : 0;
    }

    const computedCgpa = Number(cgpa) > 0 ? Number(cgpa) : computedSgpa;

    let record = await AcademicRecord.findOne({
      studentId: profile._id,
      semester: Number(semester),
    });

    const totalCredsVal =
      Number(totalCredits) ||
      processedSubjects.reduce((sum: number, s: any) => sum + s.credits, 0) ||
      24;
    const earnedCredsVal =
      Number(earnedCredits) ||
      processedSubjects
        .filter((s: any) => s.status !== 'FAIL')
        .reduce((sum: number, s: any) => sum + s.credits, 0) ||
      24;

    if (record) {
      record.academicYear = academicYear || record.academicYear || '2025-2026';
      record.sgpa = computedSgpa;
      record.cgpa = computedCgpa;
      record.totalCredits = totalCredsVal;
      record.earnedCredits = earnedCredsVal;
      record.backlogs = computedBacklogs;
      record.subjects = processedSubjects;
      await record.save();
    } else {
      record = await AcademicRecord.create({
        studentId: profile._id,
        userId: req.user?._id,
        semester: Number(semester),
        academicYear: academicYear || '2025-2026',
        sgpa: computedSgpa,
        cgpa: computedCgpa,
        totalCredits: totalCredsVal,
        earnedCredits: earnedCredsVal,
        backlogs: computedBacklogs,
        subjects: processedSubjects,
      });
    }

    // Keep StudentProfile in sync with latest CGPA and backlogs
    if (computedCgpa > 0) {
      profile.cgpa = computedCgpa;
    }
    profile.activeBacklogs = computedBacklogs;
    if (Number(semester) >= (profile.semester || 1)) {
      profile.semester = Number(semester);
    }
    await profile.save();

    await logAudit({
      req,
      action: 'ACADEMIC_RECORD_UPDATED',
      entityType: 'AcademicRecord',
      entityId: (record._id as any).toString(),
      description: `Manual academic entry for Semester ${semester} saved (CGPA: ${computedCgpa})`,
    });

    return res.status(200).json({
      success: true,
      message: `Academic performance for Semester ${semester} saved successfully.`,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMyAcademicRecord = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const { id } = req.params;
    await AcademicRecord.findOneAndDelete({ _id: id, studentId: profile._id });

    // Recalculate student profile CGPA from remaining records if any
    const remaining = await AcademicRecord.find({ studentId: profile._id }).sort({ semester: -1 });
    if (remaining.length > 0) {
      profile.cgpa = remaining[0].cgpa || remaining[0].sgpa;
      profile.activeBacklogs = remaining.reduce((sum, r) => sum + (r.backlogs || 0), 0);
    } else {
      profile.cgpa = 0;
      profile.activeBacklogs = 0;
    }
    await profile.save();

    return res.status(200).json({ success: true, message: 'Academic record deleted successfully.' });
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
