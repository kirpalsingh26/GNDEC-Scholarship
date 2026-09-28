import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { ExplainableEligibilityModal } from '../../components/common/ExplainableEligibilityModal.js';
import { Scholarship } from '../../types/index.js';

export const ScholarshipCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
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
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || s.type === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Scholarship Programs & Financial Grants
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Browse state welfare schemes, central AICTE grants, and GNDEC alumni trust endowments with real-time explainable eligibility audits.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes by title, provider, or code..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Schemes' },
            { id: 'MERIT_CUM_MEANS', label: 'Merit-cum-Means' },
            { id: 'RESERVATION', label: 'Post-Matric (SC/ST/OBC)' },
            { id: 'SPECIAL_SCHEME', label: 'AICTE Special' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading scholarship schemes & evaluating profile rules...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-xs text-slate-400">
            No scholarship schemes match your active filter.
          </div>
        ) : (
          filtered.map((sch) => {
            const elig = sch.eligibility;
            const isEligible = elig?.isEligible;
            const score = elig?.scorePercentage || 0;

            return (
              <div
                key={sch._id}
                className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Scheme Header Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {sch.code}
                    </span>
                    <Badge status={sch.status} size="sm" />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {sch.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{sch.provider}</p>

                  {/* Financial Grant Award Banner */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Award Amount</p>
                      <p className="text-lg font-black text-slate-900">
                        ₹{sch.amount.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] font-normal text-slate-400">/ {sch.frequency.toLowerCase()}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Deadline</p>
                      <p className="text-xs font-bold text-slate-700">
                        {new Date(sch.deadline).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Live Explainable Match Pill */}
                  {elig && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1 font-semibold">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          Match Score:
                        </span>
                        <span
                          className={`font-black ${
                            isEligible ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {score}% {isEligible ? '(Eligible ✓)' : '(Requirements Pending)'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isEligible ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenExplainability(sch)}
                    className="flex-1 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                  >
                    Check Rules
                  </button>

                  <button
                    onClick={() => navigate(`/student/apply/${sch._id}`)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-1"
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
      {selectedScholarship && selectedScholarship.eligibility && (
        <ExplainableEligibilityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          evaluation={{
            ...selectedScholarship.eligibility,
            scholarshipTitle: selectedScholarship.title,
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
