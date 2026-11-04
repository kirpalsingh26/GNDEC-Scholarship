import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Building2,
  FolderLock,
  Calendar,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  ChevronRight,
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
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';

export const OfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.allSettled([
          api.get('/admin/stats'),
          api.get('/applications'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          setStats(statsRes.value.data.data);
        }
        if (appsRes.status === 'fulfilled' && appsRes.value.data.success) {
          setRecentApplications((appsRes.value.data.data || []).slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpis = stats?.kpis;
  const totalAppsCount =
    (kpis?.approvedApplications ?? 0) +
    (kpis?.pendingApplications ?? 0) +
    (kpis?.rejectedApplications ?? 0);
  const totalStudentsCount = kpis?.totalStudents ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* =========================================================================
          HERO EXECUTIVE BANNER (INSTITUTIONAL GNDEC FACULTY CONSOLE)
      ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-blue-50/40 border border-slate-200/90 p-6 sm:p-8 text-slate-900 shadow-sm relative overflow-hidden">
        {/* Subtle Ambient Backlights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 flex items-center justify-center text-blue-700 shadow-md shadow-blue-500/10 shrink-0">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                  FACULTY SCRUTINY CONSOLE
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  Port 5174 • Session 2025–26
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Welcome, <strong className="text-slate-800">{user?.name || 'Prof. Rajesh Sharma'}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Scholarship Scrutiny & Verification Desk
              </h1>

              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Guru Nanak Dev Engineering College • Dr. B.R. Ambedkar Post-Matric SC Scheme Scrutiny Authority. Verify Punjab Freeship Cards, SDM income certificates, and certify candidate eligibility for 100% tuition waiver.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto shrink-0">
            <button
              onClick={() => navigate('/officer/documents')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-600/20 transform active:scale-[0.99]"
            >
              <FolderLock className="h-4 w-4" />
              <span>Verify Documents</span>
            </button>

            <button
              onClick={() => navigate('/officer/applications')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck2 className="h-4 w-4 text-indigo-600" />
              <span>Review Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KEY OPERATIONAL METRICS (REAL DATA STATS)
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Enrolled Students */}
        <div
          onClick={() => navigate('/officer/students')}
          className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Enrolled SC Scholars
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalStudentsCount}
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-between">
              <span>Registered on portal</span>
              <span className="text-[10px] font-bold text-indigo-600 flex items-center">
                Directory <ChevronRight className="h-3 w-3" />
              </span>
            </p>
          </div>
        </div>

        {/* Metric 2: Applications Pending Scrutiny */}
        <div
          onClick={() => navigate('/officer/applications')}
          className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              Pending Scrutiny
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 group-hover:bg-amber-500 text-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-amber-700 font-mono tracking-tight">
              {kpis?.pendingApplications ?? 0}
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-between">
              <span>Awaiting officer review</span>
              <span className="text-[10px] font-bold text-amber-700 flex items-center">
                Audit Queue <ChevronRight className="h-3 w-3" />
              </span>
            </p>
          </div>
        </div>

        {/* Metric 3: Documents Under Review */}
        <div
          onClick={() => navigate('/officer/documents')}
          className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Certificates Queued
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
              <FolderLock className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-blue-700 font-mono tracking-tight">
              {kpis?.pendingDocs ?? 0}
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-between">
              <span>SDM seals & Freeship cards</span>
              <span className="text-[10px] font-bold text-blue-600 flex items-center">
                Verify <ChevronRight className="h-3 w-3" />
              </span>
            </p>
          </div>
        </div>

        {/* Metric 4: Approved & Sanctioned */}
        <div
          onClick={() => navigate('/officer/applications')}
          className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Sanctioned Grants
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">
              {kpis?.approvedApplications ?? 0}
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-between">
              <span>Certified 100% fee waiver</span>
              <span className="text-[10px] font-bold text-emerald-700 flex items-center">
                Certified <ChevronRight className="h-3 w-3" />
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TRIAGE & SCRUTINY WORKSPACE TILES
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
            Mandatory Verification Rules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Certificate Scrutiny */}
          <div
            onClick={() => navigate('/officer/documents')}
            className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
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
                Inspect Punjab Freeship cards, Tehsildar income certificates (≤ ₹2.50L), and bonafide resident certificates.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-blue-700 flex items-center gap-1">
              Open Inspection Workspace <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          {/* Applications Review */}
          <div
            onClick={() => navigate('/officer/applications')}
            className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
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
                Review candidate dossiers, sanction 100% tuition waiver, or request re-upload of unclear certificates.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-indigo-700 flex items-center gap-1">
              Review Queue <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          {/* Student Directory */}
          <div
            onClick={() => navigate('/officer/students')}
            className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
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
          RECENT APPLICATIONS AWAITING FACULTY SCRUTINY TABLE
      ========================================================================= */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-indigo-600" />
              Recent Applications Awaiting Faculty Scrutiny
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest candidate submissions requiring verification officer sign-off
            </p>
          </div>
          <button
            onClick={() => navigate('/officer/applications')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Queue ({kpis?.totalApplications ?? totalAppsCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Loading recent candidate submissions...
          </div>
        ) : recentApplications.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">All Submitted Applications Scrutinized</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              New submissions from SC candidates will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Candidate Student</th>
                  <th className="py-2.5 px-3">Application ID</th>
                  <th className="py-2.5 px-3">Scholarship Scheme</th>
                  <th className="py-2.5 px-3">Submission Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app: any) => {
                  const studentName = app.studentId
                    ? `${app.studentId.firstName} ${app.studentId.lastName}`
                    : 'Candidate Student';

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0 font-bold text-xs">
                            {studentName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              URN: {app.studentId?.rollNumber || 'N/A'} • {app.snapshot?.department?.split(' ')[0] || 'SC'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {app.applicationNumber}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block line-clamp-1">
                          {app.scholarshipId?.title || 'Punjab SC Post-Matric Scheme'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {app.scholarshipId?.provider || 'Govt. of Punjab'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {new Date(app.appliedDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        <Badge status={app.status} size="sm" />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate(`/officer/applications/${app._id}`)}
                          className="px-3 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Scrutinize</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          ANALYTICS & REPORTING CHARTS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Donut Chart */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Status Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of submitted scholarship bundles</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Live Feed
            </span>
          </div>

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Beneficiary Distribution</h3>
              <p className="text-xs text-slate-500">Candidates distributed across GNDEC engineering branches</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              B.Tech / M.Tech
            </span>
          </div>

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

      {/* =========================================================================
          REGULATORY SCRUTINY & STATUTORY INFORMATION BANNER
      ========================================================================= */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-500/20 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900">
              Punjab State Scheduled Caste Post-Matric Statutory Guidelines
            </h4>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              Mandatory: Bonafide resident of Punjab, Scheduled Caste (SC) category certificate issued by competent authority, declared annual parental income ceiling ≤ ₹2,50,000, and verified Freeship Card.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/officer/reports')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Audit Reports</span>
          </button>

          <a
            href="https://scholarships.punjab.gov.in"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Punjab Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
