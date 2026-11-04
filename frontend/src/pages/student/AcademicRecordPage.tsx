import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, TrendingUp, Sparkles, GraduationCap, FileSpreadsheet } from 'lucide-react';
import api from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';

export const AcademicRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademics = async () => {
      try {
        const res = await api.get('/students/me/academics');
        if (res.data.success) {
          setRecords(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademics();
  }, []);

  const latestRecord = records[0];
  const subjects = latestRecord?.subjects || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-1.5 shadow-2xs">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
            <span>Authenticated Academic Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Academic Performance & Marksheets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official semester transcripts, credit audits, and cumulative grade points certified by GNDEC Examination Cell.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Status: <strong className="text-emerald-700 font-bold">Good Standing</strong></span>
        </div>
      </div>

      {/* Top Academic KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Cumulative CGPA"
          value={profile?.cgpa && profile.cgpa > 0 ? `${profile.cgpa.toFixed(2)}` : 'Not Recorded'}
          subtitle={profile?.cgpa && profile.cgpa > 0 ? 'Out of 10.0 scale' : 'Pending marksheet upload'}
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />

        <StatCard
          title="Earned Credits"
          value={latestRecord?.passedCredits ? `${latestRecord.passedCredits} / 160` : 'Pending Verification'}
          subtitle={latestRecord?.passedCredits ? 'On track for graduation' : 'Awaiting marksheet upload'}
          icon={BookOpen}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Active Backlogs"
          value={profile?.activeBacklogs ?? 0}
          subtitle={profile?.activeBacklogs === 0 ? 'Clear academic record' : 'Needs clearance'}
          icon={Award}
          iconColor={profile?.activeBacklogs === 0 ? 'text-emerald-600' : 'text-rose-600'}
          iconBg={profile?.activeBacklogs === 0 ? 'bg-emerald-50' : 'bg-rose-50'}
        />
      </div>

      {/* Subject Marks Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/90 via-slate-50/50 to-slate-50/90">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
              <span>Semester Official Marksheet Transcript</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">I.K. Gujral Punjab Technical University (IKGPTU) Curricular Framework</p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/60 shadow-2xs self-start sm:self-auto">
            {profile?.semester ? `Semester ${profile.semester}` : 'Enrolled Regular'} • {profile?.department || 'GNDEC'}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <div className="h-7 w-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-2" />
            <p>Loading academic records...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-10 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto shadow-2xs">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-extrabold text-slate-900">
                No Official University Marksheets Recorded Yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Your authenticated course marks, semester credits, and university letter grades will appear here once your official marksheet is uploaded to the Document Vault and verified by your department scrutiny officer.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate('/student/documents')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <span>Upload Marksheet in Document Vault</span>
              </button>
            </div>
          </div>
        ) : (
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
                {subjects.map((sub: any, idx: number) => {
                  const total = sub.totalMarks || (sub.internalMarks + sub.externalMarks);
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
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/60">
                          {sub.credits}
                        </span>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 text-xs">{sub.internalMarks}</span>
                          <span className="font-mono text-[10px] text-slate-400">/ 50</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 text-xs">{sub.externalMarks}</span>
                          <span className="font-mono text-[10px] text-slate-400">/ 50</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-xs">{total}</span>
                          <span className="font-mono text-[10px] text-slate-400">/ 100</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs">
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Badge status={sub.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
