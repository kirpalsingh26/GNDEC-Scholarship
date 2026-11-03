import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Department, Course, Subject } from '../models/Department.js';
import { Scholarship } from '../models/Scholarship.js';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { StudentDocument } from '../models/Document.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { ROLES, APPLICATION_STATUS, DOCUMENT_STATUS, DOCUMENT_TYPES } from '../config/constants.js';

export const seedDatabase = async () => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log(`ℹ️ Database already contains ${existingUsers} users. Skipping initial seeding.`);
    return;
  }

  console.log('🌱 Seeding ScholarSphere GNDEC database with realistic academic datasets...');

  // 1. Create Departments & Courses
  const departmentsData = [
    { name: 'Computer Science and Engineering', code: 'CSE', headName: 'Dr. Paramjit Singh', contactEmail: 'cse_head@gndec.ac.in' },
    { name: 'Information Technology', code: 'IT', headName: 'Dr. Kiran Jyoti', contactEmail: 'it_head@gndec.ac.in' },
    { name: 'Electronics and Communication Engineering', code: 'ECE', headName: 'Dr. Balwinder Singh', contactEmail: 'ece_head@gndec.ac.in' },
    { name: 'Mechanical Engineering', code: 'ME', headName: 'Dr. Harmeet Singh', contactEmail: 'me_head@gndec.ac.in' },
    { name: 'Civil Engineering', code: 'CE', headName: 'Dr. Harvinder Singh', contactEmail: 'ce_head@gndec.ac.in' },
  ];

  const createdDepts = await Department.insertMany(departmentsData);
  const deptMap: Record<string, any> = {};
  createdDepts.forEach((d) => {
    deptMap[d.code] = d;
  });

  // Subjects per department
  const subjectsData = [
    { name: 'Design and Analysis of Algorithms', code: 'CS-14401', departmentId: deptMap['CSE']._id, semester: 4, credits: 4 },
    { name: 'Database Management Systems', code: 'CS-14402', departmentId: deptMap['CSE']._id, semester: 4, credits: 4 },
    { name: 'Computer Networks', code: 'CS-14403', departmentId: deptMap['CSE']._id, semester: 4, credits: 4 },
    { name: 'Operating Systems', code: 'CS-14404', departmentId: deptMap['CSE']._id, semester: 4, credits: 4 },
    { name: 'Theory of Computation', code: 'CS-14405', departmentId: deptMap['CSE']._id, semester: 4, credits: 3 },
  ];
  await Subject.insertMany(subjectsData);

  // 2. Create Super Admin & Officers
  const adminUser = await User.create({
    name: 'GNDEC Super Admin',
    email: 'admin@gndec.ac.in',
    password: 'Admin@123',
    role: ROLES.ADMIN,
    status: 'ACTIVE',
    phone: '9814001122',
  });

  const officer1 = await User.create({
    name: 'Dr. Rajesh Sharma',
    email: 'officer.rajesh@gndec.ac.in',
    password: 'Officer@123',
    role: ROLES.OFFICER,
    status: 'ACTIVE',
    phone: '9815002233',
    departmentId: deptMap['CSE']._id,
  });

  const officer2 = await User.create({
    name: 'Prof. Simranjit Kaur',
    email: 'officer.simran@gndec.ac.in',
    password: 'Officer@123',
    role: ROLES.OFFICER,
    status: 'ACTIVE',
    phone: '9816003344',
  });

  // 3. Create Scholarships (Only PMS Scholarship)
  const scholarshipsData = [
    {
      title: 'Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students (Punjab)',
      code: 'PB-PMS-SC',
      provider: 'Department of Social Justice, Empowerment & Minorities, Govt. of Punjab',
      type: 'RESERVATION',
      description:
        'Centrally sponsored and Punjab State Government implemented Post Matric Scholarship Scheme for Scheduled Caste (SC) students pursuing technical and engineering education at GNDEC Ludhiana. Provides 100% tuition and institutional fee waiver along with annual Direct Benefit Transfer (DBT) maintenance allowance.',
      amount: 75000,
      frequency: 'ANNUAL',
      academicYear: '2025-2026',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isRenewable: true,
      totalSeats: 300,
      availableSeats: 215,
      status: 'ACTIVE',
      requiredDocuments: [
        DOCUMENT_TYPES.INCOME_CERTIFICATE,
        DOCUMENT_TYPES.CASTE_CERTIFICATE,
        DOCUMENT_TYPES.RESIDENCE_CERTIFICATE,
        DOCUMENT_TYPES.ACADEMIC_MARKSHEET,
        DOCUMENT_TYPES.BANK_PROOF,
        DOCUMENT_TYPES.FEE_RECEIPT,
      ],
      rules: {
        minCgpa: 0,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC'],
        maxBacklogs: 3,
        genderRestriction: 'ALL',
      },
      instructions:
        'Must possess a valid Freeship Card issued via Dr. Ambedkar Scholarship Portal (scholarships.punjab.gov.in). Family income certificate from SDM/Tehsildar (<= Rs. 2.50 Lakh) and valid SC Caste Certificate mandatory.',
      contactEmail: 'scholarship@gndec.ac.in',
    },
  ];

  const createdScholarships = await Scholarship.insertMany(scholarshipsData);
  const schMap: Record<string, any> = {};
  createdScholarships.forEach((s) => {
    schMap[s.code] = s;
  });

  // 4. Create 30+ Realistic Punjabi & Indian Student Profiles (All SC category under PMS)
  const studentNames = [
    { first: 'Harpreet', last: 'Singh', gender: 'MALE', dept: 'CSE', cat: 'SC', income: 180000, cgpa: 8.65 },
    { first: 'Simran', last: 'Kaur', gender: 'FEMALE', dept: 'CSE', cat: 'SC', income: 195000, cgpa: 9.12 },
    { first: 'Gursewak', last: 'Singh', gender: 'MALE', dept: 'IT', cat: 'SC', income: 140000, cgpa: 7.45 },
    { first: 'Manpreet', last: 'Kaur', gender: 'FEMALE', dept: 'ECE', cat: 'SC', income: 190000, cgpa: 8.2 },
    { first: 'Jaspreet', last: 'Singh', gender: 'MALE', dept: 'ME', cat: 'SC', income: 210000, cgpa: 7.8 },
    { first: 'Amanpreet', last: 'Kaur', gender: 'FEMALE', dept: 'IT', cat: 'SC', income: 150000, cgpa: 8.9 },
    { first: 'Navjot', last: 'Singh', gender: 'MALE', dept: 'CE', cat: 'SC', income: 205000, cgpa: 6.9 },
    { first: 'Lovepreet', last: 'Singh', gender: 'MALE', dept: 'CSE', cat: 'SC', income: 120000, cgpa: 8.05 },
    { first: 'Taranpreet', last: 'Kaur', gender: 'FEMALE', dept: 'ECE', cat: 'SC', income: 220000, cgpa: 8.75 },
    { first: 'Sukhman', last: 'Singh', gender: 'MALE', dept: 'ME', cat: 'SC', income: 190000, cgpa: 7.1 },
    { first: 'Harleen', last: 'Kaur', gender: 'FEMALE', dept: 'CSE', cat: 'SC', income: 240000, cgpa: 8.4 },
    { first: 'Gagandeep', last: 'Singh', gender: 'MALE', dept: 'IT', cat: 'SC', income: 160000, cgpa: 7.3 },
    { first: 'Ravneet', last: 'Kaur', gender: 'FEMALE', dept: 'CE', cat: 'SC', income: 220000, cgpa: 8.15 },
    { first: 'Gurkirat', last: 'Singh', gender: 'MALE', dept: 'CSE', cat: 'SC', income: 235000, cgpa: 9.35 },
    { first: 'Prabhjot', last: 'Singh', gender: 'MALE', dept: 'ECE', cat: 'SC', income: 130000, cgpa: 6.8 },
    { first: 'Komalpreet', last: 'Kaur', gender: 'FEMALE', dept: 'IT', cat: 'SC', income: 175000, cgpa: 8.6 },
    { first: 'Jagjit', last: 'Singh', gender: 'MALE', dept: 'ME', cat: 'SC', income: 240000, cgpa: 7.5 },
    { first: 'Jashanpreet', last: 'Kaur', gender: 'FEMALE', dept: 'CSE', cat: 'SC', income: 210000, cgpa: 8.8 },
    { first: 'Arshdeep', last: 'Singh', gender: 'MALE', dept: 'CE', cat: 'SC', income: 110000, cgpa: 7.2 },
    { first: 'Ishmeet', last: 'Singh', gender: 'MALE', dept: 'IT', cat: 'SC', income: 215000, cgpa: 8.3 },
    { first: 'Rajveer', last: 'Kaur', gender: 'FEMALE', dept: 'ECE', cat: 'SC', income: 225000, cgpa: 8.95 },
    { first: 'Balraj', last: 'Singh', gender: 'MALE', dept: 'ME', cat: 'SC', income: 195000, cgpa: 6.7 },
    { first: 'Simerpreet', last: 'Kaur', gender: 'FEMALE', dept: 'CSE', cat: 'SC', income: 145000, cgpa: 8.5 },
    { first: 'Amritpal', last: 'Singh', gender: 'MALE', dept: 'IT', cat: 'SC', income: 230000, cgpa: 7.9 },
    { first: 'Kirandeep', last: 'Kaur', gender: 'FEMALE', dept: 'CE', cat: 'SC', income: 165000, cgpa: 8.35 },
    { first: 'Daljit', last: 'Singh', gender: 'MALE', dept: 'ECE', cat: 'SC', income: 135000, cgpa: 7.6 },
    { first: 'Sandeep', last: 'Kaur', gender: 'FEMALE', dept: 'ME', cat: 'SC', income: 230000, cgpa: 8.25 },
    { first: 'Gurinder', last: 'Singh', gender: 'MALE', dept: 'CSE', cat: 'SC', income: 240000, cgpa: 8.7 },
    { first: 'Bhavneet', last: 'Kaur', gender: 'FEMALE', dept: 'IT', cat: 'SC', income: 125000, cgpa: 8.1 },
    { first: 'Jasmeet', last: 'Singh', gender: 'MALE', dept: 'CE', cat: 'SC', income: 215000, cgpa: 7.7 },
    { first: 'Fateh', last: 'Singh', gender: 'MALE', dept: 'ECE', cat: 'SC', income: 205000, cgpa: 8.0 },
  ];

  let studentCount = 0;
  for (const st of studentNames) {
    studentCount += 1;
    const rollNo = `21045${studentCount < 10 ? '0' + studentCount : studentCount}`;
    const email = studentCount === 1 ? 'student@gndec.ac.in' : `${st.first.toLowerCase()}.${st.last.toLowerCase()}${studentCount}@gndec.ac.in`;

    const user = await User.create({
      name: `${st.first} ${st.last}`,
      email,
      password: 'Student@123',
      role: ROLES.STUDENT,
      status: 'ACTIVE',
      phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
    });

    const qrToken = `GNDEC-VERIFY-${rollNo}-${Date.now().toString(36).toUpperCase()}`;

    const profile = await StudentProfile.create({
      userId: user._id,
      studentId: `GNDEC-${rollNo}`,
      rollNumber: rollNo,
      firstName: st.first,
      lastName: st.last,
      email: user.email,
      phone: user.phone || '9876543210',
      department: st.dept,
      departmentId: deptMap[st.dept]?._id,
      course: 'B.Tech',
      year: 3,
      semester: 5,
      category: st.cat,
      familyIncome: st.income,
      cgpa: st.cgpa,
      activeBacklogs: st.cgpa < 7.0 ? 1 : 0,
      totalBacklogs: st.cgpa < 7.0 ? 1 : 0,
      bankDetails: {
        accountHolderName: `${st.first} ${st.last}`,
        accountNumber: `3892019482${studentCount}`,
        ifscCode: 'SBIN0050186',
        bankName: 'State Bank of India',
        branchName: 'GNDEC Ludhiana Campus',
      },
      guardian: {
        name: `S. ${st.last === 'Singh' || st.last === 'Kaur' ? 'Gurmukh Singh' : 'Rajesh Kumar'}`,
        relation: 'Father',
        phone: '9814099887',
        occupation: 'Agriculture / Business',
        annualIncome: st.income,
      },
      qrVerificationToken: qrToken,
      isProfileComplete: true,
    });

    // Create Academic Record for Semesters 1 to 4
    await AcademicRecord.create({
      studentId: profile._id,
      userId: user._id,
      semester: 4,
      academicYear: '2024-2025',
      sgpa: st.cgpa,
      cgpa: st.cgpa,
      totalCredits: 24,
      earnedCredits: 24,
      backlogs: 0,
      subjects: subjectsData.map((s) => ({
        subjectCode: s.code,
        subjectName: s.name,
        credits: s.credits,
        internalMarks: 42,
        externalMarks: 45,
        totalMarks: 87,
        maxMarks: 100,
        grade: st.cgpa >= 8.5 ? 'A+' : st.cgpa >= 7.5 ? 'A' : 'B+',
        gradePoints: st.cgpa >= 8.5 ? 9 : 8,
        status: 'PASS',
      })),
    });

    // Create sample documents for the student (all SC students under PMS)
    const docTypesToCreate = [
      DOCUMENT_TYPES.INCOME_CERTIFICATE,
      DOCUMENT_TYPES.CASTE_CERTIFICATE,
      DOCUMENT_TYPES.RESIDENCE_CERTIFICATE,
      DOCUMENT_TYPES.ACADEMIC_MARKSHEET,
      DOCUMENT_TYPES.BANK_PROOF,
      DOCUMENT_TYPES.FEE_RECEIPT,
    ];

    for (const dType of docTypesToCreate) {
      const isVerified = studentCount % 3 === 0;
      const isRejected = studentCount % 7 === 0;
      const docStatus = isVerified
        ? DOCUMENT_STATUS.VERIFIED
        : isRejected
        ? DOCUMENT_STATUS.REUPLOAD_REQUIRED
        : DOCUMENT_STATUS.UNDER_REVIEW;

      const v1: any = {
        versionNumber: 1,
        fileName: `${dType.toLowerCase()}_sample_${rollNo}.pdf`,
        originalName: `${dType.replace(/_/g, ' ')} Official.pdf`,
        fileUrl: `/uploads/${dType.toLowerCase()}_sample_${rollNo}.pdf`,
        filePath: `uploads/${dType.toLowerCase()}_sample_${rollNo}.pdf`,
        mimeType: 'application/pdf',
        fileSize: 1024 * 350,
        uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: docStatus,
        verifiedBy: isVerified ? officer1._id : isRejected ? officer2._id : undefined,
        verifierName: isVerified ? officer1.name : isRejected ? officer2.name : undefined,
        verifiedAt: isVerified || isRejected ? new Date() : undefined,
        rejectionReason: isRejected ? 'Income certificate date is older than current financial year.' : undefined,
        rejectionComments: isRejected ? 'Please upload updated certificate issued on or after April 1, 2025.' : undefined,
        ocrData: {
          extractedStudentName: `${st.first} ${st.last}`,
          extractedDocType: dType.replace(/_/g, ' '),
          extractedCertificateNo: `PB/GNDEC/${rollNo}/${Math.floor(1000 + Math.random() * 9000)}`,
          extractedIssueDate: '10/05/2025',
          extractedExpiryDate: '31/03/2026',
          issuingAuthority: 'Sub-Divisional Magistrate, Govt. of Punjab',
          extractedIncome: st.income,
          extractedCaste: st.cat,
          nameMatchConfidence: 95,
          validationFlags: { isExpired: false, nameMismatch: false, typeMismatch: false, lowConfidence: false },
        },
      };

      await StudentDocument.create({
        studentId: profile._id,
        userId: user._id,
        documentType: dType,
        title: `${dType.replace(/_/g, ' ')}`,
        currentVersion: isRejected ? 2 : 1,
        status: docStatus,
        versions: [v1],
        latestVerifiedVersion: isVerified ? 1 : undefined,
      });
    }

    // Create Sample Applications (All for PMS SC)
    if (studentCount <= 15) {
      const targetSch = schMap['PB-PMS-SC'];

      if (targetSch) {
        let appStatus: any = APPLICATION_STATUS.SUBMITTED;
        if (studentCount <= 4) appStatus = APPLICATION_STATUS.APPROVED;
        else if (studentCount <= 8) appStatus = APPLICATION_STATUS.DOCUMENT_VERIFICATION;
        else if (studentCount <= 11) appStatus = APPLICATION_STATUS.ELIGIBILITY_REVIEW;
        else if (studentCount === 12) appStatus = APPLICATION_STATUS.ADDITIONAL_DOCUMENTS_REQUIRED;

        const appNo = `GNDEC-PMS-${rollNo}-2025`;

        await ScholarshipApplication.create({
          applicationNumber: appNo,
          studentId: profile._id,
          userId: user._id,
          scholarshipId: targetSch._id,
          academicYear: '2025-2026',
          status: appStatus,
          appliedDate: new Date(Date.now() - (15 - studentCount) * 24 * 60 * 60 * 1000),
          reviewedDate: appStatus === APPLICATION_STATUS.APPROVED ? new Date() : undefined,
          reviewedBy: appStatus === APPLICATION_STATUS.APPROVED ? officer1._id : undefined,
          reviewerNotes:
            appStatus === APPLICATION_STATUS.APPROVED
              ? 'Candidate meets all Dr. Ambedkar PMS SC criteria. SC Caste & Income Certificate (<= 2.50L) certified.'
              : undefined,
          snapshot: {
            cgpa: st.cgpa,
            attendancePercentage: 100,
            familyIncome: st.income,
            category: 'SC',
            department: st.dept,
            course: 'B.Tech',
            year: 3,
            semester: 5,
            activeBacklogs: 0,
          },
          eligibilitySummary: {
            isEligible: true,
            breakdown: [
              { criterion: 'Social Reservation Category', satisfied: true, required: 'SC (Scheduled Caste)', actual: 'SC' },
              { criterion: 'Annual Family Income Limit', satisfied: true, required: '≤ ₹2,50,000', actual: `₹${st.income.toLocaleString('en-IN')}` },
              { criterion: 'Punjab Domicile Status', satisfied: true, required: 'Bonafide Resident of Punjab', actual: 'Verified' },
              { criterion: 'Academic Standing', satisfied: true, required: 'Regular Enrolled Student', actual: `CGPA ${st.cgpa}` },
            ],
          },
          timeline: [
            {
              status: APPLICATION_STATUS.SUBMITTED,
              timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              updatedBy: user.name,
              updaterRole: 'STUDENT',
              remarks: 'Application submitted along with certified certificates.',
            },
            ...(appStatus === APPLICATION_STATUS.APPROVED
              ? [
                  {
                    status: APPLICATION_STATUS.DOCUMENT_VERIFICATION,
                    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    updatedBy: officer1.name,
                    updaterRole: 'OFFICER',
                    remarks: 'All mandatory documents verified against state portals.',
                  },
                  {
                    status: APPLICATION_STATUS.APPROVED,
                    timestamp: new Date(),
                    updatedBy: officer1.name,
                    updaterRole: 'OFFICER',
                    remarks: 'Application approved for grant disbursement.',
                  },
                ]
              : []),
          ],
        });
      }
    }

    // Create Support Tickets for a couple of students
    if (studentCount === 1 || studentCount === 3) {
      await SupportTicket.create({
        ticketNumber: `TKT-2025-00${studentCount}`,
        studentId: profile._id,
        userId: user._id,
        category: 'DOCUMENTS',
        subject: 'Query regarding Tehsildar Income Certificate Stamp',
        description:
          'My digitally signed e-District certificate does not have an embossed seal. Will the digital QR barcode be accepted?',
        priority: 'MEDIUM',
        status: 'WAITING_FOR_STUDENT',
        assignedTo: officer1._id,
        assignedOfficerName: officer1.name,
        messages: [
          {
            senderId: user._id,
            senderName: user.name,
            senderRole: 'STUDENT',
            message:
              'My digitally signed e-District certificate does not have an embossed seal. Will the digital QR barcode be accepted?',
            sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            senderId: officer1._id,
            senderName: officer1.name,
            senderRole: 'OFFICER',
            message:
              'Yes, digital signatures with valid 2D barcode issued by the Govt of Punjab e-District portal are 100% valid. Ensure the certificate number is legible.',
            sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      });
    }

    // Notifications for demo student
    if (studentCount === 1) {
      await Notification.create({
        recipientId: user._id,
        title: 'PMS Scholarship Applications Open (2025-26)',
        message: 'Applications for Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students are now active.',
        type: 'ANNOUNCEMENT',
        link: '/student/scholarships',
      });
      await Notification.create({
        recipientId: user._id,
        title: 'Post-Matric SC Eligibility Verified',
        message: 'Your profile has been evaluated: you are eligible for 100% tuition waiver under the Punjab PMS Scheme!',
        type: 'ELIGIBILITY',
        link: '/student/scholarships',
      });
    }
  }

  // Initial Audit Logs
  await AuditLog.create({
    actorName: 'GNDEC Super Admin',
    actorEmail: 'admin@gndec.ac.in',
    actorRole: 'ADMIN',
    action: 'SYSTEM_INITIALIZED',
    entityType: 'SystemSetting',
    description: 'ScholarSphere Platform initialized with GNDEC engineering departments & active scholarship schemes.',
    timestamp: new Date(),
  });

  console.log('✅ ScholarSphere GNDEC database seeding completed successfully!');
};
