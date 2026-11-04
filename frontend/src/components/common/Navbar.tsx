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
  Search,
  FileCheck2,
  FileText,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { QRModal } from './QRModal.js';
import { CommandPalette } from './CommandPalette.js';
import api from '../../services/api.js';
import {
  isPushSupported,
  subscribeToWebPush,
  checkIsSubscribed,
} from '../../utils/pushNotifications.js';
import { getPortalMode, PORTALS } from '../../utils/portalConfig.js';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.slice(0, 6));
        setUnreadCount(res.data.unreadCount ?? res.data.data.filter((n: any) => !n.isRead).length);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Periodically refresh in-app notifications
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const supported = isPushSupported();
    setPushSupported(supported);
    if (supported && user) {
      checkIsSubscribed().then(setIsPushSubscribed);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) {
        setIsNotifOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnablePush = async () => {
    setPushLoading(true);
    try {
      const res = await subscribeToWebPush();
      if (res.success) {
        setIsPushSubscribed(true);
      }
    } finally {
      setPushLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEADLINE':
        return <Clock className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />;
      case 'APPLICATION':
        return <FileCheck2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />;
      case 'DOCUMENT':
        return <FileText className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 shadow-xs transition-all">
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
              <span
                className={`h-2 w-2 rounded-full animate-pulse ${
                  getPortalMode() === 'TEACHER'
                    ? 'bg-blue-500'
                    : getPortalMode() === 'ADMIN'
                    ? 'bg-purple-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span>
                {getPortalMode() === 'TEACHER' && 'GNDEC Faculty Officer Console • Port 5174'}
                {getPortalMode() === 'ADMIN' && 'GNDEC Super Admin Console • Port 5175'}
                {getPortalMode() === 'STUDENT' && 'GNDEC Student PMS Portal • Port 5173'}
                {getPortalMode() === 'UNIFIED' && 'GNDEC Scholarship Portal'}
              </span>
            </div>
          </div>

          {/* Center & Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Spotlight Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-all group"
              title="Quick Search & Shortcuts (Cmd+K)"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="hidden xl:inline">Search portal...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-400 rounded-md border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Authenticated User Role Badge */}
            <div className="hidden md:flex items-center text-xs font-bold">
              {user?.role === 'STUDENT' ? (
                <span className="text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Student Scholar
                </span>
              ) : user?.role === 'OFFICER' ? (
                <span className="text-blue-800 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Verification Officer
                </span>
              ) : (
                <span className="text-purple-800 bg-purple-50 border border-purple-200/80 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  System Administrator
                </span>
              )}
            </div>

            {/* Student Public Digital QR Pass Button */}
            {user?.role === 'STUDENT' && (
              <button
                onClick={() => setIsQRModalOpen(true)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 ${
                  profile?.isProfileComplete
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                }`}
              >
                <QrCode className="h-4 w-4" />
                <span>{profile?.isProfileComplete ? 'Verified Pass ✓' : 'ID Pass (Pending)'}</span>
              </button>
            )}

            {/* Notifications Flyout */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Notifications & Alerts"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-indigo-600" />
                      Notifications & Alerts
                    </h4>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {unreadCount} Unread
                      </span>
                    </div>
                  </div>

                  {/* Web Push Prompt inside Notification Bell */}
                  {pushSupported && !isPushSubscribed && (
                    <div className="my-2 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-amber-900 font-semibold text-[11px]">
                        <Bell className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>Enable push for deadline & verification updates</span>
                      </div>
                      <button
                        onClick={handleEnablePush}
                        disabled={pushLoading}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-[#0b2341] font-bold text-[10px] shrink-0 transition-colors"
                      >
                        {pushLoading ? 'Enabling...' : 'Enable'}
                      </button>
                    </div>
                  )}

                  {pushSupported && isPushSubscribed && (
                    <div className="my-2 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between text-[10px] font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Web Push Active
                      </span>
                      <span className="text-emerald-600 font-medium">Desktop & Mobile alerts live</span>
                    </div>
                  )}

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id, n.link)}
                          className={`py-2.5 px-2 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                            !n.isRead ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          {getTypeIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                              {!n.isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer link to full notification history */}
                  <div className="pt-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/student/notifications');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
                    >
                      <span>View All Notification History</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
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

                  {/* Multi-Portal Tab Links */}
                  <div className="py-1 border-b border-slate-100 text-[10px]">
                    <span className="px-3 py-1 text-slate-400 font-bold uppercase tracking-wider block">
                      Open Dedicated Portals:
                    </span>
                    <a
                      href={PORTALS.STUDENT.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 flex items-center justify-between text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors font-medium"
                    >
                      <span>🎓 Student Portal (5173)</span>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                    <a
                      href={PORTALS.TEACHER.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 flex items-center justify-between text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors font-medium"
                    >
                      <span>🛡️ Faculty Console (5174)</span>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                    <a
                      href={PORTALS.ADMIN.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 flex items-center justify-between text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors font-medium"
                    >
                      <span>⚙️ Super Admin (5175)</span>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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

      {/* Global Spotlight Quick Command Search */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
