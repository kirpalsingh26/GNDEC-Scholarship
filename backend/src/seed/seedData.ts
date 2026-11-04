import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Department, Subject } from '../models/Department.js';
import { Scholarship } from '../models/Scholarship.js';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { StudentDocument } from '../models/Document.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { ROLES, APPLICATION_STATUS, DOCUMENT_STATUS, DOCUMENT_TYPES } from '../config/constants.js';

/**
 * Initializes essential production infrastructure:
 * - GNDEC Academic Departments & Curriculum Subjects
 * - Institutional Super Admin & Verification Officer Accounts
 * - Official Dr. B.R. Ambedkar Post-Matric SC Scholarship Scheme
 * 
 * Safe and idempotent for production deployment. Does NOT create fake students.
 */
export const initProductionData = async () => {
  console.log('🏛️ Initializing GNDEC Institutional Production Data...');

  // 1. Departments & Subjects
  let deptMap: Record<string, any> = {};
  const existingDeptCount = await Department.countDocuments();
  if (existingDeptCount === 0) {
    const departmentsData = [
      { name: 'Computer Science and Engineering', code: 'CSE', headName: 'Dr. Paramjit Singh', contactEmail: 'cse_head@gndec.ac.in' },
      { name: 'Information Technology', code: 'IT', headName: 'Dr. Kiran Jyoti', contactEmail: 'it_head@gndec.ac.in' },
      { name: 'Electronics and Communication Engineering', code: 'ECE', headName: 'Dr. Balwinder Singh', contactEmail: 'ece_head@gndec.ac.in' },
      { name: 'Mechanical Engineering', code: 'ME', headName: 'Dr. Harmeet Singh', contactEmail: 'me_head@gndec.ac.in' },
      { name: 'Civil Engineering', code: 'CE', headName: 'Dr. Harvinder Singh', contactEmail: 'ce_head@gndec.ac.in' },
    ];
    const createdDepts = await Department.insertMany(departmentsData);
    createdDepts.forEach((d) => {
      deptMap[d.code] = d;
    });

    const subjectsData = [
      { name: 'Design and Analysis of Algorithms', code: 'CS-14401', departmentId: deptMap['CSE']._id, semester: 4, credits: 4 },
      { name: 'Database Management Systems', code: 'CS-14402', departmentId: deptMap['CSE']._id, semester: 4, credits: 4 },
      { name: 'Computer Networks', code: 'CS-14403', departmentId: deptMap['CSE']._id, semester: 4, credits: 4 },
      { name: 'Operating Systems', code: 'CS-14404', departmentId: deptMap['CSE']._id, semester: 4, credits: 4 },
      { name: 'Theory of Computation', code: 'CS-14405', departmentId: deptMap['CSE']._id, semester: 4, credits: 3 },
    ];
    await Subject.insertMany(subjectsData);
    console.log('✅ GNDEC Academic Departments & Subjects provisioned.');
  } else {
    const existingDepts = await Department.find();
    existingDepts.forEach((d) => {
      deptMap[d.code] = d;
    });
  }

  // 2. Super Administrator
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gndec.ac.in').toLowerCase();
  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'GNDEC Super Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: ROLES.ADMIN,
      status: 'ACTIVE',
      phone: '9814001122',
    });
    console.log(`✅ Super Admin created: ${adminEmail}`);
  } else {
    adminUser.role = ROLES.ADMIN;
    adminUser.status = 'ACTIVE';
    adminUser.password = process.env.ADMIN_PASSWORD || 'Admin@123';
    await adminUser.save();
    console.log(`✅ Super Admin verified: ${adminEmail}`);
  }

  // 3. Teachers & Verification Officers
  // Primary Teacher Account: teacher@gndec.ac.in / Teacher@123
  const teacherEmail = (process.env.TEACHER_EMAIL || 'teacher@gndec.ac.in').toLowerCase();
  let teacherUser = await User.findOne({ email: teacherEmail });
  if (!teacherUser) {
    teacherUser = await User.create({
      name: 'Prof. Rajesh Sharma (Teacher / Verification Officer)',
      email: teacherEmail,
      password: process.env.TEACHER_PASSWORD || 'Teacher@123',
      role: ROLES.OFFICER,
      status: 'ACTIVE',
      phone: '9815002233',
      departmentId: deptMap['CSE']?._id,
    });
    console.log(`✅ Teacher Account created: ${teacherEmail}`);
  } else {
    teacherUser.role = ROLES.OFFICER;
    teacherUser.status = 'ACTIVE';
    teacherUser.password = process.env.TEACHER_PASSWORD || 'Teacher@123';
    await teacherUser.save();
    console.log(`✅ Teacher Account verified: ${teacherEmail}`);
  }

  // Secondary Officer Account: officer.rajesh@gndec.ac.in / Officer@123
  const officer1Email = (process.env.OFFICER_EMAIL || 'officer.rajesh@gndec.ac.in').toLowerCase();
  let officer1 = await User.findOne({ email: officer1Email });
  if (!officer1) {
    officer1 = await User.create({
      name: 'Dr. Rajesh Sharma (Head of Scholarship Cell)',
      email: officer1Email,
      password: process.env.OFFICER_PASSWORD || 'Officer@123',
      role: ROLES.OFFICER,
      status: 'ACTIVE',
      phone: '9815002233',
      departmentId: deptMap['CSE']?._id,
    });
    console.log(`✅ Verification Officer created: ${officer1Email}`);
  } else {
    officer1.role = ROLES.OFFICER;
    officer1.status = 'ACTIVE';
    officer1.password = process.env.OFFICER_PASSWORD || 'Officer@123';
    await officer1.save();
  }

  const officer2Email = 'officer.simran@gndec.ac.in';
  let officer2 = await User.findOne({ email: officer2Email });
  if (!officer2) {
    officer2 = await User.create({
      name: 'Prof. Simranjit Kaur',
      email: officer2Email,
      password: process.env.OFFICER_PASSWORD || 'Officer@123',
      role: ROLES.OFFICER,
      status: 'ACTIVE',
      phone: '9816003344',
    });
  } else {
    officer2.role = ROLES.OFFICER;
    officer2.status = 'ACTIVE';
    officer2.password = process.env.OFFICER_PASSWORD || 'Officer@123';
    await officer2.save();
  }

  // 4. Official Post-Matric Scholarship Schemes for SC Students
  const fifteenDaysDeadline = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
  let pmsScheme = await Scholarship.findOne({ code: 'PB-PMS-SC' });
  if (!pmsScheme) {
    pmsScheme = await Scholarship.create({
      title: 'Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students (Punjab)',
      code: 'PB-PMS-SC',
      provider: 'Department of Social Justice, Empowerment & Minorities, Govt. of Punjab',
      type: 'RESERVATION',
      description:
        'Centrally sponsored and Punjab State Government implemented Post Matric Scholarship Scheme for Scheduled Caste (SC) students pursuing technical and engineering education at GNDEC Ludhiana. Provides 100% tuition and institutional fee waiver along with annual Direct Benefit Transfer (DBT) maintenance allowance.',
      amount: 75000,
      frequency: 'ANNUAL',
      academicYear: '2025-2026',
      deadline: fifteenDaysDeadline,
      isRenewable: true,
      totalSeats: 500,
      availableSeats: 500,
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
    });
    console.log('✅ Punjab PMS SC Scholarship Scheme registered (15 Days Deadline).');
  } else {
    pmsScheme.deadline = fifteenDaysDeadline;
    pmsScheme.status = 'ACTIVE';
    await pmsScheme.save();
    console.log('✅ Punjab PMS SC Scholarship Scheme deadline synchronized to 15 days.');
  }

  // 4b. Punjab State SC Freeship Card Scheme & Full Fee Waiver
  const twentyDaysDeadline = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000);
  let freeshipScheme = await Scholarship.findOne({ code: 'PB-PMS-FREESHIP' });
  if (!freeshipScheme) {
    await Scholarship.create({
      title: 'Punjab State SC Freeship Card & Direct Institutional Tuition Waiver',
      code: 'PB-PMS-FREESHIP',
      provider: 'Punjab State Welfare Department (Dr. Ambedkar Portal)',
      type: 'RESERVATION',
      description:
        'Direct tuition and development fee exemption for Scheduled Caste students admitted under Punjab SC quota at GNDEC Ludhiana. Eligible candidates receive instant semester fee exemption upon verified Freeship Card submission.',
      amount: 68000,
      frequency: 'ANNUAL',
      academicYear: '2025-2026',
      deadline: twentyDaysDeadline,
      isRenewable: true,
      totalSeats: 350,
      availableSeats: 350,
      status: 'ACTIVE',
      requiredDocuments: [
        DOCUMENT_TYPES.INCOME_CERTIFICATE,
        DOCUMENT_TYPES.CASTE_CERTIFICATE,
        DOCUMENT_TYPES.RESIDENCE_CERTIFICATE,
        DOCUMENT_TYPES.BANK_PROOF,
        DOCUMENT_TYPES.BONAFIDE_CERTIFICATE,
      ],
      rules: {
        minCgpa: 0,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC'],
        maxBacklogs: 4,
        genderRestriction: 'ALL',
      },
      instructions:
        'Must possess a valid Freeship Card issued via Dr. Ambedkar Scholarship Portal (scholarships.punjab.gov.in).',
      contactEmail: 'scholarship@gndec.ac.in',
    });
    console.log('✅ Punjab SC Freeship Scheme registered.');
  } else {
    freeshipScheme.deadline = twentyDaysDeadline;
    freeshipScheme.status = 'ACTIVE';
    await freeshipScheme.save();
  }

  // Archive any legacy non-PMS test schemes to ensure only current PMS SC schemes are active
  await Scholarship.updateMany(
    { code: { $nin: ['PB-PMS-SC', 'PB-PMS-FREESHIP'] } },
    { status: 'ARCHIVED' }
  );

  // 5. System Initial Audit Log
  const initialAudit = await AuditLog.findOne({ action: 'SYSTEM_INITIALIZED' });
  if (!initialAudit) {
    await AuditLog.create({
      actorName: 'GNDEC Super Admin',
      actorEmail: adminEmail,
      actorRole: 'ADMIN',
      action: 'SYSTEM_INITIALIZED',
      entityType: 'SystemSetting',
      description: 'ScholarSphere Platform initialized with GNDEC engineering departments & active PMS SC scholarship scheme.',
      timestamp: new Date(),
    });
  }

  console.log('✅ Institutional production data verified successfully.');
};

