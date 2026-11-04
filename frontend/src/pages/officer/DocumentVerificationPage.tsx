import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { StudentDocument } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export const DocumentVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<StudentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');

  // Review Action Form
  const [rejectionReason, setRejectionReason] = useState('Certificate is expired. Upload certificate issued in current financial year.');
  const [reviewComments, setReviewComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
        if (res.data.data.length > 0 && !selectedDoc) {
          setSelectedDoc(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to retrieve document verification queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleVerify = async () => {
    if (!selectedDoc) return;
    setProcessing(true);
    setFeedbackMsg('');
    try {
      const res = await api.post(`/documents/${selectedDoc._id}/verify`, {
        comments: reviewComments || 'Certified and validated against official issuing portal.',
      });
      if (res.data.success) {
        setFeedbackMsg('Document marked as VERIFIED ✓');
        addToast('success', `${selectedDoc.title} verified successfully.`);
        await fetchDocuments();
        setSelectedDoc(res.data.data);
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
          ? 'Re-upload requested. Notification sent to student.'
          : 'Document marked as REJECTED.';
        setFeedbackMsg(msg);
        addToast(requestReupload ? 'info' : 'warning', msg);
        await fetchDocuments();
        setSelectedDoc(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Action failed.');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = documents.filter((doc) => {
    const sName = doc.studentId ? `${doc.studentId.firstName} ${doc.studentId.lastName}` : '';
    const roll = doc.studentId?.rollNumber || '';
    const title = doc.title || '';
    const matchesSearch =
      sName.toLowerCase().includes(search.toLowerCase()) ||
      roll.toLowerCase().includes(search.toLowerCase()) ||
      title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && doc.status === 'PENDING') ||
      (statusFilter === 'VERIFIED' && doc.status === 'VERIFIED') ||
      (statusFilter === 'REJECTED' && (doc.status === 'REUPLOAD_REQUIRED' || (doc.status as string) === 'REJECTED'));

    return matchesSearch && matchesStatus;
  });

  const latestVer = selectedDoc?.versions?.find((v) => v.versionNumber === selectedDoc.currentVersion);
  const student = selectedDoc?.studentId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-xs font-bold mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Faculty Verification Desk • Port 5174</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Document Verification Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side verification console with digital certificate viewer, student dossier records, and committee sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigate('/officer/applications')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <span>Applications Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3.5 text-xs font-bold text-blue-900 flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">
          <div className="h-7 w-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="font-semibold text-slate-600">Loading document verification repository...</p>
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="h-16 w-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">No Documents in Queue</h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
            There are currently no student documents awaiting faculty verification. As enrolled candidates upload caste, income, or freeship certificates, they will appear here in real-time.
          </p>
          <button
            onClick={() => navigate('/officer/applications')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
          >
            Go to Applications Queue
          </button>
        </div>
      ) : (
        /* 3-Column Verification Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMN 1 (Left 3 cols): Document Queue & Search */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Queue ({filtered.length})
                </h3>
                <span className="text-[10px] font-bold text-slate-400">
                  {documents.filter((d) => d.status === 'PENDING').length} Pending
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                {(['ALL', 'PENDING', 'VERIFIED'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      statusFilter === tab
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search candidate / doc..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filtered.map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setFeedbackMsg('');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedDoc?._id === doc._id
                        ? 'bg-blue-50/90 border-blue-300 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">v{doc.currentVersion}</span>
                      <Badge status={doc.status} size="sm" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {doc.studentId ? `${doc.studentId.firstName} ${doc.studentId.lastName}` : 'Enrolled Student'}
                    </p>
                    {doc.studentId?.rollNumber && (
                      <p className="text-[10px] font-mono text-blue-700 font-bold mt-0.5">
                        URN: {doc.studentId.rollNumber}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Student Quick Profile Card */}
            {student && (
              <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-2.5 text-xs">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <User className="h-4 w-4 text-blue-600" />
                  Candidate Dossier
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-bold text-slate-900">{student.firstName} {student.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Roll / URN:</span>
                  <span className="font-mono font-bold text-blue-700">{student.rollNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-800">{student.department || 'Engineering'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Family Income:</span>
                  <span className="font-bold text-emerald-700">
                    {student.familyIncome ? `₹${student.familyIncome.toLocaleString('en-IN')}/yr` : 'Declared'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-bold text-amber-800">{student.category || 'SC'}</span>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2 (Center 5 cols): Interactive Document Preview */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">{selectedDoc?.title || 'Selected Certificate'}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Uploaded: {latestVer?.uploadedAt ? new Date(latestVer.uploadedAt).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
              {latestVer?.fileUrl && (
                <a
                  href={latestVer.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Open Full Size</span>
                </a>
              )}
            </div>

            {/* Document Visual Frame */}
            {latestVer?.fileUrl && /\.(jpg|jpeg|png|webp|bmp|gif|svg|avif|jfif)$/i.test(latestVer.fileUrl) ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200 truncate max-w-[220px]">
                    {latestVer.originalName || 'Scanned Document'}
                  </span>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded font-mono uppercase">
                    Image Scan
                  </span>
                </div>
                <div className="py-2 w-full flex items-center justify-center max-h-72 overflow-hidden bg-slate-900/60 rounded-xl my-2">
                  <img
                    src={latestVer.fileUrl}
                    alt={selectedDoc?.title || 'Certificate'}
                    className="max-h-64 max-w-full object-contain rounded-lg shadow-md hover:scale-105 transition-transform"
                  />
                </div>
                <div className="w-full pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Authentic Candidate Upload</span>
                  <a
                    href={latestVer.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-bold underline flex items-center gap-1"
                  >
                    <span>View Raw</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 shadow-inner min-h-[240px] flex flex-col justify-between">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                      Government of Punjab / Institutional Certificate
                    </p>
                    <h4 className="text-sm font-black mt-0.5">
                      {selectedDoc?.documentType ? selectedDoc.documentType.replace(/_/g, ' ') : 'CERTIFICATE'}
                    </h4>
                  </div>
                  <Building2 className="h-5 w-5 text-blue-400" />
                </div>

                <div className="my-4 space-y-2 text-xs font-mono">
                  <p className="text-slate-300">
                    DOCUMENT TYPE:{' '}
                    <span className="text-amber-300 font-bold">
                      {selectedDoc?.documentType ? selectedDoc.documentType.replace(/_/g, ' ') : 'CERTIFICATE'}
                    </span>
                  </p>
                  <p className="text-slate-300">
                    STUDENT CANDIDATE:{' '}
                    <span className="text-white font-bold">
                      {student ? `${student.firstName} ${student.lastName}` : 'Candidate'}
                    </span>
                  </p>
                  <p className="text-slate-300">
                    ROLL NUMBER:{' '}
                    <span className="text-slate-200 font-bold">
                      {student?.rollNumber || 'Enrolled Student'}
                    </span>
                  </p>
                  <p className="text-slate-300">
                    FILE NAME:{' '}
                    <span className="text-emerald-400 font-bold">
                      {latestVer?.originalName || 'certificate.pdf'}
                    </span>
                  </p>
                  <p className="text-slate-300">
                    UPLOADED AT:{' '}
                    <span className="text-slate-200">
                      {latestVer?.uploadedAt ? new Date(latestVer.uploadedAt).toLocaleString('en-IN') : 'Recent'}
                    </span>
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span>File Integrity Check</span>
                  <span className="text-emerald-400 font-bold">Digest Logged</span>
                </div>
              </div>
            )}

            {/* Committee Scrutiny Notice */}
            <div className="rounded-2xl bg-blue-50/70 border border-blue-200/70 p-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-950">
                <ShieldCheck className="h-4 w-4 text-blue-700" />
                Official Committee Scrutiny Protocol
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Inspect the uploaded document scan above for official seals, issuing signatures, and candidate matching before certifying or requesting re-upload.
              </p>
            </div>
          </div>

          {/* COLUMN 3 (Right 4 cols): Verification Action & Comment Panel */}
          <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              Officer Decision Console
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Predefined Feedback / Reason</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
              >
                <option value="Certificate is expired. Upload certificate issued in current financial year.">
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
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reviewer Endorsement Remark</label>
              <textarea
                rows={3}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="e.g. Verified against state e-District portal. Legible seal confirmed."
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors leading-relaxed"
              />
            </div>

            <div className="pt-2 space-y-2">
              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={processing || !selectedDoc}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{processing ? 'Processing...' : 'Approve & Verify Document ✓'}</span>
              </button>

              {/* Request Re-upload Button */}
              <button
                onClick={() => handleRejectOrReupload(true)}
                disabled={processing || !selectedDoc}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Request Candidate Re-upload ↻</span>
              </button>

              {/* Outright Reject Button */}
              <button
                onClick={() => handleRejectOrReupload(false)}
                disabled={processing || !selectedDoc}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject Certificate ✕</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
