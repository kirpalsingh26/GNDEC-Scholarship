import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit3, Trash2, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import api from '../../services/api.js';
import { Modal } from '../../components/common/Modal.js';
import { Badge } from '../../components/common/Badge.js';
import { Scholarship } from '../../types/index.js';

export const ScholarshipManagerPage: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    provider: 'Department of Social Justice, Punjab',
    type: 'MERIT_CUM_MEANS',
    amount: 50000,
    frequency: 'ANNUAL',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    minCgpa: 6.5,
    minAttendance: 75,
    maxFamilyIncome: 300000,
    maxBacklogs: 1,
    status: 'ACTIVE',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchScholarships = async () => {
    try {
      const res = await api.get('/scholarships');
      if (res.data.success) {
        setScholarships(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      code: `SCH-${Date.now().toString().slice(-4)}`,
      provider: 'GNDEC Alumni Trust',
      type: 'MERIT_CUM_MEANS',
      amount: 45000,
      frequency: 'ANNUAL',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Institutional grant for deserving engineering students.',
      minCgpa: 7.0,
      minAttendance: 75,
      maxFamilyIncome: 350000,
      maxBacklogs: 0,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSaveScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const payload = {
        title: formData.title,
        code: formData.code,
        provider: formData.provider,
        type: formData.type,
        amount: Number(formData.amount),
        frequency: formData.frequency,
        deadline: formData.deadline,
        description: formData.description,
        status: formData.status,
        rules: {
          minCgpa: Number(formData.minCgpa),
          minAttendance: Number(formData.minAttendance),
          maxFamilyIncome: Number(formData.maxFamilyIncome),
          maxBacklogs: Number(formData.maxBacklogs),
        },
      };

      if (editingId) {
        await api.put(`/scholarships/${editingId}`, payload);
        setMsg('Scholarship program updated successfully.');
      } else {
        await api.post('/scholarships', payload);
        setMsg('New scholarship scheme added to catalog.');
      }

      setIsModalOpen(false);
      await fetchScholarships();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Scholarship Schemes & Rule Engine Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure financial grant amounts, deadlines, and smart eligibility validation rules (CGPA, attendance, income, and backlog thresholds).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Add Scholarship Scheme
        </button>
      </div>

      {msg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scholarships.map((sch) => (
          <div
            key={sch._id}
            className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                  {sch.code}
                </span>
                <Badge status={sch.status} size="sm" />
              </div>

              <h3 className="text-base font-extrabold text-slate-900">{sch.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{sch.provider}</p>

              {/* Rules Badge List */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Award Amount:</span>
                  <span className="font-bold text-slate-900">₹{sch.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Min. CGPA Required:</span>
                  <span className="font-bold text-indigo-600">≥ {sch.rules?.minCgpa || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Min. Attendance:</span>
                  <span className="font-bold text-emerald-600">≥ {sch.rules?.minAttendance || 75}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max. Family Income:</span>
                  <span className="font-bold text-slate-800">
                    {sch.rules?.maxFamilyIncome ? `≤ ₹${sch.rules.maxFamilyIncome.toLocaleString('en-IN')}` : 'No Income Cap'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Deadline: {new Date(sch.deadline).toLocaleDateString('en-IN')}
              </span>
              <button
                onClick={() => {
                  setEditingId(sch._id);
                  setFormData({
                    title: sch.title,
                    code: sch.code,
                    provider: sch.provider,
                    type: sch.type,
                    amount: sch.amount,
                    frequency: sch.frequency,
                    deadline: new Date(sch.deadline).toISOString().split('T')[0],
                    description: sch.description,
                    minCgpa: sch.rules?.minCgpa || 0,
                    minAttendance: sch.rules?.minAttendance || 75,
                    maxFamilyIncome: sch.rules?.maxFamilyIncome || 0,
                    maxBacklogs: sch.rules?.maxBacklogs || 0,
                    status: sch.status,
                  });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Rules
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Scholarship Rules' : 'Create New Scholarship Scheme'}
        subtitle="Configure smart eligibility thresholds"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveScholarship} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Scheme Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. GNDEC Alumni Merit Scholarship"
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Scheme Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. GNDEC-ALUMNI-2025"
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Grant Amount (₹)</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Min. CGPA Required</label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={10}
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Min. Attendance (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.minAttendance}
                onChange={(e) => setFormData({ ...formData, minAttendance: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Max Family Income Cap (₹)</label>
              <input
                type="number"
                value={formData.maxFamilyIncome}
                onChange={(e) => setFormData({ ...formData, maxFamilyIncome: Number(e.target.value) })}
                placeholder="0 for no ceiling"
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Deadline Date</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Scheme Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Scheme Rules'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
