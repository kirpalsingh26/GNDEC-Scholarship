import { IScholarship } from '../models/Scholarship.js';
import { IStudentProfile } from '../models/StudentProfile.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { StudentDocument } from '../models/Document.js';
import { DOCUMENT_STATUS } from '../config/constants.js';

export interface EligibilityCriterionResult {
  key: string;
  name: string;
  satisfied: boolean;
  required: string;
  actual: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  feedback: string;
}

export interface EligibilityEvaluation {
  isEligible: boolean;
  scholarshipId: string;
  scholarshipTitle: string;
  scorePercentage: number; // e.g. 100% if all criteria pass
  criteriaBreakdown: EligibilityCriterionResult[];
  pendingDocuments: string[];
  summaryMessage: string;
}

export class EligibilityService {
  /**
   * Evaluates if a student qualifies for a specific scholarship program
   */
  public static async evaluateStudent(
    student: IStudentProfile,
    scholarship: IScholarship
  ): Promise<EligibilityEvaluation> {
    const rules = scholarship.rules || {};
    const criteria: EligibilityCriterionResult[] = [];

    // 1. Fetch live attendance summary for student
    const attendanceRecords = await AttendanceRecord.find({ studentId: student._id });
    let totalClasses = 0;
    let attendedClasses = 0;
    attendanceRecords.forEach((rec) => {
      totalClasses += rec.totalClasses;
      attendedClasses += rec.attendedClasses;
    });
    const currentAttendancePct =
      totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 1000) / 10 : 100;

    // --- CRITERION 1: CGPA Requirement ---
    if (rules.minCgpa && rules.minCgpa > 0) {
      const satisfied = (student.cgpa || 0) >= rules.minCgpa;
      criteria.push({
        key: 'CGPA',
        name: 'Minimum CGPA Requirement',
        satisfied,
        required: `≥ ${rules.minCgpa.toFixed(2)} CGPA`,
        actual: `${(student.cgpa || 0).toFixed(2)} CGPA`,
        severity: 'CRITICAL',
        feedback: satisfied
          ? 'CGPA requirement successfully met.'
          : `Current CGPA (${student.cgpa}) is below the required threshold of ${rules.minCgpa}.`,
      });
    }

    // --- CRITERION 2: Attendance Requirement ---
    const minAttendance = rules.minAttendance || 75;
    const attendanceSatisfied = currentAttendancePct >= minAttendance;
    criteria.push({
      key: 'ATTENDANCE',
      name: 'Minimum Attendance Threshold',
      satisfied: attendanceSatisfied,
      required: `≥ ${minAttendance}%`,
      actual: `${currentAttendancePct}% (${attendedClasses}/${totalClasses} classes)`,
      severity: 'CRITICAL',
      feedback: attendanceSatisfied
        ? 'Attendance threshold verified and compliant.'
        : `Attendance (${currentAttendancePct}%) is below mandatory ${minAttendance}%.`,
    });

    // --- CRITERION 3: Family Income Ceiling ---
    if (rules.maxFamilyIncome && rules.maxFamilyIncome > 0) {
      const satisfied = (student.familyIncome || 0) <= rules.maxFamilyIncome;
      criteria.push({
        key: 'INCOME',
        name: 'Annual Family Income Limit',
        satisfied,
        required: `≤ ₹${rules.maxFamilyIncome.toLocaleString('en-IN')}`,
        actual: `₹${(student.familyIncome || 0).toLocaleString('en-IN')}`,
        severity: 'CRITICAL',
        feedback: satisfied
          ? 'Family income is within eligible limit.'
          : `Declared income of ₹${student.familyIncome.toLocaleString('en-IN')} exceeds the maximum allowance of ₹${rules.maxFamilyIncome.toLocaleString('en-IN')}.`,
      });
    }

    // --- CRITERION 4: Social / Reservation Category ---
    if (rules.allowedCategories && rules.allowedCategories.length > 0) {
      const satisfied = rules.allowedCategories.includes(student.category);
      criteria.push({
        key: 'CATEGORY',
        name: 'Eligible Reservation Category',
        satisfied,
        required: rules.allowedCategories.join(', '),
        actual: student.category || 'Not specified',
        severity: 'CRITICAL',
        feedback: satisfied
          ? `Candidate category '${student.category}' matches approved scheme criteria.`
          : `Scholarship is reserved for: ${rules.allowedCategories.join(', ')}.`,
      });
    }

