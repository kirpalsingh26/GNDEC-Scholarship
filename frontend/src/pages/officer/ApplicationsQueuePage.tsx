import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Building2,
  User,
  Clock,
  TrendingUp,
  Award,
  Layers,
  LayoutGrid,
  List,
  ArrowUpDown,
  RotateCcw,
  CheckCheck,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { ScholarshipApplication } from '../../types/index.js';

export const ApplicationsQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'CGPA_DESC' | 'AMOUNT_DESC' | 'ATT_ASC'>('DATE_DESC');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Compute live KPI counts
  const kpis = useMemo(() => {
    const total = applications.length;
    const docPending = applications.filter((a) => a.status === 'DOCUMENT_VERIFICATION' || a.status === 'SUBMITTED').length;
    const eligibilityReview = applications.filter((a) => a.status === 'ELIGIBILITY_REVIEW').length;
    const approved = applications.filter((a) => a.status === 'APPROVED').length;
    const totalValue = applications.reduce((acc, a) => acc + (a.scholarshipId?.amount || 0), 0);
    return { total, docPending, eligibilityReview, approved, totalValue };
  }, [applications]);

  // Filter and Sort Pipeline
  const filtered = useMemo(() => {
    return applications
      .filter((app) => {
        const studentName = app.studentId
          ? `${app.studentId.firstName} ${app.studentId.lastName}`
          : '';
        const matchesSearch =
          app.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
          studentName.toLowerCase().includes(search.toLowerCase()) ||
          (app.studentId?.rollNumber || '').toLowerCase().includes(search.toLowerCase()) ||
          (app.scholarshipId?.title || '').toLowerCase().includes(search.toLowerCase()) ||
          (app.snapshot?.department || '').toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
        const matchesDept = deptFilter === 'ALL' || app.snapshot?.department === deptFilter;

        return matchesSearch && matchesStatus && matchesDept;
      })
      .sort((a, b) => {
        if (sortBy === 'DATE_DESC') {
          return new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime();
        }
        if (sortBy === 'DATE_ASC') {
          return new Date(a.appliedDate || 0).getTime() - new Date(b.appliedDate || 0).getTime();
        }
        if (sortBy === 'CGPA_DESC') {
          return (b.snapshot?.cgpa || 0) - (a.snapshot?.cgpa || 0);
        }
        if (sortBy === 'AMOUNT_DESC') {
          return (b.scholarshipId?.amount || 0) - (a.scholarshipId?.amount || 0);
        }
        if (sortBy === 'ATT_ASC') {
          return (a.snapshot?.attendancePercentage || 0) - (b.snapshot?.attendancePercentage || 0);
        }
        return 0;
      });
  }, [applications, search, statusFilter, deptFilter, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setDeptFilter('ALL');
    setSortBy('DATE_DESC');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Triage Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold mb-1.5 shadow-2xs">
            <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
            <span>Verification Desk Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Applications Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            Audit enrolled candidate dossiers, verify certified credentials, and sanction state & institutional scholarships.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => setViewMode(viewMode === 'TABLE' ? 'GRID' : 'TABLE')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all"
          >
            {viewMode === 'TABLE' ? (
              <>
                <LayoutGrid className="h-4 w-4 text-indigo-600" />
                <span>Card Grid</span>
              </>
            ) : (
              <>
                <List className="h-4 w-4 text-indigo-600" />
                <span>Table Ledger</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Stage Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Queue</span>
            <div className="h-7 w-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{kpis.total}</p>
          <span className="text-[10px] font-semibold text-slate-500">All submissions</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-blue-100 shadow-2xs flex flex-col justify-between bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Doc Review</span>
            <div className="h-7 w-7 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 animate-spin" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2 font-mono">{kpis.docPending}</p>
          <span className="text-[10px] font-semibold text-blue-600">Pending OCR/audit</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-purple-100 shadow-2xs flex flex-col justify-between bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Eligibility</span>
            <div className="h-7 w-7 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 mt-2 font-mono">{kpis.eligibilityReview}</p>
          <span className="text-[10px] font-semibold text-purple-600">Rule verification</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-emerald-100 shadow-2xs flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Approved</span>
            <div className="h-7 w-7 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <CheckCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">{kpis.approved}</p>
          <span className="text-[10px] font-semibold text-emerald-600">Sanction certified</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-indigo-100 shadow-2xs col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col justify-between bg-gradient-to-br from-white to-indigo-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Pipeline Aid</span>
            <div className="h-7 w-7 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
              <Award className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2 font-mono">
            ₹{(kpis.totalValue / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] font-semibold text-indigo-600">Total fund scope</span>
        </div>
      </div>

      {/* Stage Pills Navigation Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: 'All Stages', value: 'ALL', count: applications.length },
          { label: 'Submitted', value: 'SUBMITTED', count: applications.filter(a => a.status === 'SUBMITTED').length },
          { label: 'Doc Verification', value: 'DOCUMENT_VERIFICATION', count: applications.filter(a => a.status === 'DOCUMENT_VERIFICATION').length },
          { label: 'Eligibility Review', value: 'ELIGIBILITY_REVIEW', count: applications.filter(a => a.status === 'ELIGIBILITY_REVIEW').length },
          { label: 'Approved', value: 'APPROVED', count: applications.filter(a => a.status === 'APPROVED').length },
          { label: 'Rejected', value: 'REJECTED', count: applications.filter(a => a.status === 'REJECTED').length },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === tab.value
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              statusFilter === tab.value
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Comprehensive Filter & Sort Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-lg">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, application ID, or scheme..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
          >
            <option value="ALL">All Branches</option>
            <option value="Computer Science and Engineering">CSE Branch</option>
            <option value="Information Technology">IT Branch</option>
            <option value="Electronics and Communication Engineering">ECE Branch</option>
            <option value="Mechanical Engineering">ME Branch</option>
            <option value="Civil Engineering">CE Branch</option>
          </select>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2 py-1 rounded-xl border border-slate-200/80">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 border-none focus:ring-0 p-1 cursor-pointer"
            >
              <option value="DATE_DESC">Newest Submissions</option>
              <option value="DATE_ASC">Oldest Submissions</option>
              <option value="CGPA_DESC">Highest Academic CGPA</option>
              <option value="AMOUNT_DESC">Highest Grant Amount</option>
              <option value="ATT_ASC">Lowest Attendance (Priority)</option>
            </select>
          </div>

          {(search || statusFilter !== 'ALL' || deptFilter !== 'ALL' || sortBy !== 'DATE_DESC') && (
            <button
              onClick={clearFilters}
              title="Reset all filters"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* MAIN VIEW: TABLE OR CARD GRID */}
      {viewMode === 'TABLE' ? (
        /* TABLE LEDGER VIEW */
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-4 px-5">Application ID</th>
                  <th className="py-4 px-5">Candidate Student</th>
                  <th className="py-4 px-5">Branch & Semester</th>
                  <th className="py-4 px-5">Scholarship Scheme</th>
                  <th className="py-4 px-5">Grant Amount</th>
                  <th className="py-4 px-5">CGPA & Attendance</th>
                  <th className="py-4 px-5">Audit Status</th>
                  <th className="py-4 px-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 px-5 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                        <span className="font-semibold text-xs text-slate-500">Loading application queue...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 px-5 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileCheck2 className="h-9 w-9 text-slate-300 stroke-[1.5]" />
                        <p className="font-bold text-slate-800 text-sm">No matching applications in queue</p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          Try clearing active search queries, changing branch filters, or resetting pipeline stage filters.
                        </p>
                        <button
                          onClick={clearFilters}
                          className="mt-2 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => {
                    const studentName = app.studentId
                      ? `${app.studentId.firstName} ${app.studentId.lastName}`
                      : 'Candidate Student';
                    const cgpa = app.snapshot?.cgpa || 8.0;
                    const att = app.snapshot?.attendancePercentage || 80;
                    const isAttWarning = att < 75;

                    return (
                      <tr key={app._id} className="hover:bg-indigo-50/25 transition-colors group">
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50/90 px-2.5 py-1 rounded-xl border border-indigo-200/60 shadow-2xs inline-block group-hover:scale-105 transition-transform">
                            {app.applicationNumber}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                              {studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs leading-tight">{studentName}</p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                Roll: {app.studentId?.rollNumber || '2104501'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <p className="font-bold text-slate-800 text-xs">{app.snapshot?.department || 'Computer Science'}</p>
                          <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50/70 px-2 py-0.2 rounded-md border border-indigo-100 mt-0.5">
                            Semester {app.snapshot?.semester || 5}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="max-w-xs">
                            <p className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-indigo-600 transition-colors">
                              {app.scholarshipId?.title || 'Institutional Aid Grant'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                              {app.scholarshipId?.provider || 'Govt. / University Endowment'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="font-extrabold text-slate-900 text-xs font-mono">
                            ₹{(app.scholarshipId?.amount || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-slate-400">per academic year</span>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {cgpa} CGPA
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                                isAttWarning
                                  ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              }`}
                            >
                              {att}% Att.
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <Badge status={app.status} size="sm" />
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/officer/applications/${app._id}`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200/70 rounded-xl transition-all shadow-2xs hover:scale-105"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Audit & Review</span>
                            <ArrowRight className="h-3 w-3 opacity-70" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((app) => {
            const studentName = app.studentId
              ? `${app.studentId.firstName} ${app.studentId.lastName}`
              : 'Candidate Student';
            const cgpa = app.snapshot?.cgpa || 8.0;
            const att = app.snapshot?.attendancePercentage || 80;
            const isAttWarning = att < 75;

            return (
              <div
                key={app._id}
                className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-200"
              >
                <div>
                  {/* Top Bar: App ID & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50/90 px-2.5 py-1 rounded-xl border border-indigo-200/60 shadow-2xs">
                      {app.applicationNumber}
                    </span>
                    <Badge status={app.status} size="sm" />
                  </div>

                  {/* Student Details */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                      {studentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                        {studentName}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Roll: {app.studentId?.rollNumber || '2104501'} • Sem {app.snapshot?.semester || 5}
                      </p>
                    </div>
                  </div>

                  {/* Scheme Information */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2 mb-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Scheme Requested</p>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{app.scholarshipId?.title}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/50">
                      <span className="text-slate-500 font-medium">Award Grant:</span>
                      <span className="font-mono font-black text-slate-900">
                        ₹{(app.scholarshipId?.amount || 0).toLocaleString('en-IN')}/yr
                      </span>
                    </div>
                  </div>

                  {/* Academic Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center mb-2">
                    <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase">CGPA Score</p>
                      <p className="text-sm font-black text-indigo-900 font-mono">{cgpa} / 10.0</p>
                    </div>
                    <div className={`p-2 rounded-xl border ${
                      isAttWarning
                        ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    }`}>
                      <p className="text-[10px] font-bold uppercase">Attendance</p>
                      <p className="text-sm font-black font-mono">{att}%</p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <button
                  onClick={() => navigate(`/officer/applications/${app._id}`)}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Audit Dossier & Verification</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
