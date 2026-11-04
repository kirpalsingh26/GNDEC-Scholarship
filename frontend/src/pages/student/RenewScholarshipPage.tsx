import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, Award, Calendar } from 'lucide-react';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const RenewScholarshipPage: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [renewing, setRenewing] = useState(false);
  const [renewed, setRenewed] = useState(false);

  const handleRenew = () => {
    setRenewing(true);
    setTimeout(() => {
      setRenewing(false);
      setRenewed(true);
      addToast('success', 'Annual Scholarship Renewal submitted! Queued for committee endorsement.');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-1.5 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Session 2025-26 Continuous Aid Cycle</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Annual Scholarship Renewal Hub
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast-track continuous grant disbursement by submitting current academic year marksheet and updated income affidavit.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
              Active Grant Renewal Program
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">
              Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Previous Approval: Cycle 2024-2025 • ₹75,000 Fee Exemption Awarded
            </p>
          </div>
          <Badge status={renewed ? 'SUBMITTED' : 'IN_PROGRESS'} />
        </div>

        {/* Renewal Requirements Checklist */}
        <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-5 space-y-3.5 text-xs">
          <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Renewal Eligibility Audit for Academic Year 2025-2026:
          </h4>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800">Regular academic progression (No semester year-backs)</span>
              </div>
              <span className="font-mono font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                CGPA {profile?.cgpa && profile.cgpa > 0 ? profile.cgpa.toFixed(2) : 'Enrolled Regular'} (Satisfied)
              </span>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800">Scheduled Caste (SC) Category & Domicile</span>
              </div>
              <span className="font-mono font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                SC Punjab (Verified)
              </span>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800">Updated Annual Income Certificate in Vault</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                Certified ✓
              </span>
            </div>
          </div>
        </div>

        {renewed ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200/90 p-5 text-center shadow-2xs animate-in fade-in">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-black text-emerald-900">Renewal Application Successfully Logged!</h4>
            <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
              Your continuous grant renewal is now queued for officer digital signature and PFMS financial disbursement.
            </p>
          </div>
        ) : (
          <button
            onClick={handleRenew}
            disabled={renewing}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.01]"
          >
            <RefreshCw className={`h-4 w-4 ${renewing ? 'animate-spin' : ''}`} />
            {renewing ? 'Verifying & Submitting Renewal...' : 'Submit Scholarship Renewal for Session 2025-26'}
          </button>
        )}
      </div>
    </div>
  );
};
