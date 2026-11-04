import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api.js';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [registrationMsg, setRegistrationMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as any).registered) {
      if ((location.state as any).email) setEmail((location.state as any).email);
      if ((location.state as any).message) setRegistrationMsg((location.state as any).message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      if (currentUser?.role === 'OFFICER') {
        navigate('/officer/dashboard');
        return;
      }
      if (currentUser?.role === 'ADMIN') {
        navigate('/admin/dashboard');
        return;
      }

      // Check student onboarding status
      try {
        const dashRes = await api.get('/students/dashboard');
        if (dashRes.data.success && dashRes.data.data.onboardingStage === 'DOCUMENTS_REQUIRED') {
          navigate('/student/submit-documents');
          return;
        }
      } catch (dashErr) {
        console.warn('Dashboard check:', dashErr);
      }

      const redirectTo = (location.state as any)?.redirectTo;
      if (redirectTo) {
        navigate(redirectTo);
        return;
      }

      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Animated Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10">
        {/* LEFT COLUMN: Visual Brand Showcase Hero (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

          <div>
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                  GNDEC Ludhiana
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/30">
                    PMS SC
                  </span>
                </h1>
                <p className="text-[11px] text-amber-200">Post-Matric Scholarship Portal</p>
              </div>
            </div>

            {/* Value Proposition Statement */}
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-black tracking-tight text-white leading-snug">
                Official Post-Matric Scholarship Portal for SC Students.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Centralized gateway for Guru Nanak Dev Engineering College Scheduled Caste students, verification officers, and welfare committee administrators.
              </p>
            </div>

            {/* Feature Highlights Pill List */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>100% Tuition Fee Exemption for Certified SC Students</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <FileCheck2 className="h-5 w-5 text-amber-400 shrink-0" />
                <span>Freeship Card & Tehsildar Income Verification (≤ ₹2.50L)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <Award className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>Punjab State Direct Benefit Transfer (DBT) PFMS Disbursal</span>
              </div>
            </div>
          </div>

          {/* Institutional Trust Footer */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>GNDEC Ludhiana, Punjab</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Secure Institutional Portal
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Official Login Container (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white text-slate-900 p-8 sm:p-10 shadow-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            {/* Header Title */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Sign In</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your registered institutional credentials to access your account
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Lock className="h-5 w-5" />
              </div>
            </div>

            {/* Direct Scholarship Intent Banner */}
            {(location.state as any)?.scholarshipTitle && (
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <GraduationCap className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Scholarship Application Intent</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Sign in with your student credentials to continue applying for <strong>{(location.state as any).scholarshipTitle}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Registration Success Banner */}
            {registrationMsg && (
              <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-xs text-emerald-800 flex items-start gap-3 shadow-2xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">Registration Complete!</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">{registrationMsg}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* EMAIL & PASSWORD FORM */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Official Institutional Email</label>
                <div className="mt-1 relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. 2104501@gndec.ac.in or officer.rajesh@gndec.ac.in"
                    className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                </div>
                <div className="mt-1 relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all hover:scale-[1.01]"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Registration Navigation Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">First-time student candidate?</span>
            <Link
              to="/register"
              state={location.state}
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              Register Enrolled SC Candidate
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
