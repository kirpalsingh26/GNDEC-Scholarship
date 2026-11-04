import { Response, NextFunction } from 'express';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { Scholarship } from '../models/Scholarship.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { StudentDocument } from '../models/Document.js';
import { Notification } from '../models/Notification.js';
import { notifyUser } from '../services/pushNotificationService.js';
import { EligibilityService } from '../services/eligibilityService.js';
import { APPLICATION_STATUS, DOCUMENT_STATUS } from '../config/constants.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';

export const submitApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { scholarshipId, isRenewal = false, previousApplicationId } = req.body;

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    if (scholarship.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'This scholarship program is currently not accepting applications.',
      });
    }

    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Check if application already exists for this academic cycle
    const existing = await ScholarshipApplication.findOne({
      studentId: profile._id,
      scholarshipId: scholarship._id,
      academicYear: scholarship.academicYear || '2025-2026',
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this scholarship program in this academic cycle.',
      });
    }

    // Require at least one uploaded document before allowing submission
    const userDocs = await StudentDocument.find({ studentId: profile._id });
    if (userDocs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your mandatory documents before submitting your scholarship application.',
      });
    }

    // Evaluate live eligibility
    const evalResult = await EligibilityService.evaluateStudent(profile, scholarship);

    // Generate unique Application ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appNumber = `GNDEC-${scholarship.code}-${profile.rollNumber}-${randomSuffix}`;

    const application = await ScholarshipApplication.create({
      applicationNumber: appNumber,
      studentId: profile._id,
      userId: req.user?._id,
      scholarshipId: scholarship._id,
      academicYear: scholarship.academicYear || '2025-2026',
      status: APPLICATION_STATUS.SUBMITTED,
      appliedDate: new Date(),
      snapshot: {
        cgpa: profile.cgpa,
        familyIncome: profile.familyIncome,
        category: profile.category,
        department: profile.department,
        course: profile.course,
        year: profile.year,
        semester: profile.semester,
        activeBacklogs: profile.activeBacklogs,
      },
      eligibilitySummary: {
        isEligible: evalResult.isEligible,
        breakdown: evalResult.criteriaBreakdown.map((c) => ({
          criterion: c.name,
          satisfied: c.satisfied,
          required: c.required,
          actual: c.actual,
        })),
      },
      timeline: [
        {
          status: APPLICATION_STATUS.SUBMITTED,
          timestamp: new Date(),
          updatedBy: req.user?.name,
          updaterRole: 'STUDENT',
          remarks: 'Application submitted along with initial credentials and documents.',
        },
      ],
      isRenewal,
      previousApplicationId,
    });

    // Link unlinked uploaded documents to this newly created application
    await StudentDocument.updateMany(
      { studentId: profile._id, applicationId: { $exists: false } },
      { applicationId: application._id }
    );

    // Notify student via in-app notification and web push
    await notifyUser({
      recipientId: (req.user?._id || application.userId) as any,
      title: 'Application Submitted Successfully',
      message: `Your application #${appNumber} for '${scholarship.title}' has been received and queued for document verification.`,
      type: 'APPLICATION',
      link: `/student/applications/${application._id}`,
      relatedEntityId: application._id as any,
    });

    await logAudit({
      req,
      action: 'APPLICATION_SUBMITTED',
      entityType: 'ScholarshipApplication',
      entityId: (application._id as any).toString(),
      description: `Submitted application ${appNumber} for ${scholarship.title}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const listApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, scholarshipId, department, search, page = 1, limit = 20 } = req.query;

    const query: any = {};

    // If student, only show their own applications
    if (req.user?.role === 'STUDENT') {
      query.userId = req.user._id;
    } else {
      if (status) query.status = status;
      if (scholarshipId) query.scholarshipId = scholarshipId;
      if (department) query['snapshot.department'] = department;
    }

    if (search) {
      query.$or = [
        { applicationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await ScholarshipApplication.countDocuments(query);
    const applications = await ScholarshipApplication.find(query)
      .populate('studentId')
      .populate('scholarshipId')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Check 6-month validity for APPROVED applications
    const now = new Date();
    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
    const processedApplications = await Promise.all(
      applications.map(async (app) => {
        if (app.status === 'APPROVED') {
          const approvalDate = app.reviewedDate || app.updatedAt || app.createdAt;
          const expiry = app.expiryDate || new Date(approvalDate.getTime() + sixMonthsMs);
          const isExpired = now.getTime() > expiry.getTime();

          if (!app.isExpired && isExpired) {
            app.isExpired = true;
            app.expiryDate = expiry;
            await app.save();
            await notifyUser({
              recipientId: app.userId,
              title: 'Scholarship Grant Validity Expired (6 Months)',
              message: `Your scholarship approval for application #${app.applicationNumber} has concluded its active 6-month validity window.`,
              type: 'APPLICATION',
              link: `/student/applications/${app._id}`,
              relatedEntityId: app._id as any,
            });
          } else if (app.isExpired !== isExpired || !app.expiryDate) {
            app.isExpired = isExpired;
            app.expiryDate = expiry;
            await app.save();
          }
        }
        return app;
      })
    );

    const result = req.query.hideExpired === 'true'
      ? processedApplications.filter((app) => !app.isExpired)
      : processedApplications;

    return res.status(200).json({
      success: true,
      data: result,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const application = await ScholarshipApplication.findById(id)
      .populate('studentId')
      .populate('scholarshipId')
      .populate('reviewedBy', 'name email role');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.status === 'APPROVED') {
      const now = new Date();
      const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
      const approvalDate = application.reviewedDate || application.updatedAt || application.createdAt;
      const expiry = application.expiryDate || new Date(approvalDate.getTime() + sixMonthsMs);
      const isExpired = now.getTime() > expiry.getTime();
      if (application.isExpired !== isExpired || !application.expiryDate) {
        application.isExpired = isExpired;
        application.expiryDate = expiry;
        await application.save();
      }
    }

    // Role check: student can only view their own
    if (
      req.user?.role === 'STUDENT' &&
      application.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Fetch associated uploaded documents for this student
    const documents = await StudentDocument.find({ studentId: application.studentId });

    return res.status(200).json({
      success: true,
      data: {
        ...application.toObject(),
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, remarks, reviewerNotes, rejectionReason } = req.body;

    const application = await ScholarshipApplication.findById(id).populate('studentId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = status;
    application.reviewedBy = req.user?._id;
    application.reviewedDate = new Date();
    if (reviewerNotes) application.reviewerNotes = reviewerNotes;
    if (rejectionReason) application.rejectionReason = rejectionReason;

    application.timeline.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user?.name,
      updaterRole: req.user?.role,
      remarks: remarks || `Status updated to ${status} by scholarship committee.`,
    });

    await application.save();

    if (status === APPLICATION_STATUS.APPROVED) {
      // Keep approved applications valid for 6 months (180 days) post-approval
      const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
      application.expiryDate = new Date(Date.now() + sixMonthsMs);
      application.isExpired = false;
      await application.save();

      await StudentProfile.findByIdAndUpdate(application.studentId, {
        isProfileComplete: true,
      });
      // Automatically verify student documents that are under review
      await StudentDocument.updateMany(
        { studentId: application.studentId, status: { $ne: DOCUMENT_STATUS.REJECTED } },
        { status: DOCUMENT_STATUS.VERIFIED, latestVerifiedVersion: 1 }
      );
    } else if (status === APPLICATION_STATUS.REJECTED) {
      await StudentProfile.findByIdAndUpdate(application.studentId, {
        isProfileComplete: false,
      });
    }

    // Notify student via in-app notification and web push
    await notifyUser({
      recipientId: application.userId,
      title: `Application Update: ${status.replace(/_/g, ' ')}`,
      message: `Your application #${application.applicationNumber} status is now '${status.replace(/_/g, ' ')}'. Notes: ${remarks || 'Review in progress.'}`,
      type: 'APPLICATION',
      link: `/student/applications/${application._id}`,
      relatedEntityId: application._id as any,
    });

    await logAudit({
      req,
      action: `APPLICATION_${status}`,
      entityType: 'ScholarshipApplication',
      entityId: (application._id as any).toString(),
      description: `Application #${application.applicationNumber} updated to ${status} by ${req.user?.name}`,
      metadata: { status, remarks },
    });

    return res.status(200).json({
      success: true,
      message: `Application marked as ${status}.`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
