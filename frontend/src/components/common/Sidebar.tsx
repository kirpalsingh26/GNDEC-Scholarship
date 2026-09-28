import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  FolderLock,
  Activity,
  Award,
  RefreshCw,
  HelpCircle,
  User,
  Users,
  CheckSquare,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Sliders,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Scholarships', path: '/student/scholarships', icon: GraduationCap },
    { name: 'Document Vault', path: '/student/documents', icon: FolderLock },
    { name: 'Attendance & Recovery', path: '/student/attendance', icon: Activity },
    { name: 'Academic Records', path: '/student/academics', icon: Award },
    { name: 'Grant Renewal', path: '/student/renewals', icon: RefreshCw },
    { name: 'Inquiry Helpdesk', path: '/student/tickets', icon: HelpCircle },
    { name: 'Profile & Bank Details', path: '/student/profile', icon: User },
  ];

  const officerLinks = [
    { name: 'Command Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
    { name: 'Applications Queue', path: '/officer/applications', icon: FileCheck2 },
    { name: 'Verification Workspace', path: '/officer/documents', icon: CheckSquare },
    { name: 'Attendance Shortages', path: '/officer/attendance', icon: Activity },
    { name: 'Student Directory', path: '/officer/students', icon: Users },
    { name: 'Student Inquiries', path: '/officer/tickets', icon: HelpCircle },
    { name: 'Reports & Exports', path: '/officer/reports', icon: FileSpreadsheet },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User & Role Mgmt', path: '/admin/users', icon: Users },
    { name: 'Scholarship Schemes', path: '/admin/scholarships', icon: GraduationCap },
    { name: 'Departments & Branch', path: '/admin/departments', icon: Layers },
    { name: 'Security Audit Trail', path: '/admin/audit-logs', icon: ShieldCheck },
    { name: 'Institutional Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { name: 'System Settings', path: '/admin/settings', icon: Sliders },
  ];

  const links =
    user?.role === 'STUDENT'
      ? studentLinks
      : user?.role === 'OFFICER'
      ? officerLinks
      : adminLinks;

  const sidebarContent = (
    <aside className="w-64 h-full bg-slate-900 text-slate-300 flex flex-col justify-between p-4 select-none border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-6">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">ScholarSphere</h2>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                GNDEC Ludhiana
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Role Tag */}
        <div className="px-3 mb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            {user?.role === 'STUDENT'
              ? 'Student Portal'
              : user?.role === 'OFFICER'
              ? 'Verification Desk'
              : 'Governance Admin'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Sign Out */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-slate-800/50">
          <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">{sidebarContent}</div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
