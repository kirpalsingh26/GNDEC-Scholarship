import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, CheckCircle2, UserCheck, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { User } from '../../types/index.js';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (id: string, status?: string, role?: string) => {
    setMsg('');
    try {
      const res = await api.put(`/admin/users/${id}/status`, { status, role });
      if (res.data.success) {
        setMsg('User permissions updated successfully.');
        await fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-bold mb-1.5">
            <Users className="h-3.5 w-3.5 text-purple-600" />
            <span>Identity & Access Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            User & Role Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage system identities, assign operational staff tiers, and administer account status.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Total Records: <strong className="text-slate-900">{users.length}</strong></span>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white transition-colors w-full sm:w-auto"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="STUDENT">Students ({users.filter(u => u.role === 'STUDENT').length})</option>
            <option value="OFFICER">Scholarship Officers ({users.filter(u => u.role === 'OFFICER').length})</option>
            <option value="ADMIN">Super Admins ({users.filter(u => u.role === 'ADMIN').length})</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-5">User Details</th>
                <th className="py-4 px-5">Official Email</th>
                <th className="py-4 px-5">Role Permission</th>
                <th className="py-4 px-5">Account Status</th>
                <th className="py-4 px-5 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 px-5 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                      <span className="font-semibold text-xs text-slate-500">Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-5 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Users className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 text-xs">No matching users found</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search query or role filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u: any) => {
                  const roleStyles = {
                    STUDENT: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
                    OFFICER: 'bg-blue-50 text-blue-700 border-blue-200/70',
                    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200/70',
                  }[u.role as 'STUDENT' | 'OFFICER' | 'ADMIN'] || 'bg-slate-50 text-slate-700 border-slate-200';

                  const avatarGradient = {
                    STUDENT: 'from-emerald-500 to-teal-600',
                    OFFICER: 'from-blue-600 to-indigo-600',
                    ADMIN: 'from-purple-600 to-indigo-600',
                  }[u.role as 'STUDENT' | 'OFFICER' | 'ADMIN'] || 'from-slate-600 to-slate-700';

                  return (
                    <tr key={u._id} className="hover:bg-indigo-50/25 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-2xl bg-gradient-to-tr ${avatarGradient} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover:scale-105 transition-transform`}>
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-tight">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {u._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono text-slate-600 text-[11px] bg-slate-100/70 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {u.email}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUser(u._id, undefined, e.target.value)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs transition-all ${roleStyles}`}
                        >
                          <option value="STUDENT">👨‍🎓 STUDENT</option>
                          <option value="OFFICER">🛡️ OFFICER</option>
                          <option value="ADMIN">⚙️ ADMIN</option>
                        </select>
                      </td>
                      <td className="py-4 px-5">
                        <Badge status={u.status} size="sm" />
                      </td>
                      <td className="py-4 px-5 text-right">
                        {u.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleUpdateUser(u._id, 'SUSPENDED')}
                            className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-xl transition-all shadow-2xs hover:scale-105"
                          >
                            Suspend Access
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateUser(u._id, 'ACTIVE')}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 rounded-xl transition-all shadow-2xs hover:scale-105"
                          >
                            Activate Account
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
