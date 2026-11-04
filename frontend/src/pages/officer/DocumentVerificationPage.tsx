import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  AlertTriangle,
  Building2,
  User,
  ShieldCheck,
  FileText,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  FileCheck,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { StudentDocument } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import { formatIndianCurrency } from '../../utils/currencyFormatter.js';

interface StudentDocGroup {
  student: any;
  studentKey: string;
  studentName: string;
  rollNumber: string;
  department: string;
  course: string;
  year: number;
  semester: number;
  category: string;
  familyIncome: number;
  phone: string;
  email: string;
  documents: StudentDocument[];
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  totalCount: number;
  hasPending: boolean;
  isFullyVerified: boolean;
}

export const DocumentVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<StudentDocument | null>(null);
  const [selectedStudentKey, setSelectedStudentKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'NEEDS_VERIFICATION' | 'ALL' | 'VERIFIED' | 'REUPLOAD_REQUESTED'>('NEEDS_VERIFICATION');
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Review Action Form
  const [rejectionReason, setRejectionReason] = useState('Certificate is expired. Upload certificate issued in current financial year (Session 2025–26).');
  const [reviewComments, setReviewComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      if (res.data.success) {
        const fetchedDocs: StudentDocument[] = res.data.data || [];
        setDocuments(fetchedDocs);

        // Keep or select appropriate document
        if (fetchedDocs.length > 0) {
          if (selectedDoc) {
            const updatedSelected = fetchedDocs.find((d) => d._id === selectedDoc._id);
            if (updatedSelected) {
              setSelectedDoc(updatedSelected);
            }
          } else {
            // Find first pending document, or first available doc
            const firstPending = fetchedDocs.find((d) => d.status === 'PENDING' || d.status === 'UNDER_REVIEW');
            const target = firstPending || fetchedDocs[0];
            setSelectedDoc(target);
            if (target?.studentId) {
              const key = target.studentId._id || target.studentId.studentId || target.studentId.rollNumber;
              setSelectedStudentKey(key);
              setExpandedStudents({ [key]: true });
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to retrieve document verification repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Group documents by student to eliminate mixing
  const studentGroups = useMemo<StudentDocGroup[]>(() => {
    const map = new Map<string, StudentDocGroup>();

    documents.forEach((doc) => {
      const s = doc.studentId;
      const key =
        s?._id ||
        s?.studentId ||
        s?.rollNumber ||
        (doc.userId ? String(doc.userId) : doc._id);

      if (!map.has(key)) {
        map.set(key, {
          student: s,
          studentKey: key,
          studentName: s
            ? `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Candidate Student'
            : 'Candidate Student',
          rollNumber: s?.rollNumber || s?.studentId || 'N/A',
          department: s?.department || 'Engineering',
          course: s?.course || 'B.Tech',
          year: s?.year || 1,
          semester: s?.semester || 1,
          category: s?.category || 'SC',
          familyIncome: s?.familyIncome || 0,
          phone: s?.phone || '',
          email: s?.email || '',
          documents: [],
          pendingCount: 0,
          verifiedCount: 0,
          rejectedCount: 0,
          totalCount: 0,
          hasPending: false,
          isFullyVerified: false,
        });
      }

      const group = map.get(key)!;
      group.documents.push(doc);
      group.totalCount += 1;
      if (doc.status === 'PENDING' || doc.status === 'UNDER_REVIEW') {
        group.pendingCount += 1;
      } else if (doc.status === 'VERIFIED') {
        group.verifiedCount += 1;
      } else if (doc.status === 'REUPLOAD_REQUIRED' || (doc.status as string) === 'REJECTED') {
        group.rejectedCount += 1;
      }
    });

    const groups = Array.from(map.values()).map((g) => {
      g.hasPending = g.pendingCount > 0;
      g.isFullyVerified = g.totalCount > 0 && g.verifiedCount === g.totalCount;
      // Sort docs: pending first, then by latest update
      g.documents.sort((a, b) => {
        const aPending = a.status === 'PENDING' || a.status === 'UNDER_REVIEW' ? 1 : 0;
        const bPending = b.status === 'PENDING' || b.status === 'UNDER_REVIEW' ? 1 : 0;
        if (aPending !== bPending) return bPending - aPending;
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      });
      return g;
    });

    // Sort groups: students with pending verifications appear at the top!
    groups.sort((a, b) => {
      if (a.hasPending && !b.hasPending) return -1;
      if (!a.hasPending && b.hasPending) return 1;
      if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
      return a.studentName.localeCompare(b.studentName);
    });

    return groups;
  }, [documents]);

  // Overall Statistics for Overview Cards
  const totalStudents = studentGroups.length;
  const pendingStudentsCount = studentGroups.filter((g) => g.hasPending).length;
  const fullyVerifiedStudentsCount = studentGroups.filter((g) => g.isFullyVerified).length;
  const reuploadStudentsCount = studentGroups.filter((g) => g.rejectedCount > 0).length;
  const totalPendingDocsCount = documents.filter(
    (d) => d.status === 'PENDING' || d.status === 'UNDER_REVIEW'
  ).length;

  // Filter student groups
  const filteredGroups = useMemo(() => {
    return studentGroups.filter((group) => {
      // 1. Status Filter
      if (statusFilter === 'NEEDS_VERIFICATION' && !group.hasPending) return false;
      if (statusFilter === 'VERIFIED' && !group.isFullyVerified) return false;
      if (statusFilter === 'REUPLOAD_REQUESTED' && group.rejectedCount === 0) return false;

      // 2. Search query matching
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = group.studentName.toLowerCase().includes(query);
        const matchesRoll = group.rollNumber.toLowerCase().includes(query);
        const matchesDept = group.department.toLowerCase().includes(query);
        const matchesDoc = group.documents.some(
          (d) =>
            d.title?.toLowerCase().includes(query) ||
            d.documentType?.toLowerCase().includes(query)
        );
        return matchesName || matchesRoll || matchesDept || matchesDoc;
      }

      return true;
    });
  }, [studentGroups, statusFilter, search]);

  // Active student group matching currently selected doc
  const currentStudentGroup = useMemo(() => {
    if (!selectedDoc) return null;
    const docStudentKey =
      selectedDoc.studentId?._id ||
      selectedDoc.studentId?.studentId ||
      selectedDoc.studentId?.rollNumber ||
      (selectedDoc.userId ? String(selectedDoc.userId) : selectedDoc._id);

    return (
      studentGroups.find((g) => g.studentKey === docStudentKey) ||
      (selectedStudentKey ? studentGroups.find((g) => g.studentKey === selectedStudentKey) : null) ||
      null
    );
  }, [selectedDoc, selectedStudentKey, studentGroups]);

  // Select next pending document in workflow
  const selectNextPendingDoc = (updatedDocs: StudentDocument[], currentDocId: string) => {
    const currentDoc = updatedDocs.find((d) => d._id === currentDocId);
    const currentStudentId = currentDoc?.studentId?._id;

    // 1. Look for another pending document of the same student
    const nextInSameStudent = updatedDocs.find(
      (d) =>
        d.studentId?._id === currentStudentId &&
        d._id !== currentDocId &&
        (d.status === 'PENDING' || d.status === 'UNDER_REVIEW')
    );
    if (nextInSameStudent) {
      setSelectedDoc(nextInSameStudent);
      return;
    }

    // 2. Look for next pending doc in any student
    const nextAnyPending = updatedDocs.find(
      (d) =>
        d._id !== currentDocId &&
        (d.status === 'PENDING' || d.status === 'UNDER_REVIEW')
    );
    if (nextAnyPending) {
      setSelectedDoc(nextAnyPending);
      if (nextAnyPending.studentId) {
        const key = nextAnyPending.studentId._id || nextAnyPending.studentId.studentId || nextAnyPending.studentId.rollNumber;
        setSelectedStudentKey(key);
        setExpandedStudents((prev) => ({ ...prev, [key]: true }));
      }
      return;
    }

    // 3. Fallback to updated version of current doc
    const refreshed = updatedDocs.find((d) => d._id === currentDocId);
    if (refreshed) setSelectedDoc(refreshed);
  };

  const handleVerify = async () => {
    if (!selectedDoc) return;
    setProcessing(true);
    setFeedbackMsg('');
    try {
      const res = await api.post(`/documents/${selectedDoc._id}/verify`, {
        comments: reviewComments || 'Certified and validated against official state issuing records.',
      });
      if (res.data.success) {
        addToast('success', `${selectedDoc.title} verified successfully.`);
        setFeedbackMsg(`Verified ✓: ${selectedDoc.title} marked valid.`);
        setReviewComments('');

        // Refresh documents and automatically advance to next pending
        const fetchRes = await api.get('/documents');
        if (fetchRes.data.success) {
          const freshList = fetchRes.data.data;
          setDocuments(freshList);
          selectNextPendingDoc(freshList, selectedDoc._id);
        }
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Verification update failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectOrReupload = async (requestReupload: boolean) => {
    if (!selectedDoc) return;
    setProcessing(true);
    setFeedbackMsg('');
    try {
      const res = await api.post(`/documents/${selectedDoc._id}/reject`, {
        rejectionReason,
        comments: reviewComments,
        requestReupload,
      });
      if (res.data.success) {
        const msg = requestReupload
          ? `Re-upload requested for ${selectedDoc.title}. Student notified.`
          : `Certificate marked as REJECTED.`;
        setFeedbackMsg(msg);
        addToast(requestReupload ? 'info' : 'warning', msg);
        setReviewComments('');

        // Refresh documents and advance
        const fetchRes = await api.get('/documents');
        if (fetchRes.data.success) {
          const freshList = fetchRes.data.data;
          setDocuments(freshList);
          selectNextPendingDoc(freshList, selectedDoc._id);
        }
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Action failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyRoll = (roll: string) => {
    navigator.clipboard.writeText(roll);
    setCopiedKey(roll);
    addToast('info', `URN ${roll} copied to clipboard.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleStudentExpanded = (key: string) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectStudentCard = (group: StudentDocGroup) => {
    setSelectedStudentKey(group.studentKey);
    setExpandedStudents((prev) => ({ ...prev, [group.studentKey]: true }));
    const pendingDoc = group.documents.find((d) => d.status === 'PENDING' || d.status === 'UNDER_REVIEW');
    setSelectedDoc(pendingDoc || group.documents[0] || null);
    setFeedbackMsg('');
  };

  const handleSelectDocItem = (doc: StudentDocument, studentKey: string) => {
    setSelectedDoc(doc);
    setSelectedStudentKey(studentKey);
    setExpandedStudents((prev) => ({ ...prev, [studentKey]: true }));
    setFeedbackMsg('');
  };

  const latestVer = selectedDoc?.versions?.find((v) => v.versionNumber === selectedDoc.currentVersion);
  const activeStudent = currentStudentGroup?.student || selectedDoc?.studentId;

  // Preset feedback remarks
  const quickRemarks = [
    'Official revenue seal and barcode verified against Punjab e-District portal.',
    'Applicant details match GNDEC University registration roll number records.',
    'Aadhaar seeded DBT bank account details verified.',
    'Fee receipt verified against accounts branch ledger.',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-xs font-bold mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Faculty Verification Desk • Dr. B.R. Ambedkar PMS SC Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Document Verification Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Candidate-centric verification workspace. Student dossiers group all certificates in one place for fast, accurate faculty review.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
          <button
            onClick={() => navigate('/officer/applications')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>Applications Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* TOP PENDING VERIFICATION METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Pending Verification Students */}
        <div
          onClick={() => setStatusFilter('NEEDS_VERIFICATION')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            statusFilter === 'NEEDS_VERIFICATION'
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 ring-2 ring-amber-500/30 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-amber-200 hover:bg-amber-50/30 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
              Pending Review
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {pendingStudentsCount}
                <span className="text-xs font-bold text-slate-500 ml-1.5 font-sans">Students</span>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                {totalPendingDocsCount} certificates awaiting sign-off
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-100 flex items-center justify-between text-[10px] text-amber-800 font-bold">
            <span>Filter Pending Dossiers</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Total Certificates in Repository */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            statusFilter === 'ALL'
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 ring-2 ring-blue-500/30 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/30 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-600" />
              Total Candidate Dossiers
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {totalStudents}
                <span className="text-xs font-bold text-slate-500 ml-1.5 font-sans">Enrolled</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {documents.length} total certificates archived
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] text-blue-800 font-bold">
            <span>View All Candidates</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Fully Verified Students */}
        <div
          onClick={() => setStatusFilter('VERIFIED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            statusFilter === 'VERIFIED'
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 ring-2 ring-emerald-500/30 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-emerald-200 hover:bg-emerald-50/30 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              100% Certified Dossiers
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {fullyVerifiedStudentsCount}
                <span className="text-xs font-bold text-emerald-700 ml-1.5 font-sans">Students</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                All certificates cleared & verified
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-800 font-bold">
            <span>Filter Completed</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Action Needed / Re-upload */}
        <div
          onClick={() => setStatusFilter('REUPLOAD_REQUESTED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            statusFilter === 'REUPLOAD_REQUESTED'
              ? 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-300 ring-2 ring-rose-500/30 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-rose-200 hover:bg-rose-50/30 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-rose-600" />
              Action / Re-upload
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {reuploadStudentsCount}
                <span className="text-xs font-bold text-rose-700 ml-1.5 font-sans">Candidates</span>
              </div>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                Certificates flagged for student revision
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-rose-100 flex items-center justify-between text-[10px] text-rose-800 font-bold">
            <span>Filter Re-upload Queue</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3.5 text-xs font-bold text-blue-900 flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg('')}
            className="text-[11px] text-blue-700 hover:underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="font-semibold text-slate-600">Loading student verification dossiers...</p>
        </div>
      ) : studentGroups.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="h-16 w-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">No Documents in Repository</h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
            There are currently no student documents uploaded. As candidates register and upload their SC Caste, Income, and Freeship certificates, their organized user cards will appear here.
          </p>
          <button
            onClick={() => navigate('/officer/applications')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
          >
            Go to Applications Queue
          </button>
        </div>
      ) : (
        /* MAIN WORKSPACE: Left = Student User Cards (5 cols), Right = Inspection & Decision Console (7 cols) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* COLUMN 1 (5 cols): USER CARDS & ORGANIZED STUDENT DATA   */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    <span>Candidate Dossiers ({filteredGroups.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Grouped by student • Click card to review
                  </p>
                </div>
                {statusFilter !== 'ALL' && (
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setStatusFilter('NEEDS_VERIFICATION')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center ${
                    statusFilter === 'NEEDS_VERIFICATION'
                      ? 'bg-white text-amber-800 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({pendingStudentsCount})
                </button>
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({totalStudents})
                </button>
                <button
                  onClick={() => setStatusFilter('VERIFIED')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center ${
                    statusFilter === 'VERIFIED'
                      ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Verified ({fullyVerifiedStudentsCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by student, URN, or document type..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* LIST OF STUDENT USER CARDS */}
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                {filteredGroups.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="font-semibold text-slate-600">No matching student dossiers</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {statusFilter === 'NEEDS_VERIFICATION'
                        ? 'All pending documents have been verified!'
                        : 'Try adjusting your search criteria.'}
                    </p>
                  </div>
                ) : (
                  filteredGroups.map((group) => {
                    const isSelectedStudent = currentStudentGroup?.studentKey === group.studentKey;
                    const isExpanded = expandedStudents[group.studentKey] ?? true;

                    return (
                      <div
                        key={group.studentKey}
                        className={`rounded-2xl border transition-all ${
                          isSelectedStudent
                            ? 'bg-blue-50/40 border-blue-400 shadow-xs ring-1 ring-blue-500/30'
                            : group.hasPending
                            ? 'bg-white border-amber-200 hover:border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        {/* USER CARD HEADER: Student identity & stats */}
                        <div
                          onClick={() => handleSelectStudentCard(group)}
                          className="p-3.5 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Avatar Initials Badge */}
                              <div
                                className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-2xs ${
                                  group.hasPending
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                                    : group.isFullyVerified
                                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                                    : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                                }`}
                              >
                                {group.studentName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <h4 className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{group.studentName}</span>
                                  {isSelectedStudent && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white uppercase tracking-wider">
                                      Active
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 inline-flex items-center gap-1">
                                    <span>URN: {group.rollNumber}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyRoll(group.rollNumber);
                                      }}
                                      title="Copy Roll Number"
                                      className="hover:text-blue-900"
                                    >
                                      {copiedKey === group.rollNumber ? (
                                        <Check className="h-3 w-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="h-3 w-3 text-slate-400" />
                                      )}
                                    </button>
                                  </span>
                                  <span>•</span>
                                  <span className="truncate max-w-[130px] font-medium">
                                    {group.department}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status Chip */}
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              {group.hasPending ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                                  <span>{group.pendingCount} Pending</span>
                                </span>
                              ) : group.isFullyVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <Check className="h-3 w-3 text-emerald-600" />
                                  <span>All Verified</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  <span>{group.verifiedCount}/{group.totalCount} Done</span>
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-slate-400">
                                {group.totalCount} {group.totalCount === 1 ? 'doc' : 'docs'}
                              </span>
                            </div>
                          </div>

                          {/* Quick Metadata Pill Bar */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 text-[10px]">
                                {group.category}
                              </span>
                              <span>
                                Income:{' '}
                                <strong className="text-slate-800 font-mono">
                                  {group.familyIncome > 0
                                    ? `₹${formatIndianCurrency(group.familyIncome)}/yr`
                                    : 'Declared'}
                                </strong>
                              </span>
                            </div>

                            {/* Mini Toggle / Progress Indicator */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStudentExpanded(group.studentKey);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* ORGANIZED DOCUMENTS LIST INSIDE STUDENT CARD */}
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              <span>Uploaded Documents</span>
                              <span>
                                {group.verifiedCount} of {group.totalCount} Cleared
                              </span>
                            </div>

                            {group.documents.map((doc) => {
                              const isSelectedDoc = selectedDoc?._id === doc._id;
                              const isPending =
                                doc.status === 'PENDING' || doc.status === 'UNDER_REVIEW';

                              return (
                                <div
                                  key={doc._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectDocItem(doc, group.studentKey);
                                  }}
                                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                    isSelectedDoc
                                      ? 'bg-blue-100/80 border-blue-400 shadow-2xs ring-1 ring-blue-500/40 text-blue-950 font-bold'
                                      : isPending
                                      ? 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/60'
                                      : 'bg-white border-slate-200/70 hover:bg-slate-100/70'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {doc.status === 'VERIFIED' ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    ) : isPending ? (
                                      <Clock className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />
                                    ) : (
                                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                                    )}

                                    <div className="min-w-0">
                                      <p className="text-xs font-bold truncate">
                                        {doc.title || doc.documentType?.replace(/_/g, ' ')}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-mono">
                                        v{doc.currentVersion} •{' '}
                                        {doc.updatedAt
                                          ? new Date(doc.updatedAt).toLocaleDateString('en-IN', {
                                              day: 'numeric',
                                              month: 'short',
                                            })
                                          : 'Recent'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5">
                                    <Badge status={doc.status} size="sm" />
                                    {isPending && !isSelectedDoc && (
                                      <span className="text-[10px] font-extrabold text-blue-700 hover:underline">
                                        Review →
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 2 (7 cols): CANDIDATE DOSSIER, PREVIEW & CONSOLE  */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-4">
            {selectedDoc && currentStudentGroup ? (
              <>
                {/* ACTIVE CANDIDATE DOSSIER BANNER */}
                <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                        {currentStudentGroup.studentName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-black text-slate-900">
                            {currentStudentGroup.studentName}
                          </h2>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            URN: {currentStudentGroup.rollNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {currentStudentGroup.course} • {currentStudentGroup.department} • Semester {currentStudentGroup.semester}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                        {currentStudentGroup.category} (PMS SC)
                      </span>
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                        ₹{formatIndianCurrency(currentStudentGroup.familyIncome)}/yr
                      </span>
                    </div>
                  </div>

                  {/* DOCUMENT SWITCHER TABS FOR THIS CANDIDATE */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Candidate Certificates ({currentStudentGroup.documents.length})
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Click tab to inspect different certificates of this student
                      </span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {currentStudentGroup.documents.map((doc) => {
                        const isDocActive = selectedDoc._id === doc._id;
                        const isPending =
                          doc.status === 'PENDING' || doc.status === 'UNDER_REVIEW';

                        return (
                          <button
                            key={doc._id}
                            type="button"
                            onClick={() => setSelectedDoc(doc)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                              isDocActive
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30'
                                : isPending
                                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                            }`}
                          >
                            {doc.status === 'VERIFIED' ? (
                              <CheckCircle2
                                className={`h-3.5 w-3.5 ${
                                  isDocActive ? 'text-white' : 'text-emerald-600'
                                }`}
                              />
                            ) : isPending ? (
                              <Clock
                                className={`h-3.5 w-3.5 ${
                                  isDocActive ? 'text-white' : 'text-amber-600'
                                }`}
                              />
                            ) : (
                              <AlertTriangle
                                className={`h-3.5 w-3.5 ${
                                  isDocActive ? 'text-white' : 'text-rose-600'
                                }`}
                              />
                            )}
                            <span className="truncate max-w-[150px]">
                              {doc.title || doc.documentType?.replace(/_/g, ' ')}
                            </span>
                            <span
                              className={`text-[9px] px-1 rounded font-mono ${
                                isDocActive
                                  ? 'bg-blue-700 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              v{doc.currentVersion}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SIDE-BY-SIDE: Visual Inspection + Officer Decision */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* DOCUMENT VISUAL INSPECTION FRAME (7 cols md) */}
                  <div className="md:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      {/* Document Meta Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-slate-900">
                              {selectedDoc.title || selectedDoc.documentType?.replace(/_/g, ' ')}
                            </h3>
                            <Badge status={selectedDoc.status} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Uploaded:{' '}
                            {latestVer?.uploadedAt
                              ? new Date(latestVer.uploadedAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recent'}
                          </p>
                        </div>

                        {/* Zoom & Raw actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                            title="Zoom Out"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            <ZoomOut className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-[10px] font-mono font-bold text-slate-500 px-1">
                            {zoomLevel}%
                          </span>
                          <button
                            type="button"
                            onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                            title="Zoom In"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            <ZoomIn className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setZoomLevel(100)}
                            title="Reset Zoom"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Frame Content */}
                      <div className="mt-3">
                        {latestVer?.fileUrl &&
                        /\.(jpg|jpeg|png|webp|bmp|gif|svg|avif|jfif)$/i.test(latestVer.fileUrl) ? (
                          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-3 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                                {latestVer.originalName || 'Scanned Certificate'}
                              </span>
                              <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded font-mono uppercase">
                                Scan View
                              </span>
                            </div>

                            <div className="py-2 w-full flex items-center justify-center max-h-[320px] overflow-auto bg-slate-900/60 rounded-xl my-2">
                              <img
                                src={latestVer.fileUrl}
                                alt={selectedDoc.title}
                                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                                className="max-h-[300px] max-w-full object-contain rounded-lg shadow-md transition-transform"
                              />
                            </div>

                            <div className="w-full pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Official Document Upload</span>
                              <a
                                href={latestVer.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-300 font-bold underline flex items-center gap-1"
                              >
                                <span>Open Full Window</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          /* Official Certificate Card Preview */
                          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 shadow-inner min-h-[260px] flex flex-col justify-between">
                            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                                  Government of Punjab / Institutional Registry
                                </p>
                                <h4 className="text-sm font-black mt-0.5">
                                  {selectedDoc.documentType?.replace(/_/g, ' ') || 'CERTIFICATE'}
                                </h4>
                              </div>
                              <Building2 className="h-6 w-6 text-blue-400" />
                            </div>

                            <div className="my-3 space-y-1.5 text-xs font-mono">
                              <p className="text-slate-300">
                                CANDIDATE:{' '}
                                <span className="text-white font-bold">
                                  {currentStudentGroup.studentName}
                                </span>
                              </p>
                              <p className="text-slate-300">
                                URN ROLL NO:{' '}
                                <span className="text-blue-300 font-bold">
                                  {currentStudentGroup.rollNumber}
                                </span>
                              </p>
                              <p className="text-slate-300">
                                FILE NAME:{' '}
                                <span className="text-emerald-400 font-bold">
                                  {latestVer?.originalName || 'certificate.pdf'}
                                </span>
                              </p>
                              <p className="text-slate-300">
                                FILE SIZE:{' '}
                                <span className="text-slate-200">
                                  {latestVer?.fileSize
                                    ? `${(latestVer.fileSize / 1024).toFixed(1)} KB`
                                    : 'Verified Document'}
                                </span>
                              </p>
                            </div>

                            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                              {latestVer?.fileUrl ? (
                                <a
                                  href={latestVer.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-300 hover:text-white font-bold underline flex items-center gap-1.5"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Open PDF in New Tab</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-slate-400">File uploaded in secure storage</span>
                              )}
                              <span className="text-emerald-400 font-bold font-mono text-[10px]">
                                SHA-256 Digest Logged
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scrutiny Checkpoints Notice */}
                    <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-[11px] text-blue-900 space-y-1">
                      <div className="font-extrabold flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-blue-700" />
                        <span>Faculty Scrutiny Checklist</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Verify that the certificate is issued by a competent Punjab authority (SDM/Tehsildar), applicant name matches university roll number, and date falls within the current financial year.
                      </p>
                    </div>
                  </div>

                  {/* OFFICER DECISION CONSOLE (5 cols md) */}
                  <div className="md:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                          <span>Officer Decision</span>
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400">Step 2 of 2</span>
                      </div>

                      {/* Predefined Rejection / Re-upload Reasons */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Standard Deficiency Reason
                        </label>
                        <select
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="block w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
                        >
                          <option value="Certificate is expired. Upload certificate issued in current financial year (Session 2025–26).">
                            Certificate expired (Needs Session 2025–26)
                          </option>
                          <option value="Blurry or unreadable document scan. Please re-upload high-resolution PDF.">
                            Blurry / illegible scan
                          </option>
                          <option value="Name mismatch between student portal profile and certificate.">
                            Name mismatch detected
                          </option>
                          <option value="Digital signature barcode not verifiable.">
                            Digital signature / barcode unverified
                          </option>
                          <option value="Document missing mandatory issuing authority stamp.">
                            Missing official revenue seal / stamp
                          </option>
                          <option value="Income Certificate exceeds ₹2,50,000 threshold ceiling limit.">
                            Income exceeds ₹2,50,000 ceiling
                          </option>
                        </select>
                      </div>

                      {/* Custom Remarks Textarea */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Reviewer Endorsement Remark
                        </label>
                        <textarea
                          rows={3}
                          value={reviewComments}
                          onChange={(e) => setReviewComments(e.target.value)}
                          placeholder="e.g. Legible revenue seal verified against state e-District portal."
                          className="block w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors leading-relaxed"
                        />
                      </div>

                      {/* Quick Endorsement Phrases */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                          Quick remark suggestions:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {quickRemarks.map((remark, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setReviewComments(remark)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-left font-medium cursor-pointer"
                            >
                              + {remark.slice(0, 28)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* DECISION ACTION BUTTONS */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {/* Approve Button */}
                      <button
                        onClick={handleVerify}
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{processing ? 'Processing...' : 'Approve & Verify Document ✓'}</span>
                      </button>

                      {/* Request Re-upload Button */}
                      <button
                        onClick={() => handleRejectOrReupload(true)}
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Request Candidate Re-upload ↻</span>
                      </button>

                      {/* Outright Reject Button */}
                      <button
                        onClick={() => handleRejectOrReupload(false)}
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject Certificate ✕</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* No Document Selected State */
              <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center shadow-xs">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Select a Candidate Certificate</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click on any student card or document in the left panel to begin side-by-side verification.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
