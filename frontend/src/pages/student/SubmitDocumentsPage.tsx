import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Eye,
  RefreshCw,
  FolderLock,
  ArrowRight,
  FileCheck2,
  Lock,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { DocumentType } from '../../types/index.js';

interface DocRequirement {
  type: DocumentType;
  title: string;
  subtitle: string;
  guidance: string;
  isMandatory: boolean;
}

const REQUIRED_DOCS_CONFIG: DocRequirement[] = [
  {
    type: 'CASTE_CERTIFICATE',
    title: 'Scheduled Caste (SC) Certificate',
    subtitle: 'Punjab State Competent Authority (SDM / Tehsildar)',
    guidance: 'Mandatory proof of SC category. Official revenue barcode or digital seal must be legible.',
    isMandatory: true,
  },
  {
    type: 'INCOME_CERTIFICATE',
    title: 'Annual Family Income Certificate',
    subtitle: 'SDM / Tehsildar issued for Session 2025–26',
    guidance: 'Total family income must be ≤ ₹2,50,000/yr per Punjab Post-Matric Scholarship rules.',
    isMandatory: true,
  },
  {
    type: 'RESIDENCE_CERTIFICATE',
    title: 'Punjab Residence / Domicile Certificate',
    subtitle: 'Proof of Permanent Punjab Domicile',
    guidance: 'Certifies bonafide resident status of Punjab state.',
    isMandatory: true,
  },
  {
    type: 'FEE_RECEIPT',
    title: 'Punjab State Freeship Card / Admission Fee Slip',
    subtitle: 'Dr. Ambedkar Portal (scholarships.punjab.gov.in) Card',
    guidance: 'Downloaded Freeship Card from state portal or college fee deposit receipt.',
    isMandatory: true,
  },
  {
    type: 'IDENTITY_PROOF',
    title: 'Aadhaar Card (DBT Seeded)',
    subtitle: 'UIDAI Identity Card',
    guidance: 'Must be active and seeded with your bank account for DBT grant transfers.',
    isMandatory: true,
  },
  {
    type: 'BANK_PROOF',
    title: 'Bank Passbook / Cancelled Cheque',
    subtitle: 'Aadhaar-Linked Active Savings Account',
    guidance: 'Showing student name, Account Number, and bank branch IFSC code.',
    isMandatory: true,
  },
  {
    type: 'ACADEMIC_MARKSHEET',
    title: 'Previous Academic Marksheet / DMC',
    subtitle: 'Latest Examination Marksheet',
    guidance: 'Official DMC of qualifying exam / previous semester issued by IKGPTU or School Board.',
    isMandatory: false,
  },
];

