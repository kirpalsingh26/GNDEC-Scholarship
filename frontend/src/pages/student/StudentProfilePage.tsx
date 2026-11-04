import React, { useState } from 'react';
import {
  User,
  Building2,
  CreditCard,
  Users,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import api from '../../services/api.js';
import { formatIndianCurrency, parseIndianCurrency, formatIncomeWords } from '../../utils/currencyFormatter.js';

export const StudentProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'BANK' | 'GUARDIAN'>('PERSONAL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    category: profile?.category || 'SC',
    familyIncome: profile?.familyIncome || 0,
    // Bank Details
    accountHolderName: profile?.bankDetails?.accountHolderName || '',
    accountNumber: profile?.bankDetails?.accountNumber || '',
    ifscCode: profile?.bankDetails?.ifscCode || '',
    bankName: profile?.bankDetails?.bankName || '',
    branchName: profile?.bankDetails?.branchName || '',
    // Guardian
    guardianName: profile?.guardian?.name || '',
    guardianRelation: profile?.guardian?.relation || '',
    guardianPhone: profile?.guardian?.phone || '',
  });

  const [saving, setSaving] = useState(false);

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('info', `Copied ${label} to clipboard: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        category: formData.category,
        familyIncome: Number(formData.familyIncome),
        bankDetails: {
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          branchName: formData.branchName,
        },
        guardian: {
          name: formData.guardianName,
          relation: formData.guardianRelation,
          phone: formData.guardianPhone,
        },
      };

      const res = await api.put('/students/profile', payload);
      if (res.data.success) {
        addToast('success', 'Profile & Direct Benefit Transfer bank details updated successfully!');
        await refreshProfile();
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to update student profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-amber-50/40 border border-slate-200/90 p-6 sm:p-8 text-slate-900 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-400/40 flex items-center justify-center text-amber-700 shadow-md shadow-amber-500/10 shrink-0 text-2xl font-black">
              {profile?.firstName?.charAt(0) || user?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200 shadow-2xs">
                  Verified Scholar ✓
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5 font-medium">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
                  {profile?.department} (Sem {profile?.semester})
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                  URN: {profile?.rollNumber}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(profile?.rollNumber || '', 'Roll Number', 'urn')}
                    className="hover:text-amber-600 transition-colors ml-1 cursor-pointer"
                    title="Copy URN"
                  >
                    {copiedKey === 'urn' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </span>
                <span>•</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                  Category: {profile?.category || 'SC'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 text-right shadow-2xs self-start sm:self-auto">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">DBT Bank Readiness</p>
            <p className="text-xs font-black text-emerald-700 flex items-center gap-1 justify-end mt-0.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> PFMS Validated ✓
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-2xl bg-white border border-slate-200/80 shadow-2xs max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab('PERSONAL')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'PERSONAL'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Personal & Academic
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BANK')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'BANK'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          DBT Bank Account
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GUARDIAN')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'GUARDIAN'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Guardian Info
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave} className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {activeTab === 'PERSONAL' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Personal & Social Category Data</h3>
                <p className="text-xs text-slate-500 mt-0.5">Basic identity information as registered with GNDEC Academic Cell</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                Category: SC (Scheduled Caste - Punjab PMS)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Annual Family Income (₹)</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                    ₹
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 1,80,000"
                    value={formData.familyIncome ? formatIndianCurrency(formData.familyIncome) : ''}
                    onChange={(e) => {
                      const parsed = parseIndianCurrency(e.target.value);
                      setFormData({ ...formData, familyIncome: parsed });
                    }}
                    className={`block w-full pl-7 pr-3.5 py-2.5 text-xs border rounded-xl font-bold font-mono transition-colors ${
                      formData.familyIncome > 250000
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-slate-200/80 bg-slate-50/50 hover:bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {Boolean(formData.familyIncome && formData.familyIncome > 0) && (
                  <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <span className="font-bold text-slate-700">
                      ₹{formatIndianCurrency(formData.familyIncome)} •{' '}
                      <span className="text-slate-500 font-normal italic">
                        {formatIncomeWords(formData.familyIncome)}
                      </span>
                    </span>
                    {formData.familyIncome <= 250000 ? (
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Eligible (≤ ₹2,50,000)
                      </span>
                    ) : (
                      <span className="text-rose-700 font-extrabold flex items-center gap-1 shrink-0">
                        <AlertCircle className="h-3 w-3 text-rose-600" />
                        Exceeds ₹2,50,000 Cap
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Quick presets:</span>
                  {[100000, 150000, 180000, 220000, 250000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, familyIncome: preset })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        formData.familyIncome === preset
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-black'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ₹{formatIndianCurrency(preset)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'BANK' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-indigo-600" />
                  Direct Benefit Transfer (DBT) Bank Credentials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scholarship grant funds are directly disbursed to this verified bank account via PFMS / NEFT.
                </p>
              </div>
              <span className="font-mono text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80 self-start sm:self-auto">
                Aadhaar Seeding Active ✓
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Account Holder Name</label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors font-bold text-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Bank Account Number</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.accountNumber, 'Account Number', 'acc')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    {copiedKey === 'acc' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">IFSC Code</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.ifscCode, 'IFSC Code', 'ifsc')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    {copiedKey === 'ifsc' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors font-mono uppercase font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Branch Name</label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'GUARDIAN' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">Parent & Guardian Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">Emergency contact and income verification signatory</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Guardian Name</label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Relationship</label>
                <input
                  type="text"
                  value={formData.guardianRelation}
                  onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Guardian Contact Number</label>
                <input
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.01]"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving Credentials...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
