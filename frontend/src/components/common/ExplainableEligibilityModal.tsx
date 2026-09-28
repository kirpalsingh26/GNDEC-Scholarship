import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { Modal } from './Modal.js';
import { Badge } from './Badge.js';

interface ExplainableEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: {
    isEligible: boolean;
    scholarshipTitle: string;
    scorePercentage: number;
    criteriaBreakdown: Array<{
      key: string;
      name: string;
      satisfied: boolean;
      required: string;
      actual: string;
      severity: 'CRITICAL' | 'WARNING' | 'INFO';
      feedback: string;
    }>;
    pendingDocuments: string[];
    summaryMessage: string;
  } | null;
  onApply?: () => void;
}

export const ExplainableEligibilityModal: React.FC<ExplainableEligibilityModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  onApply,
}) => {
  if (!evaluation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Eligibility Assessment"
      subtitle={evaluation.scholarshipTitle}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Outcome Header Banner */}
        <div
          className={`rounded-xl p-4 border flex items-start gap-3.5 ${
            evaluation.isEligible
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}
        >
          {evaluation.isEligible ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">
                {evaluation.isEligible ? 'Eligible to Apply' : 'Ineligible Under Current Criteria'}
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 shadow-xs">
                Match Score: {evaluation.scorePercentage}%
              </span>
            </div>
            <p className="mt-1 text-xs opacity-90 leading-relaxed">{evaluation.summaryMessage}</p>
          </div>
        </div>

        {/* Explainable Criteria Checklist */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            Requirement Evaluation Breakdown
          </h4>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/50">
            {evaluation.criteriaBreakdown.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {item.satisfied ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : item.severity === 'WARNING' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.feedback}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] font-semibold text-slate-700">
                    Required: <span className="font-mono text-slate-500">{item.required}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Your Profile: <span className="font-mono font-bold text-slate-800">{item.actual}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Documents Callout if any */}
        {evaluation.pendingDocuments && evaluation.pendingDocuments.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Certificates Still Required During Application:
            </h5>
            <ul className="mt-2 list-disc list-inside text-xs text-amber-800 space-y-1">
              {evaluation.pendingDocuments.map((doc, dIdx) => (
                <li key={dIdx}>{doc.replace(/_/g, ' ')}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          {evaluation.isEligible && onApply && (
            <button
              onClick={() => {
                onClose();
                onApply();
              }}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              Proceed to Application
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
