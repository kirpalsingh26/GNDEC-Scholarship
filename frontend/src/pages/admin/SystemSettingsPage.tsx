import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, Shield, Bell, Sparkles, Globe, Key, Database } from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';

export const SystemSettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState({
    maxFamilyIncome: 250000,
    targetCategory: 'SC',
    academicSession: '2025-2026',
    registrationOpen: true,
    announcementBanner: 'Applications for Dr. B.R. Ambedkar Post-Matric Scholarship (PMS) for SC Students are open for session 2025-26.',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast('success', 'Global institutional system settings updated successfully.');
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-bold mb-1.5 shadow-2xs">
          <Sliders className="h-3.5 w-3.5 text-purple-600" />
          <span>Portal Engine Parameters</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Global System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure PMS scheme limits, active academic sessions, and portal announcement broadcasts.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="h-4 w-4 text-indigo-600" />
            Dr. B.R. Ambedkar PMS Scheme Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Annual Family Income Cap (₹)
              </label>
              <input
                type="number"
                value={settings.maxFamilyIncome}
                onChange={(e) => setSettings({ ...settings, maxFamilyIncome: Number(e.target.value) })}
                className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Target Category Quota
              </label>
              <input
                type="text"
                disabled
                value="SC (Scheduled Caste Only)"
                className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl bg-slate-50 font-bold text-amber-700"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="h-4 w-4 text-indigo-600" />
            Active Session & Global Broadcasts
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Active Academic Session</label>
              <input
                type="text"
                value={settings.academicSession}
                onChange={(e) => setSettings({ ...settings, academicSession: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Top Announcement Marquee Banner</label>
              <textarea
                rows={3}
                value={settings.announcementBanner}
                onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.01]"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Applying Configuration...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
