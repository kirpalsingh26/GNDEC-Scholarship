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
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { ScholarshipApplication } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export const ApplicationReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [application, setApplication] = useState<ScholarshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

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
    try {
      const res = await api.put(`/applications/${id}/status`, {
        status,
        remarks: remarks || `Application marked as ${status} by verification officer.`,
      });
      if (res.data.success) {
        addToast(
          status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'error' : 'info',
          `Application status updated to ${status}!`
        );
        await fetchApplication();
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyDoc = async (docId: string) => {
    try {
      const res = await api.post(`/documents/${docId}/verify`, {
        comments: 'Certified by scrutiny officer against issuing authority records.',
      });
      if (res.data.success) {
        addToast('success', 'Document marked as VERIFIED ✓');
        await fetchApplication();
      }
    } catch (err) {
      addToast('error', 'Failed to verify document.');
    }
  };

  const handleRequestReuploadDoc = async (docId: string) => {
    const reason = window.prompt(
      'Enter specific reason for certificate rejection / re-upload request:',
      'Certificate scan is blurry or expired. Please upload current financial year certificate.'
    );
    if (!reason) return;

    try {
      const res = await api.post(`/documents/${docId}/reject`, {
        rejectionReason: reason,
        comments: reason,
        requestReupload: true,
      });
      if (res.data.success) {
        addToast('warning', 'Re-upload requested. Notification sent to student.');
        await fetchApplication();
      }
    } catch (err) {
      addToast('error', 'Failed to update document status.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-2" />
        Loading application details for review...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center max-w-md mx-auto">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">Application Record Not Found</h3>
        <button
          onClick={() => navigate('/officer/applications')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Queue
        </button>
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
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60 shadow-2xs">
              {application.applicationNumber}
            </span>
            <Badge status={application.status} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {application.scholarshipId?.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Applied on {new Date(application.appliedDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none border sm:border-0 border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grant Entitlement</p>
          <p className="text-2xl font-black text-slate-900">
            ₹{(application.scholarshipId?.amount || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Student Credentials Snapshot */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-600" />
          Candidate Academic & Financial Dossier
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
            <span className="font-extrabold text-slate-900 text-sm">{student?.firstName} {student?.lastName}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">University Roll Number (URN)</span>
            <span className="font-mono font-bold text-indigo-700 text-sm">{student?.rollNumber}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department Branch</span>
            <span className="font-bold text-slate-800">{application.snapshot?.department || student?.department}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cumulative CGPA</span>
            <span className="font-mono font-extrabold text-emerald-600 text-sm">
              {application.snapshot?.cgpa && application.snapshot.cgpa > 0
                ? `${application.snapshot.cgpa.toFixed(2)} / 10.0`
                : student?.cgpa && student.cgpa > 0
                ? `${student.cgpa.toFixed(2)} / 10.0`
                : 'Not Recorded'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Social Category</span>
            <span className="font-extrabold text-amber-800 text-sm">
              {application.snapshot?.category || student?.category || 'SC'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Family Annual Income</span>
            <span className="font-bold text-slate-900 text-sm">
              {(application.snapshot?.familyIncome ?? student?.familyIncome)
                ? `₹${(application.snapshot?.familyIncome ?? student?.familyIncome).toLocaleString('en-IN')}/yr`
                : 'Pending Declaration'}
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Attached Certificates & Scrutiny Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-600" />
              Candidate Uploaded Certificates ({application.documents?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and authenticate the student's mandatory certificates before approving the scholarship
            </p>
          </div>
        </div>

        {(!application.documents || application.documents.length === 0) ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No certificates attached to this application record yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {application.documents.map((doc: any) => {
              const latestVer = doc.versions?.find((v: any) => v.versionNumber === doc.currentVersion);
              return (
                <div key={doc._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{doc.title}</span>
                      <span className="font-mono text-[10px] text-slate-400">v{doc.currentVersion}</span>
                      <Badge status={doc.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Type: <strong className="text-slate-700">{doc.documentType.replace(/_/g, ' ')}</strong>
                      {latestVer?.fileSize && (
                        <span> • {(latestVer.fileSize / 1024).toFixed(0)} KB</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {latestVer?.fileUrl && (
                      <a
                        href={latestVer.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Certificate
                      </a>
                    )}
                    {doc.status !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerifyDoc(doc._id)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl"
                      >
                        ✓ Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleRequestReuploadDoc(doc._id)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl"
                    >
                      ↻ Request Re-upload
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Officer Decision Panel */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          Committee Final Evaluation & Decision
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700">Official Committee Remarks / Audit Notes</label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Candidate fulfills all state eligibility parameters. Certificates authenticated with Sub-Divisional Magistrate portal..."
            className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleUpdateStatus('APPROVED')}
            disabled={processing}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-200 transition-all hover:scale-105"
          >
            ✓ Approve Scholarship Grant
          </button>

          <button
            onClick={() => handleUpdateStatus('ELIGIBILITY_REVIEW')}
            disabled={processing}
            className="px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
          >
            ⏱ Under Committee Review
          </button>

          <button
            onClick={() => handleUpdateStatus('ADDITIONAL_DOCUMENTS_REQUIRED')}
            disabled={processing}
            className="px-4 py-2.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all"
          >
            ↻ Request Additional Certificates
          </button>

          <button
            onClick={() => handleUpdateStatus('REJECTED')}
            disabled={processing}
            className="px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            ✕ Reject Application
          </button>
        </div>
      </div>
    </div>
  );
};
