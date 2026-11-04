import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.js';
import { Badge } from '../../components/common/Badge.js';

export const OfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success) setStats(statsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpis = stats?.kpis;
  const totalAppsCount = (kpis?.approvedApplications ?? 0) + (kpis?.pendingApplications ?? 0) + (kpis?.rejectedApplications ?? 0);
  const totalStudentsCount = kpis?.totalStudents ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* =========================================================================
          HERO EXECUTIVE BANNER (LIGHT THEME MATCHING PORTAL DESIGN SYSTEM)
      ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-blue-50/30 border border-slate-200/90 p-6 sm:p-8 text-slate-900 shadow-sm relative overflow-hidden">
        {/* Subtle Ambient Backlights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 flex items-center justify-center text-blue-700 shadow-md shadow-blue-500/10 shrink-0">
              <ShieldAlert className="h-8 w-8 text-blue-600" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                  FACULTY SCRUTINY CONSOLE
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  Port 5174 • Verified Session 2025–26
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Scholarship Scrutiny & Verification Desk
              </h1>

              <p className="text-xs text-slate-600">
                Guru Nanak Dev Engineering College • Dr. B.R. Ambedkar Post-Matric SC Scheme Verification Authority
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
            <button
              onClick={() => navigate('/officer/documents')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-600/20 transform active:scale-[0.99]"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Document Verification Desk</span>
            </button>

            <button
              onClick={() => navigate('/officer/applications')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="h-4 w-4 text-indigo-600" />
              <span>Applications Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KEY OPERATIONAL METRICS (REAL DATA)
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scholarship Students"
          value={totalStudentsCount}
          subtitle="Enrolled candidates on portal"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          onClick={() => navigate('/officer/students')}
        />

        <StatCard
          title="Applications Pending"
          value={kpis?.pendingApplications ?? 0}
          subtitle="Awaiting committee review"
          icon={FileCheck2}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          onClick={() => navigate('/officer/applications')}
        />

        <StatCard
          title="Documents Under Review"
          value={kpis?.pendingDocs ?? 0}
          subtitle="Awaiting officer inspection"
          icon={Clock}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          onClick={() => navigate('/officer/documents')}
        />

        <StatCard
          title="Approved PMS Grants"
          value={kpis?.approvedApplications ?? 0}
          subtitle="Certified for fee waiver"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          onClick={() => navigate('/officer/applications')}
        />
      </div>

      {/* =========================================================================
          TRIAGE & ACTION WORKSPACE TILES
      ========================================================================= */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              PMS Scrutiny & Verification Action Center
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Priority compliance tasks requiring faculty officer authentication and SDM seal verification
            </p>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            Official Workflow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Certificate Scrutiny */}
          <div
            onClick={() => navigate('/officer/documents')}
            className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Document Scrutiny
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {kpis?.pendingDocs ?? 0} Queued
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Caste, Income & Domicile Verification
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Inspect Freeship cards, Tehsildar income certificates (≤ ₹2.50L), and Punjab resident certificates.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-blue-700 flex items-center gap-1">
              Open Inspection Workspace <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          {/* Applications Review */}
          <div
            onClick={() => navigate('/officer/applications')}
            className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                  Application Queue
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {kpis?.pendingApplications ?? 0} Pending
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Pending Committee Approvals
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Approve, request re-upload, or reject candidate PMS scholarship bundles.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-indigo-700 flex items-center gap-1">
              Review Queue <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          {/* Student Directory */}
          <div
            onClick={() => navigate('/officer/students')}
            className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Student Registry
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {totalStudentsCount} Enrolled
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Candidate Directory & Records
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Search enrolled students by URN, branch, category, and review verified scholarship badges.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-emerald-700 flex items-center gap-1">
              Browse Directory <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ANALYTICS & REPORTING CHARTS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Donut Chart */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Application Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown of submitted scholarship bundles</p>
          {totalAppsCount === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">Awaiting Student Submissions</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Real-time chart will display once students file scholarship applications.
              </p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.statusDistribution || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {(stats?.statusDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Department Distribution Bar Chart */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Department Beneficiary Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Candidates distributed across GNDEC engineering branches</p>
          {totalStudentsCount === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Users className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">No Student Registrations Recorded Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Branch statistics will populate automatically as registered SC candidates sign up.
              </p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.departmentDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
