import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.js';
import { LoginPage } from './pages/public/LoginPage.js';
import { RegisterPage } from './pages/public/RegisterPage.js';
import { PublicQRVerifyPage } from './pages/public/PublicQRVerifyPage.js';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { ScholarshipCatalog } from './pages/student/ScholarshipCatalog.js';
import { ApplyScholarshipPage } from './pages/student/ApplyScholarshipPage.js';
import { ApplicationStatusPage } from './pages/student/ApplicationStatusPage.js';
import { DocumentVault } from './pages/student/DocumentVault.js';
import { AttendancePage } from './pages/student/AttendancePage.js';
import { AcademicRecordPage } from './pages/student/AcademicRecordPage.js';
import { RenewScholarshipPage } from './pages/student/RenewScholarshipPage.js';
import { StudentTicketsPage } from './pages/student/StudentTicketsPage.js';
import { StudentProfilePage } from './pages/student/StudentProfilePage.js';

// Officer Pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard.js';
import { ApplicationsQueuePage } from './pages/officer/ApplicationsQueuePage.js';
import { ApplicationReviewPage } from './pages/officer/ApplicationReviewPage.js';
import { DocumentVerificationPage } from './pages/officer/DocumentVerificationPage.js';
import { StudentDirectoryPage } from './pages/officer/StudentDirectoryPage.js';
import { AttendanceMonitoringPage } from './pages/officer/AttendanceMonitoringPage.js';
import { OfficerTicketsPage } from './pages/officer/OfficerTicketsPage.js';
import { OfficerReportsPage } from './pages/officer/OfficerReportsPage.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { UserManagementPage } from './pages/admin/UserManagementPage.js';
import { ScholarshipManagerPage } from './pages/admin/ScholarshipManagerPage.js';
import { DepartmentCoursePage } from './pages/admin/DepartmentCoursePage.js';
import { AuditLogsPage } from './pages/admin/AuditLogsPage.js';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-400 font-semibold animate-pulse">
        Initializing ScholarSphere Session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify/:token" element={<PublicQRVerifyPage />} />

          {/* Protected Routes inside DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/scholarships" element={<ScholarshipCatalog />} />
            <Route path="/student/apply/:id" element={<ApplyScholarshipPage />} />
            <Route path="/student/applications" element={<ApplicationsQueuePage />} />
            <Route path="/student/applications/:id" element={<ApplicationStatusPage />} />
            <Route path="/student/documents" element={<DocumentVault />} />
            <Route path="/student/attendance" element={<AttendancePage />} />
            <Route path="/student/academics" element={<AcademicRecordPage />} />
            <Route path="/student/renewals" element={<RenewScholarshipPage />} />
            <Route path="/student/tickets" element={<StudentTicketsPage />} />
            <Route path="/student/tickets/:id" element={<StudentTicketsPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />

            {/* Officer Routes */}
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/applications" element={<ApplicationsQueuePage />} />
            <Route path="/officer/applications/:id" element={<ApplicationReviewPage />} />
            <Route path="/officer/documents" element={<DocumentVerificationPage />} />
            <Route path="/officer/students" element={<StudentDirectoryPage />} />
            <Route path="/officer/attendance" element={<AttendanceMonitoringPage />} />
            <Route path="/officer/tickets" element={<OfficerTicketsPage />} />
            <Route path="/officer/reports" element={<OfficerReportsPage />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/scholarships" element={<ScholarshipManagerPage />} />
            <Route path="/admin/departments" element={<DepartmentCoursePage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin/reports" element={<OfficerReportsPage />} />
            <Route path="/admin/settings" element={<SystemSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
