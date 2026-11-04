import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  GraduationCap,
  FileSpreadsheet,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  RefreshCw,
  FileText,
  Check,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.js';
import { Badge } from '../../components/common/Badge.js';
import { Modal } from '../../components/common/Modal.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

interface SubjectEntry {
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxMarks?: number;
  grade: string;
  gradePoints: number;
  status: 'PASS' | 'FAIL' | 'ABSENT';
}

interface AcademicRecordItem {
  _id: string;
  semester: number;
  academicYear: string;
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  earnedCredits: number;
  backlogs: number;
  subjects: SubjectEntry[];
  updatedAt: string;
}

const GNDEC_SAMPLE_TEMPLATE: SubjectEntry[] = [
  {
    subjectCode: 'BTCS-501',
    subjectName: 'Database Management Systems',
    credits: 4,
    internalMarks: 42,
    externalMarks: 45,
    totalMarks: 87,
    maxMarks: 100,
    grade: 'A+',
    gradePoints: 9,
    status: 'PASS',
  },
  {
    subjectCode: 'BTCS-502',
    subjectName: 'Formal Language & Automata Theory',
    credits: 4,
    internalMarks: 38,
    externalMarks: 40,
    totalMarks: 78,
    maxMarks: 100,
    grade: 'A',
    gradePoints: 8,
    status: 'PASS',
  },
  {
    subjectCode: 'BTCS-503',
    subjectName: 'Software Engineering & Agile Methodologies',
    credits: 4,
    internalMarks: 44,
    externalMarks: 46,
    totalMarks: 90,
    maxMarks: 100,
    grade: 'O',
    gradePoints: 10,
    status: 'PASS',
  },
  {
    subjectCode: 'BTCS-504',
    subjectName: 'Computer Networks & Internet Protocols',
    credits: 4,
    internalMarks: 40,
    externalMarks: 42,
    totalMarks: 82,
    maxMarks: 100,
    grade: 'A+',
    gradePoints: 9,
    status: 'PASS',
  },
  {
    subjectCode: 'BTCS-505',
    subjectName: 'Database Management Systems Laboratory',
    credits: 1,
    internalMarks: 46,
    externalMarks: 47,
    totalMarks: 93,
    maxMarks: 100,
    grade: 'O',
    gradePoints: 10,
    status: 'PASS',
  },
  {
    subjectCode: 'BTCS-506',
    subjectName: 'Computer Networks Laboratory',
    credits: 1,
    internalMarks: 43,
    externalMarks: 45,
    totalMarks: 88,
    maxMarks: 100,
    grade: 'A+',
    gradePoints: 9,
    status: 'PASS',
  },
];

const computeGrade = (total: number) => {
  if (total >= 90) return { grade: 'O', points: 10 };
  if (total >= 80) return { grade: 'A+', points: 9 };
  if (total >= 70) return { grade: 'A', points: 8 };
  if (total >= 60) return { grade: 'B+', points: 7 };
  if (total >= 50) return { grade: 'B', points: 6 };
  if (total >= 40) return { grade: 'C', points: 5 };
  return { grade: 'F', points: 0 };
};

const createEmptySubject = (): SubjectEntry => ({
  subjectCode: '',
  subjectName: '',
  credits: 4,
  internalMarks: 0,
  externalMarks: 0,
  totalMarks: 0,
  maxMarks: 100,
  grade: 'A',
  gradePoints: 8,
  status: 'PASS',
});

