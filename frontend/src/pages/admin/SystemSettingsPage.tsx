import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, Shield, Bell } from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    minAttendance: 75,
    warningAttendance: 65,
    academicSession: '2025-2026',
    registrationOpen: true,
    announcementBanner: 'Applications for Punjab Post-Matric & AICTE Pragati Schemes are now open for 2025-26.',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Global System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure system thresholds, active academic sessions, and portal announcement broadcasts.
        </p>
      </div>

      {saved && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>System configurations saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600" />
            Attendance Engine Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Mandatory Minimum Threshold (%)
              </label>
              <input
                type="number"
                value={settings.minAttendance}
                onChange={(e) => setSettings({ ...settings, minAttendance: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Critical Warning Threshold (%)
              </label>
              <input
                type="number"
                value={settings.warningAttendance}
                onChange={(e) => setSettings({ ...settings, warningAttendance: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-600" />
            Active Session & Announcements
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Active Academic Year</label>
              <input
                type="text"
                value={settings.academicSession}
                onChange={(e) => setSettings({ ...settings, academicSession: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Top Announcement Banner</label>
              <textarea
                rows={3}
                value={settings.announcementBanner}
                onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:scale-[1.01]"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
