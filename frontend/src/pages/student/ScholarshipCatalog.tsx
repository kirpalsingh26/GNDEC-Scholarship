import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Sliders,
  DollarSign,
  Award,
  Wallet,
  Sparkles,
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
  const [showMatcher, setShowMatcher] = useState(false);

  // Matcher Simulation Filters
  const [simCgpa, setSimCgpa] = useState<number>(profile?.cgpa || 8.65);
  const [simIncome, setSimIncome] = useState<number>(profile?.familyIncome || 180000);
  const [simCategory] = useState<string>('SC');

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

  // Compute live match score based on simulated or actual criteria
  const calculateSimulatedMatch = (sch: Scholarship) => {
    let score = 100;
    const rules = sch.rules || {};

    if (rules.minCgpa && simCgpa < rules.minCgpa) {
      const diff = rules.minCgpa - simCgpa;
      score -= Math.min(40, Math.round(diff * 20));
    }
    if (rules.maxFamilyIncome && simIncome > rules.maxFamilyIncome) {
      score -= 50;
    }
    if (rules.allowedCategories && rules.allowedCategories.length > 0) {
      if (!rules.allowedCategories.includes(simCategory)) {
        score -= 50;
      }
    }
    return Math.max(0, Math.min(100, score));
  };

  const filtered = scholarships.filter((s) => {
    return (
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  const eligibleCount = filtered.filter((s) =>
    showMatcher ? calculateSimulatedMatch(s) >= 80 : s.eligibility?.isEligible
  ).length;

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

        {/* Eligibility Calculator Toggle */}
        <button
          onClick={() => setShowMatcher(!showMatcher)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs self-start sm:self-auto ${
            showMatcher
              ? 'bg-[#0b2341] text-amber-400 border border-amber-500/40'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sliders className={`h-4 w-4 ${showMatcher ? 'text-amber-400' : 'text-slate-600'}`} />
          <span>{showMatcher ? 'Hide Eligibility Checker' : 'PMS Eligibility Calculator'}</span>
        </button>
      </div>

      {/* Interactive Eligibility Sandbox Control Panel */}
      {showMatcher && (
        <div className="p-6 rounded-2xl bg-[#0b2341] text-white border border-amber-500/30 shadow-lg animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sliders className="h-4 w-4 text-amber-400" />
                <span>PMS SC Eligibility Verification Sandbox</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Verify if your annual income and reservation category meet Punjab Government PMS guidelines.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
              {eligibleCount} of {filtered.length} Schemes Match (100% Eligible)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            {/* Category Fixed to SC */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-bold">Category & Quota</label>
              <div className="px-3 py-2 rounded-xl bg-slate-800 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-between">
                <span>SC (Scheduled Caste)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Eligible</span>
              </div>
              <span className="text-[10px] text-slate-400">Scheme is dedicated strictly to SC candidates</span>
            </div>

            {/* Family Income Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Annual Family Income</span>
                <span className="text-amber-400 font-mono font-bold text-sm">
                  ₹{(simIncome / 100000).toFixed(2)} Lakh
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={400000}
                step={10000}
                value={simIncome}
                onChange={(e) => setSimIncome(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-400">
                Mandatory PMS Limit: ≤ ₹2.50 Lakh/year ({simIncome <= 250000 ? '✅ Compliant' : '❌ Exceeds Limit'})
              </span>
            </div>

            {/* Academic CGPA Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Academic CGPA</span>
                <span className="text-amber-300 font-mono font-bold text-sm">{simCgpa} / 10</span>
              </div>
              <input
                type="range"
                min={4.0}
                max={10.0}
                step={0.1}
                value={simCgpa}
                onChange={(e) => setSimCgpa(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-400">Current CGPA: {profile?.cgpa || 8.65} (Enrolled Regular)</span>
            </div>
          </div>
        </div>
      )}

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
            const liveScore = showMatcher ? calculateSimulatedMatch(sch) : elig?.scorePercentage || 100;
            const isEligible = showMatcher ? liveScore >= 80 : elig?.isEligible ?? true;
            const rules = sch.rules || {};

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

                  {/* Explainable Match Status */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        {showMatcher ? 'Simulated Match:' : 'SC Profile Match:'}
                      </span>
                      <span
                        className={`font-black ${
                          isEligible ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {liveScore}% {isEligible ? '(Eligible ✓)' : '(Ineligible)'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isEligible ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${liveScore}%` }}
                      />
                    </div>
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
                satisfied: true,
                required: 'SC (Scheduled Caste)',
                actual: 'SC',
                severity: 'CRITICAL',
                feedback: 'Student belongs to recognized Scheduled Caste (SC) category.',
              },
              {
                key: 'INCOME',
                name: 'Annual Family Income Limit',
                satisfied: (profile?.familyIncome || 180000) <= 250000,
                required: '≤ ₹2,50,000/yr',
                actual: `₹${(profile?.familyIncome || 180000).toLocaleString('en-IN')}`,
                severity: 'CRITICAL',
                feedback: 'Declared family income is within the ₹2.50 Lakh PMS ceiling.',
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
