import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Building2,
  ShieldCheck,
  User,
  Eye,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { ScholarshipApplication } from '../../types/index.js';

export const ApplicationReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<ScholarshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchApplication = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      if (res.data.success) {
        setApplication(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    setProcessing(true);
    setFeedback('');
    try {
      const res = await api.put(`/applications/${id}/status`, {
        status,
        remarks: remarks || `Application marked as ${status} by committee.`,
      });
      if (res.data.success) {
        setFeedback(`Application successfully marked as ${status}!`);
        await fetchApplication();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
        Loading application details for review...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center">
        <p className="text-xs text-slate-500">Application record not found.</p>
      </div>
    );
  }

  const student = application.studentId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/officer/applications')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications Queue
      </button>

      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
              {application.applicationNumber}
            </span>
            <Badge status={application.status} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {application.scholarshipId?.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Applied on {new Date(application.appliedDate).toLocaleDateString('en-IN')}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400">Award Amount</p>
          <p className="text-xl font-black text-slate-900">
            ₹{(application.scholarshipId?.amount || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-xs font-bold text-indigo-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Student Credentials Snapshot */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-600" />
          Candidate Academic & Financial Audit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
            <span className="font-bold text-slate-900">{student?.firstName} {student?.lastName}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">University Roll Number</span>
            <span className="font-mono font-bold text-indigo-700">{student?.rollNumber}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
            <span className="font-semibold text-slate-800">{application.snapshot?.department || student?.department}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">CGPA Score</span>
            <span className="font-bold text-emerald-600">{application.snapshot?.cgpa} / 10.0</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Attendance Record</span>
            <span className="font-bold text-indigo-600">{application.snapshot?.attendancePercentage}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Family Income</span>
            <span className="font-bold text-slate-900">
              ₹{(application.snapshot?.familyIncome || 0).toLocaleString('en-IN')}/yr
            </span>
          </div>
        </div>
      </div>

      {/* Officer Decision Panel */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          Committee Final Evaluation Decision
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700">Official Committee Notes</label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Candidate meets all state eligibility rules. Document certificates confirmed..."
            className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleUpdateStatus('APPROVED')}
            disabled={processing}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
          >
            Approve Scholarship Grant ✓
          </button>

          <button
            onClick={() => handleUpdateStatus('ELIGIBILITY_REVIEW')}
            disabled={processing}
            className="px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
          >
            Mark Under Committee Review ⏱
          </button>

          <button
            onClick={() => handleUpdateStatus('ADDITIONAL_DOCUMENTS_REQUIRED')}
            disabled={processing}
            className="px-4 py-2.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all"
          >
            Request Additional Certificates ↻
          </button>

          <button
            onClick={() => handleUpdateStatus('REJECTED')}
            disabled={processing}
            className="px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
          >
            Reject Application ✕
          </button>
        </div>
      </div>
    </div>
  );
};
