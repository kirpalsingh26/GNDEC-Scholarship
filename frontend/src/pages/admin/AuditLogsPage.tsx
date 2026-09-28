import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, ShieldAlert, Activity, FileText, Calendar } from 'lucide-react';
import api from '../../services/api.js';
import { AuditLogItem } from '../../types/index.js';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const uniqueActions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.entityType.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeStyle = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('APPROVE') || act.includes('VERIF') || act.includes('PASS')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
    if (act.includes('REJECT') || act.includes('SUSPEND') || act.includes('FAIL') || act.includes('DELETE')) {
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MUTAT')) {
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    }
    if (act.includes('CREATE') || act.includes('REGISTER') || act.includes('SUBMIT')) {
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-slate-200 text-xs font-bold mb-1.5 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Forensic Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Security & Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all scholarship disbursements, officer approvals, document verifications, and system events.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <Activity className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
          <span>Stream Events: <strong className="text-slate-900">{logs.length}</strong></span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by actor, action event, entity or description..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white transition-colors w-full sm:w-auto"
          >
            <option value="ALL">All Event Types ({logs.length})</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {action} ({logs.filter(l => l.action === action).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Stream Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-5">Actor / Origin</th>
                <th className="py-4 px-5">Event Action</th>
                <th className="py-4 px-5">Entity Target</th>
                <th className="py-4 px-5">Event Audit Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 px-5 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                      <span className="font-semibold text-xs text-slate-500">Streaming security audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-5 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <ShieldAlert className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 text-xs">No matching audit records found</p>
                      <p className="text-[11px] text-slate-400">Try modifying your search term or filter selection.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log._id} className="hover:bg-indigo-50/25 transition-colors group">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-800">
                            {new Date(log.timestamp).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {log.actorName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{log.actorName || 'System'}</p>
                          <span className="inline-block font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50/80 px-1.5 py-0.2 rounded border border-indigo-100">
                            {log.actorRole || 'SYSTEM'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold font-mono text-[10px] border shadow-2xs ${getActionBadgeStyle(log.action)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-xs text-slate-800 font-medium leading-relaxed max-w-md">
                        {log.description}
                      </p>
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
