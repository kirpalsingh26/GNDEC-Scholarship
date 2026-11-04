import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  AlertTriangle,
  Building2,
  Calendar,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  PlusCircle,
  FileText,
  Eye,
  Info,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { useToast } from '../../context/ToastContext.js';
import { ScholarshipApplication } from '../../types/index.js';

export const StudentApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hideExpired, setHideExpired] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error('Unable to retrieve application records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const isApplicationExpired = (app: ScholarshipApplication) => {
    if (app.isExpired) return true;
    if (app.status === 'APPROVED' && app.expiryDate) {
      return new Date(app.expiryDate).getTime() < Date.now();
    }
    return false;
  };

  const handleDownloadPdf = async (app: ScholarshipApplication, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(app._id);
    try {
      const response = await api.get(`/reports/applications/${app._id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ScholarSphere_${app.applicationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Application summary downloaded: ${app.applicationNumber}`);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      toast.error('Failed to generate application PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = applications.filter((app) => {
    const title = app.scholarshipId?.title || '';
    const provider = app.scholarshipId?.provider || '';
    const appNum = app.applicationNumber || '';
    const expired = isApplicationExpired(app);

    if (hideExpired && expired) {
      return false;
    }

    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      provider.toLowerCase().includes(search.toLowerCase()) ||
      appNum.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'IN_REVIEW' &&
        ['SUBMITTED', 'DOCUMENT_VERIFICATION', 'ELIGIBILITY_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED'].includes(app.status)) ||
      (statusFilter === 'APPROVED' && app.status === 'APPROVED' && !expired) ||
      (statusFilter === 'EXPIRED' && expired) ||
      (statusFilter === 'REJECTED' && app.status === 'REJECTED');

    return matchesSearch && matchesStatus;
  });

  const totalApps = applications.length;
  const inReviewCount = applications.filter((a) =>
    ['SUBMITTED', 'DOCUMENT_VERIFICATION', 'ELIGIBILITY_REVIEW'].includes(a.status)
  ).length;
  const approvedActiveCount = applications.filter((a) => a.status === 'APPROVED' && !isApplicationExpired(a)).length;
  const expiredCount = applications.filter((a) => isApplicationExpired(a)).length;
  const actionRequiredCount = applications.filter(
    (a) => a.status === 'ADDITIONAL_DOCUMENTS_REQUIRED' || a.status === 'REJECTED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Application Tracking Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Scholarship Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time verification stages, committee reviewer notes, and download official grant certificates.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/scholarships')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          Apply for New Scheme
        </button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Submitted</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalApps}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All academic sessions</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Under Verification</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{inReviewCount}</p>
          <p className="text-[11px] text-indigo-400 mt-0.5">Desk & committee audit</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Approved & Valid</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{approvedActiveCount}</p>
          <p className="text-[11px] text-emerald-500 mt-0.5">Active &lt; 6 months</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Expired Approvals</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{expiredCount}</p>
          <p className="text-[11px] text-amber-500 mt-0.5">&gt; 6 months (Historical)</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by scholarship title, application ID, or provider..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: `All (${applications.length})` },
              { id: 'IN_REVIEW', label: `In Review (${inReviewCount})` },
              { id: 'APPROVED', label: `Active (${approvedActiveCount})` },
              { id: 'EXPIRED', label: `Expired (${expiredCount})` },
              { id: 'REJECTED', label: 'Closed / Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={hideExpired}
              onChange={(e) => setHideExpired(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span>Hide Expired</span>
          </label>
        </div>
      </div>

      {/* Applications List / Cards */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
          Loading your scholarship applications...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="h-14 w-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No applications match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            You haven't submitted an application matching this query, or your active search yielded no results.
          </p>
          <button
            onClick={() => navigate('/student/scholarships')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            Explore Eligible Scholarships
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const isApproved = app.status === 'APPROVED';
            const isRejected = app.status === 'REJECTED';
            const sch = app.scholarshipId || {};

            return (
              <div
                key={app._id}
                onClick={() => navigate(`/student/applications/${app._id}`)}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Scheme Info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                        {app.applicationNumber}
                      </span>
                      <Badge status={app.status} size="sm" />
                      {app.isRenewal && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          Annual Renewal
                        </span>
                      )}
                      {isApproved && isApplicationExpired(app) && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-amber-700" />
                          Expired (&gt; 6 Mos Ago)
                        </span>
                      )}
                      {isApproved && !isApplicationExpired(app) && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                          Valid (Active Grant)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {sch.title || 'Scholarship Scheme'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {sch.provider || 'State Government'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Applied: {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        Award: ₹{(sch.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 self-start lg:self-center">
                    <button
                      onClick={(e) => handleDownloadPdf(app, e)}
                      disabled={downloadingId === app._id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
                      title="Download Application Summary PDF"
                    >
                      <Download className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{downloadingId === app._id ? 'Exporting...' : 'Receipt PDF'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/applications/${app._id}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-all hover:scale-105"
                    >
                      <span>View Audit Trail</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stepper Progress Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/60 text-indigo-950 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">1. Form Submitted</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 p-2 rounded-xl font-semibold ${
                      app.status !== 'SUBMITTED'
                        ? 'bg-indigo-50/60 text-indigo-950'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {app.status !== 'SUBMITTED' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-[11px]">2. Doc Verification</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 p-2 rounded-xl font-semibold ${
                      ['ELIGIBILITY_REVIEW', 'APPROVED'].includes(app.status)
                        ? 'bg-indigo-50/60 text-indigo-950'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {['ELIGIBILITY_REVIEW', 'APPROVED'].includes(app.status) ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-[11px]">3. Committee Sign-off</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 p-2 rounded-xl font-semibold ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-950'
                        : isRejected
                        ? 'bg-rose-50 text-rose-950'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {isApproved ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : isRejected ? (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-[11px]">
                      {isApproved ? '4. Certified / Awarded' : isRejected ? '4. Rejected' : '4. Final Grant'}
                    </span>
                  </div>
                </div>

                {/* Reviewer Note preview if exists */}
                {app.reviewerNotes && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span className="line-clamp-1">Latest Remark: {app.reviewerNotes}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
