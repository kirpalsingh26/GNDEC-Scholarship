import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Building2,
  FileText,
  Sparkles,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Scholarship } from '../../types/index.js';

export const ApplyScholarshipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/scholarships/${id}`);
        if (res.data.success) {
          setScholarship(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load scholarship details.');
      } finally {
        setLoading(false);
      }
    };
    fetchScholarship();
  }, [id]);

  const handleSubmitApplication = async () => {
    if (!agreeTerms) {
      setError('You must certify the declaration before submitting.');
      toast.warning('Please agree to the certification declaration first.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/applications', { scholarshipId: id });
      if (res.data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success(
          `Application ${res.data.data.applicationNumber} submitted successfully!`,
          'Scholarship Application Logged'
        );

        setTimeout(() => {
          navigate(`/student/applications/${res.data.data._id}`);
        }, 1200);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
        Loading scholarship application workspace...
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Scholarship Scheme Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          This scholarship scheme was not found or the application window has closed.
        </p>
        <button
          onClick={() => navigate('/student/scholarships')}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/scholarships')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Scholarship Catalog</span>
      </button>

      {/* Scheme Banner */}
      <div className="rounded-3xl bg-[#0b2341] p-6 sm:p-8 text-white shadow-md border border-amber-500/30">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2.5 border border-amber-500/30">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>{scholarship.provider || 'State Government of Punjab'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{scholarship.title}</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">{scholarship.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 bg-white/5 p-3.5 rounded-2xl border border-white/10">
          <span>Grant Amount: <strong className="text-amber-400 font-mono font-bold">₹{scholarship.amount.toLocaleString('en-IN')}/yr</strong></span>
          <span>•</span>
          <span>Academic Cycle: <strong className="text-white">{scholarship.academicYear || '2025-26'}</strong></span>
          <span>•</span>
          <span>Deadline: <strong className="text-amber-300">{new Date(scholarship.deadline).toLocaleDateString('en-IN')}</strong></span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 flex items-center gap-2 shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pre-filled Student Credentials Snapshot */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Enrolled Student Credentials Snapshot
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
            <span className="font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number / URN</span>
            <span className="font-mono font-bold text-slate-900">{profile?.rollNumber || 'URN'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department & Semester</span>
            <span className="font-semibold text-slate-800">{profile?.department || 'Engineering'} (Sem {profile?.semester || 1})</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Category & Family Income</span>
            <span className="font-semibold text-slate-800">
              {profile?.category || 'SC'} • ₹{(profile?.familyIncome || 0).toLocaleString('en-IN')}/yr
            </span>
          </div>
        </div>

        {/* Required Documents List */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-800 mb-2">Required Certificates for Verification:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(scholarship.requiredDocuments || ['CASTE_CERTIFICATE', 'INCOME_CERTIFICATE', 'FEE_RECEIPT', 'BANK_PROOF']).map((doc, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-800"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{doc.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Declaration & Submission */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            I hereby declare that all information provided in this application is genuine and accurate. I certify that I belong to the Scheduled Caste (SC) category of Punjab and our total family annual income from all sources does not exceed ₹2,50,000/-. I authorize Guru Nanak Dev Engineering College and the Punjab Department of Social Justice to verify my certificates and academic records.
          </span>
        </label>

        <button
          onClick={handleSubmitApplication}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
        >
          <span>{submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
