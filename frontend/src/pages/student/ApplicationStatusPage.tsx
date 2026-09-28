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
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { ScholarshipApplication } from '../../types/index.js';

export const ApplicationStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<ScholarshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
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
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
        Retrieving application history and audit logs...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center">
        <p className="text-xs text-slate-500">Application not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/applications')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </button>

      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {application.scholarshipId?.provider} • Applied on{' '}
            {new Date(application.appliedDate).toLocaleDateString('en-IN')}
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl shadow-xs hover:bg-slate-50 transition-all"
        >
          <Download className="h-4 w-4 text-indigo-600" />
          {downloading ? 'Generating PDF...' : 'Download Official Certificate'}
        </button>
      </div>

      {/* Reviewer Notes / Rejection Callout */}
      {application.reviewerNotes && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-xs text-indigo-900">
          <h4 className="font-bold flex items-center gap-1.5 mb-1">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            Committee Reviewer Comments:
          </h4>
          <p className="leading-relaxed">{application.reviewerNotes}</p>
        </div>
      )}

      {application.rejectionReason && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900">
          <h4 className="font-bold flex items-center gap-1.5 mb-1">
            <XCircle className="h-4 w-4 text-rose-600" />
            Rejection Feedback:
          </h4>
          <p className="leading-relaxed">{application.rejectionReason}</p>
        </div>
      )}

      {/* Verification Audit Timeline */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-600" />
          Verification Lifecycle & History Trail
        </h3>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {(application.timeline || []).map((t, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-6 top-1 h-5 w-5 rounded-full border-2 border-white bg-indigo-600 shadow-sm" />
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
              <p className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                {t.remarks}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
