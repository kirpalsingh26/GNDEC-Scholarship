import { Response, NextFunction } from 'express';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { Scholarship } from '../models/Scholarship.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { StudentDocument } from '../models/Document.js';
import { Notification } from '../models/Notification.js';
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
        attendancePercentage: 84.5,
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

    // Notify student
    await Notification.create({
      recipientId: req.user?._id,
      title: 'Application Submitted Successfully',
      message: `Your application #${appNumber} for '${scholarship.title}' has been received and queued for document verification.`,
      type: 'APPLICATION',
      link: `/student/applications/${application._id}`,
      relatedEntityId: application._id,
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

    return res.status(200).json({
      success: true,
      data: applications,
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

    // Notify student
    await Notification.create({
      recipientId: application.userId,
      title: `Application Update: ${status.replace(/_/g, ' ')}`,
      message: `Your application #${application.applicationNumber} status is now '${status.replace(/_/g, ' ')}'. Notes: ${remarks || 'Review in progress.'}`,
      type: 'APPLICATION',
      link: `/student/applications/${application._id}`,
      relatedEntityId: application._id,
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
