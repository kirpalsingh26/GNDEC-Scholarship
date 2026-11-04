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

  // 4c. Punjab State SC Hosteller Special Boarding & Mess Allowance
  const twelveDaysDeadline = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000);
  let hostelScheme = await Scholarship.findOne({ code: 'PB-PMS-HOSTEL' });
  if (!hostelScheme) {
    await Scholarship.create({
      title: 'Punjab State SC Hosteller Special Boarding & Mess Allowance Scheme',
      code: 'PB-PMS-HOSTEL',
      provider: 'Department of Social Justice, Empowerment & Minorities, Govt. of Punjab',
      type: 'RESERVATION',
      description:
        'Dedicated residential and boarding maintenance grant for Scheduled Caste (SC) students residing in GNDEC campus hostels. Disbursed via DBT at ₹4,000 per month to cover mess bills and hostel accommodations.',
      amount: 48000,
      frequency: 'ANNUAL',
      academicYear: '2025-2026',
      deadline: twelveDaysDeadline,
      isRenewable: true,
      totalSeats: 250,
      availableSeats: 250,
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
        maxBacklogs: 3,
        genderRestriction: 'ALL',
      },
      instructions:
        'Must be a bonafide GNDEC hostel resident belonging to the Scheduled Caste (SC) of Punjab with income <= 2.50 Lakh.',
      contactEmail: 'scholarship@gndec.ac.in',
    });
    console.log('✅ Punjab SC Hosteller Scheme registered (12 Days Deadline).');
  } else {
    hostelScheme.deadline = twelveDaysDeadline;
    hostelScheme.status = 'ACTIVE';
    await hostelScheme.save();
  }

  // 4d. Dr. Ambedkar SC Higher Technical Education Book Bank & Equipment Grant
  const eighteenDaysDeadline = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000);
  let meritScheme = await Scholarship.findOne({ code: 'PB-PMS-MERIT' });
  if (!meritScheme) {
    await Scholarship.create({
      title: 'Dr. Ambedkar SC Higher Technical Education Book Bank & Study Equipment Grant',
      code: 'PB-PMS-MERIT',
      provider: 'Punjab State Directorate of Technical Education & Industrial Training',
      type: 'RESERVATION',
      description:
        'Annual academic grant providing financial assistance for textbook procurement, laptop/computing devices, scientific calculators, and laboratory toolkits for SC engineering and technology students.',
      amount: 35000,
      frequency: 'ANNUAL',
      academicYear: '2025-2026',
      deadline: eighteenDaysDeadline,
      isRenewable: true,
      totalSeats: 300,
      availableSeats: 300,
      status: 'ACTIVE',
      requiredDocuments: [
        DOCUMENT_TYPES.INCOME_CERTIFICATE,
        DOCUMENT_TYPES.CASTE_CERTIFICATE,
        DOCUMENT_TYPES.RESIDENCE_CERTIFICATE,
        DOCUMENT_TYPES.ACADEMIC_MARKSHEET,
        DOCUMENT_TYPES.BANK_PROOF,
      ],
      rules: {
        minCgpa: 0,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC'],
        maxBacklogs: 2,
        genderRestriction: 'ALL',
      },
      instructions:
        'Open to all enrolled SC undergraduate and postgraduate students in technical disciplines at GNDEC.',
      contactEmail: 'scholarship@gndec.ac.in',
    });
    console.log('✅ Punjab SC Technical Equipment Grant registered (18 Days Deadline).');
  } else {
    meritScheme.deadline = eighteenDaysDeadline;
    meritScheme.status = 'ACTIVE';
    await meritScheme.save();
  }

  // 4e. Previous Academic Cycle Scheme (Expired / Closed)
  const expiredDate = new Date('2024-11-30T23:59:59.000Z');
  let expiredScheme = await Scholarship.findOne({ code: 'PB-PMS-2024-CLOSED' });
  if (!expiredScheme) {
    await Scholarship.create({
      title: 'Dr. B.R. Ambedkar Post-Matric State Grant (Academic Session 2024–25)',
      code: 'PB-PMS-2024-CLOSED',
      provider: 'Department of Social Justice, Empowerment & Minorities, Govt. of Punjab',
      type: 'RESERVATION',
      description:
        'Official state scholarship cycle for previous academic year 2024–25. Application submission window has officially expired and closed for new filings.',
      amount: 62000,
      frequency: 'ANNUAL',
      academicYear: '2024-2025',
      deadline: expiredDate,
      isRenewable: false,
      totalSeats: 300,
      availableSeats: 0,
      status: 'EXPIRED',
      requiredDocuments: [
        DOCUMENT_TYPES.INCOME_CERTIFICATE,
        DOCUMENT_TYPES.CASTE_CERTIFICATE,
        DOCUMENT_TYPES.RESIDENCE_CERTIFICATE,
      ],
      rules: {
        minCgpa: 0,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC'],
        maxBacklogs: 4,
        genderRestriction: 'ALL',
      },
      instructions:
        'Application deadline for academic session 2024–25 passed on 30 November 2024.',
      contactEmail: 'scholarship@gndec.ac.in',
    });
    console.log('✅ Expired PMS Scholarship registered for catalog reference.');
  } else {
    expiredScheme.deadline = expiredDate;
    expiredScheme.status = 'EXPIRED';
    await expiredScheme.save();
  }

  // Archive any legacy non-PMS test schemes to ensure only current PMS SC schemes are active
  await Scholarship.updateMany(
    { code: { $nin: ['PB-PMS-SC', 'PB-PMS-FREESHIP', 'PB-PMS-HOSTEL', 'PB-PMS-MERIT', 'PB-PMS-2024-CLOSED'] } },
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
 * Production environment: Demo student seeding is completely disabled.
 * The portal operates exclusively on authentic student accounts, real applications,
 * and uploaded certificates.
 */
export const seedDemoData = async () => {
  await initProductionData();
  console.log('ℹ️ Demo student seeding is disabled. Platform operates on real student data only.');
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
