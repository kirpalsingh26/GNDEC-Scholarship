import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  AlertTriangle,
  Building2,
  Calendar,
  ArrowLeft,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { ScholarshipApplication } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export const ApplicationStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [application, setApplication] = useState<ScholarshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/applications/${id}`);
        if (res.data.success) {
          setApplication(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load application history.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!application) return;
    setDownloading(true);
    try {
      const response = await api.get(`/reports/applications/${application._id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ScholarSphere_${application.applicationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('success', `Application receipt downloaded: ${application.applicationNumber}`);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      addToast('error', 'Failed to generate receipt PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
        Retrieving application history and audit logs...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Application Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          This application reference does not exist or may have been archived.
        </p>
        <button
          onClick={() => navigate('/student/applications')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
        >
          Return to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/applications')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Applications</span>
      </button>

      {/* Header Banner */}
      <div className="rounded-3xl bg-[#0b2341] p-6 sm:p-8 text-white shadow-md border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/30">
              {application.applicationNumber}
            </span>
            <Badge status={application.status} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {application.scholarshipId?.title || 'Scholarship Application'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            <span>{application.scholarshipId?.provider || 'Government of Punjab'}</span>
            <span>•</span>
            <span>Applied on {new Date(application.appliedDate).toLocaleDateString('en-IN')}</span>
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>{downloading ? 'Exporting PDF...' : 'Download Official Certificate'}</span>
        </button>
      </div>

      {/* 6-Month Post-Approval Validity Status Banner */}
      {application.status === 'APPROVED' && application.isExpired && (
        <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-950">Application Validity Window Concluded (Expired)</h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              This scholarship approval was granted more than 6 months ago (validity expired on{' '}
              {application.expiryDate ? new Date(application.expiryDate).toLocaleDateString('en-IN') : 'previous cycle'}).
              This record is preserved in your institutional student account for historical audit and certification.
            </p>
          </div>
        </div>
      )}

      {application.status === 'APPROVED' && !application.isExpired && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-xs text-emerald-950 flex items-start gap-3 shadow-2xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950">Active Approved Scholarship</h4>
            <p className="mt-0.5 text-emerald-800 leading-relaxed">
              Your application is approved and active. Approved scholarship benefits remain valid for 6 months post-approval
              (valid until {application.expiryDate ? new Date(application.expiryDate).toLocaleDateString('en-IN') : 'active session'}).
            </p>
          </div>
        </div>
      )}

      {/* Reviewer Notes / Rejection Callout */}
      {application.reviewerNotes && (
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 shadow-2xs">
          <h4 className="font-bold flex items-center gap-1.5 mb-1 text-blue-950">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Committee Reviewer Comments:
          </h4>
          <p className="leading-relaxed text-blue-800">{application.reviewerNotes}</p>
        </div>
      )}

      {application.rejectionReason && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900 shadow-2xs">
          <h4 className="font-bold flex items-center gap-1.5 mb-1 text-rose-950">
            <XCircle className="h-4 w-4 text-rose-600" />
            Rejection Feedback:
          </h4>
          <p className="leading-relaxed text-rose-800">{application.rejectionReason}</p>
        </div>
      )}

      {/* Verification Audit Timeline */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          Verification Lifecycle & History Trail
        </h3>

        {(!application.timeline || application.timeline.length === 0) ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Initial application submission logged. Verification timeline will populate as faculty officers review your documents.
          </div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {application.timeline.map((t, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-6 top-1 h-5 w-5 rounded-full border-2 border-white bg-[#0b2341] shadow-xs" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Badge status={t.status} size="sm" />
                    <span className="text-xs font-bold text-slate-800">
                      {t.updatedBy ? `by ${t.updatedBy}` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(t.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {t.remarks && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                    {t.remarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
