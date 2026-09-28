import React, { useState, useEffect } from 'react';
import { Building2, BookOpen, Layers, Users, Mail, GraduationCap, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';

export const DepartmentCoursePage: React.FC = () => {
  const [data, setData] = useState<any>({ departments: [], courses: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DEPTS' | 'SUBJECTS'>('DEPTS');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/admin/departments');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  const defaultSubjects = [
    { code: 'CS-14401', name: 'Design & Analysis of Algorithms', dept: 'CSE', credits: 4, sem: 5 },
    { code: 'CS-14402', name: 'Database Management Systems', dept: 'CSE', credits: 4, sem: 5 },
    { code: 'CS-14403', name: 'Computer Networks', dept: 'CSE', credits: 4, sem: 5 },
    { code: 'CS-14404', name: 'Operating Systems', dept: 'CSE', credits: 4, sem: 5 },
    { code: 'CS-14405', name: 'Theory of Computation', dept: 'CSE', credits: 3, sem: 5 },
    { code: 'IT-14401', name: 'Web Technologies & Cloud Arch', dept: 'IT', credits: 4, sem: 5 },
    { code: 'EC-14401', name: 'Digital Signal Processing', dept: 'ECE', credits: 4, sem: 5 },
  ];

  const subjectsList = (data.subjects && data.subjects.length > 0) ? data.subjects : defaultSubjects;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-1.5 shadow-2xs">
            <Building2 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Academic Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Departments, Programs & Curriculum
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            GNDEC institutional hierarchy for branch eligibility routing and subject-wise attendance aggregation.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('DEPTS')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'DEPTS'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏢 Departments ({data.departments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('SUBJECTS')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'SUBJECTS'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📚 Curriculum Subjects ({subjectsList.length})
          </button>
        </div>
      </div>

      {activeTab === 'DEPTS' ? (
        /* Departments Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.departments?.map((dept: any) => (
            <div
              key={dept._id}
              className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50/90 px-2.5 py-1 rounded-xl border border-indigo-200/60 shadow-2xs">
                    {dept.code}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70 shadow-2xs">
                    ✓ Active Branch
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Head of Dept: <strong className="text-slate-800">{dept.headName}</strong>
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{dept.contactEmail}</span>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1 text-indigo-600">
                  <GraduationCap className="h-4 w-4" />
                  B.Tech (4 Years)
                </span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700 font-mono text-[11px]">
                  8 Semesters
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Curriculum Subjects Table */
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-4 px-5">Subject Code</th>
                  <th className="py-4 px-5">Subject Title</th>
                  <th className="py-4 px-5">Department Branch</th>
                  <th className="py-4 px-5 text-center">Assigned Credits</th>
                  <th className="py-4 px-5 text-right">Target Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectsList.map((sub: any, idx: number) => (
                  <tr key={idx} className="hover:bg-indigo-50/25 transition-colors group">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-xl border border-indigo-200/60 shadow-2xs">
                        {sub.code || sub.subjectCode}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 text-xs">{sub.name || sub.subjectName}</p>
                      <p className="text-[10px] text-slate-400">Core Engineering Course</p>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200/60">
                        {sub.dept || 'CSE'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {sub.credits || 4} Credits
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <span className="font-mono font-semibold text-xs text-slate-600">
                        Semester {sub.sem || 5}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
