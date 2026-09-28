import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { StudentDocument } from '../models/Document.js';
import { DOCUMENT_STATUS } from '../config/constants.js';

export const exportApplicationsCsv = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const csvData = await ReportService.exportApplicationsCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment(`ScholarSphere_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    return res.send(csvData);
  } catch (error) {
    next(error);
  }
};

export const exportApplicationsExcel = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await ReportService.exportApplicationsExcel();
    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.attachment(`ScholarSphere_Applications_${new Date().toISOString().slice(0, 10)}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const exportApplicationPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await ReportService.generateApplicationPdf(id);
    res.header('Content-Type', 'application/pdf');
    res.attachment(`ScholarSphere_Certificate_${id}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const getPublicQRVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    const student = await StudentProfile.findOne({ qrVerificationToken: token }).select(
      'firstName lastName studentId rollNumber department course year semester category isProfileComplete'
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired student verification token.',
      });
    }

    // Fetch verified application summary (sanitized, zero sensitive bank/income/aadhaar exposed)
    const applications = await ScholarshipApplication.find({ studentId: student._id })
      .populate('scholarshipId', 'title code provider amount')
      .select('applicationNumber status academicYear appliedDate');

    const totalVerifiedDocs = await StudentDocument.countDocuments({
      studentId: student._id,
      status: DOCUMENT_STATUS.VERIFIED,
    });

    return res.status(200).json({
      success: true,
      message: 'Official Student Scholarship Verification Record',
      data: {
        institution: 'Guru Nanak Dev Engineering College, Ludhiana (GNDEC)',
        student: {
          fullName: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          rollNumber: student.rollNumber,
          department: student.department,
          course: student.course,
          year: student.year,
          semester: student.semester,
        },
        verificationStatus: 'GENUINE_ENROLLED_STUDENT',
        verifiedDocumentsCount: totalVerifiedDocs,
        scholarshipApplications: applications,
        issuedBy: 'ScholarSphere Central Financial Aid Committee',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};