    // --- CRITERION 5: Department / Branch ---
    if (rules.allowedDepartments && rules.allowedDepartments.length > 0) {
      const satisfied = rules.allowedDepartments.includes(student.department);
      criteria.push({
        key: 'DEPARTMENT',
        name: 'Academic Department / Branch',
        satisfied,
        required: rules.allowedDepartments.join(', '),
        actual: student.department,
        severity: 'CRITICAL',
        feedback: satisfied
          ? `Department '${student.department}' is eligible.`
          : `Scholarship restricted to: ${rules.allowedDepartments.join(', ')}.`,
      });
    }

    // --- CRITERION 6: Active Backlogs / Academic Standing ---
    if (rules.maxBacklogs !== undefined) {
      const satisfied = (student.activeBacklogs || 0) <= rules.maxBacklogs;
      criteria.push({
        key: 'BACKLOGS',
        name: 'Active Backlog Limit',
        satisfied,
        required: `≤ ${rules.maxBacklogs} active backlogs`,
        actual: `${student.activeBacklogs || 0} backlogs`,
        severity: 'CRITICAL',
        feedback: satisfied
          ? 'Academic record satisfies backlog criteria.'
          : `You have ${student.activeBacklogs} active backlogs (max allowed: ${rules.maxBacklogs}).`,
      });
    }

    // --- CRITERION 7: Gender Eligibility ---
    if (rules.genderRestriction && rules.genderRestriction !== 'ALL') {
      const isFemaleOnly = rules.genderRestriction === 'FEMALE_ONLY';
      const satisfied = isFemaleOnly ? student.gender === 'FEMALE' : student.gender === 'MALE';
      criteria.push({
        key: 'GENDER',
        name: 'Gender Scheme Restriction',
        satisfied,
        required: isFemaleOnly ? 'Female Students Only' : 'Male Students Only',
        actual: student.gender || 'Not specified',
        severity: 'CRITICAL',
        feedback: satisfied
          ? 'Gender criteria met.'
          : `This specialized grant is designated for ${isFemaleOnly ? 'female' : 'male'} candidates.`,
      });
    }

    // --- Check Document Readiness ---
    const requiredDocs = scholarship.requiredDocuments || [];
    const uploadedDocs = await StudentDocument.find({
      studentId: student._id,
      documentType: { $in: requiredDocs },
      status: { $in: [DOCUMENT_STATUS.VERIFIED, DOCUMENT_STATUS.UNDER_REVIEW, DOCUMENT_STATUS.PENDING] },
    });

    const uploadedDocTypes = uploadedDocs.map((d) => d.documentType);
    const pendingDocuments = requiredDocs.filter((type) => !uploadedDocTypes.includes(type));

    if (requiredDocs.length > 0) {
      const docsReady = pendingDocuments.length === 0;
      criteria.push({
        key: 'DOCUMENTS',
        name: 'Mandatory Documents Readiness',
        satisfied: docsReady,
        required: `${requiredDocs.length} certificates`,
        actual: `${uploadedDocTypes.length} uploaded (${pendingDocuments.length} pending)`,
        severity: 'WARNING',
        feedback: docsReady
          ? 'All mandatory certificates are uploaded or in vault.'
          : `Pending uploads needed: ${pendingDocuments.join(', ').replace(/_/g, ' ')}.`,
      });
    }

    // Overall Eligibility outcome
    const criticalCriteria = criteria.filter((c) => c.severity === 'CRITICAL');
    const isEligible = criticalCriteria.every((c) => c.satisfied);

    const totalCount = criteria.length;
    const satisfiedCount = criteria.filter((c) => c.satisfied).length;
    const scorePercentage = totalCount > 0 ? Math.round((satisfiedCount / totalCount) * 100) : 100;

    let summaryMessage = isEligible
      ? '🎉 You meet all core eligibility criteria for this scholarship opportunity!'
      : '⚠️ You currently do not meet one or more mandatory criteria for this scholarship.';

    if (isEligible && pendingDocuments.length > 0) {
      summaryMessage += ` Note: ${pendingDocuments.length} document(s) must still be submitted during application.`;
    }

    return {
      isEligible,
      scholarshipId: (scholarship._id as any).toString(),
      scholarshipTitle: scholarship.title,
      scorePercentage,
      criteriaBreakdown: criteria,
      pendingDocuments,
      summaryMessage,
    };
  }
}
