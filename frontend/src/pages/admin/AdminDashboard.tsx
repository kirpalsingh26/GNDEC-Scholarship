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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            Super Administrator Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Governance & Financial Aid Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            System Rules, Role Delegation, Audit Trails & Global Scholarship Analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/scholarships')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            Manage Scholarship Schemes
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Students"
          value={kpis?.totalStudents || 31}
          subtitle="GNDEC engineering branches"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          onClick={() => navigate('/admin/users')}
        />

        <StatCard
          title="Active Scholarship Schemes"
          value={kpis?.totalScholarships || 5}
          subtitle="State, AICTE & Alumni grants"
          icon={GraduationCap}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          onClick={() => navigate('/admin/scholarships')}
        />

        <StatCard
          title="Global Approval Rate"
          value={kpis?.approvalRate || '76%'}
          subtitle={`${kpis?.approvedApplications || 14} grants certified`}
          icon={Award}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Disbursed Funds"
          value={kpis?.disbursedAmountTotal || '₹14,80,000'}
          subtitle="Direct benefit transfers"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications Trend */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Application Submissions</h3>
          <p className="text-xs text-slate-500 mb-4">Volume of student submissions across cycle</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Application Approval Pipeline</h3>
          <p className="text-xs text-slate-500 mb-4">Institutional verification status breakdown</p>
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
      </div>
    </div>
  );
};