/**
 * Optional Development/Test Mock Dataset Seeder
 * Only generates sample students if explicitly executed.
 */
export const seedDemoData = async () => {
  await initProductionData();

  const studentCount = await User.countDocuments({ role: ROLES.STUDENT });
  if (studentCount > 0) {
    console.log(`ℹ️ Database already contains ${studentCount} students. Skipping demo student seeding.`);
    return;
  }

  console.log('🌱 Seeding demo student dataset for development...');

  const departments = await Department.find();
  const deptMap: Record<string, any> = {};
  departments.forEach((d) => {
    deptMap[d.code] = d;
  });

  const sch = await Scholarship.findOne({ code: 'PB-PMS-SC' });
  const officer1 = await User.findOne({ email: 'officer.rajesh@gndec.ac.in' });

  const studentNames = [
    { first: 'Harpreet', last: 'Singh', gender: 'MALE', dept: 'CSE', cat: 'SC', income: 180000, cgpa: 8.65 },
    { first: 'Simran', last: 'Kaur', gender: 'FEMALE', dept: 'CSE', cat: 'SC', income: 195000, cgpa: 9.12 },
    { first: 'Gursewak', last: 'Singh', gender: 'MALE', dept: 'IT', cat: 'SC', income: 140000, cgpa: 7.45 },
    { first: 'Manpreet', last: 'Kaur', gender: 'FEMALE', dept: 'ECE', cat: 'SC', income: 190000, cgpa: 8.2 },
    { first: 'Jaspreet', last: 'Singh', gender: 'MALE', dept: 'ME', cat: 'SC', income: 210000, cgpa: 7.8 },
  ];

  let count = 0;
  for (const st of studentNames) {
    count += 1;
    const rollNo = `210450${count}`;
    const email = `${st.first.toLowerCase()}.${st.last.toLowerCase()}@gndec.ac.in`;

    const user = await User.create({
      name: `${st.first} ${st.last}`,
      email,
      password: 'Student@123',
      role: ROLES.STUDENT,
      status: 'ACTIVE',
      phone: `987654321${count}`,
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
      activeBacklogs: 0,
      totalBacklogs: 0,
      bankDetails: {
        accountHolderName: `${st.first} ${st.last}`,
        accountNumber: `3892019482${count}`,
        ifscCode: 'SBIN0050186',
        bankName: 'State Bank of India',
        branchName: 'GNDEC Ludhiana Campus',
      },
      guardian: {
        name: `S. Gurmukh Singh`,
        relation: 'Father',
        phone: '9814099887',
        occupation: 'Farmer / Service',
      },
      verificationStatus: 'VERIFIED',
      verifiedBy: officer1?._id,
      verifiedAt: new Date(),
      verificationBadge: true,
      qrVerificationToken: qrToken,
      qrVerificationUrl: `https://gndec.ac.in/verify/scholar?token=${qrToken}`,
      remarks: 'Documents fully verified under Punjab PMS SC Scheme guidelines.',
    });

    // Sample Academic Record
    await AcademicRecord.create({
      studentId: profile._id,
      semester: 4,
      academicYear: '2024-2025',
      cgpa: st.cgpa,
      sgpa: st.cgpa,
      totalCredits: 22,
      passedCredits: 22,
      backlogs: 0,
    });

    // Sample Application
    if (sch) {
      await ScholarshipApplication.create({
        applicationNumber: `GNDEC-PMS-2025-${rollNo}`,
        studentId: profile._id,
        scholarshipId: sch._id,
        academicYear: '2025-2026',
        status: APPLICATION_STATUS.APPROVED,
        appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        cgpaAtApplication: st.cgpa,
        familyIncomeAtApplication: st.income,
        verifiedBy: officer1?._id,
        verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        officerRemarks: 'All Punjab state PMS SC certificates and Freeship card verified.',
        timeline: [
          { status: APPLICATION_STATUS.SUBMITTED, updatedBy: user._id, comment: 'Application submitted', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
          { status: APPLICATION_STATUS.APPROVED, updatedBy: officer1?._id, comment: 'Verified by Scholarship Officer', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        ],
      });
    }
  }

  console.log('✅ Demo dataset generated.');
};

// Aliased export for compatibility
export const seedDatabase = initProductionData;

// Direct execution runner (e.g. npm run seed)
if (process.argv[1]?.includes('seedData')) {
  import('../config/db.js').then(async ({ connectDB, disconnectDB }) => {
    try {
      await connectDB();
      await initProductionData();
      console.log('🎉 Seed operations completed successfully.');
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    }
  });
}
