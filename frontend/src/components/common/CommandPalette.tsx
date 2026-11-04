import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  FolderLock,
  Activity,
  Award,
  RefreshCw,
  HelpCircle,
  User,
  ShieldCheck,
  CheckSquare,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../services/api.js';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [scholarships, setScholarships] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchShortcuts = async () => {
        try {
          const res = await api.get('/scholarships');
          if (res.data.success) {
            setScholarships(res.data.data);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchShortcuts();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event or prop
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultNavigationItems =
    user?.role === 'STUDENT'
      ? [
          { title: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard, tag: 'Page' },
          { title: 'PMS Scholarship Scheme', path: '/student/scholarships', icon: GraduationCap, tag: 'Page' },
          { title: 'My Applications & Status', path: '/student/applications', icon: FileCheck2, tag: 'Page' },
          { title: 'Document Vault', path: '/student/documents', icon: FolderLock, tag: 'Page' },
          { title: 'Academic CGPA Records', path: '/student/academics', icon: Award, tag: 'Page' },
          { title: 'Grant Annual Renewal', path: '/student/renewals', icon: RefreshCw, tag: 'Page' },
          { title: 'Inquiry Support Helpdesk', path: '/student/tickets', icon: HelpCircle, tag: 'Support' },
          { title: 'Profile & Bank Details', path: '/student/profile', icon: User, tag: 'Settings' },
        ]
      : user?.role === 'OFFICER'
      ? [
          { title: 'Command Dashboard', path: '/officer/dashboard', icon: LayoutDashboard, tag: 'Page' },
          { title: 'Applications Queue & Review', path: '/officer/applications', icon: FileCheck2, tag: 'Queue' },
          { title: 'Document Verification Workspace', path: '/officer/documents', icon: CheckSquare, tag: 'Desk' },
          { title: 'Student Directory', path: '/officer/students', icon: User, tag: 'Directory' },
          { title: 'Student Inquiries & Tickets', path: '/officer/tickets', icon: HelpCircle, tag: 'Desk' },
          { title: 'Reports & Export Center', path: '/officer/reports', icon: FileSpreadsheet, tag: 'Reports' },
        ]
      : [
          { title: 'Governance Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, tag: 'Admin' },
          { title: 'User & Role Management', path: '/admin/users', icon: User, tag: 'Admin' },
          { title: 'Scholarship Scheme Manager', path: '/admin/scholarships', icon: GraduationCap, tag: 'Admin' },
          { title: 'Departments & Branch Setup', path: '/admin/departments', icon: Layers, tag: 'Admin' },
          { title: 'Security Audit Logs Trail', path: '/admin/audit-logs', icon: ShieldCheck, tag: 'Admin' },
          { title: 'System Configuration', path: '/admin/settings', icon: Sparkles, tag: 'Admin' },
        ];

  const filteredPages = defaultNavigationItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredScholarships = scholarships.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.provider.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectPage = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSelectScholarship = (id: string) => {
    if (user?.role === 'STUDENT') {
      navigate(`/student/apply/${id}`);
    } else {
      navigate(`/student/scholarships`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="h-5 w-5 text-indigo-600 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a page, scheme, or command (e.g., 'PMS', 'Freeship', 'Documents')..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Results / Categories */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Navigation Pages */}
          {filteredPages.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Portal Navigation
              </p>
              <div className="space-y-1">
                {filteredPages.map((page, idx) => {
                  const Icon = page.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectPage(page.path)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-indigo-50 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-slate-100 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white flex items-center justify-center transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                          {page.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {page.tag}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scholarship Schemes */}
          {filteredScholarships.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Scholarship Schemes
              </p>
              <div className="space-y-1">
                {filteredScholarships.slice(0, 4).map((sch) => (
                  <div
                    key={sch._id}
                    onClick={() => handleSelectScholarship(sch._id)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-indigo-50 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                          {sch.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {sch.provider} • ₹{(sch.amount || 0).toLocaleString('en-IN')}/yr
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 group-hover:bg-indigo-200 px-2.5 py-1 rounded-xl whitespace-nowrap">
                      View / Apply
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or keyboard</span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
