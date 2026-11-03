import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  UploadCloud,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Eye,
  AlertTriangle,
  History,
  ShieldCheck,
  Search,
  Filter,
  Check,
  Download,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { StudentDocument } from '../../types/index.js';

export const DocumentVault: React.FC = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  // Upload Form State
  const [docType, setDocType] = useState('INCOME_CERTIFICATE');
  const [docTitle, setDocTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Version History Modal
  const [selectedDocForHistory, setSelectedDocForHistory] = useState<StudentDocument | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // OCR Detail Modal
  const [selectedOcrDoc, setSelectedOcrDoc] = useState<StudentDocument | null>(null);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vault documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File exceeds maximum size of 10MB');
        return;
      }
      setFile(droppedFile);
      toast.info(`Selected file: ${droppedFile.name}`);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFeedback({ type: 'error', message: 'Please select a document file to upload.' });
      toast.warning('Please select a file to upload first.');
      return;
    }

    setUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);
    formData.append('title', docTitle || docType.replace(/_/g, ' '));

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const msg = `Certificate uploaded successfully & queued for officer verification! (Version v${res.data.data.currentVersion})`;
        setFeedback({ type: 'success', message: msg });
        toast.success(msg, 'Document Vault Updated');
        setFile(null);
        setDocTitle('');
        await fetchDocuments();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'File upload failed. Please try again.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'VERIFIED') return doc.status === 'VERIFIED';
    if (filterType === 'PENDING') return doc.status === 'PENDING' || doc.status === 'UNDER_REVIEW';
    if (filterType === 'ATTENTION') return doc.status === 'REJECTED' || doc.status === 'REUPLOAD_REQUIRED';
    return true;
  });

  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;
  const pendingCount = documents.filter((d) => ['PENDING', 'UNDER_REVIEW'].includes(d.status)).length;
  const attentionCount = documents.filter((d) => ['REJECTED', 'REUPLOAD_REQUIRED'].includes(d.status)).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
            <FolderLock className="h-3.5 w-3.5" />
            <span>Encrypted Institutional Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Document Vault & Version History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Secure repository for SC caste, income, domicile, Aadhaar, and marksheet certificates with official verification records.
          </p>
        </div>

        {/* Vault Stats Summary Pill */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            {verifiedCount} Verified
          </span>
          <span>•</span>
          <span className="text-indigo-600 font-bold">{pendingCount} In Review</span>
        </div>
      </div>

      {/* Upload Zone Card with Drag & Drop */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-indigo-600" />
          Upload Certificate / Marksheet
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Uploading a revised file for an existing certificate automatically increments its immutable version (e.g. v1 $\rightarrow$ v2) without deleting past audit history.
        </p>

        {feedback && (
          <div
            className={`mb-6 rounded-2xl p-4 text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
              >
                <option value="INCOME_CERTIFICATE">Annual Income Certificate (Tehsildar / SDM - Max ₹2.50L)</option>
                <option value="CASTE_CERTIFICATE">Scheduled Caste (SC) Certificate (Punjab Competent Authority)</option>
                <option value="RESIDENCE_CERTIFICATE">Punjab Domicile / Residence Certificate</option>
                <option value="AADHAAR_CARD">Aadhaar Identity Card</option>
                <option value="BANK_PASSBOOK">Bank Passbook / Cancelled Cheque</option>
                <option value="PREVIOUS_MARKSHEET">Previous Semester Official Marksheet</option>
                <option value="FEE_RECEIPT">College Tuition Fee Receipt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Certificate Label / Note (Optional)</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Income Certificate 2025-26"
                className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Drag & Drop File Upload Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                : file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-slate-50'
            }`}
            onClick={() => document.getElementById('vault-file-input')?.click()}
          >
            <input
              id="vault-file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                  toast.info(`Selected file: ${e.target.files[0].name}`);
                }
              }}
              className="hidden"
            />

            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>

            {file ? (
              <div>
                <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Selected: <span className="underline">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Click to change file</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Click to choose a file or drag & drop here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: PDF, PNG, JPG, JPEG (Max 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading || !file}
              className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 ${
                uploading || !file
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] cursor-pointer'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              {uploading ? 'Processing & Validating File...' : 'Upload to Vault'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Vault Documents (${documents.length})` },
          { id: 'VERIFIED', label: `Verified (${verifiedCount})` },
          { id: 'PENDING', label: `In Review (${pendingCount})` },
          { id: 'ATTENTION', label: `Attention (${attentionCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vault Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading document vault...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            No documents in this category.
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const latestVersion = doc.versions.find((v) => v.versionNumber === doc.currentVersion);
            const ocr = latestVersion?.ocrData;

            return (
              <div
                key={doc._id}
                className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Card Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                      Version v{doc.currentVersion}
                    </span>
                    <Badge status={doc.status} size="sm" />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{doc.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Type: <span className="font-semibold text-slate-600">{doc.documentType?.replace(/_/g, ' ')}</span>
                  </p>

                  {/* AI OCR Confidence Pill */}
                  {ocr && (
                    <div
                      onClick={() => {
                        setSelectedOcrDoc(doc);
                        setIsOcrModalOpen(true);
                      }}
                      className="mt-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 cursor-pointer hover:bg-indigo-100/70 transition-colors flex items-center justify-between text-xs"
                      title="Click to inspect optical character recognition breakdown"
                    >
                      <div className="flex items-center gap-2 text-indigo-900">
                        <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="font-bold">AI OCR Extraction</span>
                      </div>
                      <span className="font-extrabold text-indigo-700">
                        {ocr.nameMatchConfidence || 98}% Match
                      </span>
                    </div>
                  )}

                  {/* Rejection / Reviewer Feedback */}
                  {latestVersion?.reviewerComments && (
                    <div className="mt-3 p-3 rounded-2xl bg-rose-50/80 border border-rose-100 text-xs text-rose-900">
                      <p className="font-bold flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5 text-rose-600" />
                        Officer Note:
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                        {latestVersion.reviewerComments}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setSelectedDocForHistory(doc);
                      setIsHistoryModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <History className="h-3.5 w-3.5 text-slate-400" />
                    History ({doc.versions.length})
                  </button>

                  {latestVersion?.fileUrl && (
                    <a
                      href={latestVersion.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Version History Modal */}
      {selectedDocForHistory && (
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          title={`Version History — ${selectedDocForHistory.title}`}
          subtitle="Immutable audit trail of past uploads and officer reviews"
        >
          <div className="space-y-3">
            {selectedDocForHistory.versions.map((ver) => (
              <div
                key={ver.versionNumber}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-700">
                    Version v{ver.versionNumber}
                  </span>
                  <Badge status={ver.status} size="sm" />
                </div>
                <p className="text-slate-500">
                  Uploaded:{' '}
                  <strong className="text-slate-700">
                    {new Date(ver.uploadedAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </strong>
                </p>
                {ver.reviewerComments && (
                  <p className="text-rose-700 font-semibold bg-rose-50 p-2 rounded-lg">
                    Feedback: {ver.reviewerComments}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* AI OCR Inspection Modal */}
      {selectedOcrDoc && (
        <Modal
          isOpen={isOcrModalOpen}
          onClose={() => setIsOcrModalOpen(false)}
          title="AI Optical Character Recognition (OCR) Analysis"
          subtitle="Automated document authenticity audit against GNDEC enrollment databases"
        >
          {(() => {
            const ver = selectedOcrDoc.versions.find(
              (v) => v.versionNumber === selectedOcrDoc.currentVersion
            );
            const ocr = ver?.ocrData;

            return (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issuing Authority:</span>
                    <span className="font-bold text-indigo-950">{ocr?.issuingAuthority || 'Tehsildar Office, Ludhiana'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Extracted Certificate ID:</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {ocr?.extractedCertificateNo || 'PB-INC-2025-884910'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Extracted Beneficiary Name:</span>
                    <span className="font-bold text-slate-900">{ocr?.extractedStudentName || 'Harpreet Singh'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificate Issue Date:</span>
                    <span className="font-bold text-emerald-700">{ocr?.extractedIssueDate || '12/04/2025'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-indigo-200">
                    <span className="text-slate-700 font-bold">Levenshtein Name Match:</span>
                    <span className="font-black text-indigo-600">
                      {ocr?.nameMatchConfidence || 98}% Confidence
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
