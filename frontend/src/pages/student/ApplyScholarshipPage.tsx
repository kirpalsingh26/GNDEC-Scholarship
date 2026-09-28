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
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Scholarship } from '../../types/index.js';

export const ApplyScholarshipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
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
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/applications', { scholarshipId: id });
      if (res.data.success) {
        navigate(`/student/applications/${res.data.data._id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
        Loading application workspace...
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center">
        <p className="text-xs text-slate-500">Scholarship scheme not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/scholarships')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Scholarship Catalog
      </button>

      {/* Scheme Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2">
          <GraduationCap className="h-4 w-4" />
          <span>{scholarship.provider}</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{scholarship.title}</h1>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{scholarship.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <span>Award Amount: <strong className="text-slate-900">₹{scholarship.amount.toLocaleString('en-IN')}</strong></span>
          <span>•</span>
          <span>Cycle: <strong className="text-slate-900">{scholarship.academicYear}</strong></span>
          <span>•</span>
          <span>Deadline: <strong className="text-indigo-600">{new Date(scholarship.deadline).toLocaleDateString('en-IN')}</strong></span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pre-filled Student Credentials Snapshot */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          Candidate Profile Snapshot (To Be Submitted)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
            <span className="font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number / URN</span>
            <span className="font-mono font-bold text-indigo-700">{profile?.rollNumber}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department & Semester</span>
            <span className="font-semibold text-slate-800">{profile?.department} (Sem {profile?.semester})</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Category & Income</span>
            <span className="font-semibold text-slate-800">
              {profile?.category} • ₹{(profile?.familyIncome || 0).toLocaleString('en-IN')}/yr
            </span>
          </div>
        </div>

        {/* Required Documents List */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-800 mb-2">Required Certificates for this Scheme:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scholarship.requiredDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-2 text-xs font-semibold text-slate-800"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{doc.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Declaration & Submission */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            I hereby declare that all information provided in this application is genuine and accurate. I authorize Guru Nanak Dev Engineering College and the respective scholarship authority to verify my attendance, academic records, and certificates.
          </span>
        </label>

        <button
          onClick={handleSubmitApplication}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.01]"
        >
          {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
