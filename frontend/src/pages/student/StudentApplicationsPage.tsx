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

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="rounded-3xl bg-[#0b2341] p-6 sm:p-8 text-white shadow-md border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Scholarship Application Tracking Hub • Port 5173</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            My Scholarship Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Monitor real-time verification stages, faculty reviewer remarks, and export official grant certification receipts.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/scholarships')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Apply for New Scheme</span>
        </button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">Total Submitted</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalApps}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All academic sessions</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">Under Verification</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{inReviewCount}</p>
          <p className="text-[11px] text-blue-500 mt-0.5">Faculty & committee audit</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">Approved & Active</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{approvedActiveCount}</p>
          <p className="text-[11px] text-emerald-500 mt-0.5">Valid grant award</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">Expired / Historical</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{expiredCount}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">&gt; 6 months (Archived)</p>
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
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50 hover:bg-white transition-colors"
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
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#0b2341] text-amber-400 shadow-xs font-black'
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
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
            />
            <span>Hide Expired</span>
          </label>
        </div>
      </div>

      {/* Applications List / Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
          Loading your scholarship applications...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="h-16 w-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">No applications match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
            {applications.length === 0
              ? 'You have not submitted any scholarship applications yet. Explore active Punjab Post-Matric Scholarship schemes and apply today.'
              : 'Your active search or filter query did not return any records.'}
          </p>
          <button
            onClick={() => navigate('/student/scholarships')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Explore Active Scholarships</span>
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
                className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Scheme Info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {app.applicationNumber}
                      </span>
                      <Badge status={app.status} size="sm" />
                      {app.isRenewal && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
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

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
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
                      <span className="font-extrabold text-slate-800">
                        Award: ₹{(sch.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 self-start lg:self-center">
                    <button
                      onClick={(e) => handleDownloadPdf(app, e)}
                      disabled={downloadingId === app._id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      title="Download Application Summary PDF"
                    >
                      <Download className="h-3.5 w-3.5 text-amber-600" />
                      <span>{downloadingId === app._id ? 'Exporting...' : 'Receipt PDF'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/applications/${app._id}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b2341] hover:bg-[#123158] text-xs font-bold text-amber-400 shadow-xs transition-all hover:scale-105 cursor-pointer"
                    >
                      <span>View Audit Trail</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stepper Progress Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/80 text-emerald-950 font-semibold border border-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">1. Form Submitted</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 p-2 rounded-xl font-semibold border ${
                      app.status !== 'SUBMITTED'
                        ? 'bg-emerald-50/80 text-emerald-950 border-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
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
                    className={`flex items-center gap-2 p-2 rounded-xl font-semibold border ${
                      ['ELIGIBILITY_REVIEW', 'APPROVED'].includes(app.status)
                        ? 'bg-emerald-50/80 text-emerald-950 border-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
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
                    className={`flex items-center gap-2 p-2 rounded-xl font-semibold border ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                        : isRejected
                        ? 'bg-rose-50 text-rose-950 border-rose-200'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
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
                    <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
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
