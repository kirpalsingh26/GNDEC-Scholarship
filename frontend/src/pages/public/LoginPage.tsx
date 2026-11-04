import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api.js';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Award,
  Sliders,
  HelpCircle,
  X,
  Phone,
  Building2,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { getPortalMode, PORTALS } from '../../utils/portalConfig.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();
  const portalMode = getPortalMode();

  const isTeacherPortal = portalMode === 'TEACHER';
  const isAdminPortal = portalMode === 'ADMIN';
  const isStudentPortal = portalMode === 'STUDENT';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [registrationMsg, setRegistrationMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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

      // 1. Role boundary protection for Teacher / Faculty portal (Port 5174)
      if (isTeacherPortal && currentUser?.role === 'STUDENT') {
        logout();
        setError('Access Denied: This portal is strictly for GNDEC Faculty Verification Officers. Please use the Student Portal at http://localhost:5173.');
        return;
      }

      // 2. Role boundary protection for Super Admin portal (Port 5175)
      if (isAdminPortal && currentUser?.role !== 'ADMIN') {
        logout();
        setError('Access Denied: Super Admin privileges are required to access this portal.');
        return;
      }

      // 3. Navigation routing
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
      setError(err.response?.data?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1b] text-slate-100 flex flex-col font-sans relative selection:bg-amber-500 selection:text-slate-950">
      {/* Background Subtle Grid Pattern & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 border-b border-white/5 bg-[#070e1b]/70 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to={isTeacherPortal ? '/officer/dashboard' : isAdminPortal ? '/admin/dashboard' : '/'}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-amber-400" />
            <span>{isStudentPortal ? 'Back to Portal Homepage' : 'Back to Dashboard'}</span>
          </Link>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="hidden sm:flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
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
      <main className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT COLUMN: Visual Brand Showcase Hero (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-7 sm:p-9 backdrop-blur-xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* College Logo & Accreditation */}
              <div className="flex items-start gap-3.5">
                <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                      GNDEC Ludhiana
                    </h1>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase tracking-wider">
                      {isTeacherPortal ? 'OFFICER' : isAdminPortal ? 'ADMIN' : 'PMS SC'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Guru Nanak Dev Engineering College
                  </p>
                  <p className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                    NAAC &apos;A&apos; Grade • Autonomous Institution Estd. 1956
                  </p>
                </div>
              </div>

              {/* Portal Title & Mission */}
              <div className="mt-8 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-amber-300">
                  <Sparkles className="h-3 w-3" />
                  {isTeacherPortal
                    ? 'Faculty Verification Desk'
                    : isAdminPortal
                    ? 'Master Administration Tower'
                    : 'Dr. B.R. Ambedkar SC Scholarship'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {isTeacherPortal
                    ? 'Faculty Scrutiny & Approval Desk'
                    : isAdminPortal
                    ? 'Master Governance & Security Center'
                    : 'Official Post-Matric Scholarship Portal'}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isTeacherPortal
                    ? 'Dedicated portal for Guru Nanak Dev Engineering College department verification officers. Audit student freeship cards, tehsildar income proofs, and process SC scholarship batches.'
                    : isAdminPortal
                    ? 'Central governance console for college scholarship management. Configure active schemes, audit officer reviews, manage permissions, and export state compliance records.'
                    : 'Institutional scholarship gateway enabling enrolled Scheduled Caste candidates to claim 100% tuition waivers and state Direct Benefit Transfer (DBT) funds.'}
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="mt-7 space-y-2.5">
                {isTeacherPortal ? (
                  <>
                    <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <FileCheck2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Digital Document Queue</p>
                        <p className="text-[11px] text-slate-400">Review Freeship Cards & Tehsildar certificates</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Income Limit Verification</p>
                        <p className="text-[11px] text-slate-400">Strict compliance with ≤ ₹2.50 Lakh family cap</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Instant Defect Workflow</p>
                        <p className="text-[11px] text-slate-400">Flag corrections directly to student dashboard</p>
                      </div>
                    </div>
                  </>
                ) : isAdminPortal ? (
                  <>
                    <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Sliders className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Role & Privilege Governance</p>
                        <p className="text-[11px] text-slate-400">Configure officer access across academic departments</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Security & Audit Trails</p>
                        <p className="text-[11px] text-slate-400">Immutable logging of every review and approval</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Scheme Lifecycle Control</p>
                        <p className="text-[11px] text-slate-400">Manage active schemes, quotas, and deadlines</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">100% Tuition Fee Exemption</p>
                        <p className="text-[11px] text-slate-400">Full waiver under Punjab State SC Welfare Scheme</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <FileCheck2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Digital Document Verification</p>
                        <p className="text-[11px] text-slate-400">Upload Freeship Card, Income (≤ ₹2.50L) & Passbook</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Direct Benefit Transfer (DBT)</p>
                        <p className="text-[11px] text-slate-400">PFMS integrated scholarship disbursals to bank</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Helpline Footer */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                GNDEC Scholarship Cell
              </span>
              <span className="text-slate-300 font-mono text-[10px]">Room 102, Admin Block</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Official Login Container (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-white text-slate-900 p-7 sm:p-10 shadow-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              {/* Form Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold mb-2.5 tracking-wide uppercase shadow-2xs border">
                    {isTeacherPortal ? (
                      <span className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                        🛡️ Faculty Verification Login
                      </span>
                    ) : isAdminPortal ? (
                      <span className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                        ⚙️ Super Administrator Login
                      </span>
                    ) : (
                      <span className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1">
                        🎓 Student Candidate Login
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Sign in to your account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {isTeacherPortal
                      ? 'Enter your institutional faculty email to review verification queues.'
                      : isAdminPortal
                      ? 'Enter authorized super-admin credentials to access college controls.'
                      : 'Enter your registered email and password to access your scholarship desk.'}
                  </p>
                </div>
                <div
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    isTeacherPortal
                      ? 'bg-blue-50 text-blue-600'
                      : isAdminPortal
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <Lock className="h-5 w-5" />
                </div>
              </div>

              {/* Direct Scholarship Intent Banner */}
              {(location.state as any)?.scholarshipTitle && (
                <div className="mt-5 rounded-2xl bg-amber-50/90 border border-amber-300 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
                  <GraduationCap className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-amber-950">Target Scholarship Scheme</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Please log in to continue your application for <strong>{(location.state as any).scholarshipTitle}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Registration Success Banner */}
              {registrationMsg && (
                <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-xs text-emerald-800 flex items-start gap-3 shadow-2xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-emerald-950">Registration Successful!</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">{registrationMsg}</p>
                  </div>
                </div>
              )}

              {/* Error Message Alert */}
              {error && (
                <div className="mt-5 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 flex items-start gap-3 shadow-2xs">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-extrabold text-rose-950">Authentication Notice</p>
                    <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Institutional Email Address
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        isTeacherPortal
                          ? 'faculty@gndec.ac.in or officer email'
                          : isAdminPortal
                          ? 'admin@gndec.ac.in'
                          : 'student@gndec.ac.in or registered email'
                      }
                      className="block w-full pl-10 pr-3.5 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsHelpOpen(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-10 pr-11 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox & Security Indicator */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600">Keep me logged in</span>
                  </label>
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Encrypted Session
                  </span>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-2 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl shadow-md text-sm font-bold text-white transition-all transform active:scale-[0.99] hover:shadow-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                    isTeacherPortal
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:ring-4 focus:ring-blue-100'
                      : isAdminPortal
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 focus:ring-4 focus:ring-purple-100'
                      : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 hover:from-indigo-700 hover:to-blue-800 focus:ring-4 focus:ring-indigo-100'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isTeacherPortal
                          ? 'Sign In to Faculty Desk'
                          : isAdminPortal
                          ? 'Sign In to Admin Tower'
                          : 'Sign In to Student Portal'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer Callout */}
            <div className="mt-8 pt-5 border-t border-slate-100">
              {isStudentPortal ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-800">New SC candidate at GNDEC?</p>
                    <p className="text-[11px] text-slate-500">Register once to access 100% fee waiver benefits</p>
                  </div>
                  <Link
                    to="/register"
                    state={location.state}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-white border border-indigo-200 shadow-2xs hover:bg-indigo-50 hover:border-indigo-300 transition-all shrink-0"
                  >
                    <span>Register Candidate</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Student looking to apply?</span>
                  <a
                    href={PORTALS.STUDENT.url}
                    className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    Open Student Portal
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Help Desk Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-slate-900 relative">
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Scholarship Support Desk</h3>
                <p className="text-xs text-slate-500">Guru Nanak Dev Engineering College</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 mt-4 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  For Students:
                </p>
                <p className="mt-1 text-slate-600">
                  If you forgot your password or cannot access your account, visit the <strong>Scholarship Section (Room 102, Admin Block)</strong> with your physical College ID card, or write to our support email.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  For Faculty & Scrutiny Officers:
                </p>
                <p className="mt-1 text-slate-600">
                  Faculty credentials are institutional and provisioned by the Dean Academic / Principal Office. Contact the College System Administrator for password resets.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-amber-500" />
                  <span>Email: <strong>scholarship@gndec.ac.in</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-amber-500" />
                  <span>Helpline: <strong>0161-5064500 (Ext. 204)</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
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
