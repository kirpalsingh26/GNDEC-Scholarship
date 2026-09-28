import { Router } from 'express';
import { registerStudent, login, getMe } from '../controllers/authController.js';
import {
  getMyProfile,
  updateMyProfile,
  getMyAttendanceAnalytics,
  getMyAcademicRecords,
} from '../controllers/studentController.js';
import {
  listScholarships,
  getScholarshipById,
  checkEligibilityForScholarship,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from '../controllers/scholarshipController.js';
import {
  submitApplication,
  listApplications,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import {
  uploadDocument,
  listDocuments,
  verifyDocument,
  rejectDocument,
} from '../controllers/documentController.js';
import {
  getStudentAttendance,
  getLowAttendanceStudents,
  updateAttendanceRecord,
  sendLowAttendanceWarnings,
} from '../controllers/attendanceController.js';
import {
  createTicket,
  listTickets,
  getTicketById,
  replyToTicket,
} from '../controllers/ticketController.js';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendBroadcastAnnouncement,
} from '../controllers/notificationController.js';
import {
  getAdminDashboardStats,
  listUsers,
  updateUserStatus,
  getAuditLogs,
  listDepartments,
} from '../controllers/adminController.js';
import {
  exportApplicationsCsv,
  exportApplicationsExcel,
  exportApplicationPdf,
  getPublicQRVerification,
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/register', registerStudent);
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);

// ==========================================
// 2. STUDENT PROFILE & ACADEMIC ROUTES
// ==========================================
router.get('/students/me', authenticate, authorize(ROLES.STUDENT), getMyProfile);
router.put('/students/me', authenticate, authorize(ROLES.STUDENT), updateMyProfile);
router.get(
  '/students/me/attendance',
  authenticate,
  authorize(ROLES.STUDENT),
  getMyAttendanceAnalytics
);
router.get('/students/me/academics', authenticate, authorize(ROLES.STUDENT), getMyAcademicRecords);

// ==========================================
// 3. SCHOLARSHIP ROUTES
// ==========================================
router.get('/scholarships', authenticate, listScholarships);
router.get('/scholarships/:id', authenticate, getScholarshipById);
router.get('/scholarships/:id/eligibility', authenticate, checkEligibilityForScholarship);
router.post('/scholarships', authenticate, authorize(ROLES.ADMIN), createScholarship);
router.put('/scholarships/:id', authenticate, authorize(ROLES.ADMIN), updateScholarship);
router.delete('/scholarships/:id', authenticate, authorize(ROLES.ADMIN), deleteScholarship);

// ==========================================
// 4. SCHOLARSHIP APPLICATION ROUTES
// ==========================================
router.post('/applications', authenticate, authorize(ROLES.STUDENT), submitApplication);
router.get('/applications', authenticate, listApplications);
router.get('/applications/:id', authenticate, getApplicationById);
router.put(
  '/applications/:id/status',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  updateApplicationStatus
);

// ==========================================
// 5. DOCUMENT MANAGEMENT ROUTES
// ==========================================
router.post('/documents/upload', authenticate, upload.single('file'), uploadDocument);
router.get('/documents', authenticate, listDocuments);
router.post(
  '/documents/:id/verify',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  verifyDocument
);
router.post(
  '/documents/:id/reject',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  rejectDocument
);

// ==========================================
// 6. ATTENDANCE MANAGEMENT ROUTES
// ==========================================
router.get(
  '/attendance/student/:studentId',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  getStudentAttendance
);
router.get(
  '/attendance/low-attendance',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  getLowAttendanceStudents
);
router.post(
  '/attendance/update',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  updateAttendanceRecord
);
router.post(
  '/attendance/send-warnings',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  sendLowAttendanceWarnings
);

// ==========================================
// 7. SUPPORT TICKET ROUTES
// ==========================================
router.post('/tickets', authenticate, createTicket);
router.get('/tickets', authenticate, listTickets);
router.get('/tickets/:id', authenticate, getTicketById);
router.post('/tickets/:id/reply', authenticate, replyToTicket);

// ==========================================
// 8. NOTIFICATION ROUTES
// ==========================================
router.get('/notifications', authenticate, getMyNotifications);
router.put('/notifications/:id/read', authenticate, markNotificationRead);
router.put('/notifications/read-all', authenticate, markAllNotificationsRead);
router.post(
  '/notifications/broadcast',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  sendBroadcastAnnouncement
);

// ==========================================
// 9. ADMIN SYSTEM & AUDIT ROUTES
// ==========================================
router.get(
  '/admin/stats',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  getAdminDashboardStats
);
router.get('/admin/users', authenticate, authorize(ROLES.ADMIN), listUsers);
router.put('/admin/users/:id/status', authenticate, authorize(ROLES.ADMIN), updateUserStatus);
router.get('/admin/audit-logs', authenticate, authorize(ROLES.ADMIN), getAuditLogs);
router.get('/admin/departments', authenticate, listDepartments);

// ==========================================
// 10. REPORT EXPORT ROUTES
// ==========================================
router.get(
  '/reports/applications/csv',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  exportApplicationsCsv
);
router.get(
  '/reports/applications/excel',
  authenticate,
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  exportApplicationsExcel
);
router.get('/reports/applications/:id/pdf', authenticate, exportApplicationPdf);

// ==========================================
// 11. PUBLIC VERIFICATION ROUTE (SAFE QR)
// ==========================================
router.get('/public/verify/:token', getPublicQRVerification);

export default router;
