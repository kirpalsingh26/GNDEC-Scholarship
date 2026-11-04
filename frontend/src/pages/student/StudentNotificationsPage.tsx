import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck2,
  FileText,
  ShieldCheck,
  Send,
  Sparkles,
  ExternalLink,
  Check,
  Info,
  Inbox,
} from 'lucide-react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToWebPush,
  unsubscribeFromWebPush,
  checkIsSubscribed,
} from '../../utils/pushNotifications.js';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const StudentNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'DEADLINE' | 'APPLICATION' | 'DOCUMENT'>('ALL');

  // Web push states
  const [pushSupported, setPushSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Check Push status
    const supported = isPushSupported();
    setPushSupported(supported);
    if (supported) {
      setPermission(getNotificationPermission());
      checkIsSubscribed().then(setIsSubscribed);
    }
  }, []);

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (isSubscribed) {
        const ok = await unsubscribeFromWebPush();
        if (ok) {
          setIsSubscribed(false);
          toast.success('Web push notifications unsubscribed.');
        } else {
          toast.error('Failed to unsubscribe.');
        }
      } else {
        const result = await subscribeToWebPush();
        if (result.success) {
          setIsSubscribed(true);
          setPermission(getNotificationPermission());
          toast.success(result.message || 'Push notifications enabled!');
        } else {
          toast.error(result.message || 'Permission was denied.');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Error configuring web push');
    } finally {
      setPushLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    try {
      toast.info('Sending test push notification...');
      const res = await api.post('/notifications/test-push');
      if (res.data.success) {
        toast.success('Test push sent! Check your notification center.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send test push.');
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'DEADLINE') return n.type === 'DEADLINE';
    if (filter === 'APPLICATION') return n.type === 'APPLICATION';
    if (filter === 'DOCUMENT') return n.type === 'DOCUMENT';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEADLINE':
        return <Clock className="h-5 w-5 text-rose-600" />;
      case 'APPLICATION':
        return <FileCheck2 className="h-5 w-5 text-blue-600" />;
      case 'DOCUMENT':
        return <FileText className="h-5 w-5 text-amber-600" />;
      case 'ELIGIBILITY':
        return <ShieldCheck className="h-5 w-5 text-emerald-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DEADLINE':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">Deadline</span>;
      case 'APPLICATION':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">Application</span>;
      case 'DOCUMENT':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">Document</span>;
      case 'ELIGIBILITY':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">Eligibility</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">General</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-1.5">
            <Bell className="h-3.5 w-3.5 text-amber-600" />
            <span>Student Notification Center • Port 5173</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Notifications & Alerts History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding document scrutiny, verification results, application decisions, and deadline reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
          >
            <Check className="h-4 w-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Web Push Notifications Activation Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0b2341] text-white shadow-md border border-amber-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Bell className="h-5 w-5" />
              </span>
              <h3 className="text-base font-black text-white">
                Browser & Device Web Push Notifications
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stay informed instantly even when you close the tab. Receive automatic notifications for document verification results, faculty action requests, and scheduled Punjab Post-Matric Scholarship deadline reminders.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${isSubscribed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                Status: {isSubscribed ? 'Active & Subscribed ✓' : 'Not Subscribed'}
              </span>
              <span>•</span>
              <span>Permission: {permission}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            {isSubscribed && (
              <button
                onClick={handleSendTestPush}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Test Push</span>
              </button>
            )}

            <button
              onClick={handleTogglePush}
              disabled={pushLoading || !pushSupported}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isSubscribed
                  ? 'bg-rose-600/90 hover:bg-rose-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {pushLoading
                ? 'Configuring...'
                : isSubscribed
                ? 'Disable Push'
                : 'Enable Web Push Alerts'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: 'ALL', label: `All (${notifications.length})` },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'DEADLINE', label: 'Deadlines' },
          { id: 'APPLICATION', label: 'Applications' },
          { id: 'DOCUMENT', label: 'Documents' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-[#0b2341] text-amber-400 font-black shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Cards List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
          Loading notification history...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No notifications found</h3>
          <p className="text-xs text-slate-500 mt-1">
            You don't have any notifications matching this filter category.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item._id}
              onClick={() => handleMarkAsRead(item._id, item.link)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !item.isRead
                  ? 'bg-amber-50/40 border-amber-200 shadow-2xs hover:bg-amber-50/70'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(item.type)}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {item.message}
                  </p>

                  <p className="text-[10px] text-slate-400 pt-1 font-mono">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {item.link && (
                <div className="text-amber-600 hover:text-amber-800 shrink-0 pt-1">
                  <ExternalLink className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
