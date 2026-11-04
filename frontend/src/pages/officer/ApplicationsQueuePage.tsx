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
  Calendar,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  Zap,
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
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'CGPA_DESC' | 'AMOUNT_DESC'>('DATE_DESC');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

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
        return 0;
      });
  }, [applications, search, statusFilter, deptFilter, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setDeptFilter('ALL');
    setSortBy('DATE_DESC');
  };

  const hasActiveFilters = search || statusFilter !== 'ALL' || deptFilter !== 'ALL' || sortBy !== 'DATE_DESC';

  return (
    <div className="space-y-6">
      {/* Top Header & Triage Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-700 text-xs font-bold mb-2 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
            <span>Verification Desk Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Applications Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Audit enrolled candidate dossiers, verify credentials and submitted proofs, and sanction state & institutional scholarships.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all hover:scale-105 active:scale-95"
            title="Refresh application data"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'GRID'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Stage Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Queue</span>
            <div className="h-8 w-8 rounded-2xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{kpis.total}</p>
            <span className="text-[10px] font-semibold text-slate-500">All student submissions</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-blue-50/60 border border-blue-100 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Doc Review</span>
            <div className="h-8 w-8 rounded-2xl bg-blue-100/80 group-hover:bg-blue-600 group-hover:text-white text-blue-700 flex items-center justify-center transition-colors">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-blue-700 font-mono tracking-tight">{kpis.docPending}</p>
            <span className="text-[10px] font-semibold text-blue-600">Pending certificate audit</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-purple-50/30 to-purple-50/60 border border-purple-100 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Eligibility</span>
            <div className="h-8 w-8 rounded-2xl bg-purple-100/80 group-hover:bg-purple-600 group-hover:text-white text-purple-700 flex items-center justify-center transition-colors">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-purple-700 font-mono tracking-tight">{kpis.eligibilityReview}</p>
            <span className="text-[10px] font-semibold text-purple-600">Committee evaluation</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-emerald-50/60 border border-emerald-100 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Approved</span>
            <div className="h-8 w-8 rounded-2xl bg-emerald-100/80 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center transition-colors">
              <CheckCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">{kpis.approved}</p>
            <span className="text-[10px] font-semibold text-emerald-600">Sanction certified</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-indigo-50/30 to-indigo-50/60 border border-indigo-100 shadow-2xs col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Pipeline Aid</span>
            <div className="h-8 w-8 rounded-2xl bg-indigo-100/80 group-hover:bg-indigo-600 group-hover:text-white text-indigo-700 flex items-center justify-center transition-colors">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono tracking-tight">
              ₹{(kpis.totalValue / 100000).toFixed(1)}L
            </p>
            <span className="text-[10px] font-semibold text-indigo-600">Total fund scope</span>
          </div>
        </div>
      </div>

      {/* Stage Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              statusFilter === tab.value
                ? 'bg-slate-900 text-white shadow-sm scale-105'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-2xs'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
              statusFilter === tab.value
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-lg">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, application ID, or scheme..."
            className="w-full pl-10 pr-8 py-2 text-xs border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white transition-colors cursor-pointer"
          >
            <option value="ALL">All Engineering Branches</option>
            <option value="Computer Science and Engineering">CSE Branch</option>
            <option value="Information Technology">IT Branch</option>
            <option value="Electronics and Communication Engineering">ECE Branch</option>
            <option value="Mechanical Engineering">ME Branch</option>
            <option value="Civil Engineering">CE Branch</option>
          </select>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1 rounded-2xl border border-slate-200/80">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 border-none focus:ring-0 p-1 cursor-pointer"
            >
              <option value="DATE_DESC">Newest Submissions</option>
              <option value="DATE_ASC">Oldest Submissions</option>
              <option value="CGPA_DESC">Highest Academic CGPA</option>
              <option value="AMOUNT_DESC">Highest Grant Amount</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              title="Reset all filters"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Ledger View (Table or Grid) */}
      {viewMode === 'TABLE' ? (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-4 px-5 whitespace-nowrap">Candidate Student</th>
                  <th className="py-4 px-5 whitespace-nowrap">Application ID</th>
                  <th className="py-4 px-5 whitespace-nowrap">Scholarship Scheme</th>
                  <th className="py-4 px-5 whitespace-nowrap">Grant Amount</th>
                  <th className="py-4 px-5 whitespace-nowrap">Academic & Category</th>
                  <th className="py-4 px-5 whitespace-nowrap">Audit Status</th>
                  <th className="py-4 px-5 text-right whitespace-nowrap">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 px-5 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-7 w-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                        <span className="font-bold text-xs text-slate-600 mt-1">Loading application records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 px-5 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileCheck2 className="h-10 w-10 text-slate-300 stroke-[1.5]" />
                        <p className="font-bold text-slate-800 text-sm">No matching applications in queue</p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          Try clearing active search queries or resetting pipeline stage filters.
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
                    const cgpa = app.snapshot?.cgpa && app.snapshot.cgpa > 0 ? app.snapshot.cgpa.toFixed(2) : 'N/A';

                    return (
                      <tr key={app._id} className="hover:bg-indigo-50/20 transition-colors group">
                        {/* 1. Candidate Student Profile */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                              {studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs leading-tight whitespace-nowrap group-hover:text-indigo-600 transition-colors">
                                {studentName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 whitespace-nowrap">
                                <span className="text-[10px] text-slate-600 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 whitespace-nowrap">
                                  Roll: {app.studentId?.rollNumber || 'N/A'}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 whitespace-nowrap">
                                  {app.snapshot?.department ? `${app.snapshot.department.split(' ')[0]} • Sem ${app.snapshot.semester || 5}` : 'CSE • Sem 5'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Application ID & Date */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50/90 px-2.5 py-1 rounded-xl border border-indigo-200/60 shadow-2xs inline-block group-hover:scale-105 transition-transform whitespace-nowrap">
                            {app.applicationNumber}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 whitespace-nowrap font-medium">
                            <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>
                              {new Date(app.appliedDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </p>
                        </td>

                        {/* 3. Scholarship Scheme */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div>
                            <p className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                              {app.scholarshipId?.title || 'Institutional Aid Grant'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1 whitespace-nowrap">
                              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{app.scholarshipId?.provider || 'State / Institutional Fund'}</span>
                            </p>
                          </div>
                        </td>

                        {/* 4. Grant Award Amount */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="font-black text-slate-900 text-xs font-mono whitespace-nowrap">
                            ₹{(app.scholarshipId?.amount || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-medium whitespace-nowrap">per academic year</span>
                        </td>

                        {/* 5. Academic & Category */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs whitespace-nowrap">
                              {cgpa} CGPA
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-extrabold whitespace-nowrap">
                              SC Category
                            </span>
                          </div>
                        </td>

                        {/* 6. Audit & Review Status */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <Badge status={app.status} size="sm" />
                        </td>

                        {/* 7. Verification Action Button */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/officer/applications/${app._id}`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
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
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((app) => {
            const studentName = app.studentId
              ? `${app.studentId.firstName} ${app.studentId.lastName}`
              : 'Candidate Student';
            const cgpa = app.snapshot?.cgpa && app.snapshot.cgpa > 0 ? app.snapshot.cgpa.toFixed(2) : 'N/A';

            return (
              <div
                key={app._id}
                className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-200"
              >
                <div>
                  {/* Top Bar: App ID & Status */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100 shadow-2xs">
                      {app.applicationNumber}
                    </span>
                    <Badge status={app.status} size="sm" />
                  </div>

                  {/* Student Details */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                      {studentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                        {studentName}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Roll: {app.studentId?.rollNumber || 'N/A'} • Sem {app.snapshot?.semester || '-'}
                      </p>
                      <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                        {app.snapshot?.department || 'Computer Science and Engineering'}
                      </p>
                    </div>
                  </div>

                  {/* Scheme Information Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 mb-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Scheme Requested</p>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{app.scholarshipId?.title}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">Award Grant:</span>
                      <span className="font-mono font-black text-slate-900">
                        ₹{(app.scholarshipId?.amount || 0).toLocaleString('en-IN')}/yr
                      </span>
                    </div>
                  </div>

                  {/* Academic & Category Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center mb-2">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">CGPA Score</p>
                      <p className="text-sm font-black text-slate-900 font-mono mt-0.5">{cgpa} / 10.0</p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                      <p className="text-[10px] font-bold uppercase">Category</p>
                      <p className="text-sm font-black font-mono mt-0.5">SC</p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <button
                  onClick={() => navigate(`/officer/applications/${app._id}`)}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-95 cursor-pointer"
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