export const AcademicRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [records, setRecords] = useState<AcademicRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<number>(profile?.semester || 1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Manual Entry Form State
  const [formData, setFormData] = useState({
    semester: profile?.semester || 1,
    academicYear: '2024-2025',
    sgpa: 8.25,
    cgpa: profile?.cgpa && profile.cgpa > 0 ? profile.cgpa : 8.0,
    totalCredits: 24,
    earnedCredits: 24,
    backlogs: profile?.activeBacklogs ?? 0,
    subjects: [createEmptySubject()],
  });

  const fetchAcademics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me/academics');
      if (res.data.success) {
        const fetchedRecords: AcademicRecordItem[] = res.data.data || [];
        setRecords(fetchedRecords);
        if (fetchedRecords.length > 0) {
          // Select highest or matching semester
          const semExists = fetchedRecords.some((r) => r.semester === selectedSemester);
          if (!semExists) {
            setSelectedSemester(fetchedRecords[fetchedRecords.length - 1].semester);
          }
        }
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to retrieve academic records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  // Active semester record
  const activeRecord = useMemo(() => {
    if (records.length === 0) return null;
    return records.find((r) => r.semester === selectedSemester) || records[records.length - 1];
  }, [records, selectedSemester]);

  const activeSubjects = activeRecord?.subjects || [];

  // Open modal for NEW entry
  const handleOpenNewModal = () => {
    const nextSem = records.length > 0 ? Math.max(...records.map((r) => r.semester)) + 1 : profile?.semester || 1;
    setFormData({
      semester: Math.min(8, nextSem),
      academicYear: '2024-2025',
      sgpa: 8.25,
      cgpa: profile?.cgpa && profile.cgpa > 0 ? profile.cgpa : 8.0,
      totalCredits: 24,
      earnedCredits: 24,
      backlogs: 0,
      subjects: [
        {
          subjectCode: '',
          subjectName: '',
          credits: 4,
          internalMarks: 40,
          externalMarks: 42,
          totalMarks: 82,
          maxMarks: 100,
          grade: 'A+',
          gradePoints: 9,
          status: 'PASS',
        },
      ],
    });
    setIsModalOpen(true);
  };

  // Open modal to EDIT existing record
  const handleOpenEditModal = (rec: AcademicRecordItem) => {
    setFormData({
      semester: rec.semester,
      academicYear: rec.academicYear || '2024-2025',
      sgpa: rec.sgpa,
      cgpa: rec.cgpa,
      totalCredits: rec.totalCredits,
      earnedCredits: rec.earnedCredits,
      backlogs: rec.backlogs,
      subjects: rec.subjects && rec.subjects.length > 0 ? [...rec.subjects] : [createEmptySubject()],
    });
    setIsModalOpen(true);
  };

  // Load GNDEC Sample Courses Template into form
  const handleLoadSampleTemplate = () => {
    const totalCreds = GNDEC_SAMPLE_TEMPLATE.reduce((sum, s) => sum + s.credits, 0);
    const earnedCreds = GNDEC_SAMPLE_TEMPLATE.filter((s) => s.status !== 'FAIL').reduce((sum, s) => sum + s.credits, 0);
    const totalPoints = GNDEC_SAMPLE_TEMPLATE.reduce((sum, s) => sum + s.credits * s.gradePoints, 0);
    const computedSgpa = totalCreds > 0 ? parseFloat((totalPoints / totalCreds).toFixed(2)) : 8.5;

    setFormData({
      ...formData,
      totalCredits: totalCreds,
      earnedCredits: earnedCreds,
      sgpa: computedSgpa,
      cgpa: formData.cgpa > 0 ? formData.cgpa : computedSgpa,
      backlogs: 0,
      subjects: JSON.parse(JSON.stringify(GNDEC_SAMPLE_TEMPLATE)),
    });
    addToast('info', 'Loaded GNDEC B.Tech semester course template with pre-filled marks.');
  };

  // Subject row helpers
  const handleSubjectChange = (index: number, field: keyof SubjectEntry, value: any) => {
    const updated = [...formData.subjects];
    const item = { ...updated[index], [field]: value };

    // Auto calculate total and grade when marks change
    if (field === 'internalMarks' || field === 'externalMarks') {
      const internal = field === 'internalMarks' ? Number(value) : Number(item.internalMarks || 0);
      const external = field === 'externalMarks' ? Number(value) : Number(item.externalMarks || 0);
      const total = internal + external;
      item.totalMarks = total;
      const { grade, points } = computeGrade(total);
      item.grade = grade;
      item.gradePoints = points;
      item.status = grade === 'F' ? 'FAIL' : 'PASS';
    }

    updated[index] = item;

    // Recompute total credits, earned credits, backlogs & SGPA
    const totalCreds = updated.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    const earnedCreds = updated.filter((s) => s.status !== 'FAIL').reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    const totalPoints = updated.reduce((sum, s) => sum + (Number(s.credits) || 0) * (Number(s.gradePoints) || 0), 0);
    const computedSgpa = totalCreds > 0 ? parseFloat((totalPoints / totalCreds).toFixed(2)) : formData.sgpa;
    const computedBacklogs = updated.filter((s) => s.status === 'FAIL').length;

    setFormData({
      ...formData,
      subjects: updated,
      totalCredits: totalCreds || formData.totalCredits,
      earnedCredits: earnedCreds || formData.earnedCredits,
      sgpa: computedSgpa,
      backlogs: computedBacklogs,
    });
  };

  const handleAddSubjectRow = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, createEmptySubject()],
    });
  };

  const handleRemoveSubjectRow = (index: number) => {
    if (formData.subjects.length <= 1) {
      addToast('warning', 'At least one subject is required.');
      return;
    }
    const updated = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: updated });
  };

  // Submit manual academic record
  const handleSaveAcademicRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subjects.length === 0) {
      addToast('error', 'Please enter at least one subject.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/students/me/academics', formData);
      if (res.data.success) {
        addToast('success', `Semester ${formData.semester} academic performance saved successfully!`);
        setIsModalOpen(false);
        await fetchAcademics();
        setSelectedSemester(formData.semester);
        // Refresh global profile so updated CGPA and backlogs sync with dashboard and scholarship eligibility
        await refreshProfile();
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to save academic record.');
    } finally {
      setSaving(false);
    }
  };

  // Delete academic record
  const handleDeleteRecord = async (id: string, sem: number) => {
    if (!window.confirm(`Are you sure you want to delete the academic record for Semester ${sem}?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await api.delete(`/students/me/academics/${id}`);
      if (res.data.success) {
        addToast('info', `Semester ${sem} record removed.`);
        await fetchAcademics();
        await refreshProfile();
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const currentCgpa = activeRecord?.cgpa || profile?.cgpa || 0;
  const isCgpaEligible = currentCgpa >= 6.0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-amber-50/40 p-6 sm:p-8 text-slate-900 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold mb-2">
            <GraduationCap className="h-3.5 w-3.5 text-amber-700" />
            <span>Authenticated Academic Record • GNDEC Examination Cell</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Academic Performance & Marksheets
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Record semester marks, credit weightage, and cumulative grade points. Punjab Post-Matric Scholarship mandates a minimum of 6.0 CGPA.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Marksheet / Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Top Academic KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Cumulative CGPA
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {currentCgpa > 0 ? currentCgpa.toFixed(2) : 'Not Entered'}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 10.0</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {currentCgpa > 0 ? (
                isCgpaEligible ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Eligible (≥ 6.0 CGPA Rule)
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-rose-600" />
                    Below Minimum 6.0 CGPA
                  </span>
                )
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">Click Add to record marks</span>
              )}
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Semester SGPA & Credits
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {activeRecord?.sgpa ? activeRecord.sgpa.toFixed(2) : '—'}
              </span>
              <span className="text-xs font-bold text-slate-500 font-sans">
                {activeRecord ? `(${activeRecord.earnedCredits}/${activeRecord.totalCredits} Credits)` : 'No transcript'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              {activeRecord?.academicYear ? `Academic Session ${activeRecord.academicYear}` : 'IKGPTU Standard Scale'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Active Backlogs
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-3xl font-black font-mono ${
                  (activeRecord?.backlogs ?? profile?.activeBacklogs ?? 0) === 0
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {activeRecord?.backlogs ?? profile?.activeBacklogs ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-400">Subjects</span>
            </div>
            <div className="mt-2">
              {(activeRecord?.backlogs ?? profile?.activeBacklogs ?? 0) === 0 ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-600" />
                  All Subjects Cleared
                </span>
              ) : (
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-rose-600" />
                  Clearance Examination Needed
                </span>
              )}
            </div>
          </div>
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              (activeRecord?.backlogs ?? profile?.activeBacklogs ?? 0) === 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Semester Navigation Bar (if records exist) */}
      {records.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Transcripts:
            </span>
            {records.map((rec) => (
              <button
                key={rec._id}
                type="button"
                onClick={() => setSelectedSemester(rec.semester)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedSemester === rec.semester
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-white'
                }`}
              >
                Semester {rec.semester} ({rec.sgpa.toFixed(2)} SGPA)
              </button>
            ))}
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-100 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Semester</span>
            </button>
          </div>

          {activeRecord && (
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEditModal(activeRecord)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                <span>Edit Semester {activeRecord.semester}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRecord(activeRecord._id, activeRecord.semester)}
                disabled={deletingId === activeRecord._id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subject Marks Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/90 via-slate-50/50 to-slate-50/90">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
              <span>
                {activeRecord
                  ? `Semester ${activeRecord.semester} Official Marksheet Transcript`
                  : 'Official Semester Marksheet Transcript'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              I.K. Gujral Punjab Technical University (IKGPTU) Curricular Framework
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/60 shadow-2xs">
              {profile?.department || 'GNDEC'} • Roll: {profile?.rollNumber || 'Enrolled'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <div className="h-7 w-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-2" />
            <p>Loading academic records...</p>
          </div>
        ) : activeSubjects.length === 0 ? (
          /* Empty State */
          <div className="p-10 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto shadow-2xs">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-extrabold text-slate-900">
                No Academic Marksheets Recorded Yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Add your semester marksheet manually below with pre-filled placeholders, or upload your official scanned marksheets in the Document Vault.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={handleOpenNewModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Enter Semester Marksheet Manually</span>
              </button>
              <button
                onClick={() => navigate('/student/documents')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <span>Upload in Document Vault</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Subjects Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-4 px-5">Subject Code</th>
                  <th className="py-4 px-5">Course Title</th>
                  <th className="py-4 px-5 text-center">Credits</th>
                  <th className="py-4 px-5">Internal (50)</th>
                  <th className="py-4 px-5">External (50)</th>
                  <th className="py-4 px-5">Composite Score</th>
                  <th className="py-4 px-5 text-center">Letter Grade</th>
                  <th className="py-4 px-5 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSubjects.map((sub: any, idx: number) => {
                  const total = sub.totalMarks || (Number(sub.internalMarks) + Number(sub.externalMarks));
                  return (
                    <tr key={idx} className="hover:bg-indigo-50/25 transition-colors group">
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-xl border border-indigo-200/60 shadow-2xs">
                          {sub.subjectCode}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900 text-xs">{sub.subjectName}</p>
                        <p className="text-[10px] text-slate-400">Core Engineering Course</p>
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60">
                          {sub.credits}
                        </span>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {sub.internalMarks}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">/ 50</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {sub.externalMarks}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">/ 50</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-xs">
                            {total}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">/ 100</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs">
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Badge status={sub.status || (sub.grade === 'F' ? 'FAIL' : 'PASS')} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notice & Rule Footnote */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            Transcripts recorded here are evaluated against scholarship criteria: <strong>Minimum CGPA ≥ 6.0</strong> and <strong>Clear Backlogs</strong>.
          </span>
        </div>
        <button
          onClick={() => navigate('/student/documents')}
          className="text-indigo-600 hover:text-indigo-800 font-bold shrink-0 self-start sm:self-auto hover:underline flex items-center gap-1"
        >
          <span>Vault Marksheets</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* MANUAL ENTRY MODAL WITH PREDEFINED DATA PLACEHOLDERS      */}
      {/* ======================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manual Academic Performance & Marksheet Entry"
        subtitle="Enter semester transcript details, credit weightage, and subject scores with live CGPA calculation."
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveAcademicRecord} className="space-y-5">
          {/* Top Quick Actions Bar */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-indigo-950 font-semibold">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>Need help? Load standard GNDEC B.Tech Engineering course template as a starter.</span>
            </div>
            <button
              type="button"
              onClick={handleLoadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-100/70 font-bold text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Load GNDEC Sample Template</span>
            </button>
          </div>

          {/* Semester & Session Meta Grid with Clear Placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semester Number <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white font-bold transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s} (Year {Math.ceil(s / 2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Session
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2024-2025"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semester SGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                placeholder="e.g. 8.25"
                value={formData.sgpa}
                onChange={(e) => setFormData({ ...formData, sgpa: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold font-mono bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cumulative CGPA (≥ 6.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                placeholder="e.g. 7.90 (Min 6.0 required)"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold font-mono bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Semester Credits
              </label>
              <input
                type="number"
                min="1"
                max="40"
                required
                placeholder="e.g. 24"
                value={formData.totalCredits}
                onChange={(e) => setFormData({ ...formData, totalCredits: Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Earned Credits
              </label>
              <input
                type="number"
                min="0"
                max="40"
                required
                placeholder="e.g. 24"
                value={formData.earnedCredits}
                onChange={(e) => setFormData({ ...formData, earnedCredits: Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Active Backlogs Count
              </label>
              <input
                type="number"
                min="0"
                max="10"
                placeholder="e.g. 0 (Enter 0 if all clear)"
                value={formData.backlogs}
                onChange={(e) => setFormData({ ...formData, backlogs: Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Subjects Entry Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                  <span>Subject-wise Marks & Credits ({formData.subjects.length} Subjects)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Total marks and letter grades are auto-computed as you enter internal and external marks.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSubjectRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {formData.subjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    {/* Subject Code */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Subject Code
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BTCS-501"
                        value={sub.subjectCode}
                        onChange={(e) => handleSubjectChange(idx, 'subjectCode', e.target.value.toUpperCase())}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold uppercase border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Course Title */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Course Name / Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Database Management Systems"
                        value={sub.subjectName}
                        onChange={(e) => handleSubjectChange(idx, 'subjectName', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Credits */}
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Credits
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        required
                        placeholder="e.g. 4"
                        value={sub.credits}
                        onChange={(e) => handleSubjectChange(idx, 'credits', Number(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs font-mono font-bold text-center border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Internal Marks */}
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Int (50)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        required
                        placeholder="e.g. 42"
                        value={sub.internalMarks}
                        onChange={(e) => handleSubjectChange(idx, 'internalMarks', Number(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs font-mono font-bold text-center border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* External Marks */}
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Ext (50)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        required
                        placeholder="e.g. 45"
                        value={sub.externalMarks}
                        onChange={(e) => handleSubjectChange(idx, 'externalMarks', Number(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs font-mono font-bold text-center border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Total & Grade pill */}
                    <div className="sm:col-span-1 flex flex-col items-center">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Total
                      </label>
                      <span className="font-mono font-extrabold text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">
                        {sub.totalMarks || sub.internalMarks + sub.externalMarks}
                      </span>
                    </div>

                    {/* Delete Action */}
                    <div className="sm:col-span-1 flex items-center justify-end pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectRow(idx)}
                        disabled={formData.subjects.length <= 1}
                        title="Delete Course"
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Estimated Semester SGPA:{' '}
              <strong className="font-mono text-indigo-700">{formData.sgpa.toFixed(2)}</strong> •
              Cumulative CGPA: <strong className="font-mono text-slate-800">{formData.cgpa.toFixed(2)}</strong>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Academic Record...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Save Academic Record ✓</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
