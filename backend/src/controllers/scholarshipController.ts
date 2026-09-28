import { Request, Response, NextFunction } from 'express';
import { Scholarship } from '../models/Scholarship.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { EligibilityService } from '../services/eligibilityService.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';

export const listScholarships = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { department, category, type, search, status } = req.query;

    const query: any = {};
    if (status) query.status = status;
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
    const scholarship = await Scholarship.create(req.body);

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
    const scholarship = await Scholarship.findByIdAndUpdate(id, req.body, { new: true });

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
