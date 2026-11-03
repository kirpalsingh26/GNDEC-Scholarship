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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Scholarship Officer Operations Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Financial Aid & Verification Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            GNDEC Scholarship Cell • Session 2025-2026 Operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/officer/documents')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            Open Verification Workspace
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scholarship Students"
          value={kpis?.totalStudents || 31}
          subtitle="Enrolled candidates"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          onClick={() => navigate('/officer/students')}
        />

        <StatCard
          title="Applications Pending"
          value={kpis?.pendingApplications || 11}
          subtitle="Awaiting committee review"
          icon={FileCheck2}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          onClick={() => navigate('/officer/applications')}
        />

        <StatCard
          title="Documents Under Review"
          value={kpis?.pendingDocs || 12}
          subtitle="Queued in workspace"
          icon={Clock}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          onClick={() => navigate('/officer/documents')}
        />

        <StatCard
          title="Approved PMS Grants"
          value={kpis?.approvedApplications || 14}
          subtitle="Certified for fee waiver"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          onClick={() => navigate('/officer/applications')}
        />
      </div>

      {/* "NEEDS ATTENTION" Triage Section */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              PMS Scrutiny & Verification Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Urgent tasks requiring officer certification and welfare committee sign-off
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            Action Items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SC Caste Certificate Audits */}
          <div
            onClick={() => navigate('/officer/documents')}
            className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 cursor-pointer hover:bg-amber-100/70 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  SC Certificate
                </span>
                <span className="text-xs font-black text-amber-900">Priority Verification</span>
              </div>
              <h4 className="mt-3 text-xs font-bold text-slate-900">
                SC Caste & Tehsildar Income Audits
              </h4>
              <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                Review uploaded SC certificates and income limit compliance (≤ ₹2.50L).
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-amber-800 flex items-center gap-1">
              Audit Documents <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          {/* Documents Pending Verification */}
          <div
            onClick={() => navigate('/officer/documents')}
            className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 cursor-pointer hover:bg-amber-100/70 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Document Review
                </span>
                <span className="text-xs font-black text-amber-700">{kpis?.pendingDocs || 12} Certificates</span>
              </div>
              <h4 className="mt-3 text-xs font-bold text-slate-900">
                Certificates Pending Review &gt; 3 Days
              </h4>
              <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                Income and caste certificates awaiting optical scan verification.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-amber-700 flex items-center gap-1">
              Open Verification Desk <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          {/* Applications Awaiting Review */}
          <div
            onClick={() => navigate('/officer/applications')}
            className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 cursor-pointer hover:bg-indigo-100/70 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-200/60 px-2 py-0.5 rounded">
                  Grant Approval
                </span>
                <span className="text-xs font-black text-indigo-700">{kpis?.pendingApplications || 11} Applications</span>
              </div>
              <h4 className="mt-3 text-xs font-bold text-slate-900">
                Applications Awaiting Committee Sign-off
              </h4>
              <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                Fully verified bundles ready for final financial authorization.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-indigo-700 flex items-center gap-1">
              Process Applications <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Donut Chart */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Application Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown of total submitted scholarship bundles</p>
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
        </div>

        {/* Department Distribution Bar Chart */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Department Beneficiary Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Candidates distributed across GNDEC engineering branches</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.departmentDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="students" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
