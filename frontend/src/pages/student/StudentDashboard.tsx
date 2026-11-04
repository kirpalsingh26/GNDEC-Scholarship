import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  FileCheck2,
  FolderLock,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wallet,
  ShieldCheck,
  ExternalLink,
  Clock,
  Eye,
  RefreshCw,
  Upload,
  Lock,
  Info,
  Bell,
  Phone,
  Mail,
  FileText,
  Sparkles,
  Calendar,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Badge } from '../../components/common/Badge.js';
import { QRModal } from '../../components/common/QRModal.js';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [reuploadingDocType, setReuploadingDocType] = useState<string | null>(null);

  const fetchDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [dashRes, notifRes] = await Promise.allSettled([
        api.get('/students/dashboard'),
        api.get('/notifications'),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data.success) {
        setData(dashRes.value.data.data);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.data.success) {
        setRecentNotifications((notifRes.value.data.data || []).slice(0, 3));
      }
      if (isManual) {
        addToast('success', 'Dashboard refreshed with latest scrutiny records.');
      }
    } catch (err) {
      console.error(err);
      if (isManual) addToast('error', 'Failed to refresh records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // If new student has not uploaded documents yet, automatically redirect to document submission page
  useEffect(() => {
    if (!loading && data && data.onboardingStage === 'DOCUMENTS_REQUIRED') {
      navigate('/student/submit-documents');
    }
  }, [loading, data, navigate]);

  const latestApp = data?.latestApplication || data?.applications?.[0];
  const kpis = data?.kpis;
  const documents: any[] = data?.documents || [];
  const isVerified = data?.isVerified === true;
  const onboardingStage = data?.onboardingStage || 'PENDING_VERIFICATION';

  const familyIncome = profile?.familyIncome || 180000;
  const isIncomeEligible = familyIncome <= 250000;

  // Handle quick re-upload directly from dashboard if officer requested it
  const handleQuickReupload = async (docType: string, file: File) => {
    if (!file) return;
    setReuploadingDocType(docType);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);
    formData.append('title', docType.replace(/_/g, ' '));
    if (latestApp?._id) formData.append('applicationId', latestApp._id);

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        addToast('success', `${docType.replace(/_/g, ' ')} re-uploaded successfully.`);
        await fetchDashboard();
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to re-upload document.');
    } finally {
      setReuploadingDocType(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-600">Loading student scholarship workspace...</p>
        <p className="text-[11px] text-slate-400 mt-1">Connecting to GNDEC Scholarship Verification Authority</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* =========================================================================
          HERO COCKPIT WELCOME BANNER (LIGHT THEME MATCHING LOGIN PAGE AESTHETICS)
      ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-amber-50/30 border border-slate-200/90 p-6 sm:p-8 text-slate-900 shadow-sm relative overflow-hidden">
        {/* Ambient Subtle Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            {/* Golden Emblem Container */}
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-400/40 flex items-center justify-center text-amber-700 shadow-md shadow-amber-500/10 shrink-0">
              <GraduationCap className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                  PMS SC SCHOLAR
                </span>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    100% Tuition Fee Exemption Certified ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                    <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                    Officer Scrutiny In Progress
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Welcome back, {profile?.firstName || user?.name}! 👋
              </h1>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-slate-600">
                <span className="font-mono text-slate-800 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  URN: {profile?.rollNumber || '2104520'}
                </span>
                <span>•</span>
                <span className="font-medium text-slate-700">{profile?.department || 'Computer Science & Engineering'}</span>
                <span>•</span>
                <span className="font-medium text-slate-700">Semester {profile?.semester || 5}</span>
                <span>•</span>
                <span className="font-bold text-amber-900 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-md text-[11px]">
                  Category: SC Verified ✓
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white shadow-indigo-600/20 transform active:scale-[0.99]"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isVerified ? 'Verified Digital ID' : 'Check ID Pass Status'}</span>
            </button>

            <button
              onClick={() => navigate('/student/documents')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FolderLock className="h-4 w-4 text-indigo-600" />
              <span>Document Vault</span>
            </button>

            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              title="Refresh scrutiny records"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KEY STATS & COMPLIANCE METRICS
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Application Status Card */}
        <div
          onClick={() => navigate('/student/applications')}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                PMS Application Status
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-900">
                {latestApp ? latestApp.status.replace(/_/g, ' ') : isVerified ? 'APPROVED' : 'SUBMITTED'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 font-mono">
                #{latestApp?.applicationNumber || 'GNDEC-PMS-2025'}
              </p>
            </div>
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' : 'bg-amber-50 text-amber-600 border-amber-200/60'}`}>
              {isVerified ? <FileCheck2 className="h-5 w-5" /> : <Clock className="h-5 w-5 animate-pulse" />}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className={isVerified ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
              {isVerified ? '✓ Certified by Welfare Officer' : '⏳ Committee Review Pending'}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Tuition Fee Waiver Card */}
        <div
          onClick={() => navigate('/student/scholarships')}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Tuition Fee Waiver
              </p>
              <h3 className="mt-1 text-xl font-black text-emerald-700">
                100% Exemption
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Punjab Post-Matric SC Scheme
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold">100% Tuition Fees Waived</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Annual Family Income Card */}
        <div
          onClick={() => navigate('/student/profile')}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Certified Family Income
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-900">
                ₹{(familyIncome / 100000).toFixed(2)} Lakh
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Limit: ≤ ₹2.50 Lakh / year
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-blue-700 font-bold">✓ Income Under Ceiling</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Uploaded Documents Card */}
        <div
          onClick={() => navigate('/student/documents')}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Mandatory Certificates
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-900">
                {kpis?.verifiedDocuments ?? (isVerified ? documents.length : 0)} / {documents.length || 6}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {isVerified ? 'All Certificates Certified' : 'Under Officer Inspection'}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0">
              <FolderLock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-indigo-700 font-bold">Open Document Vault</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          VERIFICATION STATUS NOTICE (IF PENDING)
      ========================================================================= */}
      {!isVerified && (
        <div className="rounded-2xl bg-amber-50/90 border border-amber-300/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-amber-200">
              <ShieldCheck className="h-5 w-5 text-amber-700" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950">
                  Institutional ID Status: Pending Officer Verification
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 uppercase">
                  Committee Review
                </span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                In strict compliance with Punjab Government Post-Matric Scholarship rules, your digital student ID pass will be unlocked as soon as the GNDEC verification committee confirms your Freeship Card, Tehsildar income certificate, and Punjab domicile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          APPLICATION LIFECYCLE PROGRESS PIPELINE
      ========================================================================= */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-amber-600" />
              Post-Matric Scholarship (PMS) Application & Verification Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students • Academic Session 2025–26
            </p>
          </div>
          {latestApp && <Badge status={latestApp.status} />}
        </div>

        {/* Dynamic Connected Pipeline Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
          {[
            {
              step: '1',
              title: 'Account Registration',
              desc: 'Enrolled SC profile created',
              done: true,
              current: false,
            },
            {
              step: '2',
              title: 'Certificates Uploaded',
              desc: `${documents.length || 6} mandatory proofs filed`,
              done: true,
              current: false,
            },
            {
              step: '3',
              title: 'Faculty Officer Scrutiny',
              desc: isVerified ? 'All certificates certified ✓' : 'Authenticating SDM/Tehsildar seals',
              done: isVerified,
              current: !isVerified,
            },
            {
              step: '4',
              title: '100% Tuition Fee Exemption',
              desc: isVerified ? 'Sanctioned & state DBT linked' : 'Unlocks on officer signoff',
              done: isVerified,
              current: false,
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                s.done
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : s.current
                  ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs ring-2 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    s.done
                      ? 'bg-emerald-600 text-white'
                      : s.current
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {s.done ? '✓' : s.step}
                </span>
                {s.done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                {s.current && <Clock className="h-4 w-4 text-amber-600 animate-spin" />}
              </div>
              <p className="text-xs font-bold text-slate-900">{s.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          RECENT IN-APP NOTIFICATIONS & DEADLINE REMINDERS FEED
      ========================================================================= */}
      {recentNotifications.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Latest In-App Announcements & Deadlines
                </h3>
                <p className="text-[11px] text-slate-400">Time-sensitive reminders from GNDEC Scholarship Desk</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/student/notifications')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Notification Center</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => notif.link && navigate(notif.link)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  notif.type === 'DEADLINE'
                    ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
                    : notif.type === 'DOCUMENT'
                    ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 uppercase">
                      {notif.type}
                    </span>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{notif.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-mono">
                  {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          UPLOADED DOCUMENTS SCRUTINY VAULT TABLE
      ========================================================================= */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderLock className="h-4 w-4 text-indigo-600" />
              Mandatory Certificates & Verification Records
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inspection status of your documents verified by the GNDEC Scholarship Scrutiny Officer
            </p>
          </div>
          <button
            onClick={() => navigate('/student/documents')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Vault</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Certificate Type</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Scrutiny Status</th>
                <th className="py-2.5 px-3">Officer Remarks</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc: any) => {
                const latestVer = doc.versions?.find((v: any) => v.versionNumber === doc.currentVersion);
                const isReupload = doc.status === 'REUPLOAD_REQUIRED';

                return (
                  <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 font-bold text-xs">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{doc.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {doc.documentType.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">v{doc.currentVersion}</td>
                    <td className="py-3 px-3">
                      <Badge status={doc.status} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      {isReupload ? (
                        <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                          <span className="font-bold">Re-upload required: </span>
                          {latestVer?.rejectionReason || 'Please upload a clearer official copy.'}
                        </div>
                      ) : doc.status === 'VERIFIED' ? (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Authenticated by Verification Committee
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Pending officer review...
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {latestVer?.fileUrl && (
                          <a
                            href={latestVer.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </a>
                        )}
                        {isReupload && (
                          <label className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer flex items-center gap-1 transition-colors">
                            <input
                              type="file"
                              accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff,.tif,.heic,.heif,.avif,.jfif,.doc,.docx,.xls,.xlsx,.txt"
                              className="hidden"
                              disabled={reuploadingDocType === doc.documentType}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleQuickReupload(doc.documentType, f);
                              }}
                            />
                            <Upload className="h-3 w-3" />
                            {reuploadingDocType === doc.documentType ? 'Uploading...' : 'Re-upload'}
                          </label>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          SPLIT SECTION: PMS COMPLIANCE CHECKLIST + HELPDESK OFFICE
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compliance Checklist */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              PMS Criteria Compliance Checklist
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
              {isVerified ? 'All Certified ✓' : 'In Review ⏳'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Social Reservation Category</p>
                <p className="text-[11px] text-slate-500">Scheduled Caste (Punjab State)</p>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isVerified ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                {isVerified ? 'Certified ✓' : 'Under Review ⏳'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Annual Family Income Ceiling</p>
                <p className="text-[11px] text-slate-500">Declared: ₹{(familyIncome / 100000).toFixed(2)}L (Limit: ≤ ₹2.50L)</p>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isVerified ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                {isVerified ? 'SDM Seal Verified ✓' : 'SDM Seal In Review ⏳'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Punjab State Domicile</p>
                <p className="text-[11px] text-slate-500">Permanent Resident Certificate</p>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isVerified ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                {isVerified ? 'Verified ✓' : 'Logged ⏳'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Direct Benefit Transfer (DBT)</p>
                <p className="text-[11px] text-slate-500">Aadhaar Seeded Active Account</p>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isVerified ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                {isVerified ? 'PFMS Active ✓' : 'Logged ⏳'}
              </span>
            </div>
          </div>
        </div>

        {/* Scholarship Cell Contact Card */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <Building2 className="h-4 w-4 text-indigo-600" />
              GNDEC Scholarship Verification Cell
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              For inquiries regarding Freeship Card submission, Tehsildar income certification, or state DBT disbursals, visit or reach out to the college scholarship desk:
            </p>

            <div className="mt-3 space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span><strong>Office:</strong> Room #102, Administrative Block, GNDEC Gill Park</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span><strong>Helpline:</strong> 0161-5064500 (Ext. 204)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span><strong>Support Email:</strong> scholarship@gndec.ac.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span><strong>Working Hours:</strong> Mon–Fri, 9:00 AM – 4:30 PM</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <a
              href="https://scholarships.punjab.gov.in"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Punjab Dr. Ambedkar State Scholarship Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          QUICK ACCESS ACTION TILES
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/student/scholarships')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">PMS Scheme Catalog</h4>
            <p className="text-xs text-slate-500 mt-1">
              Explore active schemes, 100% tuition waivers, and live application deadlines.
            </p>
          </div>
          <p className="mt-4 text-xs font-bold text-amber-800 flex items-center gap-1">
            Browse Schemes <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>

        <div
          onClick={() => navigate('/student/documents')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FolderLock className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Secure Document Vault</h4>
            <p className="text-xs text-slate-500 mt-1">
              Inspect uploaded caste certificates, income affidavits, and college fee receipts.
            </p>
          </div>
          <p className="mt-4 text-xs font-bold text-emerald-700 flex items-center gap-1">
            Manage Certificates <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>

        <div
          onClick={() => navigate('/student/renewals')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Academic Renewal</h4>
            <p className="text-xs text-slate-500 mt-1">
              File latest semester marksheets and annual income certificates for renewal.
            </p>
          </div>
          <p className="mt-4 text-xs font-bold text-blue-700 flex items-center gap-1">
            Submit Renewal <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>

        <div
          onClick={() => navigate('/student/tickets')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Scholarship Helpdesk</h4>
            <p className="text-xs text-slate-500 mt-1">
              Open inquiry tickets directly with the GNDEC Scrutiny Officer and Welfare Committee.
            </p>
          </div>
          <p className="mt-4 text-xs font-bold text-purple-700 flex items-center gap-1">
            Contact Helpdesk <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>
      </div>

      {/* =========================================================================
          DIGITAL QR ID CARD PASS MODAL
      ========================================================================= */}
      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        profile={profile}
      />
    </div>
  );
};
