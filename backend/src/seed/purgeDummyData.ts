import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { ScholarshipApplication } from '../models/ScholarshipApplication.js';
import { StudentDocument } from '../models/Document.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { Notification } from '../models/Notification.js';
import { PushSubscription } from '../models/PushSubscription.js';
import { Scholarship } from '../models/Scholarship.js';
import { Department } from '../models/Department.js';
import { ROLES } from '../config/constants.js';

/**
 * Purge all mock/dummy student and transactional data from the database.
 * Strictly preserves:
 * - Official GNDEC Scholarship Schemes (PB-PMS-SC, PB-PMS-FREESHIP, PB-PMS-HOSTEL, PB-PMS-MERIT)
 * - Academic Departments & Curriculum Subjects
 * - Institutional Super Admin & Verification Officer Accounts
 */
export const purgeDummyData = async () => {
  console.log('🧹 Starting database cleanup: removing all dummy data...');

  // 1. Delete all student users
  const deletedStudents = await User.deleteMany({ role: ROLES.STUDENT });
  console.log(`✅ Removed ${deletedStudents.deletedCount} dummy student user accounts.`);

  // 2. Delete all student profiles
  const deletedProfiles = await StudentProfile.deleteMany({});
  console.log(`✅ Removed ${deletedProfiles.deletedCount} student profile records.`);

  // 3. Delete all scholarship applications
  const deletedApps = await ScholarshipApplication.deleteMany({});
  console.log(`✅ Removed ${deletedApps.deletedCount} scholarship application records.`);

  // 4. Delete all student uploaded documents
  const deletedDocs = await StudentDocument.deleteMany({});
  console.log(`✅ Removed ${deletedDocs.deletedCount} student document records.`);

  // 5. Delete all mock academic records
  const deletedAcademics = await AcademicRecord.deleteMany({});
  console.log(`✅ Removed ${deletedAcademics.deletedCount} academic marksheet records.`);

  // 6. Delete all attendance records
  const deletedAttendance = await AttendanceRecord.deleteMany({});
  console.log(`✅ Removed ${deletedAttendance.deletedCount} attendance records.`);

  // 7. Delete all support tickets
  const deletedTickets = await SupportTicket.deleteMany({});
  console.log(`✅ Removed ${deletedTickets.deletedCount} support inquiry tickets.`);

  // 8. Delete student notifications & push subscriptions
  const deletedNotifs = await Notification.deleteMany({});
  console.log(`✅ Removed ${deletedNotifs.deletedCount} notification records.`);

  const deletedSubs = await PushSubscription.deleteMany({});
  console.log(`✅ Removed ${deletedSubs.deletedCount} push subscriptions.`);

  // Verify preserved scholarship data
  const scholarshipsCount = await Scholarship.countDocuments({ status: 'ACTIVE' });
  const deptsCount = await Department.countDocuments({});
  const staffCount = await User.countDocuments({ role: { $in: [ROLES.ADMIN, ROLES.OFFICER] } });

  console.log('----------------------------------------------------');
  console.log('🏛️ PRESERVED PRODUCTION DATA:');
  console.log(`   - Active Scholarship Schemes: ${scholarshipsCount}`);
  console.log(`   - GNDEC Engineering Departments: ${deptsCount}`);
  console.log(`   - Official Admin & Officer Accounts: ${staffCount}`);
  console.log('🎉 Cleanup complete. Database is now in clean state for real users.');
};

if (process.argv[1]?.includes('purgeDummyData')) {
  (async () => {
    try {
      await connectDB();
      await purgeDummyData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('❌ Purge failed:', err);
      process.exit(1);
    }
  })();
}

