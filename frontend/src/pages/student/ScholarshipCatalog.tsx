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
  Lock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { ExplainableEligibilityModal } from '../../components/common/ExplainableEligibilityModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { Scholarship, ScholarshipApplication } from '../../types/index.js';

export const ScholarshipCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [userApplications, setUserApplications] = useState<ScholarshipApplication[]>([]);
  const [search, setSearch] = useState('');

  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schRes, appRes] = await Promise.allSettled([
          api.get('/scholarships'),
          api.get('/applications'),
        ]);

        if (schRes.status === 'fulfilled' && schRes.value.data.success) {
          setScholarships(schRes.value.data.data);
        }
        if (appRes.status === 'fulfilled' && appRes.value.data.success) {
          setUserApplications(appRes.value.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAppliedApplication = (scholarshipId: string): ScholarshipApplication | undefined => {
    return userApplications.find((app) => {
      const sId =
        typeof app.scholarshipId === 'object' && app.scholarshipId !== null
          ? app.scholarshipId._id
          : app.scholarshipId;
      return String(sId) === String(scholarshipId);
    });
  };

  // Check for any active application to enforce single-scholarship policy
  const activeApplication = userApplications.find(
    (app) => app.status !== 'REJECTED'
  );
  const activeScholarshipId = activeApplication
    ? typeof activeApplication.scholarshipId === 'object' && activeApplication.scholarshipId !== null
      ? (activeApplication.scholarshipId as any)._id
      : activeApplication.scholarshipId
    : null;
  const hasAppliedAnywhere = Boolean(activeApplication);

  const handleOpenExplainability = (sch: Scholarship) => {
    setSelectedScholarship(sch);
    setIsModalOpen(true);
  };

  const isExpired = (sch: Scholarship) => {
    if (sch.status === 'EXPIRED' || sch.status === 'CLOSED') return true;
    if (sch.deadline) {
      const d = new Date(sch.deadline).getTime();
      if (!isNaN(d) && d < Date.now()) return true;
    }
    return false;
  };

  const filtered = scholarships
    .filter((s) => {
      return (
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.provider.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      // Applied scholarship takes absolute #1 precedence at top of list
      if (hasAppliedAnywhere && activeScholarshipId) {
        const isAApplied = String(a._id) === String(activeScholarshipId);
        const isBApplied = String(b._id) === String(activeScholarshipId);
        if (isAApplied && !isBApplied) return -1;
        if (!isAApplied && isBApplied) return 1;
      }

      const aExpired = isExpired(a);
      const bExpired = isExpired(b);
      // Available (non-expired) on top
      if (!aExpired && bExpired) return -1;
      if (aExpired && !bExpired) return 1;

      const timeA = new Date(a.deadline).getTime() || 0;
      const timeB = new Date(b.deadline).getTime() || 0;
      if (!aExpired && !bExpired) {
        // Nearest deadline first
        return timeA - timeB;
      }
      // Most recently expired first
      return timeB - timeA;
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
          <span>Category: <strong className="text-amber-800">SC Only</strong> • Ceiling: <strong className="text-slate-900">≤ ₹2.50L</strong> • Min CGPA: <strong className="text-emerald-700 font-mono">≥ 6.0</strong></span>
        </div>
      </div>

      {/* Single Scholarship Policy Notice Banner */}
      {hasAppliedAnywhere && activeApplication && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-start sm:items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                  Single Scholarship Policy Enforced
                </span>
                <span className="text-xs text-indigo-200">
                  Application Ref: <strong className="font-mono text-white">{activeApplication.applicationNumber}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed max-w-2xl">
                Under Punjab Government regulations, each candidate can apply for only <strong>one single scholarship scheme</strong> per academic cycle. Your applied scheme is highlighted below with full tracking access, and other schemes are locked.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/student/applications/${activeApplication._id}`)}
            className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            <span>Track Active Application</span>
            <ArrowRight className="h-4 w-4" />
          </button>
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
            const minCgpa = Math.max(6.0, sch.rules?.minCgpa || 6.0);
            const isCategoryEligible = !sch.rules?.allowedCategories?.length || sch.rules.allowedCategories.includes(profile?.category || 'SC');
            const isIncomeEligible = !sch.rules?.maxFamilyIncome || ((profile?.familyIncome || 0) <= sch.rules.maxFamilyIncome);
            const isCgpaEligible = (profile?.cgpa || 0) >= minCgpa;
            const isEligible = elig ? elig.isEligible : (isCategoryEligible && isIncomeEligible && isCgpaEligible);
            const isExp = isExpired(sch);
            const appliedApp = getAppliedApplication(sch._id);
            const hasApplied = Boolean(appliedApp);
            const isFaded = hasAppliedAnywhere && !hasApplied;

            const appliedDate = appliedApp?.appliedDate ? new Date(appliedApp.appliedDate) : new Date();
            const appliedExpiryDate = appliedApp?.expiryDate
              ? new Date(appliedApp.expiryDate)
              : new Date(appliedDate.getTime() + 180 * 24 * 60 * 60 * 1000);
            const appliedExpiryDateStr = appliedExpiryDate.toLocaleDateString('en-IN');

            return (
              <div
                key={sch._id}
                className={`rounded-2xl p-6 transition-all flex flex-col justify-between relative group ${
                  hasApplied
                    ? 'border-2 border-indigo-600 bg-gradient-to-br from-indigo-50/95 via-blue-50/50 to-white shadow-xl ring-4 ring-indigo-500/20'
                    : isFaded
                    ? 'border border-slate-300 bg-slate-100/70 opacity-40 grayscale-[45%] hover:opacity-60 hover:grayscale-[20%]'
                    : isExp
                    ? 'border border-slate-300 opacity-55 grayscale-[35%] bg-slate-100/80 hover:opacity-75'
                    : 'bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400'
                }`}
              >
                {/* Active Scheme Ribbon for Applied Card */}
                {hasApplied && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-xs flex items-center gap-1.5 z-10">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>Your Active Scheme</span>
                  </div>
                )}

                <div>
                  {/* Scheme Header Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                        hasApplied
                          ? 'text-indigo-900 bg-indigo-100/80 border-indigo-300 font-extrabold'
                          : isFaded
                          ? 'text-slate-500 bg-slate-200 border-slate-300'
                          : isExp
                          ? 'text-slate-600 bg-slate-200/80 border-slate-300'
                          : 'text-amber-900 bg-amber-50 border-amber-300'
                      }`}
                    >
                      {sch.code}
                    </span>
                    {hasApplied ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-2xs">
                        <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                        Applied
                      </span>
                    ) : isFaded ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                        <Lock className="h-3 w-3 text-slate-500" />
                        Locked
                      </span>
                    ) : isExp ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        Expired
                      </span>
                    ) : (
                      <Badge status={sch.status} size="sm" />
                    )}
                  </div>

                  {hasApplied ? (
                    <div className="mb-2 flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg border bg-indigo-50/90 text-indigo-950 border-indigo-200 font-semibold shadow-2xs">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Validity: {appliedExpiryDateStr}</span>
                      </span>
                      <span className="font-black text-indigo-700 flex items-center gap-1 bg-indigo-100/90 px-2 py-0.5 rounded-md border border-indigo-200">
                        <Clock className="h-3 w-3 text-indigo-600" />
                        6 months
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`mb-2 flex items-center justify-between text-[11px] px-2.5 py-1 rounded-lg border ${
                        isFaded
                          ? 'bg-slate-200/60 text-slate-500 border-slate-300'
                          : isExp
                          ? 'bg-rose-50/50 text-rose-800 border-rose-200/60'
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Deadline: {new Date(sch.deadline).toLocaleDateString('en-IN')}
                      </span>
                      {isExp ? (
                        <span className="font-bold text-rose-700 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-rose-600" />
                          Deadline Passed
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-emerald-600 animate-pulse" />
                          {Math.max(
                            0,
                            Math.ceil((new Date(sch.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                          )}{' '}
                          days left
                        </span>
                      )}
                    </div>
                  )}

                  <h3
                    className={`text-base font-extrabold transition-colors leading-snug ${
                      hasApplied
                        ? 'text-indigo-950 text-lg'
                        : isFaded
                        ? 'text-slate-600'
                        : isExp
                        ? 'text-slate-600'
                        : 'text-[#0b2341] group-hover:text-amber-700'
                    }`}
                  >
                    {sch.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{sch.provider}</p>

                  {/* Financial Grant Award Banner */}
                  <div
                    className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between ${
                      hasApplied
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                        : isFaded || isExp
                        ? 'bg-slate-200/50 border-slate-300 text-slate-500'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Award Benefits</p>
                      <p className={`text-base font-black ${hasApplied ? 'text-indigo-950' : isExp || isFaded ? 'text-slate-700' : 'text-slate-900'}`}>
                        100% Fee Exemption
                        <span className="block text-[10px] font-normal text-slate-500">+ DBT Maintenance Allowance</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Academic Term</p>
                      <p className={`text-xs font-bold ${hasApplied ? 'text-indigo-900' : isExp || isFaded ? 'text-slate-500' : 'text-slate-700'}`}>
                        {sch.academicYear || 'Session 2025–26'}
                      </p>
                    </div>
                  </div>

                  {/* Requirements Summary Chips */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Category</span>
                      <span className="font-bold text-amber-800">SC Only</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Income</span>
                      <span className="font-bold text-slate-800">≤ ₹2.50L</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Min CGPA</span>
                      <span className="font-bold text-emerald-800 font-mono">≥ {minCgpa.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Scheme Eligibility Verification Status */}
                  <div className="mt-4">
                    {hasApplied ? (
                      <div className="p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 flex items-center justify-between text-xs shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-indigo-950 block">Application Enrolled</span>
                            <span className="text-[11px] text-indigo-700 font-mono font-semibold">
                              Ref: {appliedApp?.applicationNumber || 'On Record'}
                            </span>
                          </div>
                        </div>
                        <Badge status={appliedApp?.status || 'SUBMITTED'} size="sm" />
                      </div>
                    ) : isFaded ? (
                      <div className="p-3 rounded-xl bg-slate-200/70 border border-slate-300 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-700 block">Application Locked</span>
                            <span className="text-[10px] text-slate-500">Single Scheme Policy Active</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-300 text-slate-600">
                          Locked
                        </span>
                      </div>
                    ) : isExp ? (
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-600">Applications Closed (Deadline Elapsed)</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                          Closed
                        </span>
                      </div>
                    ) : isEligible ? (
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
                    className="flex-1 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors text-center border border-slate-200 cursor-pointer"
                  >
                    Check Rules
                  </button>

                  {hasApplied ? (
                    <button
                      onClick={() => navigate(`/student/applications/${appliedApp?._id}`)}
                      className="flex-1 py-2.5 px-3 text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />
                      <span>Applied • View Status</span>
                    </button>
                  ) : isFaded ? (
                    <button
                      disabled
                      className="flex-1 py-2 text-xs font-bold text-slate-400 bg-slate-200/90 cursor-not-allowed rounded-xl text-center border border-slate-300 flex items-center justify-center gap-1.5"
                    >
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Application Locked</span>
                    </button>
                  ) : isExp ? (
                    <button
                      disabled
                      className="flex-1 py-2 text-xs font-bold text-slate-400 bg-slate-200/90 cursor-not-allowed rounded-xl text-center border border-slate-300"
                    >
                      Application Closed
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/student/apply/${sch._id}`)}
                      disabled={!isEligible}
                      className="flex-1 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
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
          hasApplied={Boolean(getAppliedApplication(selectedScholarship._id))}
          appliedApplicationNumber={getAppliedApplication(selectedScholarship._id)?.applicationNumber}
          isLockedByOtherScheme={Boolean(
            hasAppliedAnywhere && !getAppliedApplication(selectedScholarship._id)
          )}
          otherSchemeApplicationNumber={activeApplication?.applicationNumber}
          onViewApplication={() => {
            const app = getAppliedApplication(selectedScholarship._id);
            if (app) {
              setIsModalOpen(false);
              navigate(`/student/applications/${app._id}`);
            }
          }}
          evaluation={{
            scholarshipTitle: selectedScholarship.title,
            isEligible: selectedScholarship.eligibility?.isEligible ?? true,
            scorePercentage: selectedScholarship.eligibility?.scorePercentage ?? 100,
            criteriaBreakdown: selectedScholarship.eligibility?.criteriaBreakdown ?? [
              {
                key: 'CGPA',
                name: 'Minimum CGPA Requirement',
                satisfied: (profile?.cgpa || 0) >= Math.max(6.0, selectedScholarship.rules?.minCgpa || 6.0),
                required: `≥ ${Math.max(6.0, selectedScholarship.rules?.minCgpa || 6.0).toFixed(2)} CGPA`,
                actual: profile?.cgpa ? `${profile.cgpa.toFixed(2)} CGPA` : 'Pending Entry (0.00)',
                severity: 'CRITICAL',
                feedback: (profile?.cgpa || 0) >= Math.max(6.0, selectedScholarship.rules?.minCgpa || 6.0)
                  ? 'Candidate meets the mandatory minimum requirement of 6.00 CGPA.'
                  : 'Current academic CGPA is below the mandatory requirement of 6.00 CGPA.',
              },
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
