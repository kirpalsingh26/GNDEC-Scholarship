import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  FileCheck2,
  FolderLock,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wallet,
  ShieldCheck,
  ExternalLink,
  Clock,
  Eye,
  RefreshCw,
  Upload,
  Lock,
  Info,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { StatCard } from '../../components/common/StatCard.js';
import { Badge } from '../../components/common/Badge.js';
import { QRModal } from '../../components/common/QRModal.js';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [reuploadingDocType, setReuploadingDocType] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/students/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // If new student has not uploaded documents yet, automatically redirect to document submission page
  useEffect(() => {
    if (!loading && data && data.onboardingStage === 'DOCUMENTS_REQUIRED') {
      navigate('/student/submit-documents');
    }
  }, [loading, data, navigate]);

  const latestApp = data?.latestApplication || data?.applications?.[0];
  const kpis = data?.kpis;
  const documents: any[] = data?.documents || [];
  const isVerified = data?.isVerified === true;
  const onboardingStage = data?.onboardingStage || 'PENDING_VERIFICATION';

  const familyIncome = profile?.familyIncome || 180000;
  const isIncomeEligible = familyIncome <= 250000;

  // Handle quick re-upload directly from dashboard if officer requested it
  const handleQuickReupload = async (docType: string, file: File) => {
    if (!file) return;
    setReuploadingDocType(docType);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);
    formData.append('title', docType.replace(/_/g, ' '));
    if (latestApp?._id) formData.append('applicationId', latestApp._id);

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        addToast('success', `${docType.replace(/_/g, ' ')} re-uploaded successfully.`);
        await fetchDashboard();
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to re-upload document.');
    } finally {
      setReuploadingDocType(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        <div className="h-7 w-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-2" />
        Loading your scholarship workspace...
      </div>
    );
  }

  // =========================================================================
  // VIEW A: PENDING VERIFICATION STATE (Student submitted documents, awaiting officer review)
  // =========================================================================
  if (!isVerified) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        {/* Top Status Banner */}
        <div className="rounded-2xl bg-[#0b2341] p-6 sm:p-7 text-white shadow-md border border-amber-500/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2.5 border border-amber-500/30">
                <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                <span>Verification In Progress • Dr. B.R. Ambedkar PMS Scheme</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {profile?.firstName || user?.name}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Your application <span className="font-mono font-bold text-amber-300">#{latestApp?.applicationNumber || 'GNDEC-PMS-SUBMITTED'}</span> and mandatory certificates have been submitted to the GNDEC Scholarship Verification Committee. Officer verification and administrative approval are currently in progress.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0b2341] font-black text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                View ID Pass Status
              </button>
              <button
                onClick={() => navigate('/student/documents')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
              >
                <FolderLock className="h-4 w-4 text-amber-300" />
                Document Vault
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="PMS Application Status"
            value={latestApp ? latestApp.status.replace(/_/g, ' ') : 'SUBMITTED'}
            subtitle="Under Officer Scrutiny"
            icon={Clock}
            iconColor="text-amber-700"
            iconBg="bg-amber-50"
            onClick={() => navigate('/student/applications')}
          />

          <StatCard
            title="Student ID Pass"
            value="PENDING VERIFICATION"
            subtitle="ID Card Locked until Approved"
            icon={Lock}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            onClick={() => setIsQRModalOpen(true)}
          />

          <StatCard
            title="Annual Family Income"
            value={`₹${(familyIncome / 100000).toFixed(2)} Lakh`}
            subtitle="Income seal under verification"
            icon={Wallet}
            iconColor="text-blue-700"
            iconBg="bg-blue-50"
            onClick={() => navigate('/student/profile')}
          />

          <StatCard
            title="Uploaded Documents"
            value={`${kpis?.verifiedDocuments || 0} / ${documents.length || 6} Verified`}
            subtitle="Committee review in progress"
            icon={FileCheck2}
            iconColor="text-indigo-700"
            iconBg="bg-indigo-50"
            onClick={() => navigate('/student/documents')}
          />
        </div>

        {/* Unverified ID Alert Banner */}
        <div className="rounded-2xl bg-amber-50/90 border border-amber-300 p-5 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="h-5 w-5 text-amber-700" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950">
                  Institutional ID Status: Pending Officer Verification
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Not Pre-Verified
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                In compliance with Punjab Government Post-Matric Scholarship guidelines, your student ID and digital verification pass are not pre-verified. Official certification will be granted automatically as soon as the GNDEC verification committee authenticates your caste certificate, income certificate, and Punjab domicile.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Step Verification Workflow Progress Tracker */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-amber-600" />
                Post-Matric Scholarship (PMS) Verification Pipeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students (Punjab)
              </p>
            </div>
            {latestApp && <Badge status={latestApp.status} />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              {
                step: '1',
                title: 'Account Registration',
                desc: 'Student profile created',
                status: 'DONE',
              },
              {
                step: '2',
                title: 'Certificates Uploaded',
                desc: `${documents.length} certificates filed`,
                status: 'DONE',
              },
              {
                step: '3',
                title: 'Officer Scrutiny',
                desc: 'Authenticating state records',
                status: 'CURRENT',
              },
              {
                step: '4',
                title: 'Committee Approval',
                desc: '100% Fee waiver unlock',
                status: 'PENDING',
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  s.status === 'DONE'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : s.status === 'CURRENT'
                    ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      s.status === 'DONE'
                        ? 'bg-emerald-600 text-white'
                        : s.status === 'CURRENT'
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {s.step}
                  </span>
                  {s.status === 'DONE' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  {s.status === 'CURRENT' && <Clock className="h-4 w-4 text-amber-600" />}
                </div>
                <p className="text-xs font-bold text-slate-900">{s.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Uploaded Documents Scrutiny Table */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderLock className="h-4 w-4 text-indigo-600" />
                Submitted Mandatory Certificates Status
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time review status of your uploaded documents from the GNDEC Scholarship Cell
              </p>
            </div>
            <button
              onClick={() => navigate('/student/documents')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Open Vault <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Certificate Type</th>
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-3">Review Status</th>
                  <th className="py-3 px-3">Officer Feedback</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc: any) => {
                  const latestVer = doc.versions?.find((v: any) => v.versionNumber === doc.currentVersion);
                  const isReupload = doc.status === 'REUPLOAD_REQUIRED';

                  return (
                    <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 block">{doc.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {doc.documentType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">v{doc.currentVersion}</td>
                      <td className="py-3.5 px-3">
                        <Badge status={doc.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-3">
                        {isReupload ? (
                          <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                            <span className="font-bold">Re-upload required: </span>
                            {latestVer?.rejectionReason || 'Please upload a clearer official copy.'}
                          </div>
                        ) : doc.status === 'VERIFIED' ? (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            ✓ Verified by Scholarship Officer
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Pending officer review...
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {latestVer?.fileUrl && (
                            <a
                              href={latestVer.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </a>
                          )}
                          {isReupload && (
                            <label className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg cursor-pointer flex items-center gap-1">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                disabled={reuploadingDocType === doc.documentType}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleQuickReupload(doc.documentType, f);
                                }}
                              />
                              <Upload className="h-3 w-3" />
                              {reuploadingDocType === doc.documentType ? 'Uploading...' : 'Re-upload'}
                            </label>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PMS Criteria Under Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              PMS Criteria Authentication Checklist
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Social Category</p>
                  <p className="text-[11px] text-slate-500">Scheduled Caste (SC)</p>
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Certificate Submitted ⏳
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Annual Income Ceiling</p>
                  <p className="text-[11px] text-slate-500">Declared: ₹{(familyIncome / 100000).toFixed(2)}L (Limit: ≤ ₹2.50L)</p>
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  SDM Seal Under Scrutiny ⏳
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Punjab Domicile</p>
                  <p className="text-[11px] text-slate-500">Permanent Resident Certificate</p>
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Submitted ⏳
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Bank DBT Linking</p>
                  <p className="text-[11px] text-slate-500">Aadhaar Seeded Account</p>
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Details Logged ⏳
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="h-4 w-4 text-indigo-600" />
                GNDEC Scholarship Verification Cell Contact
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                If you have queries regarding physical document verification or your Dr. Ambedkar portal application, visit the College Scholarship Cell:
              </p>
              <div className="mt-3 space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p><strong>Office:</strong> Room #104, Administrative Block, GNDEC Ludhiana</p>
                <p><strong>Phone:</strong> 0161-2502700 (Ext. 204)</p>
                <p><strong>Email:</strong> scholarship@gndec.ac.in</p>
                <p><strong>Hours:</strong> Mon–Fri, 9:00 AM – 4:30 PM</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href="https://scholarships.punjab.gov.in"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                Verify Freeship Card on State Portal
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* QR Modal Component */}
        <QRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          profile={profile}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW B: APPROVED STATE (Teacher / Admin approved application & all documents)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Welcome Institutional Banner */}
      <div className="rounded-2xl bg-[#0b2341] p-6 sm:p-7 text-white shadow-md border border-amber-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2.5 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>PMS Scholarship Approved & Officially Certified • Session 2025–26</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {profile?.firstName || user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              University Roll No: <span className="font-mono font-bold text-amber-300">{profile?.rollNumber || '2104501'}</span> •{' '}
              {profile?.department || 'Computer Science and Engineering'} (Sem {profile?.semester || 5}) •{' '}
              <span className="font-bold text-emerald-400">Category: SC Verified ✓</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Verified ID Pass
            </button>
            <button
              onClick={() => navigate('/student/documents')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              <FolderLock className="h-4 w-4 text-amber-300" />
              Document Vault
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="PMS Application Status"
          value={latestApp ? latestApp.status.replace(/_/g, ' ') : 'APPROVED'}
          subtitle="Dr. Ambedkar PMS Scheme"
          icon={FileCheck2}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
          onClick={() => navigate('/student/applications')}
        />

        <StatCard
          title="Social Category"
          value="SC"
          subtitle="Scheduled Caste (Certified ✓)"
          icon={ShieldCheck}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
          onClick={() => navigate('/student/profile')}
        />

        <StatCard
          title="Annual Family Income"
          value={`₹${(familyIncome / 100000).toFixed(2)} Lakh`}
          subtitle={isIncomeEligible ? '≤ ₹2.50 Lakh Limit (Certified ✓)' : 'Exceeds PMS Limit'}
          icon={Wallet}
          iconColor={isIncomeEligible ? 'text-amber-700' : 'text-rose-600'}
          iconBg={isIncomeEligible ? 'bg-amber-50' : 'bg-rose-50'}
          onClick={() => navigate('/student/profile')}
        />

        <StatCard
          title="Verified Documents"
          value={`${kpis?.verifiedDocuments || documents.length} / ${documents.length || 6}`}
          subtitle="All Certificates Certified ✓"
          icon={CheckCircle2}
          iconColor="text-blue-700"
          iconBg="bg-blue-50"
          onClick={() => navigate('/student/documents')}
        />
      </div>

      {/* Application Lifecycle Tracker */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-emerald-600" />
              Post-Matric Scholarship (PMS) Application Progress
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students (Punjab)
            </p>
          </div>
          {latestApp && <Badge status={latestApp.status} />}
        </div>

        {/* 5-Step Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {[
            { step: '1', title: 'State Freeship Card', desc: 'Applied on State Portal', done: true },
            { step: '2', title: 'College Application', desc: 'GNDEC PMS form logged', done: true },
            { step: '3', title: 'Document Scrutiny', desc: 'SC & Income certified', done: true },
            { step: '4', title: 'Committee Approval', desc: 'GNDEC Welfare approval', done: true },
            { step: '5', title: '100% Fee Exemption', desc: 'DBT Grant released', done: true },
          ].map((s, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border bg-emerald-50/70 border-emerald-300 text-emerald-950 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-600 text-white">
                  {s.step}
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-slate-900">{s.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Split Section: PMS Eligibility Checklist + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#0b2341] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                PMS SC Eligibility Certified Checklist
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified Scholar ✓
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Verified against Punjab Social Justice & Welfare Department criteria:
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Social Category</p>
                  <p className="text-[11px] text-slate-500">Scheduled Caste (SC)</p>
                </div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Certified ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Family Income Ceiling</p>
                  <p className="text-[11px] text-slate-500">Declared: ₹{(familyIncome / 100000).toFixed(2)}L (Limit: ≤ ₹2.50L)</p>
                </div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Compliant ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">State Domicile</p>
                  <p className="text-[11px] text-slate-500">Punjab Permanent Resident</p>
                </div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Verified ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">DBT Bank Account Status</p>
                  <p className="text-[11px] text-slate-500">Aadhaar Seeded & Active</p>
                </div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Linked ✓
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <a
              href="https://scholarships.punjab.gov.in"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              Verify on Punjab Dr. Ambedkar Portal
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Access Action Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/student/scholarships')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">PMS Scheme Guidelines</h4>
              <p className="text-xs text-slate-500 mt-1">
                View 100% fee waiver terms, maintenance allowances, and state government circulars.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-amber-800 flex items-center gap-1">
              View Scheme <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          <div
            onClick={() => navigate('/student/documents')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FolderLock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Document Vault</h4>
              <p className="text-xs text-slate-500 mt-1">
                View verified SC caste certificates, income affidavits, and college receipts.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-emerald-700 flex items-center gap-1">
              Manage Certificates <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          <div
            onClick={() => navigate('/student/renewals')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Annual Renewal</h4>
              <p className="text-xs text-slate-500 mt-1">
                Submit latest semester marksheet and current FY income affidavit to renew ongoing PMS grant.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-blue-700 flex items-center gap-1">
              Submit Renewal <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          <div
            onClick={() => navigate('/student/tickets')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Scholarship Cell Helpdesk</h4>
              <p className="text-xs text-slate-500 mt-1">
                Direct inquiry communication with GNDEC Welfare Officer and Academic Section.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-purple-700 flex items-center gap-1">
              Contact Cell <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      </div>

      {/* QR Modal Component */}
      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        profile={profile}
      />
    </div>
  );
};
