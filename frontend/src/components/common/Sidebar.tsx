import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  FolderLock,
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
  Upload,
  X,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'PMS Scholarships', path: '/student/scholarships', icon: GraduationCap },
    { name: 'My Applications', path: '/student/applications', icon: FileCheck2 },
    { name: 'Document Vault', path: '/student/documents', icon: FolderLock },
    { name: 'Submit Documents', path: '/student/submit-documents', icon: Upload },
    { name: 'Academic Records', path: '/student/academics', icon: Award },
    { name: 'Grant Renewal', path: '/student/renewals', icon: RefreshCw },
    { name: 'Inquiry Helpdesk', path: '/student/tickets', icon: HelpCircle },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Profile & Bank Details', path: '/student/profile', icon: User },
  ];

  const officerLinks = [
    { name: 'Command Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
    { name: 'Applications Queue', path: '/officer/applications', icon: FileCheck2 },
    { name: 'Verification Workspace', path: '/officer/documents', icon: CheckSquare },
    { name: 'Student Directory', path: '/officer/students', icon: Users },
    { name: 'Student Inquiries', path: '/officer/tickets', icon: HelpCircle },
    { name: 'Reports & Exports', path: '/officer/reports', icon: FileSpreadsheet },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User & Role Mgmt', path: '/admin/users', icon: Users },
    { name: 'PMS Scheme Rules', path: '/admin/scholarships', icon: GraduationCap },
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

  const roleTheme =
    user?.role === 'STUDENT'
      ? {
          activeClass:
            'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/25 ring-1 ring-amber-400',
          badgeText: 'Student Scholar Portal',
          badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          portalPort: 'Port 5173',
          iconActiveColor: 'text-slate-950',
          avatarBg: 'bg-amber-500 text-slate-950 font-black',
        }
      : user?.role === 'OFFICER'
      ? {
          activeClass:
            'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-black shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30',
          badgeText: 'Faculty Scrutiny Officer',
          badgeClass: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
          portalPort: 'Port 5174',
          iconActiveColor: 'text-white',
          avatarBg: 'bg-blue-600 text-white font-black',
        }
      : {
          activeClass:
            'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white font-black shadow-md shadow-purple-600/30 ring-1 ring-purple-400/30',
          badgeText: 'Institutional Super Admin',
          badgeClass: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
          portalPort: 'Port 5175',
          iconActiveColor: 'text-white',
          avatarBg: 'bg-purple-600 text-white font-black',
        };

  const isLinkActive = (path: string) => {
    if (
      path === '/student/dashboard' ||
      path === '/officer/dashboard' ||
      path === '/admin/dashboard'
    ) {
      return location.pathname === path;
    }
    if (path === '/student/scholarships') {
      return (
        location.pathname.startsWith('/student/scholarships') ||
        location.pathname.startsWith('/student/apply')
      );
    }
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <aside className="w-64 h-full bg-[#0b1f3a] text-slate-300 flex flex-col justify-between p-3.5 select-none border-r border-slate-800 shadow-xl relative shrink-0">
      {/* Subtle Ambient Backlight */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Section */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {/* Institutional Brand Header */}
        <div className="flex items-center justify-between px-1.5 py-2 mb-3 border-b border-white/10 pb-3">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group min-w-0"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-600/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-md group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white tracking-tight leading-tight truncate">
                GNDEC Ludhiana
              </h2>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                <span>PMS SC Portal</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono font-normal">
                  {roleTheme.portalPort}
                </span>
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Role Tag Banner */}
        <div className="mb-2.5 px-0.5 shrink-0">
          <div
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-between ${roleTheme.badgeClass}`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">{roleTheme.badgeText}</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 shrink-0">
              Online
            </span>
          </div>
        </div>

        {/* Navigation Links Scrollable Area */}
        <nav className="space-y-1 overflow-y-auto pr-1 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.path);

            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  active
                    ? roleTheme.activeClass
                    : 'text-slate-300 hover:text-white hover:bg-white/10 hover:translate-x-0.5'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? roleTheme.iconActiveColor : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Sign Out */}
      <div className="pt-2.5 border-t border-white/10 space-y-2 relative z-10 shrink-0 mt-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/5 border border-white/10">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${roleTheme.avatarBg}`}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-extrabold text-white truncate leading-tight">
              {user?.name || 'Authorized User'}
            </p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
              {user?.email || 'user@gndec.ac.in'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-200 hover:bg-rose-500/15 rounded-xl border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Secure Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex w-64 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
