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
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

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
    category: 'GENERAL',
    familyIncome: 250000,
    phone: '',
    course: 'B.Tech',
    year: 3,
    semester: 5,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        setError('Passwords do not match.');
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
        phone: formData.phone || '9876543210',
        course: formData.course,
        year: Number(formData.year),
        semester: Number(formData.semester),
      });
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please review your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10">
        {/* LEFT COLUMN: Benefits & Instructions Showcase (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div>
            {/* Brand Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-black text-lg tracking-tight text-white flex items-center gap-2">
                  ScholarSphere
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
                    GNDEC
                  </span>
                </h1>
                <p className="text-[10px] text-indigo-200">Candidate Enrollment Desk</p>
              </div>
            </div>

            {/* Registration Perks */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-black tracking-tight text-white">
                Unlock 100% Fee Grants & Financial Endowments
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Register with your official GNDEC roll number to automatically evaluate eligibility across state, central, and alumni scholarship schemes.
              </p>
            </div>

            {/* Step Progress Checklist */}
            <div className="mt-8 space-y-3">
              <div
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  step === 1
                    ? 'bg-indigo-600/30 border-indigo-400/50 text-white'
                    : step > 1
                    ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <div className="h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs bg-white/10 shrink-0">
                  {step > 1 ? '✓' : '1'}
                </div>
                <div className="text-xs">
                  <p className="font-bold">Account Credentials</p>
                  <p className="text-[10px] opacity-75">Name, email & security password</p>
                </div>
              </div>

              <div
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  step === 2
                    ? 'bg-indigo-600/30 border-indigo-400/50 text-white'
                    : step > 2
                    ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <div className="h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs bg-white/10 shrink-0">
                  {step > 2 ? '✓' : '2'}
                </div>
                <div className="text-xs">
                  <p className="font-bold">Academic Hierarchy</p>
                  <p className="text-[10px] opacity-75">Roll number, branch & semester</p>
                </div>
              </div>

              <div
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  step === 3
                    ? 'bg-indigo-600/30 border-indigo-400/50 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <div className="h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs bg-white/10 shrink-0">
                  3
                </div>
                <div className="text-xs">
                  <p className="font-bold">Income & Social Category</p>
                  <p className="text-[10px] opacity-75">Welfare grants & income brackets</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Official GNDEC Portal</span>
            <span className="text-emerald-400 font-bold">256-bit Encrypted</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Multi-Step Interactive Form (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-white text-slate-900 p-8 sm:p-10 shadow-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            {/* Top Step Breadcrumb */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  Step {step} of 3
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {step === 1 && 'Create Student Account'}
                  {step === 2 && 'University Academic Details'}
                  {step === 3 && 'Eligibility & Income Profiling'}
                </h3>
              </div>
              <p className="text-xs font-bold text-slate-400 font-mono">
                {step === 1 && '33%'}
                {step === 2 && '66%'}
                {step === 3 && '100%'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Basic Account */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Full Name</label>
                  <div className="mt-1 relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Jaspreet Kaur"
                      className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Official Email</label>
                  <div className="mt-1 relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. jaspreet.kaur@gndec.ac.in"
                      className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <div className="mt-1 relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
                    <div className="mt-1 relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:scale-[1.01]"
                  >
                    Proceed to Academic Details
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Academic Details */}
            {step === 2 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      University Roll No. (URN)
                    </label>
                    <div className="mt-1 relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        placeholder="e.g. 2104520"
                        className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">Contact Phone</label>
                    <div className="mt-1 relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Academic Department</label>
                  <div className="mt-1 relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Course / Degree</label>
                    <input
                      type="text"
                      disabled
                      value={formData.course}
                      className="mt-1 block w-full px-3 py-2.5 text-xs border border-slate-200 bg-slate-50 rounded-xl font-semibold text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">Year of Study</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">Active Semester</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
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

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:scale-[1.01]"
                  >
                    Proceed to Income & Category
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Income & Social Category */}
            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Social Reservation Category
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Used to automatically match state Post-Matric & AICTE schemes
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['GENERAL', 'SC', 'ST', 'OBC', 'EWS', 'MINORITY', 'PWD'].map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                          formData.category === cat
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Annual Gross Family Income (₹)
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1">
                    State scholarships (e.g. Punjab PMSS) require income $\le$ ₹2,50,000/yr
                  </p>
                  <div className="mt-1 relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                      ₹
                    </div>
                    <input
                      type="number"
                      required
                      value={formData.familyIncome}
                      onChange={(e) => setFormData({ ...formData, familyIncome: Number(e.target.value) })}
                      className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Student Honor Declaration</p>
                    <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                      By submitting this registration, I certify that I am a bonafide student of GNDEC and all academic/income details are true to the best of my knowledge.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-7 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all hover:scale-[1.01]"
                  >
                    {loading ? 'Creating Student Profile...' : 'Complete Registration ✓'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Login Navigation Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Already registered on ScholarSphere?</span>
            <Link
              to="/login"
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              Sign In to Your Account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
