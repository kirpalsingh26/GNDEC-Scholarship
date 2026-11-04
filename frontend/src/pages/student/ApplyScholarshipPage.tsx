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
import { Badge } from '../../components/common/Badge.js';
import { Scholarship, ScholarshipApplication } from '../../types/index.js';

export const ApplyScholarshipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [existingApplication, setExistingApplication] = useState<ScholarshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const fetchScholarshipAndApplication = async () => {
      try {
        setLoading(true);
        const [schRes, appRes] = await Promise.allSettled([
          api.get(`/scholarships/${id}`),
          api.get('/applications'),
        ]);

        if (schRes.status === 'fulfilled' && schRes.value.data.success) {
          setScholarship(schRes.value.data.data);
        }
        if (appRes.status === 'fulfilled' && appRes.value.data.success) {
          const apps = appRes.value.data.data || [];
          const found = apps.find((a: any) => {
            const sId =
              typeof a.scholarshipId === 'object' && a.scholarshipId !== null
                ? a.scholarshipId._id
                : a.scholarshipId;
            return String(sId) === String(id);
          });
          if (found) {
            setExistingApplication(found);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load scholarship details.');
      } finally {
        setLoading(false);
      }
    };
    fetchScholarshipAndApplication();
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
      <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-amber-50/40 border border-slate-200/90 p-6 sm:p-8 text-slate-900 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-900 text-xs font-bold mb-2.5 border border-amber-300 shadow-2xs">
            <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
            <span>{scholarship.provider || 'State Government of Punjab'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{scholarship.title}</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{scholarship.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <span>Grant Amount: <strong className="text-slate-900 font-mono font-bold">₹{scholarship.amount.toLocaleString('en-IN')}/yr</strong></span>
            <span>•</span>
            <span>Academic Cycle: <strong className="text-slate-900">{scholarship.academicYear || '2025-26'}</strong></span>
            <span>•</span>
            <span>Deadline: <strong className="text-amber-800">{new Date(scholarship.deadline).toLocaleDateString('en-IN')}</strong></span>
          </div>
        </div>
      </div>

      {/* Existing Application Notice */}
      {existingApplication && (
        <div className="rounded-3xl bg-blue-50/90 border border-blue-200 p-6 text-blue-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
              <h3 className="text-sm font-black text-blue-950">
                Application Already Submitted for This Scheme
              </h3>
              <Badge status={existingApplication.status} size="sm" />
            </div>
            <p className="text-xs text-blue-800 leading-relaxed max-w-xl">
              You have already applied for this scholarship program in this academic cycle. Application Ref:{' '}
              <strong className="font-mono text-blue-950 font-bold">{existingApplication.applicationNumber}</strong> (Applied on{' '}
              {new Date(existingApplication.appliedDate).toLocaleDateString('en-IN')}). Re-applying is disabled to prevent duplicate submissions.
            </p>
          </div>
          <button
            onClick={() => navigate(`/student/applications/${existingApplication._id}`)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Track Application</span>
          </button>
        </div>
      )}

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
      {existingApplication ? (
        <div className="rounded-3xl bg-white border border-blue-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">Application Already Registered</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your application for this scholarship scheme is already recorded with reference number{' '}
              <strong className="font-mono text-slate-800">{existingApplication.applicationNumber}</strong>. Re-application in the same academic cycle is restricted.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/student/applications/${existingApplication._id}`)}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Track Application Status ({existingApplication.applicationNumber})
            </button>
            <button
              onClick={() => navigate('/student/scholarships')}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};
