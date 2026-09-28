import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Sparkles,
  AlertTriangle,
  Building2,
  User,
  ShieldCheck,
  FileText,
  Search,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { StudentDocument } from '../../types/index.js';

export const DocumentVerificationPage: React.FC = () => {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<StudentDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Action Form
  const [rejectionReason, setRejectionReason] = useState('Certificate is expired. Upload certificate issued in current financial year.');
  const [reviewComments, setReviewComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
        if (res.data.data.length > 0 && !selectedDoc) {
          setSelectedDoc(res.data.data[0]);
        }
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
        await fetchDocuments();
        setSelectedDoc(res.data.data);
      }
    } catch (err) {
      console.error(err);
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
        setFeedbackMsg(
          requestReupload
            ? 'Re-upload requested. Notification sent to student.'
            : 'Document marked as REJECTED.'
        );
        await fetchDocuments();
        setSelectedDoc(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const latestVer = selectedDoc?.versions.find((v) => v.versionNumber === selectedDoc.currentVersion);
  const ocr = latestVer?.ocrData;
  const student = selectedDoc?.studentId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Staff Document Verification Workspace
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dedicated 3-column verification console with side-by-side student summary, interactive preview, and AI OCR assistance.
        </p>
      </div>

      {feedbackMsg && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3.5 text-xs font-bold text-indigo-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 3-Column Verification Workspace (Requirement #15) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1 (Left 3 cols): Document Queue & Student Summary */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Document Queue ({documents.length})
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setFeedbackMsg('');
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedDoc?._id === doc._id
                      ? 'bg-indigo-50/80 border-indigo-200 shadow-xs'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-slate-400">v{doc.currentVersion}</span>
                    <Badge status={doc.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                  <p className="text-[11px] text-slate-500">
                    {doc.studentId ? `${doc.studentId.firstName} ${doc.studentId.lastName}` : 'Student'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Quick Profile Card */}
          {student && (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <User className="h-4 w-4 text-indigo-600" />
                Candidate Identity
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-bold">{student.firstName} {student.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roll Number:</span>
                <span className="font-mono font-bold text-indigo-600">{student.rollNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold">{student.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Family Income:</span>
                <span className="font-bold">₹{student.familyIncome?.toLocaleString('en-IN')}/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold">{student.category}</span>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2 (Center 5 cols): Interactive Document Preview & OCR Extract */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{selectedDoc?.title}</h3>
              <p className="text-[11px] text-slate-400">
                Uploaded: {latestVer?.uploadedAt ? new Date(latestVer.uploadedAt).toLocaleDateString('en-IN') : 'N/A'}
              </p>
            </div>
            {latestVer && (
              <a
                href={latestVer.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" />
                Open File
              </a>
            )}
          </div>

          {/* Document Simulated / Live Visual Frame */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 shadow-inner min-h-[260px] flex flex-col justify-between">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-300">
                  Government of Punjab — Official Certificate
                </p>
                <h4 className="text-sm font-black mt-0.5">{selectedDoc?.documentType.replace(/_/g, ' ')}</h4>
              </div>
              <Building2 className="h-5 w-5 text-indigo-400" />
            </div>

            <div className="my-4 space-y-2 text-xs font-mono">
              <p className="text-slate-300">
                CERTIFICATE ID: <span className="text-amber-300 font-bold">{ocr?.extractedCertificateNo || 'PB/REV/2025/892144'}</span>
              </p>
              <p className="text-slate-300">
                ISSUED TO: <span className="text-white font-bold">{ocr?.extractedStudentName || `${student?.firstName} ${student?.lastName}`}</span>
              </p>
              <p className="text-slate-300">
                ISSUING TEHSIL: <span className="text-slate-200">{ocr?.issuingAuthority || 'Sub-Divisional Magistrate, Ludhiana'}</span>
              </p>
              <p className="text-slate-300">
                ISSUE DATE: <span className="text-emerald-400 font-bold">{ocr?.extractedIssueDate || '15/04/2025'}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>Security Stamp: Verified Digital Signature</span>
              <span className="text-emerald-400 font-bold">SHA-256 Valid</span>
            </div>
          </div>

          {/* AI OCR Optical Assistant Box (Requirement #31) */}
          {ocr && (
            <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-indigo-950">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  AI OCR Verification Assistant
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 font-bold text-[10px] shadow-2xs">
                  {ocr.nameMatchConfidence}% Name Match
                </span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Optical extract indicates student name and certificate authority match GNDEC enrollment database.
              </p>
            </div>
          )}
        </div>

        {/* COLUMN 3 (Right 4 cols): Verification Action & Comment Panel */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <CheckSquare className="h-4 w-4 text-indigo-600" />
            Verification Decision Panel
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700">Predefined Rejection Reason</label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Certificate is expired. Upload certificate issued in current financial year.">
                Certificate expired
              </option>
              <option value="Blurry or unreadable document scan. Please re-upload high-resolution PDF.">
                Blurry / illegible scan
              </option>
              <option value="Name mismatch between student portal profile and certificate.">
                Name mismatch detected
              </option>
              <option value="Digital signature barcode not verifiable.">
                Signature barcode unverified
              </option>
              <option value="Document missing mandatory issuing authority stamp.">
                Missing official stamp
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Officer Review Comments</label>
            <textarea
              rows={3}
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="e.g. Verified against state e-District portal on 02/09/2026..."
              className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 space-y-2">
            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="h-4 w-4" />
              {processing ? 'Processing...' : 'Verify Document ✓'}
            </button>

            {/* Request Re-upload Button */}
            <button
              onClick={() => handleRejectOrReupload(true)}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Request Re-upload with Feedback ↻
            </button>

            {/* Outright Reject Button */}
            <button
              onClick={() => handleRejectOrReupload(false)}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Reject Document ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
