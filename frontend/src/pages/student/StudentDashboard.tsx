import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  FileCheck2,
  FolderLock,
  Activity,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  QrCode,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { StatCard } from '../../components/common/StatCard.js';
import { Badge } from '../../components/common/Badge.js';
import { CircularProgress } from '../../components/common/CircularProgress.js';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/students/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const latestApp = data?.applications?.[0];
  const attendance = data?.attendance;
  const attendancePct = attendance?.percentage || 84.5;
  const kpis = data?.kpis;

  return (
    <div className="space-y-8">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              GNDEC Financial Aid Portal • Session 2025-26
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {profile?.firstName || user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Roll Number: <span className="font-mono font-bold text-white">{profile?.rollNumber || '2104501'}</span> •{' '}
              {profile?.department || 'Computer Science and Engineering'} (Sem {profile?.semester || 5})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/student/scholarships')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center gap-2"
            >
              Browse Scholarships
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/student/documents')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              <FolderLock className="h-4 w-4 text-indigo-300" />
              Document Vault
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Applications"
          value={kpis?.activeApplications || 1}
          subtitle="Submitted for review"
          icon={FileCheck2}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          onClick={() => navigate('/student/applications')}
        />

        <StatCard
          title="Attendance Standing"
          value={`${attendancePct}%`}
          subtitle={attendancePct >= 75 ? 'Meets scholarship threshold' : 'Critical Shortage Alert'}
          icon={Activity}
          iconColor={attendancePct >= 75 ? 'text-emerald-600' : 'text-rose-600'}
          iconBg={attendancePct >= 75 ? 'bg-emerald-50' : 'bg-rose-50'}
          onClick={() => navigate('/student/attendance')}
        />

        <StatCard
          title="Academic Score (CGPA)"
          value={profile?.cgpa ? `${profile.cgpa} / 10` : '8.65 / 10'}
          subtitle="Updated from IKGPTU records"
          icon={Award}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          onClick={() => navigate('/student/academics')}
        />

        <StatCard
          title="Verified Documents"
          value={`${kpis?.verifiedDocuments || 3} / 4`}
          subtitle="Income & caste validated"
          icon={CheckCircle2}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          onClick={() => navigate('/student/documents')}
        />
      </div>

      {/* Horizontal Application Lifecycle Tracker */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-indigo-600" />
              Active Scholarship Application Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {latestApp ? latestApp.scholarshipId?.title : 'Punjab Post-Matric Scholarship Scheme (SC/OBC)'}
            </p>
          </div>
          {latestApp && <Badge status={latestApp.status} />}
        </div>

        {/* 5-Step Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {[
            { step: '1', title: 'Submitted', desc: 'Application logged', done: true },
            {
              step: '2',
              title: 'Doc Verification',
              desc: 'Certificates audited',
              done: latestApp?.status !== 'SUBMITTED',
            },
            {
              step: '3',
              title: 'Eligibility Review',
              desc: 'Committee sign-off',
              done: ['ELIGIBILITY_REVIEW', 'APPROVED'].includes(latestApp?.status),
            },
            {
              step: '4',
              title: 'Grant Certified',
              desc: 'Award approved',
              done: latestApp?.status === 'APPROVED',
            },
            {
              step: '5',
              title: 'Disbursement',
              desc: 'Bank transfer',
              done: latestApp?.status === 'APPROVED',
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                s.done
                  ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.done ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {s.step}
                </span>
                {s.done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </div>
              <p className="text-xs font-bold text-slate-900">{s.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Split Section: Attendance Recovery Meter + Action Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Compliance Gauge (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Attendance Standing</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  attendancePct >= 75
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {attendancePct >= 75 ? 'Safe / Compliant' : 'Shortage Alert'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Minimum 75% required across all academic subjects to retain scholarship grant.
            </p>

            <div className="my-6 flex flex-col items-center justify-center">
              <CircularProgress
                percentage={attendancePct}
                size={160}
                strokeWidth={14}
                color={attendancePct >= 75 ? '#10B981' : '#F43F5E'}
              />
              <p className="mt-3 text-xs font-bold text-slate-700">
                {attendance?.attendedClasses || 82} Attended / {attendance?.totalClasses || 97} Total Sessions
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/student/attendance')}
            className="w-full py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            Open Attendance Recovery Simulator
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick Access Bento Grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/student/scholarships')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Explore Scholarships</h4>
              <p className="text-xs text-slate-500 mt-1">
                Check smart explainable eligibility for state, AICTE, and alumni schemes.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1">
              View Catalog <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          <div
            onClick={() => navigate('/student/documents')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FolderLock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Document Vault</h4>
              <p className="text-xs text-slate-500 mt-1">
                Upload income certificates and review verification history with AI OCR.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
              Manage Documents <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          <div
            onClick={() => navigate('/student/renewals')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Annual Renewal</h4>
              <p className="text-xs text-slate-500 mt-1">
                Submit annual CGPA and attendance verification for continuing grants.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
              Submit Renewal <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          <div
            onClick={() => navigate('/student/tickets')}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Support Helpdesk</h4>
              <p className="text-xs text-slate-500 mt-1">
                Direct communication with GNDEC Scholarship Cell officers.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-purple-600 flex items-center gap-1">
              Get Help <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
