import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { ROLES } from '../config/constants.js';
import { logAudit } from '../utils/auditLogger.js';
import { AuthRequest } from '../middleware/auth.js';

const generateToken = (id: string, email: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'scholarsphere_super_secret_jwt_key_2026_gndec_portal';
  return jwt.sign({ id, email, role }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const registerStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      department,
      course = 'B.Tech',
      year = 1,
      semester = 1,
      phone,
      category = 'GENERAL',
      familyIncome = 250000,
    } = req.body;

    if (!email || !password || !name || !rollNumber || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, roll number, and department are required.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const existingRoll = await StudentProfile.findOne({ rollNumber });
    if (existingRoll) {
      return res.status(400).json({
        success: false,
        message: 'A student profile with this roll number already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: ROLES.STUDENT,
      status: 'ACTIVE',
      phone,
    });

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const qrToken = `GNDEC-VERIFY-${rollNumber}-${Date.now().toString(36).toUpperCase()}`;

    const profile = await StudentProfile.create({
      userId: user._id,
      studentId: `GNDEC-${rollNumber}`,
      rollNumber,
      firstName,
      lastName,
      email: user.email,
      phone: phone || '9876543210',
      department,
      course,
      year: Number(year),
      semester: Number(semester),
      category,
      familyIncome: Number(familyIncome),
      cgpa: 8.2,
      activeBacklogs: 0,
      totalBacklogs: 0,
      qrVerificationToken: qrToken,
      isProfileComplete: true,
    });

    await logAudit({
      actorId: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: (user._id as any).toString(),
      description: `Student registered: ${name} (${rollNumber}) in ${department}`,
    });

    const token = generateToken((user._id as any).toString(), user.email, user.role);

    return res.status(201).json({
      success: true,
      message: 'Student registration completed successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please contact administration.`,
      });
    }

    user.lastLogin = new Date();
    await user.save();

    let studentProfile = null;
    if (user.role === ROLES.STUDENT) {
      studentProfile = await StudentProfile.findOne({ userId: user._id });
    }

    const token = generateToken((user._id as any).toString(), user.email, user.role);

    await logAudit({
      actorId: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: (user._id as any).toString(),
      description: `${user.role} logged in: ${user.name} (${user.email})`,
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        profile: studentProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let profile = null;
    if (req.user.role === ROLES.STUDENT) {
      profile = await StudentProfile.findOne({ userId: req.user._id });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          avatar: req.user.avatar,
          phone: req.user.phone,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};
