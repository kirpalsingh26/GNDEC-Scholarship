import { Request, Response, NextFunction } from 'express';
import { Scholarship } from '../models/Scholarship.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { EligibilityService } from '../services/eligibilityService.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Automatically checks and updates deadlines for active scholarships.
 * If an active scholarship's deadline has passed, automatically extends it by 30 days
 * for the ongoing academic cycle, ensuring deadlines remain live and up to date.
 */
export const syncScholarshipDeadlines = async () => {
  const now = new Date();
  const expiredActive = await Scholarship.find({
    status: 'ACTIVE',
    deadline: { $lt: now },
  });

  if (expiredActive.length > 0) {
    for (const sch of expiredActive) {
      sch.deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await sch.save();
    }
  }

  // Ensure minimum CGPA requirement is at least 6.0 across all scholarships
  await Scholarship.updateMany(
    { $or: [{ 'rules.minCgpa': { $lt: 6 } }, { 'rules.minCgpa': { $exists: false } }] },
    { $set: { 'rules.minCgpa': 6 } }
  );
};

export const listScholarships = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Automatically update and maintain active scholarship deadlines
    await syncScholarshipDeadlines();

    const { department, category, type, search, status } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'ARCHIVED' };
    }
    if (type) query.type = type;
    if (department) query['rules.allowedDepartments'] = { $in: [department] };
    if (category) query['rules.allowedCategories'] = { $in: [category] };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const scholarships = await Scholarship.find(query).sort({ deadline: 1 });

    // If logged-in user is a student, attach live eligibility assessment summary to each scholarship!
    let enrichedScholarships = scholarships;
    if (req.user && req.user.role === 'STUDENT') {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile) {
        const evaluated = await Promise.all(
          scholarships.map(async (sch) => {
            const evalResult = await EligibilityService.evaluateStudent(profile, sch);
            return {
              ...sch.toObject(),
              eligibility: evalResult,
            };
          })
        );
        return res.status(200).json({ success: true, data: evaluated });
      }
    }

    return res.status(200).json({ success: true, data: enrichedScholarships });
  } catch (error) {
    next(error);
  }
};

export const getScholarshipById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const scholarship = await Scholarship.findById(id);

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    let eligibility: any = null;
    if (req.user && req.user.role === 'STUDENT') {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile) {
        eligibility = await EligibilityService.evaluateStudent(profile, scholarship);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        ...scholarship.toObject(),
        eligibility,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkEligibilityForScholarship = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const scholarship = await Scholarship.findById(id);
    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const evaluation = await EligibilityService.evaluateStudent(profile, scholarship);
    return res.status(200).json({ success: true, data: evaluation });
  } catch (error) {
    next(error);
  }
};

export const createScholarship = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payload = { ...req.body };
    if (!payload.rules) payload.rules = {};
    payload.rules.minCgpa = Math.max(6, Number(payload.rules.minCgpa || 6));

    const scholarship = await Scholarship.create(payload);

    await logAudit({
      req,
      action: 'SCHOLARSHIP_CREATED',
      entityType: 'Scholarship',
      entityId: (scholarship._id as any).toString(),
      description: `Created scholarship: ${scholarship.title} (${scholarship.code})`,
    });

    return res.status(201).json({
      success: true,
      message: 'Scholarship program created successfully.',
      data: scholarship,
    });
  } catch (error) {
    next(error);
  }
};

export const updateScholarship = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.rules) {
      payload.rules.minCgpa = Math.max(6, Number(payload.rules.minCgpa || 6));
    }

    const scholarship = await Scholarship.findByIdAndUpdate(id, payload, { new: true });

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    await logAudit({
      req,
      action: 'SCHOLARSHIP_UPDATED',
      entityType: 'Scholarship',
      entityId: (scholarship._id as any).toString(),
      description: `Updated scholarship rules/info: ${scholarship.title}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Scholarship updated successfully.',
      data: scholarship,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScholarship = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const scholarship = await Scholarship.findByIdAndDelete(id);

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    await logAudit({
      req,
      action: 'SCHOLARSHIP_DELETED',
      entityType: 'Scholarship',
      entityId: id,
      description: `Deleted scholarship: ${scholarship.title}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Scholarship deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
