import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import api from '../../services/api.js';
import { Modal } from '../../components/common/Modal.js';
import { Badge } from '../../components/common/Badge.js';
import { Scholarship } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export const ScholarshipManagerPage: React.FC = () => {
  const { addToast } = useToast();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    provider: 'Department of Social Justice, Punjab',
    type: 'MERIT_CUM_MEANS',
    amount: 50000,
    frequency: 'ANNUAL',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    minCgpa: 0,
    maxFamilyIncome: 250000,
    maxBacklogs: 1,
    status: 'ACTIVE',
  });

  const [saving, setSaving] = useState(false);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scholarships');
      if (res.data.success) {
        setScholarships(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Unable to retrieve scholarship catalog.');
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
      provider: 'Department of Social Justice, Punjab',
      type: 'MERIT_CUM_MEANS',
      amount: 45000,
      frequency: 'ANNUAL',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Punjab Post-Matric Scholarship grant for eligible SC engineering candidates.',
      minCgpa: 0,
      maxFamilyIncome: 250000,
      maxBacklogs: 0,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSaveScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
          maxFamilyIncome: Number(formData.maxFamilyIncome),
          maxBacklogs: Number(formData.maxBacklogs),
          allowedCategories: ['SC'],
        },
      };

      if (editingId) {
        await api.put(`/scholarships/${editingId}`, payload);
        addToast('success', 'Scholarship scheme rules updated successfully.');
      } else {
        await api.post('/scholarships', payload);
        addToast('success', 'New scholarship scheme added to catalog.');
      }

      setIsModalOpen(false);
      await fetchScholarships();
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to save scholarship scheme.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = scholarships.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/70 text-purple-800 text-xs font-bold mb-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
            <span>Scheme Rule Governance • Port 5175</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Scholarship Schemes & Rule Engine Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure financial grant amounts, academic cycles, deadlines, and smart eligibility verification rules.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Scholarship Scheme</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes by title, code or provider..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-slate-50/50 hover:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Active Programs: <strong className="text-slate-900">{filtered.length}</strong></span>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-20 text-center text-xs text-slate-400">
            <div className="h-6 w-6 rounded-full border-2 border-purple-600 border-t-transparent animate-spin mx-auto mb-2" />
            Loading scholarship catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <GraduationCap className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
            <p className="font-bold text-slate-700">No scholarship schemes match your search</p>
          </div>
        ) : (
          filtered.map((sch) => (
            <div
              key={sch._id}
              className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-purple-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/70">
                    {sch.code}
                  </span>
                  <Badge status={sch.status} size="sm" />
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                  {sch.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>{sch.provider}</span>
                </p>

                {/* Rules Badge List */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Grant Value:</span>
                    <span className="font-extrabold text-slate-900 font-mono">₹{sch.amount.toLocaleString('en-IN')}/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Minimum CGPA:</span>
                    <span className="font-bold text-purple-700 font-mono">≥ {sch.rules?.minCgpa || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Eligible Category:</span>
                    <span className="font-bold text-amber-800 font-mono">SC (Scheduled Caste)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Family Income Cap:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {sch.rules?.maxFamilyIncome ? `≤ ₹${sch.rules.maxFamilyIncome.toLocaleString('en-IN')}` : 'No Income Cap'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Deadline: {new Date(sch.deadline).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}</span>
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
                      maxFamilyIncome: sch.rules?.maxFamilyIncome || 250000,
                      maxBacklogs: sch.rules?.maxBacklogs || 0,
                      status: sch.status,
                    });
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Configure Rules</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Configure Scheme Rule Engine' : 'Register New Scholarship Scheme'}
        subtitle="Configure grant values and automated qualification checks"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveScholarship} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Dr. B.R. Ambedkar Post-Matric Scholarship for SC Students"
                className="block w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. PB-PMS-SC"
                className="block w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-mono uppercase bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grant Amount (₹)</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="block w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-bold bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min. CGPA Required</label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={10}
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: Number(e.target.value) })}
                className="block w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Family Income Cap (₹)</label>
              <input
                type="number"
                value={formData.maxFamilyIncome}
                onChange={(e) => setFormData({ ...formData, maxFamilyIncome: Number(e.target.value) })}
                placeholder="250000 for Punjab PMS SC"
                className="block w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="block w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-slate-50/50 hover:bg-white transition-colors leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Scheme Rules'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
