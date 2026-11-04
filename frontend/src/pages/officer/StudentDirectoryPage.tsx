import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  User,
  Eye,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  GraduationCap,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { Modal } from '../../components/common/Modal.js';

export const StudentDirectoryPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/admin/users?role=STUDENT');
        if (res.data.success) {
          setStudents(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load student roster:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter((st) => {
    const profile = st.profile || {};
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.email.toLowerCase().includes(search.toLowerCase()) ||
      (st.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (profile.rollNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (profile.department || '').toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      deptFilter === 'ALL' ||
      profile.department === deptFilter ||
      (profile.department && profile.department.includes(deptFilter));

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-xs font-bold mb-1.5 shadow-2xs">
            <Users className="h-3.5 w-3.5 text-blue-600" />
            <span>Enrolled Scholars Roster • Port 5174</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Enrolled Student Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official candidate directory of Scheduled Caste (SC) students registered under the Dr. Ambedkar Post-Matric Scheme.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>
            Active Scholars: <strong className="text-slate-900 font-extrabold">{students.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by name, roll number, email, or branch..."
            className="w-full pl-10 pr-8 py-2 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science and Engineering">CSE</option>
            <option value="Information Technology">IT</option>
            <option value="Electronics and Communication Engineering">ECE</option>
            <option value="Mechanical Engineering">Mechanical</option>
            <option value="Civil Engineering">Civil</option>
            <option value="Electrical Engineering">Electrical</option>
          </select>

          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            Showing <strong className="text-slate-700">{filtered.length}</strong> candidates
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Candidate Student</th>
                <th className="py-3 px-4">Roll Number / URN</th>
                <th className="py-3 px-4">Branch & Semester</th>
                <th className="py-3 px-4">Contact Channels</th>
                <th className="py-3 px-4">Category & Income</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span className="font-semibold text-xs text-slate-500">Loading student directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Users className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 text-xs">No matching student profiles found</p>
                      <p className="text-[11px] text-slate-400">Try modifying your search query or department filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((st) => {
                  const prof = st.profile || {};
                  return (
                    <tr key={st._id} className="hover:bg-blue-50/20 transition-colors group">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                            {st.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-tight group-hover:text-blue-700 transition-colors">
                              {st.name}
                            </p>
                            <span className="inline-block mt-0.5 text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                              {prof.category || 'SC (Scheduled Caste)'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200/60 shadow-2xs">
                          {prof.rollNumber || 'URN Pending'}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800 text-xs">
                          {prof.department || 'Engineering'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {prof.course || 'B.Tech'} • Semester {prof.semester || 1}
                        </p>
                      </td>

                      {/* Contact Channels */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5 text-[11px]">
                          <a
                            href={`mailto:${st.email}`}
                            className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors font-mono"
                          >
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{st.email}</span>
                          </a>
                          {st.phone && (
                            <a
                              href={`tel:${st.phone}`}
                              className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors font-mono"
                            >
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{st.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Income */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block text-xs">
                          {prof.familyIncome
                            ? `₹${prof.familyIncome.toLocaleString('en-IN')}/yr`
                            : 'Pending Declaration'}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {prof.familyIncome && prof.familyIncome <= 250000 ? '≤ ₹2.50L Ceiling ✓' : ''}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge status={st.status || 'ACTIVE'} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedStudent(st);
                            setIsDetailOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Dossier Inspection Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Candidate Dossier — ${selectedStudent.name}`}
          subtitle="Enrolled student academic credentials and state welfare verification profile"
        >
          {(() => {
            const p = selectedStudent.profile || {};
            return (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">University Roll Number:</span>
                    <span className="font-mono font-bold text-indigo-700 text-sm">
                      {p.rollNumber || 'URN Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Department / Branch:</span>
                    <span className="font-bold text-slate-900">{p.department || 'Not Assigned'}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Academic Term:</span>
                    <span className="font-bold text-slate-800">
                      {p.course || 'B.Tech'} • Year {p.year || 1} • Semester {p.semester || 1}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Social Category:</span>
                    <span className="font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                      {p.category || 'SC (Scheduled Caste)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Declared Family Income:</span>
                    <span className="font-bold text-emerald-700">
                      {p.familyIncome ? `₹${p.familyIncome.toLocaleString('en-IN')}/yr` : 'Pending Declaration'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Official Email:</span>
                    <span className="font-mono text-slate-700">{selectedStudent.email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact Number:</span>
                    <span className="font-mono text-slate-700">{selectedStudent.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 leading-relaxed text-[11px]">
                  <strong>Scrutiny Notice:</strong> Cross-check this candidate's uploaded Freeship Card on the Punjab Dr. Ambedkar Scholarship portal prior to sanctioning 100% tuition fee exemption.
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
