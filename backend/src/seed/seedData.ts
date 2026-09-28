import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Department, Course, Subject } from '../models/Department.js';
import { Scholarship } from '../models/Scholarship.js';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { StudentDocument } from '../models/Document.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
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

  // 3. Create Scholarships
  const scholarshipsData = [
    {
      title: 'Punjab Post-Matric Scholarship Scheme (SC/ST)',
      code: 'PB-PMSS-SC',
      provider: 'Department of Social Justice, Govt. of Punjab',
      type: 'RESERVATION',
      description:
        'Complete tuition fee waiver and annual maintenance allowance for scheduled caste students pursuing engineering degrees.',
      amount: 75000,
      frequency: 'ANNUAL',
      academicYear: '2025-2026',
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days left
      isRenewable: true,
      totalSeats: 250,
      availableSeats: 184,
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
        minCgpa: 6.0,
        minAttendance: 75,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC', 'ST'],
        maxBacklogs: 2,
        genderRestriction: 'ALL',
      },
    },
    {
      title: 'GNDEC Alumni Merit-cum-Means Excellence Award',
      code: 'GNDEC-ALUMNI-MCM',
      provider: 'GNDEC Global Alumni Association & Trust',
      type: 'MERIT_CUM_MEANS',
      description:
        'Endowed scholarship honoring high-achieving undergraduate engineering students from low-income families.',
      amount: 50000,
      frequency: 'ANNUAL',
      academicYear: '2025-2026',
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      isRenewable: true,
      totalSeats: 50,
      availableSeats: 32,
      status: 'ACTIVE',
      requiredDocuments: [
        DOCUMENT_TYPES.INCOME_CERTIFICATE,
        DOCUMENT_TYPES.ACADEMIC_MARKSHEET,
        DOCUMENT_TYPES.BONAFIDE_CERTIFICATE,
        DOCUMENT_TYPES.BANK_PROOF,
      ],
      rules: {
        minCgpa: 8.0,
        minAttendance: 80,
        maxFamilyIncome: 450000,
        allowedCategories: ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'MINORITY'],
        maxBacklogs: 0,
        genderRestriction: 'ALL',
      },
    },
    {
      title: 'AICTE Pragati Scholarship for Girl Students',
      code: 'AICTE-PRAGATI-GIRLS',
      provider: 'All India Council for Technical Education (AICTE)',
      type: 'SPECIAL_SCHEME',
      description:
        'Government initiative to advance girl child technical education with ₹50,000 contingency fund per annum.',
      amount: 50000,
      frequency: 'ANNUAL',
      academicYear: '2025-2026',
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      isRenewable: true,
      totalSeats: 100,
      availableSeats: 70,
      status: 'ACTIVE',
      requiredDocuments: [
        DOCUMENT_TYPES.INCOME_CERTIFICATE,
        DOCUMENT_TYPES.RESIDENCE_CERTIFICATE,
        DOCUMENT_TYPES.ACADEMIC_MARKSHEET,
        DOCUMENT_TYPES.BANK_PROOF,
      ],
      rules: {
        minCgpa: 6.5,
        minAttendance: 75,
        maxFamilyIncome: 800000,
        allowedCategories: ['GENERAL', 'SC', 'ST', 'OBC', 'EWS', 'MINORITY'],
        maxBacklogs: 1,
        genderRestriction: 'FEMALE_ONLY',
      },
    },
    {
      title: 'Chief Minister Scholarship Scheme for Higher Education',
      code: 'PB-CM-MERIT',
      provider: 'Punjab Higher Education Department',
      type: 'MERIT',
      description:
        'Tiered tuition reimbursement based on university entrance rank and top 10% academic performance.',
      amount: 35000,
      frequency: 'ANNUAL',
      academicYear: '2025-2026',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isRenewable: true,
      totalSeats: 120,
      availableSeats: 95,
      status: 'ACTIVE',
      requiredDocuments: [
        DOCUMENT_TYPES.ACADEMIC_MARKSHEET,
        DOCUMENT_TYPES.RESIDENCE_CERTIFICATE,
        DOCUMENT_TYPES.BONAFIDE_CERTIFICATE,
      ],
      rules: {
        minCgpa: 8.5,
        minAttendance: 75,
        maxFamilyIncome: 0,
        maxBacklogs: 0,
        genderRestriction: 'ALL',
      },
    },
    {
      title: 'S. Nanak Singh Need-Based Student Support Fund',
      code: 'GNDEC-NANAK-FUND',
      provider: 'Guru Nanak Dev Engineering College Welfare Board',
      type: 'MEANS',
      description:
        'Immediate institutional grant covering semester examination fees and hostel living expenses for economically distressed students.',
      amount: 25000,
      frequency: 'SEMESTER',
      academicYear: '2025-2026',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      isRenewable: false,
      totalSeats: 30,
      availableSeats: 12,
      status: 'ACTIVE',
      requiredDocuments: [DOCUMENT_TYPES.INCOME_CERTIFICATE, DOCUMENT_TYPES.FEE_RECEIPT],
      rules: {
        minCgpa: 5.5,
        minAttendance: 70,
        maxFamilyIncome: 180000,
        maxBacklogs: 3,
        genderRestriction: 'ALL',
      },
    },
  ];

  const createdScholarships = await Scholarship.insertMany(scholarshipsData);
  const schMap: Record<string, any> = {};
  createdScholarships.forEach((s) => {
    schMap[s.code] = s;
  });

  // 4. Create 30+ Realistic Punjabi & Indian Student Profiles
  const studentNames = [
    { first: 'Harpreet', last: 'Singh', gender: 'MALE', dept: 'CSE', cat: 'OBC', income: 180000, cgpa: 8.65, att: 84 },
    { first: 'Simran', last: 'Kaur', gender: 'FEMALE', dept: 'CSE', cat: 'GENERAL', income: 320000, cgpa: 9.12, att: 92 },
    { first: 'Gursewak', last: 'Singh', gender: 'MALE', dept: 'IT', cat: 'SC', income: 140000, cgpa: 7.45, att: 68 }, // Low attendance demo!
    { first: 'Manpreet', last: 'Kaur', gender: 'FEMALE', dept: 'ECE', cat: 'SC', income: 190000, cgpa: 8.2, att: 88 },
    { first: 'Jaspreet', last: 'Singh', gender: 'MALE', dept: 'ME', cat: 'GENERAL', income: 260000, cgpa: 7.8, att: 76 },
    { first: 'Amanpreet', last: 'Kaur', gender: 'FEMALE', dept: 'IT', cat: 'EWS', income: 150000, cgpa: 8.9, att: 94 },
    { first: 'Navjot', last: 'Singh', gender: 'MALE', dept: 'CE', cat: 'OBC', income: 210000, cgpa: 6.9, att: 59 }, // Critical attendance demo!
    { first: 'Lovepreet', last: 'Singh', gender: 'MALE', dept: 'CSE', cat: 'SC', income: 120000, cgpa: 8.05, att: 81 },
    { first: 'Taranpreet', last: 'Kaur', gender: 'FEMALE', dept: 'ECE', cat: 'GENERAL', income: 380000, cgpa: 8.75, att: 89 },
    { first: 'Sukhman', last: 'Singh', gender: 'MALE', dept: 'ME', cat: 'GENERAL', income: 420000, cgpa: 7.1, att: 78 },
    { first: 'Harleen', last: 'Kaur', gender: 'FEMALE', dept: 'CSE', cat: 'MINORITY', income: 240000, cgpa: 8.4, att: 85 },
    { first: 'Gagandeep', last: 'Singh', gender: 'MALE', dept: 'IT', cat: 'SC', income: 160000, cgpa: 7.3, att: 64 }, // Low attendance
    { first: 'Ravneet', last: 'Kaur', gender: 'FEMALE', dept: 'CE', cat: 'OBC', income: 220000, cgpa: 8.15, att: 86 },
    { first: 'Gurkirat', last: 'Singh', gender: 'MALE', dept: 'CSE', cat: 'GENERAL', income: 350000, cgpa: 9.35, att: 96 },
    { first: 'Prabhjot', last: 'Singh', gender: 'MALE', dept: 'ECE', cat: 'SC', income: 130000, cgpa: 6.8, att: 77 },
    { first: 'Komalpreet', last: 'Kaur', gender: 'FEMALE', dept: 'IT', cat: 'EWS', income: 175000, cgpa: 8.6, att: 90 },
    { first: 'Jagjit', last: 'Singh', gender: 'MALE', dept: 'ME', cat: 'GENERAL', income: 490000, cgpa: 7.5, att: 79 },
    { first: 'Jashanpreet', last: 'Kaur', gender: 'FEMALE', dept: 'CSE', cat: 'OBC', income: 210000, cgpa: 8.8, att: 87 },
    { first: 'Arshdeep', last: 'Singh', gender: 'MALE', dept: 'CE', cat: 'SC', income: 110000, cgpa: 7.2, att: 82 },
    { first: 'Ishmeet', last: 'Singh', gender: 'MALE', dept: 'IT', cat: 'GENERAL', income: 310000, cgpa: 8.3, att: 84 },
    { first: 'Rajveer', last: 'Kaur', gender: 'FEMALE', dept: 'ECE', cat: 'GENERAL', income: 270000, cgpa: 8.95, att: 93 },
    { first: 'Balraj', last: 'Singh', gender: 'MALE', dept: 'ME', cat: 'OBC', income: 195000, cgpa: 6.7, att: 62 }, // Critical attendance
    { first: 'Simerpreet', last: 'Kaur', gender: 'FEMALE', dept: 'CSE', cat: 'SC', income: 145000, cgpa: 8.5, att: 88 },
    { first: 'Amritpal', last: 'Singh', gender: 'MALE', dept: 'IT', cat: 'GENERAL', income: 390000, cgpa: 7.9, att: 80 },
    { first: 'Kirandeep', last: 'Kaur', gender: 'FEMALE', dept: 'CE', cat: 'EWS', income: 165000, cgpa: 8.35, att: 89 },
    { first: 'Daljit', last: 'Singh', gender: 'MALE', dept: 'ECE', cat: 'SC', income: 135000, cgpa: 7.6, att: 75 },
    { first: 'Sandeep', last: 'Kaur', gender: 'FEMALE', dept: 'ME', cat: 'OBC', income: 230000, cgpa: 8.25, att: 86 },
    { first: 'Gurinder', last: 'Singh', gender: 'MALE', dept: 'CSE', cat: 'GENERAL', income: 340000, cgpa: 8.7, att: 91 },
    { first: 'Bhavneet', last: 'Kaur', gender: 'FEMALE', dept: 'IT', cat: 'SC', income: 125000, cgpa: 8.1, att: 83 },
    { first: 'Jasmeet', last: 'Singh', gender: 'MALE', dept: 'CE', cat: 'GENERAL', income: 280000, cgpa: 7.7, att: 79 },
    { first: 'Fateh', last: 'Singh', gender: 'MALE', dept: 'ECE', cat: 'OBC', income: 205000, cgpa: 8.0, att: 85 },
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

    // Create 5 Attendance records per student
    const totalClassesForRec = 40;
    const attendedForRec = Math.round((st.att / 100) * totalClassesForRec);

    for (let sIdx = 0; sIdx < subjectsData.length; sIdx++) {
      const sub = subjectsData[sIdx];
      const variance = (sIdx - 2) * 2;
      const subAttended = Math.min(totalClassesForRec, Math.max(15, attendedForRec + variance));

      await AttendanceRecord.create({
        studentId: profile._id,
        userId: user._id,
        department: st.dept,
        semester: 5,
        academicYear: '2025-2026',
        subjectCode: sub.code,
        subjectName: sub.name,
        totalClasses: totalClassesForRec,
        attendedClasses: subAttended,
        percentage: Math.round((subAttended / totalClassesForRec) * 1000) / 10,
      });
    }

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

    // Create sample documents for the student
    const docTypesToCreate = [
      DOCUMENT_TYPES.INCOME_CERTIFICATE,
      DOCUMENT_TYPES.ACADEMIC_MARKSHEET,
      DOCUMENT_TYPES.BANK_PROOF,
      ...(st.cat === 'SC' || st.cat === 'ST' || st.cat === 'OBC' ? [DOCUMENT_TYPES.CASTE_CERTIFICATE] : []),
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

    // Create Sample Applications
    if (studentCount <= 15) {
      const targetSch =
        st.cat === 'SC' || st.cat === 'ST'
          ? schMap['PB-PMSS-SC']
          : st.gender === 'FEMALE'
          ? schMap['AICTE-PRAGATI-GIRLS']
          : schMap['GNDEC-ALUMNI-MCM'];

      if (targetSch) {
        let appStatus: any = APPLICATION_STATUS.SUBMITTED;
        if (studentCount <= 4) appStatus = APPLICATION_STATUS.APPROVED;
        else if (studentCount <= 8) appStatus = APPLICATION_STATUS.DOCUMENT_VERIFICATION;
        else if (studentCount <= 11) appStatus = APPLICATION_STATUS.ELIGIBILITY_REVIEW;
        else if (studentCount === 12) appStatus = APPLICATION_STATUS.ADDITIONAL_DOCUMENTS_REQUIRED;

        const appNo = `GNDEC-${targetSch.code}-${rollNo}-2025`;

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
              ? 'Candidate meets all academic and financial criteria. Document bundle certified.'
              : undefined,
          snapshot: {
            cgpa: st.cgpa,
            attendancePercentage: st.att,
            familyIncome: st.income,
            category: st.cat,
            department: st.dept,
            course: 'B.Tech',
            year: 3,
            semester: 5,
            activeBacklogs: 0,
          },
          eligibilitySummary: {
            isEligible: true,
            breakdown: [
              { criterion: 'Minimum CGPA', satisfied: true, required: '≥ 6.5', actual: `${st.cgpa}` },
              { criterion: 'Attendance Threshold', satisfied: true, required: '≥ 75%', actual: `${st.att}%` },
              { criterion: 'Family Income', satisfied: true, required: '≤ ₹4.5 Lakh', actual: `₹${st.income}` },
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
        title: 'Scholarship Applications Open (2025-26)',
        message: 'Applications for Punjab Post-Matric & GNDEC Alumni MCM schemes are now active.',
        type: 'ANNOUNCEMENT',
        link: '/student/scholarships',
      });
      await Notification.create({
        recipientId: user._id,
        title: 'Smart Eligibility Check Available',
        message: 'Your profile has been evaluated: you are eligible for 3 scholarship grants!',
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
