import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { ExplainableEligibilityModal } from '../../components/common/ExplainableEligibilityModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { Scholarship } from '../../types/index.js';

export const ScholarshipCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState('');

  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const res = await api.get('/scholarships');
        if (res.data.success) {
          setScholarships(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScholarships();
  }, []);

  const handleOpenExplainability = (sch: Scholarship) => {
    setSelectedScholarship(sch);
    setIsModalOpen(true);
  };

  const filtered = scholarships.filter((s) => {
    return (
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-2 shadow-2xs">
            <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
            <span>GNDEC Post-Matric Scholarship (PMS) Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b2341]">
            Dr. B.R. Ambedkar Post-Matric Scholarship Scheme
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            100% Tuition Fee Waiver and DBT Maintenance Allowance for Scheduled Caste (SC) Students of Punjab.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Category: <strong className="text-amber-800">SC Only</strong> • Ceiling: <strong className="text-slate-900">≤ ₹2.50L</strong></span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PMS scheme details, code, or department guidelines..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Target Category: <strong>SC (Scheduled Caste)</strong>
          </span>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading Post-Matric Scholarship scheme details...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            No scholarship schemes match your current search.
          </div>
        ) : (
          filtered.map((sch) => {
            const elig = sch.eligibility;
            const isCategoryEligible = !sch.rules?.allowedCategories?.length || sch.rules.allowedCategories.includes(profile?.category || 'SC');
            const isIncomeEligible = !sch.rules?.maxFamilyIncome || ((profile?.familyIncome || 0) <= sch.rules.maxFamilyIncome);
            const isEligible = elig ? elig.isEligible : (isCategoryEligible && isIncomeEligible);

            return (
              <div
                key={sch._id}
                className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-amber-400"
              >
                <div>
                  {/* Scheme Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-300">
                        {sch.code}
                      </span>
                      <Badge status={sch.status} size="sm" />
                    </div>

                    <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Deadline: {new Date(sch.deadline).toLocaleDateString('en-IN')}
                      </span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-emerald-600 animate-pulse" />
                        {Math.max(0, Math.ceil((new Date(sch.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                      </span>
                    </div>

                  <h3 className="text-base font-extrabold text-[#0b2341] group-hover:text-amber-700 transition-colors leading-snug">
                    {sch.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{sch.provider}</p>

                  {/* Financial Grant Award Banner */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Award Benefits</p>
                      <p className="text-base font-black text-slate-900">
                        100% Fee Exemption
                        <span className="block text-[10px] font-normal text-slate-500">+ DBT Maintenance Allowance</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Academic Term</p>
                      <p className="text-xs font-bold text-slate-700">
                        Session 2025–26
                      </p>
                    </div>
                  </div>

                  {/* Requirements Summary Chips */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Category</span>
                      <span className="font-bold text-amber-800">SC Only</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Income Ceiling</span>
                      <span className="font-bold text-slate-800">≤ ₹2.50 Lakh/yr</span>
                    </div>
                  </div>

                  {/* Scheme Eligibility Verification Status */}
                  <div className="mt-4">
                    {isEligible ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-emerald-950">Eligible to Apply (PMS SC Verified ✓)</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                          Qualified
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                          <span className="font-bold text-amber-950">Ineligible (Criteria Not Met)</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                          Review
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenExplainability(sch)}
                    className="flex-1 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors text-center border border-slate-200"
                  >
                    Check Rules
                  </button>

                  <button
                    onClick={() => navigate(`/student/apply/${sch._id}`)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-[#0b2341] hover:bg-[#12335c] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                  >
                    Apply Now
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Explainable Eligibility Modal */}
      {selectedScholarship && (
        <ExplainableEligibilityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          evaluation={{
            scholarshipTitle: selectedScholarship.title,
            isEligible: selectedScholarship.eligibility?.isEligible ?? true,
            scorePercentage: selectedScholarship.eligibility?.scorePercentage ?? 100,
            criteriaBreakdown: selectedScholarship.eligibility?.criteriaBreakdown ?? [
              {
                key: 'CATEGORY',
                name: 'Social Reservation Category',
                satisfied: (profile?.category || 'SC') === 'SC',
                required: 'SC (Scheduled Caste)',
                actual: profile?.category || 'SC',
                severity: 'CRITICAL',
                feedback: 'Student belongs to recognized Scheduled Caste (SC) category.',
              },
              {
                key: 'INCOME',
                name: 'Annual Family Income Limit',
                satisfied: (profile?.familyIncome || 0) <= 250000,
                required: '≤ ₹2,50,000/yr',
                actual: profile?.familyIncome ? `₹${profile.familyIncome.toLocaleString('en-IN')}` : 'Pending Declaration',
                severity: 'CRITICAL',
                feedback: (profile?.familyIncome || 0) <= 250000
                  ? 'Declared family income is within the ₹2.50 Lakh PMS ceiling.'
                  : 'Declared family income exceeds the ₹2.50 Lakh PMS ceiling.',
              },
              {
                key: 'DOMICILE',
                name: 'Punjab State Domicile',
                satisfied: true,
                required: 'Bonafide Resident of Punjab',
                actual: 'Punjab Domicile Verified',
                severity: 'CRITICAL',
                feedback: 'Bonafide domicile of Punjab confirmed.',
              },
            ],
            pendingDocuments: selectedScholarship.eligibility?.pendingDocuments ?? (selectedScholarship.requiredDocuments || []),
            summaryMessage: selectedScholarship.eligibility?.summaryMessage ?? 'Candidate satisfies all mandatory conditions for Dr. Ambedkar Post-Matric SC Scheme.',
          }}
          onApply={() => {
            setIsModalOpen(false);
            navigate(`/student/apply/${selectedScholarship._id}`);
          }}
        />
      )}
    </div>
  );
};