export const SubmitDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { addToast } = useToast();

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, any>>({});
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [pmsSchemeId, setPmsSchemeId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch already uploaded documents and PMS scholarship ID
  useEffect(() => {
    const initPage = async () => {
      try {
        const [docsRes, schRes] = await Promise.all([
          api.get('/documents'),
          api.get('/scholarships'),
        ]);

        if (docsRes.data.success) {
          const map: Record<string, any> = {};
          docsRes.data.data.forEach((d: any) => {
            map[d.documentType] = d;
          });
          setUploadedDocs(map);
        }

        if (schRes.data.success && schRes.data.data.length > 0) {
          // Find PB-PMS-SC or first active scholarship
          const pms =
            schRes.data.data.find((s: any) => s.code === 'PB-PMS-SC') ||
            schRes.data.data[0];
          if (pms) setPmsSchemeId(pms._id);
        }
      } catch (err) {
        console.error('Failed to initialize document submission workspace:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    initPage();
  }, []);

  const handleFileUpload = async (type: DocumentType, file: File) => {
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      addToast('error', 'File size exceeds 25MB limit. Please upload a file under 25MB.');
      return;
    }

    setUploadingType(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', type);
    formData.append('title', type.replace(/_/g, ' '));

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setUploadedDocs((prev) => ({
          ...prev,
          [type]: res.data.data,
        }));
        addToast('success', `${type.replace(/_/g, ' ')} uploaded successfully.`);
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingType(null);
    }
  };

  const mandatoryDocs = REQUIRED_DOCS_CONFIG.filter((d) => d.isMandatory);
  const uploadedMandatoryCount = mandatoryDocs.filter((d) => uploadedDocs[d.type]).length;
  const allMandatoryUploaded = uploadedMandatoryCount === mandatoryDocs.length;
  const progressPercent = Math.round((uploadedMandatoryCount / mandatoryDocs.length) * 100);

  const handleSubmitApplication = async () => {
    if (!allMandatoryUploaded) {
      addToast('warning', 'Please upload all mandatory certificates before submitting.');
      return;
    }

    if (!agreeTerms) {
      addToast('warning', 'Please certify the declaration checkbox to confirm authenticity.');
      return;
    }

    if (!pmsSchemeId) {
      addToast('error', 'PMS Scholarship scheme is currently unavailable. Please contact administration.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/applications', {
        scholarshipId: pmsSchemeId,
      });

      if (res.data.success) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        addToast(
          'success',
          `PMS Application #${res.data.data.applicationNumber} and certificates successfully submitted to the Committee!`
        );

        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-2" />
        Loading document upload workspace...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0b2341] p-6 sm:p-7 text-white shadow-md border border-amber-500/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2.5 border border-amber-500/30">
          <FolderLock className="h-3.5 w-3.5" />
          <span>Step 2 of 2: Mandatory Certificates & Application Filing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Upload Documents for PMS SC Scholarship
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students (Punjab). Upload all mandatory certificates to submit your application for teacher and administrative committee verification.
        </p>
      </div>

      {/* Candidate Profile Summary Box */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Enrolled Candidate Credentials Snapshot
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Name</span>
            <span className="font-bold text-slate-900">{profile?.firstName} {profile?.lastName || user?.name}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Roll Number / URN</span>
            <span className="font-mono font-bold text-indigo-700">{profile?.rollNumber || '2104501'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Social Category</span>
            <span className="font-extrabold text-amber-800">SC (Scheduled Caste)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Family Income</span>
            <span className="font-bold text-emerald-700">₹{(profile?.familyIncome || 180000).toLocaleString('en-IN')}/yr</span>
          </div>
        </div>
      </div>

      {/* Upload Progress Bar Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-bold text-slate-700">
            Mandatory Documents Uploaded: <strong className="text-slate-900">{uploadedMandatoryCount} of {mandatoryDocs.length}</strong>
          </span>
          <span className="font-mono font-extrabold text-indigo-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              allMandatoryUploaded ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {!allMandatoryUploaded && (
          <p className="text-[11px] text-amber-700 font-semibold mt-2 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Please upload all {mandatoryDocs.length} mandatory certificates below to enable application submission.
          </p>
        )}
      </div>

      {/* Documents Upload Grid */}
      <div className="space-y-4">
        {REQUIRED_DOCS_CONFIG.map((req) => {
          const doc = uploadedDocs[req.type];
          const latestVer = doc?.versions?.find((v: any) => v.versionNumber === doc.currentVersion);
          const isUploading = uploadingType === req.type;

          return (
            <div
              key={req.type}
              className={`rounded-2xl border p-5 transition-all ${
                doc
                  ? 'bg-emerald-50/20 border-emerald-200/80 shadow-2xs'
                  : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{req.title}</span>
                    {req.isMandatory ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Optional
                      </span>
                    )}
                    {doc && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Uploaded ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-600">{req.subtitle}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{req.guidance}</p>

                  {doc && latestVer && (
                    <div className="mt-2 text-[11px] font-mono text-emerald-800 flex items-center gap-3">
                      <span>File: {latestVer.originalName}</span>
                      <span>•</span>
                      <span>{(latestVer.fileSize / 1024).toFixed(0)} KB</span>
                      {latestVer.fileUrl && (
                        <a
                          href={latestVer.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View File
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload Button / File Picker */}
                <div className="shrink-0 flex items-center gap-2">
                  <label
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                      isUploading
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : doc
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:scale-[1.01]'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff,.tif,.heic,.heif,.avif,.jfif,.doc,.docx,.xls,.xlsx,.txt"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(req.type, file);
                      }}
                      className="hidden"
                    />
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : doc ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                        <span>Replace File</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Select Certificate</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certification Declaration & Final Submission Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            I solemnly declare that all certificates uploaded above are authentic documents issued by the Government of Punjab Competent Authority. I confirm that I am a bonafide student of Guru Nanak Dev Engineering College (GNDEC), belonging to the Scheduled Caste (SC) category of Punjab, with annual family income ≤ ₹2,50,000/-. I authorize the College Verification Officer and Punjab Social Justice Department to verify these records against official state portals.
          </span>
        </label>

        <button
          onClick={handleSubmitApplication}
          disabled={!allMandatoryUploaded || !agreeTerms || submitting}
          className={`w-full py-3.5 text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
            !allMandatoryUploaded || !agreeTerms || submitting
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:scale-[1.01] cursor-pointer'
          }`}
        >
          {submitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Submitting Application to Committee...
            </>
          ) : (
            <>
              <FileCheck2 className="h-4 w-4" />
              Submit Official Application for Teacher / Committee Verification
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {!allMandatoryUploaded && (
          <p className="text-center text-[11px] text-slate-400">
            *Submission is locked until all {mandatoryDocs.length} mandatory certificates are uploaded.
          </p>
        )}
      </div>
    </div>
  );
};
