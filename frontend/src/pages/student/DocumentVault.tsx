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
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { Modal } from '../../components/common/Modal.js';
import { StudentDocument } from '../../types/index.js';

export const DocumentVault: React.FC = () => {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [docType, setDocType] = useState('INCOME_CERTIFICATE');
  const [docTitle, setDocTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFeedback({ type: 'error', message: 'Please select a document file to upload.' });
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
        setFeedback({
          type: 'success',
          message: 'Certificate uploaded successfully & queued for staff verification! (v' + res.data.data.currentVersion + ')',
        });
        setFile(null);
        setDocTitle('');
        await fetchDocuments();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'File upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Document Vault & Version Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Secure, tamper-evident repository for verified income, caste, Aadhaar, and grade marksheets with immutable audit history.
        </p>
      </div>

      {/* Upload Zone Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-indigo-600" />
          Upload New Certificate / Marksheet
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Uploading an updated certificate for an existing document type automatically increments its immutable version (e.g. v1 $\rightarrow$ v2) without deleting past audit history.
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

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="mt-1 block w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="INCOME_CERTIFICATE">Annual Income Certificate (Tehsildar / SDM)</option>
              <option value="CASTE_CERTIFICATE">Caste / Category Certificate (SC/ST/OBC)</option>
              <option value="RESIDENCE_CERTIFICATE">Punjab Domicile / Residence Certificate</option>
              <option value="AADHAAR_CARD">Aadhaar Identity Card</option>
              <option value="BANK_PASSBOOK">Bank Passbook / Cancelled Cheque</option>
              <option value="PREVIOUS_MARKSHEET">Previous Semester Official Marksheet</option>
              <option value="FEE_RECEIPT">College Tuition Fee Receipt</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Certificate Custom Label</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Income Certificate 2025-26"
              className="mt-1 block w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Select PDF / Image File</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:scale-[1.01] flex items-center gap-2"
            >
              <UploadCloud className="h-4 w-4" />
              {uploading ? 'Processing File & AI OCR...' : 'Upload to Vault'}
            </button>
          </div>
        </form>
      </div>

      {/* Vault Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => {
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                    Version v{doc.currentVersion}
                  </span>
                  <Badge status={doc.status} size="sm" />
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{doc.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type: <span className="font-semibold text-slate-600">{doc.documentType}</span>
                </p>

                {/* AI OCR Confidence Pill */}
                {ocr && (
                  <div
                    onClick={() => {
                      setSelectedOcrDoc(doc);
                      setIsOcrModalOpen(true);
                    }}
                    className="mt-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 cursor-pointer hover:bg-indigo-100/70 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 text-indigo-900">
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-bold">AI OCR Extraction</span>
                    </div>
                    <span className="font-extrabold text-indigo-700">
                      {ocr.nameMatchConfidence}% Match
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
                  className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-slate-900"
                >
                  <History className="h-3.5 w-3.5 text-slate-400" />
                  History ({doc.versions.length})
                </button>

                {latestVersion?.fileUrl && (
                  <a
                    href={latestVersion.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Version History Drawer / Modal */}
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
                    <span className="font-bold text-indigo-950">{ocr?.issuingAuthority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Extracted Certificate ID:</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {ocr?.extractedCertificateNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Extracted Beneficiary Name:</span>
                    <span className="font-bold text-slate-900">{ocr?.extractedStudentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificate Issue Date:</span>
                    <span className="font-bold text-emerald-700">{ocr?.extractedIssueDate}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-indigo-200">
                    <span className="text-slate-700 font-bold">Levenshtein Name Match:</span>
                    <span className="font-black text-indigo-600">
                      {ocr?.nameMatchConfidence}% Confidence
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
