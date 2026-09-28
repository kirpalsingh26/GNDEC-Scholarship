import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  Search,
  CheckCircle2,
  TrendingDown,
  ShieldAlert,
  Flame,
  Zap,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';

export const AttendanceMonitoringPage: React.FC = () => {
  const [lowAttendanceList, setLowAttendanceList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchLowAttendance = async () => {
    try {
      const res = await api.get('/attendance/low-attendance');
      if (res.data.success) {
        setLowAttendanceList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowAttendance();
  }, []);

  const handleDispatchWarnings = async () => {
    setDispatching(true);
    setMsg('');
    try {
      const res = await api.post('/attendance/send-warnings');
      if (res.data.success) {
        setMsg(res.data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  const filtered = lowAttendanceList.filter((st) => {
    return (
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      st.department.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-rose-700 text-xs font-bold mb-1.5 shadow-2xs">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>Attendance Compliance Deficit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Attendance Monitoring & Shortage Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit of students falling below the mandatory 75% threshold with algorithmic recovery requirements.
          </p>
        </div>

        <button
          onClick={handleDispatchWarnings}
          disabled={dispatching}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-md shadow-rose-200 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Bell className="h-4 w-4" />
          {dispatching ? 'Dispatching SMS & Email...' : 'Broadcast Attendance Warnings'}
        </button>
      </div>

      {msg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by name, roll number, or department..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50/80 px-3 py-1.5 rounded-xl border border-rose-200/60">
          <Flame className="h-3.5 w-3.5 text-rose-600" />
          <span>At-Risk Students: <strong>{lowAttendanceList.length}</strong></span>
        </div>
      </div>

      {/* Low Attendance Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-5">Student Candidate</th>
                <th className="py-4 px-5">Roll Number</th>
                <th className="py-4 px-5">Department & Term</th>
                <th className="py-4 px-5">Logged Attendance</th>
                <th className="py-4 px-5">Shortfall Deficit</th>
                <th className="py-4 px-5">Algorithmic Recovery Target</th>
                <th className="py-4 px-5 text-right">Risk Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 px-5 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                      <span className="font-semibold text-xs text-slate-500">Scanning institutional attendance records...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-5 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 text-xs">All candidates in attendance compliance!</p>
                      <p className="text-[11px] text-slate-400">No active students currently below the 75% threshold.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((st, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/20 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                          {st.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{st.name}</p>
                          <p className="text-[10px] text-rose-600 font-semibold">Under Shortage</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-xl border border-indigo-200/60 shadow-2xs">
                        {st.rollNumber}
                      </span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <p className="font-bold text-slate-800 text-xs">{st.department}</p>
                      <p className="text-[10px] text-slate-400">Semester {st.semester}</p>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-rose-600 text-sm font-mono">
                          {st.percentage}%
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60">
                          {st.attendedClasses}/{st.totalClasses} classes
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/70">
                        <TrendingDown className="h-3 w-3" />
                        -{st.difference}%
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>
                          Must attend <strong className="text-rose-600 font-black">{st.classesNeededForRecovery}</strong> consecutive classes
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Badge status={st.risk} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
