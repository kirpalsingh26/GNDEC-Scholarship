import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  User,
  LogOut,
  QrCode,
  Shield,
  GraduationCap,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { QRModal } from './QRModal.js';
import api from '../../services/api.js';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, profile, logout, quickSwitchDemo } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleSwitchRole = async (role: 'STUDENT' | 'OFFICER' | 'ADMIN') => {
    try {
      await quickSwitchDemo(role);
      if (role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (role === 'OFFICER') {
        navigate('/officer/dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Failed to switch panel demo persona:', err);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.data.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Trigger + Brand Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GNDEC Session 2025-26</span>
            </div>
          </div>

          {/* Center / Right: Quick Demo Persona Switcher Pill */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs">
              <span className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Demo Switch:
              </span>
              <button
                onClick={() => handleSwitchRole('STUDENT')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  user?.role === 'STUDENT'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                👨‍🎓 Student
              </button>
              <button
                onClick={() => handleSwitchRole('OFFICER')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  user?.role === 'OFFICER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                🛡️ Officer
              </button>
              <button
                onClick={() => handleSwitchRole('ADMIN')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  user?.role === 'ADMIN'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                ⚙️ Admin
              </button>
            </div>

            {/* Student Public Digital QR Pass Button */}
            {user?.role === 'STUDENT' && (
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all hover:scale-105"
              >
                <QrCode className="h-4 w-4" />
                Digital Pass
              </button>
            )}

            {/* Notifications Flyout */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-indigo-600" />
                      Notifications & Alerts
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {unreadCount} Unread
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className="py-2.5 px-1 hover:bg-slate-50 rounded-xl transition-colors">
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-slate-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <p className="font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[10px] font-bold text-indigo-600">{user?.role}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50">
                  <div className="p-3 border-b border-slate-100 text-xs">
                    <p className="font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Public Digital Pass QR Modal */}
      {profile?.qrVerificationToken && (
        <QRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          profile={profile}
        />
      )}
    </>
  );
};
