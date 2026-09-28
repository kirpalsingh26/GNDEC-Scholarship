import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Users,
  Award,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickSwitchDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'DEMO' | 'CUSTOM'>('DEMO');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'STUDENT' | 'OFFICER' | 'ADMIN') => {
    setError('');
    setLoading(true);
    try {
      await quickSwitchDemo(role);
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'OFFICER') navigate('/officer/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
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
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                  ScholarSphere
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
                    GNDEC
                  </span>
                </h1>
                <p className="text-[11px] text-indigo-200">Financial Aid & Verification Portal</p>
              </div>
            </div>

            {/* Value Proposition Statement */}
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-black tracking-tight text-white leading-snug">
                One unified gateway for scholarships, attendance & student success.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seamless digital access for enrolled students, verification staff officers, and university administrators of Guru Nanak Dev Engineering College.
              </p>
            </div>

            {/* Feature Highlights Pill List */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Explainable eligibility checklist with AI OCR assist</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <Zap className="h-5 w-5 text-amber-400 shrink-0" />
                <span>Real-time attendance recovery projection algorithm</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <Award className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>Direct state, central, and alumni grant integration</span>
              </div>
            </div>
          </div>

          {/* Institutional Trust Footer */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>GNDEC Ludhiana, Punjab</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Secure Portal v1.0
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Login Container (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white text-slate-900 p-8 sm:p-10 shadow-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            {/* Header Title */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a demo account for instant access or enter credentials
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Lock className="h-5 w-5" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Tabs: One-Click Demo Mode vs Direct Credentials */}
            <div className="mt-6 flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveTab('DEMO')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'DEMO'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                1-Click Demo Personas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CUSTOM')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'CUSTOM'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                Official Email & Password
              </button>
            </div>

            {/* TAB 1: 1-CLICK DEMO CARDS */}
            {activeTab === 'DEMO' ? (
              <div className="mt-6 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select a predefined role to sign in immediately:
                </p>

                {/* Student Demo Persona */}
                <div
                  onClick={() => handleQuickDemo('STUDENT')}
                  className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-emerald-500/20">
                      👨‍🎓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          Harpreet Singh
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          STUDENT
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Roll: <span className="font-mono font-bold text-slate-700">2104501</span> • CSE 5th Sem (8.65 CGPA)
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Scholarship Officer Persona */}
                <div
                  onClick={() => handleQuickDemo('OFFICER')}
                  className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-blue-500/20">
                      🛡️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-800 transition-colors">
                          Dr. Rajesh Sharma
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          OFFICER
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Head of Scholarship Cell • Document Verification Desk
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Super Administrator Persona */}
                <div
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-purple-500/20">
                      ⚙️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-purple-800 transition-colors">
                          Super Administrator
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          ADMIN
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Central Governance, Scheme Rules & Audit Logs
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: EMAIL & PASSWORD FORM */
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Official Email</label>
                  <div className="mt-1 relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@gndec.ac.in"
                      className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Password</label>
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
            )}
          </div>

          {/* Registration Navigation Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">First-time student candidate?</span>
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              Create Enrolled Account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
