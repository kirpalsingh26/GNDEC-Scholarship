import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  Sliders,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  Server,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.js';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const kpis = stats?.kpis;
  const totalStudentsCount = kpis?.totalStudents ?? 0;
  const totalAppsCount = (kpis?.approvedApplications ?? 0) + (kpis?.pendingApplications ?? 0) + (kpis?.rejectedApplications ?? 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* =========================================================================
          HERO EXECUTIVE BANNER (LIGHT THEME MATCHING PORTAL DESIGN SYSTEM)
      ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-purple-50/30 border border-slate-200/90 p-6 sm:p-8 text-slate-900 shadow-sm relative overflow-hidden">
        {/* Subtle Ambient Backlights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/10 border border-purple-500/30 flex items-center justify-center text-purple-700 shadow-md shadow-purple-500/10 shrink-0">
              <ShieldCheck className="h-8 w-8 text-purple-600" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-purple-600 text-white uppercase tracking-wider">
                  SUPER ADMINISTRATOR CONSOLE
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                  Port 5175 • Institutional Governance Mode
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Institutional Governance & Financial Aid Authority
              </h1>

              <p className="text-xs text-slate-600">
                System Rules, Role Delegation, Audit Trails & Global Post-Matric SC Scholarship Controls
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
            <button
              onClick={() => navigate('/admin/scholarships')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-purple-600/20 transform active:scale-[0.99]"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Scholarship Schemes</span>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="h-4 w-4 text-purple-600" />
              <span>User & Role Mgmt</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GLOBAL SYSTEM METRICS (REAL DATA)
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Students"
          value={totalStudentsCount}
          subtitle="Enrolled candidates on portal"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          onClick={() => navigate('/admin/users')}
        />

        <StatCard
          title="Active Scholarship Schemes"
          value={kpis?.totalScholarships ?? 4}
          subtitle="Punjab PMS SC & Freeship"
          icon={GraduationCap}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          onClick={() => navigate('/admin/scholarships')}
        />

        <StatCard
          title="Global Approval Rate"
          value={kpis?.approvalRate ?? '0%'}
          subtitle={`${kpis?.approvedApplications ?? 0} grants approved`}
          icon={Award}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          onClick={() => navigate('/admin/reports')}
        />

        <StatCard
          title="Disbursed Funds"
          value={kpis?.disbursedAmountTotal ?? '₹0'}
          subtitle="Direct benefit transfers"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          onClick={() => navigate('/admin/reports')}
        />
      </div>

      {/* =========================================================================
          INSTITUTIONAL ISOLATION BOUNDARIES & PORT MATRIX
      ========================================================================= */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="h-4 w-4 text-purple-600" />
              Institutional Security & Multi-Port Environment Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of isolated portal routes and privacy boundaries running across ports
            </p>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            All Scopes Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PORT 5173
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">🎓 Student & Public Portal</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Dedicated strictly to candidate registration, scheme applications, and document vault submissions.
              </p>
            </div>
            <p className="mt-3 text-[10px] text-slate-400 font-mono">Boundary: Isolated Session Storage</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  PORT 5174
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  Active
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">👨‍🏫 Faculty Verification Desk</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Scoped to department teachers & scrutiny officers for document authentication and grant certification.
              </p>
            </div>
            <p className="mt-3 text-[10px] text-slate-400 font-mono">Boundary: Officer Scrutiny Token</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  PORT 5175
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                  <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  Active
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">🏛️ Super Administrator Console</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Dedicated governance root with access to audit logs, user management, and scheme criteria rules.
              </p>
            </div>
            <p className="mt-3 text-[10px] text-slate-400 font-mono">Boundary: Root Governance Access</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ANALYTICS & REPORTING CHARTS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications Trend */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Application Approval Pipeline</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown of submitted scholarship bundles</p>
          {totalAppsCount === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">No Applications Filed Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Real-time pipeline analytics will populate as candidates submit scholarship applications.
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
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Department Beneficiary Enrollment</h3>
          <p className="text-xs text-slate-500 mb-4">Candidates distributed across GNDEC engineering branches</p>
          {totalStudentsCount === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Users className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">No Student Registrations Recorded Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Department numbers will update automatically upon student registration.
              </p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.departmentDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
