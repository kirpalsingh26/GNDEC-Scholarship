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
  BookOpen,
  Calendar,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { StatCard } from '../../components/common/StatCard.js';
import { Badge } from '../../components/common/Badge.js';

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
  const kpis = data?.kpis;
  const familyIncome = profile?.familyIncome || 180000;
  const isIncomeEligible = familyIncome <= 250000;

  return (
    <div className="space-y-6">
      {/* Top Welcome Institutional Banner */}
      <div className="rounded-2xl bg-[#0b2341] p-6 sm:p-7 text-white shadow-md border border-amber-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2.5 border border-amber-500/30">
              <Award className="h-3.5 w-3.5" />
              <span>Dr. B.R. Ambedkar Post-Matric Scholarship (PMS) Portal • Session 2025–26</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {profile?.firstName || user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              University Roll No: <span className="font-mono font-bold text-amber-300">{profile?.rollNumber || '2104501'}</span> •{' '}
              {profile?.department || 'Computer Science and Engineering'} (Sem {profile?.semester || 5}) •{' '}
              <span className="font-bold text-emerald-400">Category: SC</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/student/scholarships')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0b2341] font-black text-xs shadow-sm transition-all flex items-center gap-2"
            >
              View PMS Scheme
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/student/documents')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              <FolderLock className="h-4 w-4 text-amber-300" />
              Document Vault
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="PMS Application Status"
          value={latestApp ? latestApp.status.replace(/_/g, ' ') : 'SUBMITTED'}
          subtitle="Dr. Ambedkar PMS Scheme"
          icon={FileCheck2}
          iconColor="text-[#0b2341]"
          iconBg="bg-slate-100"
          onClick={() => navigate('/student/applications')}
        />

        <StatCard
          title="Social Category"
          value="SC"
          subtitle="Scheduled Caste (Punjab Domicile)"
          icon={ShieldCheck}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
          onClick={() => navigate('/student/profile')}
        />

        <StatCard
          title="Annual Family Income"
          value={`₹${(familyIncome / 100000).toFixed(2)} Lakh`}
          subtitle={isIncomeEligible ? '≤ ₹2.50 Lakh Limit (Eligible)' : 'Exceeds PMS Limit'}
          icon={Wallet}
          iconColor={isIncomeEligible ? 'text-amber-700' : 'text-rose-600'}
          iconBg={isIncomeEligible ? 'bg-amber-50' : 'bg-rose-50'}
          onClick={() => navigate('/student/profile')}
        />

        <StatCard
          title="Verified Documents"
          value={`${kpis?.verifiedDocuments || 5} / 6`}
          subtitle="Caste & Income certified"
          icon={CheckCircle2}
          iconColor="text-blue-700"
          iconBg="bg-blue-50"
          onClick={() => navigate('/student/documents')}
        />
      </div>

      {/* Application Lifecycle Tracker */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-amber-600" />
              Post-Matric Scholarship (PMS) Application Progress
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students (Punjab)
            </p>
          </div>
          {latestApp && <Badge status={latestApp.status} />}
        </div>

        {/* 5-Step Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {[
            { step: '1', title: 'State Freeship Card', desc: 'Applied on State Portal', done: true },
            {
              step: '2',
              title: 'College Application',
              desc: 'GNDEC PMS form logged',
              done: true,
            },
            {
              step: '3',
              title: 'Document Scrutiny',
              desc: 'SC & Income certified',
              done: latestApp?.status !== 'SUBMITTED',
            },
            {
              step: '4',
              title: 'Committee Review',
              desc: 'GNDEC Welfare approval',
              done: ['ELIGIBILITY_REVIEW', 'APPROVED'].includes(latestApp?.status),
            },
            {
              step: '5',
              title: '100% Fee Exemption',
              desc: 'DBT Grant release',
              done: latestApp?.status === 'APPROVED',
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                s.done
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.done ? 'bg-[#0b2341] text-amber-400' : 'bg-slate-200 text-slate-600'
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

      {/* Split Section: PMS Eligibility Checklist + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PMS Eligibility Criteria Status Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#0b2341] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                PMS SC Eligibility Verification Checklist
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Eligible Candidate
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Verified against Punjab Social Justice & Welfare Department criteria:
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Social Category</p>
                  <p className="text-[11px] text-slate-500">Scheduled Caste (SC)</p>
                </div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Certified ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Family Income Ceiling</p>
                  <p className="text-[11px] text-slate-500">Declared: ₹{(familyIncome / 100000).toFixed(2)}L (Limit: ≤ ₹2.50L)</p>
                </div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Compliant ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">State Domicile</p>
                  <p className="text-[11px] text-slate-500">Punjab Permanent Resident</p>
                </div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Verified ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">DBT Bank Account Status</p>
                  <p className="text-[11px] text-slate-500">Aadhaar Seeded & Active</p>
                </div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Linked ✓
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <a
              href="https://scholarships.punjab.gov.in"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              Verify on Punjab Dr. Ambedkar Portal
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Access Action Grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/student/scholarships')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">PMS Scheme Guidelines</h4>
              <p className="text-xs text-slate-500 mt-1">
                View 100% fee waiver terms, maintenance allowances, and state government circulars.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-amber-800 flex items-center gap-1">
              View Scheme <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          <div
            onClick={() => navigate('/student/documents')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FolderLock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Document Vault</h4>
              <p className="text-xs text-slate-500 mt-1">
                Upload SDM/Tehsildar SC caste certificates, income affidavits, and university marksheets.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-emerald-700 flex items-center gap-1">
              Manage Certificates <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          <div
            onClick={() => navigate('/student/renewals')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Annual Renewal</h4>
              <p className="text-xs text-slate-500 mt-1">
                Submit latest semester marksheet and current FY income affidavit to renew ongoing PMS grant.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-blue-700 flex items-center gap-1">
              Submit Renewal <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          <div
            onClick={() => navigate('/student/tickets')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Scholarship Cell Helpdesk</h4>
              <p className="text-xs text-slate-500 mt-1">
                Direct inquiry communication with GNDEC Welfare Officer and Academic Section.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-purple-700 flex items-center gap-1">
              Contact Cell <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
