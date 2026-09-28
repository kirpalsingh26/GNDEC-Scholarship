import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';

export const RenewScholarshipPage: React.FC = () => {
  const { profile } = useAuth();
  const [renewing, setRenewing] = useState(false);
  const [renewed, setRenewed] = useState(false);

  const handleRenew = () => {
    setRenewing(true);
    setTimeout(() => {
      setRenewing(false);
      setRenewed(true);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Annual Scholarship Renewal Hub
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast-track continuous grant disbursement by submitting current academic year marksheet and attendance verification.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Active Grant Renewal
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Punjab Post-Matric Scholarship Scheme (SC/ST)
            </h3>
            <p className="text-xs text-slate-500">
              Previous Approval: Cycle 2024-2025 • ₹75,000 Awarded
            </p>
          </div>
          <Badge status={renewed ? 'SUBMITTED' : 'IN_PROGRESS'} />
        </div>

        {/* Renewal Requirements Checklist */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-4 space-y-3 text-xs">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            Renewal Eligibility Audit for Academic Year 2025-2026:
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Minimum 60% marks in previous semester</span>
              </div>
              <span className="font-bold text-slate-900">Satisfied (CGPA {profile?.cgpa || 8.65})</span>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Minimum 75% attendance in previous terms</span>
              </div>
              <span className="font-bold text-slate-900">Satisfied (84.5%)</span>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Updated Annual Income Certificate in Vault</span>
              </div>
              <span className="font-bold text-emerald-600">Certified</span>
            </div>
          </div>
        </div>

        {renewed ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            <h4 className="text-xs font-bold text-emerald-900">Renewal Application Submitted!</h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Your continuous grant renewal is now queued for officer signature and financial disbursement.
            </p>
          </div>
        ) : (
          <button
            onClick={handleRenew}
            disabled={renewing}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:scale-[1.01]"
          >
            <RefreshCw className={`h-4 w-4 ${renewing ? 'animate-spin' : ''}`} />
            {renewing ? 'Submitting Renewal...' : 'Submit Scholarship Renewal for 2025-26'}
          </button>
        )}
      </div>
    </div>
  );
};
