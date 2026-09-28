import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Building2, User, Eye, Calendar, Sparkles } from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';

export const StudentDirectoryPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/admin/users?role=STUDENT');
        if (res.data.success) {
          setStudents(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter((st) => {
    return (
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.email.toLowerCase().includes(search.toLowerCase()) ||
      (st.phone || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold mb-1.5 shadow-2xs">
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            <span>Enrolled Scholars Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Enrolled Student Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse certified GNDEC scholarship candidate profiles, contact channels, and registration records.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Active Students: <strong className="text-slate-900 font-extrabold">{students.length}</strong></span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, or contact number..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-slate-700">{filtered.length}</strong> of {students.length} students
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-5">Candidate Name</th>
                <th className="py-4 px-5">Official Email</th>
                <th className="py-4 px-5">Contact Phone</th>
                <th className="py-4 px-5">Account Status</th>
                <th className="py-4 px-5 text-right">Enrolled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 px-5 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                      <span className="font-semibold text-xs text-slate-500">Loading student directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-5 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Users className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 text-xs">No matching student profiles found</p>
                      <p className="text-[11px] text-slate-400">Try modifying your search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((st) => (
                  <tr key={st._id} className="hover:bg-indigo-50/25 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                          {st.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-tight">{st.name}</p>
                          <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
                            Undergraduate Scholar
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700 text-[11px] bg-slate-100/70 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {st.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{st.phone || '+91 98765-43210'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <Badge status={st.status} size="sm" />
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-slate-500 font-mono text-[11px] bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{new Date(st.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}</span>
                      </div>
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
