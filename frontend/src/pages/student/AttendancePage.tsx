import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Sparkles,
  BookOpen,
  Info,
  CalendarCheck2,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../../services/api.js';
import { CircularProgress } from '../../components/common/CircularProgress.js';
import { Badge } from '../../components/common/Badge.js';

export const AttendancePage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Recovery Simulator State
  const [targetPercentage, setTargetPercentage] = useState(75);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance');
        if (res.data.success) {
          setAttendanceData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const overall = attendanceData?.overall;
  const subjects = attendanceData?.subjects || [];
  const monthlyTrend = attendanceData?.monthlyTrend || [
    { month: 'Jan', percentage: 88 },
    { month: 'Feb', percentage: 82 },
    { month: 'Mar', percentage: 79 },
    { month: 'Apr', percentage: 85 },
  ];

  const currentAttended = overall?.attendedClasses || 82;
  const currentTotal = overall?.totalClasses || 97;
  const currentPercentage = overall?.percentage || 84.5;

  // Interactive Mathematical Recovery Formula
  const p = targetPercentage / 100;
  let simulatedClassesNeeded = 0;
  let simulatedClassesCanMiss = 0;

  if (currentPercentage < targetPercentage) {
    simulatedClassesNeeded = Math.ceil((p * currentTotal - currentAttended) / (1 - p));
  } else {
    simulatedClassesCanMiss = Math.floor((currentAttended - p * currentTotal) / p);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold mb-1.5 shadow-2xs">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span>Biometric Attendance Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Attendance Monitoring & Recovery Projection
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time biometric attendance tracker with predictive mathematical recovery forecasting for scholarship compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <span className={`h-2 w-2 rounded-full ${currentPercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>Status: <strong className={currentPercentage >= 75 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
            {currentPercentage >= 75 ? 'Grant Compliant (≥75%)' : 'Shortage Warning'}
          </strong></span>
        </div>
      </div>

      {/* Top Overview: Circular Gauge + Monthly Trend Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Gauge Card (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Overall Cumulative Attendance
              </span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-2xs ${
                  currentPercentage >= 75
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                }`}
              >
                {currentPercentage >= 75 ? '✓ Meets Threshold' : '⚠ Shortage Alert'}
              </span>
            </div>

            <div className="my-6 flex flex-col items-center justify-center">
              <CircularProgress
                percentage={currentPercentage}
                size={170}
                strokeWidth={14}
                color={currentPercentage >= 75 ? '#10B981' : '#F43F5E'}
              />
              <p className="mt-4 text-xs font-bold text-slate-700">
                {currentAttended} Attended / {currentTotal} Total Conducted Sessions
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-2.5">
            <Info className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Attendance synchronized automatically from GNDEC Department Biometric logs.</span>
          </div>
        </div>

        {/* Monthly Trend Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Monthly Attendance Consistency</h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                Session 2025-26
              </span>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Mandatory UGC / State Limit: <strong>75%</strong></span>
            <span className="text-emerald-600 font-bold">Your Average: {currentPercentage}%</span>
          </div>
        </div>
      </div>

      {/* CORE INNOVATION: Interactive Recovery Simulator */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Algorithmic Mathematical Simulator
            </div>
            <h3 className="text-xl font-black tracking-tight">Interactive Attendance Recovery Forecaster</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate required consecutive class attendance based on formula N = ceil((0.75T - A)/0.25)
            </p>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-right min-w-[200px]">
            {currentPercentage < targetPercentage ? (
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-300">Required Recovery</p>
                <p className="text-2xl font-black text-white">
                  {simulatedClassesNeeded}{' '}
                  <span className="text-xs font-normal text-slate-300">consecutive classes</span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-300">Attendance Buffer</p>
                <p className="text-2xl font-black text-white">
                  {simulatedClassesCanMiss}{' '}
                  <span className="text-xs font-normal text-slate-300">classes can miss</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Target Benchmark:</span>
            <span className="text-indigo-400 font-mono text-sm">{targetPercentage}%</span>
          </div>
          <input
            type="range"
            min={60}
            max={95}
            value={targetPercentage}
            onChange={(e) => setTargetPercentage(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>60% (Minimum Emergency)</span>
            <span>75% (Mandatory Standard)</span>
            <span>85% (Merit Honors)</span>
            <span>95% (Perfect Record)</span>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Register Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/90 via-slate-50/50 to-slate-50/90">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-emerald-600" />
              <span>Subject-Wise Academic Biometric Register</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Enrolled Semester 5 B.Tech Curriculum</p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/60 shadow-2xs self-start sm:self-auto">
            {subjects.length} Subjects Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-5">Subject Code</th>
                <th className="py-4 px-5">Course Title</th>
                <th className="py-4 px-5">Attended / Conducted</th>
                <th className="py-4 px-5">Attendance %</th>
                <th className="py-4 px-5">Recovery Projection</th>
                <th className="py-4 px-5 text-right">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((s: any, idx: number) => {
                const isCompliant = s.percentage >= 75;
                return (
                  <tr key={idx} className="hover:bg-indigo-50/25 transition-colors group">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-xl border border-indigo-200/60 shadow-2xs">
                        {s.subjectCode}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 text-xs">{s.subjectName}</p>
                      <p className="text-[10px] text-slate-400">Theory & Lab Sessions</p>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-lg border border-slate-200/60">
                        {s.attendedClasses} / {s.totalClasses} classes
                      </span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-black text-sm ${
                            isCompliant ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {s.percentage}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCompliant ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(s.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {s.classesNeededForRecovery > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-700 font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80 shadow-2xs">
                          <Zap className="h-3.5 w-3.5 text-rose-600" />
                          Must attend {s.classesNeededForRecovery} consecutive classes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-2xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          In Compliance
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Badge status={s.risk} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
