export type Role = 'STUDENT' | 'OFFICER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
}

export interface StudentProfile {
  _id: string;
  studentId: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  department: string;
  course: string;
  year: number;
  semester: number;
  category: string;
  familyIncome: number;
  cgpa: number;
  activeBacklogs: number;
  totalBacklogs: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
  guardian?: {
    name?: string;
    relation?: string;
    phone?: string;
    occupation?: string;
    annualIncome?: number;
  };
  qrVerificationToken: string;
  isProfileComplete: boolean;
}

export interface ScholarshipRule {
  minCgpa?: number;
  minAttendance?: number;
  maxFamilyIncome?: number;
  allowedCategories?: string[];
  allowedDepartments?: string[];
  allowedCourses?: string[];
  maxBacklogs?: number;
  genderRestriction?: 'ALL' | 'FEMALE_ONLY' | 'MALE_ONLY';
}

export interface Scholarship {
  _id: string;
  title: string;
  code: string;
  provider: string;
  type: 'MERIT' | 'MEANS' | 'MERIT_CUM_MEANS' | 'RESERVATION' | 'SPECIAL_SCHEME';
  description: string;
  amount: number;
  frequency: 'ONE_TIME' | 'ANNUAL' | 'SEMESTER';
  academicYear: string;
  deadline: string;
  isRenewable: boolean;
  totalSeats?: number;
  availableSeats?: number;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
  requiredDocuments: string[];
  rules: ScholarshipRule;
  eligibility?: {
    isEligible: boolean;
    scorePercentage: number;
    criteriaBreakdown: Array<{
      key: string;
      name: string;
      satisfied: boolean;
      required: string;
      actual: string;
      severity: 'CRITICAL' | 'WARNING' | 'INFO';
      feedback: string;
    }>;
    pendingDocuments: string[];
    summaryMessage: string;
  };
}

export interface ScholarshipApplication {
  _id: string;
  applicationNumber: string;
  studentId: any;
  userId: any;
  scholarshipId: any;
  academicYear: string;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'DOCUMENT_VERIFICATION'
    | 'ADDITIONAL_DOCUMENTS_REQUIRED'
    | 'ELIGIBILITY_REVIEW'
    | 'APPROVED'
    | 'REJECTED';
  appliedDate: string;
  reviewedDate?: string;
  reviewedBy?: any;
  reviewerNotes?: string;
  rejectionReason?: string;
  snapshot: {
    cgpa: number;
    attendancePercentage: number;
    familyIncome: number;
    category: string;
    department: string;
    course: string;
    year: number;
    semester: number;
    activeBacklogs: number;
  };
  eligibilitySummary?: {
    isEligible: boolean;
    breakdown: Array<{
      criterion: string;
      satisfied: boolean;
      required: string;
      actual: string;
    }>;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    updatedBy?: string;
    updaterRole?: string;
    remarks: string;
  }>;
  isRenewal: boolean;
  documents?: StudentDocument[];
}

export interface DocumentVersion {
  _id?: string;
  versionNumber: number;
  fileName: string;
  originalName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'REUPLOAD_REQUIRED' | 'EXPIRED';
  verifiedBy?: any;
  verifierName?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  rejectionComments?: string;
  reviewerComments?: string;
  ocrData?: {
    extractedStudentName?: string;
    extractedDocType?: string;
    extractedCertificateNo?: string;
    extractedIssueDate?: string;
    extractedExpiryDate?: string;
    issuingAuthority?: string;
    extractedIncome?: number;
    extractedCaste?: string;
    nameMatchConfidence?: number;
    validationFlags?: {
      isExpired?: boolean;
      nameMismatch?: boolean;
      typeMismatch?: boolean;
      lowConfidence?: boolean;
    };
    rawTextPreview?: string;
  };
}

export interface StudentDocument {
  _id: string;
  studentId: any;
  userId: any;
  documentType: string;
  title: string;
  currentVersion: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'REUPLOAD_REQUIRED' | 'EXPIRED';
  versions: DocumentVersion[];
  expiryDate?: string;
  certificateNumber?: string;
  updatedAt: string;
}

export interface SubjectAttendanceSummary {
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  classesNeededFor75: number;
  classesCanAffordToMiss: number;
}

export interface AttendanceAnalyticsSummary {
  overallPercentage: number;
  totalClasses: number;
  attendedClasses: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  consecutiveClassesNeeded: number;
  classesCanAffordToMiss: number;
  recoveryPlanAdvice: string;
  subjectBreakdown: SubjectAttendanceSummary[];
  monthlyTrend: Array<{ month: string; percentage: number; attended: number; total: number }>;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  studentId: any;
  userId: any;
  category: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_STUDENT' | 'RESOLVED' | 'CLOSED';
  assignedOfficerName?: string;
  messages: Array<{
    _id: string;
    senderId: any;
    senderName: string;
    senderRole: string;
    message: string;
    sentAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'APPLICATION' | 'DOCUMENT' | 'DEADLINE' | 'ATTENDANCE' | 'ELIGIBILITY' | 'RENEWAL' | 'ANNOUNCEMENT';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLogItem {
  _id: string;
  actorName: string;
  actorEmail?: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  timestamp: string;
}
