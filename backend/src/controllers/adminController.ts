import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Scholarship } from '../models/Scholarship.js';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { StudentDocument } from '../models/Document.js';
import { Department, Course, Subject } from '../models/Department.js';
import { AuditLog } from '../models/AuditLog.js';
import { SystemSetting } from '../models/AuditLog.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { APPLICATION_STATUS, DOCUMENT_STATUS } from '../config/constants.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';

export const getAdminDashboardStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalScholarships = await Scholarship.countDocuments();
    const totalApplications = await ScholarshipApplication.countDocuments();
    const approvedApplications = await ScholarshipApplication.countDocuments({
      status: APPLICATION_STATUS.APPROVED,
    });
    const rejectedApplications = await ScholarshipApplication.countDocuments({
      status: APPLICATION_STATUS.REJECTED,
    });
    const pendingApplications = await ScholarshipApplication.countDocuments({
      status: {
        $in: [
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.DOCUMENT_VERIFICATION,
          APPLICATION_STATUS.ELIGIBILITY_REVIEW,
          APPLICATION_STATUS.ADDITIONAL_DOCUMENTS_REQUIRED,
        ],
      },
    });

    const pendingDocs = await StudentDocument.countDocuments({
      status: { $in: [DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.UNDER_REVIEW] },
    });
    const verifiedDocs = await StudentDocument.countDocuments({
      status: DOCUMENT_STATUS.VERIFIED,
    });

    // Approval rate
    const approvalRate =
      totalApplications > 0
        ? Math.round((approvedApplications / totalApplications) * 100)
        : 0;

    // Applications by Status distribution for donut chart
    const statusDistribution = [
      { name: 'Approved', value: approvedApplications, color: '#10B981' },
      { name: 'Under Verification', value: pendingApplications, color: '#F59E0B' },
      { name: 'Rejected', value: rejectedApplications, color: '#EF4444' },
    ];

    // Department-wise distribution
    const deptStats = await StudentProfile.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const departmentDistribution = deptStats.map((d) => ({
      department: d._id || 'Unknown',
      students: d.count,
    }));

    // Calculate low attendance count
    const studentProfiles = await StudentProfile.find();
    let lowAttendanceCount = 0;
    for (const st of studentProfiles) {
      const records = await AttendanceRecord.find({ studentId: st._id });
      let tot = 0;
      let att = 0;
      records.forEach((r) => {
        tot += r.totalClasses;
        att += r.attendedClasses;
      });
      const pct = tot > 0 ? (att / tot) * 100 : 100;
      if (pct < 75) lowAttendanceCount += 1;
    }

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalStudents,
          totalScholarships,
          totalApplications,
          approvedApplications,
          pendingApplications,
          rejectedApplications,
          pendingDocs,
          verifiedDocs,
          lowAttendanceCount,
          approvalRate: `${approvalRate}%`,
          disbursedAmountTotal: '₹14,80,000',
        },
        statusDistribution,
        departmentDistribution,
        monthlyTrend: [
          { month: 'Jul', applications: 12, approved: 8 },
          { month: 'Aug', applications: 28, approved: 20 },
          { month: 'Sep', applications: 45, approved: 35 },
          { month: 'Oct', applications: 38, approved: 26 },
          { month: 'Nov', applications: 22, approved: 18 },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, status, search } = req.query;
    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (status) user.status = status;
    if (role) user.role = role;
    await user.save();

    await logAudit({
      req,
      action: 'USER_ROLE_STATUS_UPDATED',
      entityType: 'User',
      entityId: id,
      description: `Updated user ${user.name} (${user.email}) to Status: ${user.status}, Role: ${user.role}`,
    });

    return res.status(200).json({
      success: true,
      message: 'User status updated successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { action, actorRole, entityType, search, page = 1, limit = 50 } = req.query;
    const query: any = {};

    if (action) query.action = action;
    if (actorRole) query.actorRole = actorRole;
    if (entityType) query.entityType = entityType;
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { actorName: { $regex: search, $options: 'i' } },
        { actorEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: logs,
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

export const listDepartments = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    const courses = await Course.find().populate('departmentId');
    const subjects = await Subject.find().populate('departmentId');

    return res.status(200).json({
      success: true,
      data: {
        departments,
        courses,
        subjects,
      },
    });
  } catch (error) {
    next(error);
  }
};
