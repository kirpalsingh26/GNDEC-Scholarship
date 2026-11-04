import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Building2,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Award,
  BookOpen,
  Phone,
  HelpCircle,
  X,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { formatIndianCurrency, parseIndianCurrency, formatIncomeWords } from '../../utils/currencyFormatter.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Wizard Step State
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    department: 'Computer Science and Engineering',
    category: 'SC',
    familyIncome: '' as any,
    phone: '',
    course: 'B.Tech',
    year: 3,
    semester: 5,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Dynamic progress calculation based on active step and field completion
  const getProgressInfo = () => {
    if (step === 1) {
      const hasName = formData.name.trim().length > 0;
      const hasEmail = formData.email.trim().includes('@');
      const hasPass = formData.password.length >= 6;
      const passMatch = hasPass && formData.password === formData.confirmPassword;
      const fieldsFilled = (hasName ? 1 : 0) + (hasEmail ? 1 : 0) + (passMatch ? 1 : 0);

      if (fieldsFilled === 0) {
        return { percent: 0, label: '0% Completed' };
      }
      if (fieldsFilled === 1) {
        return { percent: 10, label: '10% Completed' };
      }
      if (fieldsFilled === 2) {
        return { percent: 20, label: '20% Completed' };
      }
      return { percent: 33, label: '33% • Step 1 Ready' };
    }

    if (step === 2) {
      const hasRoll = formData.rollNumber.trim().length > 0;
      if (!hasRoll) {
        return { percent: 33, label: '33% Completed (Step 1 Done)' };
      }
      const hasPhone = formData.phone.trim().length >= 10;
      if (!hasPhone) {
        return { percent: 50, label: '50% Completed' };
      }
      return { percent: 66, label: '66% • Step 2 Ready' };
    }

    // Step 3
    const hasValidIncome = Boolean(formData.familyIncome) && Number(formData.familyIncome) > 0 && Number(formData.familyIncome) <= 250000;
    if (!hasValidIncome) {
      return { percent: 66, label: '66% Completed (Steps 1 & 2 Done)' };
    }
    return { percent: 90, label: '90% • Ready to Register' };
  };

  const progress = getProgressInfo();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
        setError('Please fill in all basic account credentials.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.rollNumber.trim()) {
        setError('University Roll Number / URN is required.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.familyIncome || Number(formData.familyIncome) <= 0) {
      setError('Please provide your annual family income as certified by Tehsildar/SDM.');
      return;
    }
    if (Number(formData.familyIncome) > 250000) {
      setError('Punjab Dr. B.R. Ambedkar PMS SC Scheme requires annual family income ≤ ₹2,50,000.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        rollNumber: formData.rollNumber,
        department: formData.department,
        category: formData.category,
        familyIncome: Number(formData.familyIncome),
        phone: formData.phone.trim(),
        course: formData.course,
        year: Number(formData.year),
        semester: Number(formData.semester),
      });

      // Explicitly redirect new student to login page per workflow requirements
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');

      navigate('/login', {
        state: {
          registered: true,
          email: formData.email,
          message:
            'Registration successful! Please sign in with your email and password to upload your mandatory documents (Freeship Card & Income Certificate).',
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please review your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1b] text-slate-100 flex flex-col font-sans relative selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* Background Subtle Grid Pattern & Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/15 rounded-full blur-[90px]" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px]" />
      </div>

      {/* Top Compact Navigation Bar */}
      <header className="relative z-10 border-b border-white/5 bg-[#070e1b]/70 backdrop-blur-md px-4 sm:px-6 py-2.5 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1 text-amber-400" />
            <span>Back to Portal Homepage</span>
          </Link>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="hidden sm:flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              256-Bit SSL Encrypted
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Need Help?</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-4 sm:py-6 px-4 sm:px-6 relative z-10 my-auto">
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          
          {/* LEFT COLUMN: Benefits & Progress Showcase (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* College Logo & Accreditation */}
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10 shrink-0">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-extrabold text-base tracking-tight text-white truncate">
                      GNDEC Ludhiana
                    </h1>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider shrink-0">
                      PMS SC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">
                    Guru Nanak Dev Engineering College
                  </p>
                  <p className="text-[10px] text-amber-300/80 font-mono">
                    Candidate Registration • Estd. 1956
                  </p>
                </div>
              </div>

              {/* Mission Statement */}
              <div className="mt-4 space-y-1.5">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold text-amber-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Dr. B.R. Ambedkar SC Welfare
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white leading-snug">
                  100% Tuition Fee Exemption & DBT Allowance
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Register with your official GNDEC University Roll Number to claim your 100% tuition waiver under the Punjab State Post-Matric Scholarship Scheme.
                </p>
              </div>

              {/* Visual Step Progress Timeline */}
              <div className="mt-4 space-y-2">
                {/* Step 1 Pill */}
                <div
                  className={`flex items-center gap-2.5 py-2 px-3 rounded-xl border transition-all ${
                    step === 1
                      ? 'bg-indigo-600/25 border-indigo-400/50 text-white shadow-xs'
                      : step > 1
                      ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      step > 1 ? 'bg-emerald-500 text-slate-950' : step === 1 ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {step > 1 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : '1'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">Basic Student Credentials</p>
                    <p className="text-[10px] opacity-75 truncate">Candidate name, email & password</p>
                  </div>
                </div>

                {/* Step 2 Pill */}
                <div
                  className={`flex items-center gap-2.5 py-2 px-3 rounded-xl border transition-all ${
                    step === 2
                      ? 'bg-indigo-600/25 border-indigo-400/50 text-white shadow-xs'
                      : step > 2
                      ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      step > 2 ? 'bg-emerald-500 text-slate-950' : step === 2 ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {step > 2 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : '2'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">University Academic Details</p>
                    <p className="text-[10px] opacity-75 truncate">URN, department, branch & semester</p>
                  </div>
                </div>

                {/* Step 3 Pill */}
                <div
                  className={`flex items-center gap-2.5 py-2 px-3 rounded-xl border transition-all ${
                    step === 3
                      ? 'bg-indigo-600/25 border-indigo-400/50 text-white shadow-xs'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      step === 3 ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    3
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">Social Category & Income</p>
                    <p className="text-[10px] opacity-75 truncate">Punjab SC quota & family income</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpline Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                GNDEC Scholarship Cell
              </span>
              <span className="text-slate-300 font-mono text-[10px]">Room 102, Admin Block</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Multi-Step Interactive Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              {/* Top Step Header with Progress Bar */}
              <div className="pb-3 border-b border-slate-100 mb-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Step {step} of 3
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {progress.label}
                  </span>
                </div>

                {/* Progress Fill Bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5">
                  {step === 1 && 'Create Student Account'}
                  {step === 2 && 'University Academic Hierarchy'}
                  {step === 3 && 'Eligibility & Income Profiling'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {step === 1 && 'Enter your full legal name and official college email address.'}
                  {step === 2 && 'Specify your GNDEC enrollment details and current academic year.'}
                  {step === 3 && 'Confirm your Scheduled Caste (SC) category and Tehsildar income bracket.'}
                </p>
              </div>

              {/* Error Message Alert */}
              {error && (
                <div className="mb-3.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2.5 shadow-2xs">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-extrabold text-rose-950">Registration Notice</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* STEP 1: Basic Account Credentials */}
              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Jaspreet Kaur"
                        className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-3 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Institutional Email Address
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. jaspreet.kaur@gndec.ac.in"
                        className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-3 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Password
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="block w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-3 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="block w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-3 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 py-2.5 px-5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 hover:from-indigo-700 hover:to-blue-800 rounded-xl shadow-md transition-all transform active:scale-[0.99] cursor-pointer"
                    >
                      <span>Proceed to Academic Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: University Academic Details */}
              {step === 2 && (
                <form onSubmit={handleNext} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        University Roll No. (URN)
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                          placeholder="e.g. 2104520"
                          className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-3 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Contact Phone Number
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="h-4 w-4" />
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. 9876543210"
                          className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-3 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Academic Department / Engineering Branch
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-3 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                      >
                        <option value="Computer Science and Engineering">Computer Science & Engineering (CSE)</option>
                        <option value="Information Technology">Information Technology (IT)</option>
                        <option value="Electronics and Communication Engineering">Electronics & Communication (ECE)</option>
                        <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                        <option value="Civil Engineering">Civil Engineering (CE)</option>
                        <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Course / Degree</label>
                      <input
                        type="text"
                        disabled
                        value={formData.course}
                        className="block w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 bg-slate-100 rounded-xl font-bold text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Year of Study</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="block w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-3 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Active Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                        className="block w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-3 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                      >
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                        <option value={3}>Semester 3</option>
                        <option value={4}>Semester 4</option>
                        <option value={5}>Semester 5</option>
                        <option value={6}>Semester 6</option>
                        <option value={7}>Semester 7</option>
                        <option value={8}>Semester 8</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Step 1
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 py-2.5 px-5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 hover:from-indigo-700 hover:to-blue-800 rounded-xl shadow-md transition-all transform active:scale-[0.99] cursor-pointer"
                    >
                      <span>Proceed to Income & Category</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Income & Social Category */}
              {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Social Reservation Category
                    </label>
                    <p className="text-[10px] text-amber-700 font-semibold mb-1.5">
                      Notice: Dedicated exclusively to the Dr. B.R. Ambedkar Post-Matric SC Scholarship Scheme.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category: 'SC' })}
                      className="w-full py-2.5 px-3.5 text-xs font-bold rounded-xl border border-amber-400 bg-amber-50 text-amber-950 shadow-2xs flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>SC — Scheduled Caste (Punjab State PMS Eligible)</span>
                      </span>
                      <span className="text-[9px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-extrabold uppercase">
                        Verified
                      </span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        Annual Gross Family Income (₹)
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium">Tehsildar / SDM Certified</span>
                    </div>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-xs sm:text-sm">
                        ₹
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="e.g. 1,80,000"
                        value={formData.familyIncome ? formatIndianCurrency(formData.familyIncome) : ''}
                        onChange={(e) => {
                          const parsed = parseIndianCurrency(e.target.value);
                          setFormData({ ...formData, familyIncome: parsed > 0 ? parsed : ('' as any) });
                        }}
                        className={`block w-full pl-8 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50/70 border rounded-xl text-slate-900 font-bold focus:bg-white focus:ring-3 focus:ring-indigo-100 transition-all outline-none font-mono ${
                          Number(formData.familyIncome) > 250000
                            ? 'border-rose-400 focus:border-rose-600 bg-rose-50/30'
                            : 'border-slate-200 focus:border-indigo-600'
                        }`}
                      />
                    </div>

                    {/* Live formatting readout with Indian currency words */}
                    {Boolean(formData.familyIncome && Number(formData.familyIncome) > 0) && (
                      <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                        <span className="font-bold text-slate-700">
                          ₹{formatIndianCurrency(formData.familyIncome)} •{' '}
                          <span className="text-slate-500 font-normal italic">
                            {formatIncomeWords(formData.familyIncome)}
                          </span>
                        </span>
                        {Number(formData.familyIncome) <= 250000 ? (
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

                    {/* Quick Income Preset Pills */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">Common Presets:</span>
                      {[100000, 150000, 180000, 220000, 250000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData({ ...formData, familyIncome: preset })}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            formData.familyIncome === preset
                              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-black'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          ₹{formatIndianCurrency(preset)}
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1.5">
                      *Punjab State PMS mandates total annual income ≤ ₹2,50,000/year issued by Tehsildar/SDM.
                    </p>
                  </div>

                  {/* Student Honor Declaration */}
                  <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[11px] text-indigo-950">Student Honor Declaration</p>
                      <p className="text-[10px] text-indigo-800 mt-0.5 leading-relaxed">
                        I hereby declare that I am an enrolled SC student at GNDEC and the provided income & academic credentials are authentic.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Step 2
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 py-2.5 px-5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-75"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Student Profile...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Registration</span>
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Login Navigation Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Already have an enrolled account?</span>
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Help Desk Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-slate-900 relative">
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Scholarship Support Desk</h3>
                <p className="text-[11px] text-slate-500">Guru Nanak Dev Engineering College</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mt-3 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                  SC Registration Guidance:
                </p>
                <p className="mt-0.5 text-slate-600 text-[11px]">
                  All Scheduled Caste students of GNDEC are eligible for 100% tuition waiver under the Dr. B.R. Ambedkar Scheme provided family annual income is ≤ ₹2.50 Lakh. Have your URN and Tehsildar Income Certificate ready.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Physical Support Office:
                </p>
                <p className="mt-0.5 text-slate-600 text-[11px]">
                  Scholarship Section, Room 102, Administrative Block, GNDEC Gill Park, Ludhiana.
                </p>
              </div>

              <div className="pt-1 flex flex-col gap-1.5 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-amber-500" />
                  <span>Email: <strong>scholarship@gndec.ac.in</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-amber-500" />
                  <span>Helpline: <strong>0161-5064500 (Ext. 204)</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Close Support Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
