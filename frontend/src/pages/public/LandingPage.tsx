import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  Building2,
  Clock,
  Lock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Award,
  Wallet,
  Calendar,
  Sparkles,
  AlertCircle,
  Check,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../services/api.js';
import { Scholarship } from '../../types/index.js';
import { PortalSwitcherBar } from '../../components/common/PortalSwitcherBar.js';

// Helper to compute remaining days, hours, minutes, and seconds
function calculateTimeLeft(deadlineDate: string | Date) {
  const target = new Date(deadlineDate).getTime();
  const diff = target - Date.now();

  if (diff <= 0 || isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true, totalMs: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPassed: false,
    totalMs: diff,
  };
}

// Live Countdown Clock & Urgency Badge Component with real-time ticking
const LiveCountdownClock: React.FC<{
  deadline: string | Date;
  compact?: boolean;
  showPill?: boolean;
}> = ({ deadline, compact = false, showPill = true }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(deadline));

  useEffect(() => {
    // Tick every second to provide a live real-time countdown
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.isPassed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <Clock className="h-3 w-3 text-amber-400" />
        Application Cycle Active
      </span>
    );
  }

  const isUrgent = timeLeft.days <= 5;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-center">
        <div className="flex flex-col items-center bg-black/65 border border-white/15 rounded-xl px-2.5 py-1 min-w-[42px] shadow-inner">
          <span className="font-mono font-black text-sm text-amber-300 leading-tight">
            {timeLeft.days}
          </span>
          <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider">
            Days
          </span>
        </div>
        <span className="text-amber-400/80 font-bold text-xs">:</span>
        <div className="flex flex-col items-center bg-black/65 border border-white/15 rounded-xl px-2.5 py-1 min-w-[42px] shadow-inner">
          <span className="font-mono font-black text-sm text-white leading-tight">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider">
            Hrs
          </span>
        </div>
        <span className="text-amber-400/80 font-bold text-xs">:</span>
        <div className="flex flex-col items-center bg-black/65 border border-white/15 rounded-xl px-2.5 py-1 min-w-[42px] shadow-inner">
          <span className="font-mono font-black text-sm text-white leading-tight">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider">
            Min
          </span>
        </div>
        <span className="text-amber-400/80 font-bold text-xs">:</span>
        <div className="flex flex-col items-center bg-black/65 border border-white/15 rounded-xl px-2.5 py-1 min-w-[42px] shadow-inner">
          <span className="font-mono font-black text-sm text-emerald-400 leading-tight">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider">
            Sec
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start md:items-end gap-2">
      {/* Prominent Live Pill */}
      {showPill && (
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm ${
            isUrgent
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-amber-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            {timeLeft.days > 0
              ? `${timeLeft.days} Days Left to Apply`
              : `${timeLeft.hours} Hours Left to Apply`}
          </span>
        </div>
      )}

      {/* Digital Real-Time Flip Boxes */}
      <div className="flex items-center gap-1 sm:gap-1.5 text-center">
        <div className="flex flex-col items-center bg-black/60 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 min-w-[50px] shadow-inner">
          <span className="font-mono font-black text-sm sm:text-base text-amber-300 leading-tight">
            {timeLeft.days}
          </span>
          <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider">
            Days
          </span>
        </div>
        <span className="text-amber-400 font-bold text-xs">:</span>
        <div className="flex flex-col items-center bg-black/60 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 min-w-[50px] shadow-inner">
          <span className="font-mono font-black text-sm sm:text-base text-white leading-tight">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider">
            Hours
          </span>
        </div>
        <span className="text-amber-400 font-bold text-xs">:</span>
        <div className="flex flex-col items-center bg-black/60 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 min-w-[50px] shadow-inner">
          <span className="font-mono font-black text-sm sm:text-base text-white leading-tight">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider">
            Mins
          </span>
        </div>
        <span className="text-amber-400 font-bold text-xs">:</span>
        <div className="flex flex-col items-center bg-black/60 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 min-w-[50px] shadow-inner">
          <span className="font-mono font-black text-sm sm:text-base text-emerald-400 leading-tight">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider">
            Secs
          </span>
        </div>
      </div>
    </div>
  );
};

// Aliased for backwards compatibility
const LiveCountdownBadge = LiveCountdownClock;

const getSchemeTheme = (code?: string) => {
  switch (code) {
    case 'PB-PMS-FREESHIP':
      return {
        topBorder: 'from-emerald-500 via-teal-600 to-emerald-400',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        consoleBg: 'from-[#07241f] via-[#0b3831] to-[#07241f] border-emerald-900/40',
        glowColor: 'bg-emerald-400/10',
        benefitPill: '100% Tuition & Dev Fee Waiver',
        benefitPillColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        btnBg: 'bg-[#07241f] hover:bg-[#0e423a]',
        accentText: 'text-emerald-700',
      };
    case 'PB-PMS-HOSTEL':
      return {
        topBorder: 'from-indigo-500 via-blue-600 to-indigo-400',
        badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
        consoleBg: 'from-[#101c3d] via-[#162754] to-[#101c3d] border-indigo-900/40',
        glowColor: 'bg-indigo-400/10',
        benefitPill: 'Hosteller Boarding DBT (₹4,000/mo)',
        benefitPillColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        btnBg: 'bg-[#101c3d] hover:bg-[#1a2f69]',
        accentText: 'text-indigo-700',
      };
    case 'PB-PMS-MERIT':
      return {
        topBorder: 'from-purple-500 via-violet-600 to-purple-400',
        badgeBg: 'bg-purple-50 text-purple-800 border-purple-300',
        consoleBg: 'from-[#231238] via-[#331a52] to-[#231238] border-purple-900/40',
        glowColor: 'bg-purple-400/10',
        benefitPill: 'Books, Laptop & Study Equipment Grant',
        benefitPillColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        btnBg: 'bg-[#231238] hover:bg-[#3b1e5e]',
        accentText: 'text-purple-700',
      };
    default:
      return {
        topBorder: 'from-amber-400 via-[#0b2341] to-amber-500',
        badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
        consoleBg: 'from-[#0b1f3a] via-[#102d54] to-[#0b1f3a] border-blue-900/40',
        glowColor: 'bg-amber-400/10',
        benefitPill: '100% Tuition Fee Exemption + DBT',
        benefitPillColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        btnBg: 'bg-[#0b2341] hover:bg-[#12335c]',
        accentText: 'text-amber-700',
      };
  }
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current active scholarships publicly without requiring user login
  useEffect(() => {
    const fetchPublicScholarships = async () => {
      try {
        setLoading(true);
        const res = await api.get('/scholarships?status=ACTIVE');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setScholarships(res.data.data);
        } else {
          // Robust institutional fallback if database is bootstrapping
          setScholarships([
            {
              _id: 'pb-pms-sc-default',
              title: 'Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students (Punjab)',
              code: 'PB-PMS-SC',
              provider: 'Department of Social Justice, Empowerment & Minorities, Govt. of Punjab',
              type: 'RESERVATION',
              description:
                'Centrally sponsored and Punjab State Government implemented Post Matric Scholarship Scheme for Scheduled Caste (SC) students pursuing technical and engineering education at GNDEC Ludhiana. Provides 100% tuition and institutional fee waiver along with annual Direct Benefit Transfer (DBT) maintenance allowance.',
              amount: 75000,
              frequency: 'ANNUAL',
              academicYear: '2025-2026',
              deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
              isRenewable: true,
              status: 'ACTIVE',
              requiredDocuments: [
                'INCOME_CERTIFICATE',
                'CASTE_CERTIFICATE',
                'RESIDENCE_CERTIFICATE',
                'ACADEMIC_MARKSHEET',
                'BANK_PROOF',
                'FEE_RECEIPT',
              ],
              rules: {
                minCgpa: 0,
                maxFamilyIncome: 250000,
                allowedCategories: ['SC'],
                maxBacklogs: 3,
                genderRestriction: 'ALL',
              },
            } as any,
            {
              _id: 'pb-pms-freeship-default',
              title: 'Punjab State SC Freeship Card & Direct Institutional Tuition Fee Waiver',
              code: 'PB-PMS-FREESHIP',
              provider: 'Punjab State Welfare Department (Dr. Ambedkar Portal)',
              type: 'RESERVATION',
              description:
                'Direct tuition and development fee exemption for Scheduled Caste students admitted under Punjab SC quota at GNDEC Ludhiana. Eligible candidates receive instant semester fee exemption upon verified Freeship Card submission.',
              amount: 68000,
              frequency: 'ANNUAL',
              academicYear: '2025-2026',
              deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
              isRenewable: true,
              status: 'ACTIVE',
              requiredDocuments: [
                'INCOME_CERTIFICATE',
                'CASTE_CERTIFICATE',
                'RESIDENCE_CERTIFICATE',
                'BANK_PROOF',
                'BONAFIDE_CERTIFICATE',
              ],
              rules: {
                minCgpa: 0,
                maxFamilyIncome: 250000,
                allowedCategories: ['SC'],
                maxBacklogs: 4,
                genderRestriction: 'ALL',
              },
            } as any,
            {
              _id: 'pb-pms-hostel-default',
              title: 'Punjab State SC Hosteller Special Boarding & Mess Allowance Scheme',
              code: 'PB-PMS-HOSTEL',
              provider: 'Department of Social Justice, Empowerment & Minorities, Govt. of Punjab',
              type: 'RESERVATION',
              description:
                'Dedicated residential and boarding maintenance grant for Scheduled Caste (SC) students residing in GNDEC campus hostels. Disbursed via DBT at ₹4,000 per month to cover mess bills and hostel accommodations.',
              amount: 48000,
              frequency: 'ANNUAL',
              academicYear: '2025-2026',
              deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
              isRenewable: true,
              status: 'ACTIVE',
              requiredDocuments: [
                'INCOME_CERTIFICATE',
                'CASTE_CERTIFICATE',
                'RESIDENCE_CERTIFICATE',
                'BANK_PROOF',
                'BONAFIDE_CERTIFICATE',
              ],
              rules: {
                minCgpa: 0,
                maxFamilyIncome: 250000,
                allowedCategories: ['SC'],
                maxBacklogs: 3,
                genderRestriction: 'ALL',
              },
            } as any,
            {
              _id: 'pb-pms-merit-default',
              title: 'Dr. Ambedkar SC Higher Technical Education Book Bank & Equipment Grant',
              code: 'PB-PMS-MERIT',
              provider: 'Punjab State Directorate of Technical Education & Industrial Training',
              type: 'RESERVATION',
              description:
                'Annual academic grant providing financial assistance for textbook procurement, laptop/computing devices, scientific calculators, and laboratory toolkits for SC engineering and technology students.',
              amount: 35000,
              frequency: 'ANNUAL',
              academicYear: '2025-2026',
              deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
              isRenewable: true,
              status: 'ACTIVE',
              requiredDocuments: [
                'INCOME_CERTIFICATE',
                'CASTE_CERTIFICATE',
                'RESIDENCE_CERTIFICATE',
                'ACADEMIC_MARKSHEET',
                'BANK_PROOF',
              ],
              rules: {
                minCgpa: 0,
                maxFamilyIncome: 250000,
                allowedCategories: ['SC'],
                maxBacklogs: 2,
                genderRestriction: 'ALL',
              },
            } as any,
          ]);
        }
      } catch (err) {
        console.warn('Using institutional fallback for public scholarship catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicScholarships();
  }, []);

  const handleApplyClick = (sch: Scholarship) => {
    if (!user) {
      // Send unauthenticated users to login or register
      navigate('/login', {
        state: {
          redirectTo: `/student/apply/${sch._id}`,
          scholarshipTitle: sch.title,
        },
      });
    } else if (user.role === 'STUDENT') {
      navigate(`/student/apply/${sch._id}`);
    } else if (user.role === 'OFFICER') {
      navigate('/officer/applications');
    } else {
      navigate('/admin/scholarships');
    }
  };

  const handleRegisterClick = (sch: Scholarship) => {
    navigate('/register', {
      state: {
        redirectTo: `/student/apply/${sch._id}`,
        scholarshipTitle: sch.title,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-amber-600 selection:text-white">
      <PortalSwitcherBar />
      {/* 1. Official State Government & College Top Announcement Ticker */}
      <div className="bg-[#0b1f3a] text-white py-2 px-4 border-b border-amber-500/40 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="bg-amber-500 text-[#0b1f3a] font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
              Official Notice
            </span>
            <span className="text-slate-200 text-[11px] sm:text-xs">
              Session 2025–26: Dr. B.R. Ambedkar Post-Matric Scholarship (PMS) for Scheduled Caste (SC) Students is Active. Mandatory submission of Freeship Card & Tehsildar Income Certificate (≤ ₹2.50 Lakh).
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-amber-300 font-semibold shrink-0">
            <a
              href="https://scholarships.punjab.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              Punjab State Portal <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-slate-500">•</span>
            <span>Helpline: 0161-2502700</span>
          </div>
        </div>
      </div>

      {/* 2. Official College Institutional Header */}
      <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
            {/* College Emblem Icon */}
            <div className="h-12 w-12 rounded-xl bg-[#0b2341] text-amber-400 flex items-center justify-center font-black text-xl shadow-md border-2 border-amber-500/40">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-[#0b2341] tracking-tight leading-tight">
                  GURU NANAK DEV ENGINEERING COLLEGE
                </h1>
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded">
                  Autonomous College (UGC Act - 1956)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                Ludhiana, Punjab • Affiliated to IKGPTU Jalandhar • NAAC 'A+' Accredited
              </p>
              <p className="text-[11px] font-bold text-amber-700 tracking-wide mt-0.5">
                Dr. B.R. Ambedkar Post-Matric Scholarship (PMS) Portal • SC Category
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => {
                  if (user.role === 'STUDENT') navigate('/student/dashboard');
                  else if (user.role === 'OFFICER') navigate('/officer/dashboard');
                  else navigate('/admin/dashboard');
                }}
                className="px-4 py-2 rounded-lg bg-[#0b2341] hover:bg-[#12335c] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg bg-[#0b2341] hover:bg-[#12335c] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  SC Student Register
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Section: Institutional, Dignified, Authoritative */}
      <section className="bg-gradient-to-b from-white to-slate-100/70 border-b border-slate-200 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-5 shadow-2xs">
            <Award className="h-4 w-4 text-amber-600" />
            <span>Punjab State Government Welfare Grant • Session 2025–26</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#0b2341] tracking-tight max-w-4xl mx-auto leading-tight">
            Dr. B.R. Ambedkar Post-Matric Scholarship (PMS) Scheme
          </h2>
          <p className="text-base sm:text-lg font-bold text-amber-800 mt-2">
            Exclusively for Scheduled Caste (SC) Students of Punjab Pursuing Engineering Education
          </p>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Guru Nanak Dev Engineering College facilitates 100% Tuition Fee Waivers, Examination Fee Exemptions, and Direct Benefit Transfer (DBT) Annual Maintenance Allowances under the centrally sponsored Post-Matric Scholarship scheme implemented by the Department of Social Justice, Empowerment & Minorities, Government of Punjab.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('scholarships');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('/login');
              }}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0b2341] hover:bg-[#12335c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              View Active Schemes & Apply
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4 text-slate-500" />
              Existing Student & Officer Login
            </button>
            <a
              href="https://scholarships.punjab.gov.in"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-sm shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              State Freeship Portal <ExternalLink className="h-4 w-4 text-amber-700" />
            </a>
          </div>

          {/* Hero Live Countdown Spotlight Banner */}
          <div className="mt-10 max-w-3xl mx-auto rounded-3xl bg-[#0b2341] text-white p-5 sm:p-7 border-2 border-amber-400 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-4 text-left z-10">
              <div className="h-14 w-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                <Clock className="h-7 w-7 animate-pulse text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-md animate-pulse">
                    Open Now
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    Session 2025–26 Applications Active
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white mt-1">
                  Dr. B.R. Ambedkar Post-Matric SC Scheme
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  100% Tuition Fee Exemption • State DBT Maintenance Allowance
                </p>
              </div>
            </div>

            <div className="z-10 shrink-0 w-full md:w-auto flex flex-col items-center md:items-end gap-3">
              <LiveCountdownClock deadline={scholarships[0]?.deadline || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)} />
              <button
                onClick={() => {
                  const el = document.getElementById('scholarships');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Schemes Below</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Key Scheme Pillars */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xl font-black text-slate-900">100% Fee Exemption</p>
              <p className="text-xs text-slate-500 mt-1">Full tuition, development, and university examination fees waived.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6" />
              </div>
              <p className="text-xl font-black text-slate-900">≤ ₹2.50 Lakh</p>
              <p className="text-xs text-slate-500 mt-1">Gross annual family income ceiling (certified by Tehsildar/SDM).</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-xl font-black text-slate-900">SC Category Only</p>
              <p className="text-xs text-slate-500 mt-1">Dedicated social justice welfare scheme for Scheduled Caste students of Punjab.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group">
              <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="text-xl font-black text-slate-900">DBT via PFMS</p>
              <p className="text-xs text-slate-500 mt-1">Annual maintenance allowance directly transferred to Aadhaar-seeded bank accounts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Active Scholarship Schemes Catalog (Publicly Accessible Without Login) */}
      <section id="scholarships" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-3xl mx-auto mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Public Scholarship Portal • Open for All Enrolled Students</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-[#0b2341] tracking-tight">
            Current Active Scholarship Schemes
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Review detailed scheme terms, eligibility conditions, grant allowances, and live submission deadlines. Click <strong>Apply</strong> to submit your application.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading active scholarship programs and live submission deadlines...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {scholarships.map((sch) => {
              const theme = getSchemeTheme(sch.code);

              const formattedDeadline = new Date(sch.deadline).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              const diffDays = Math.max(
                0,
                Math.ceil((new Date(sch.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              );

              return (
                <div
                  key={sch._id}
                  className="relative bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Micro Color Brand Stripe */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${theme.topBorder}`} />

                  {/* Top Header */}
                  <div className="p-6 sm:p-7 pb-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${theme.badgeBg}`}
                        >
                          <Award className="h-3.5 w-3.5" />
                          {sch.code || 'PB-PMS-SC'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          Session {sch.academicYear || '2025–26'}
                        </span>
                      </div>

                      {/* Live Days Left Pill with Pulsing Status */}
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${
                          diffDays <= 5
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        <span className="relative flex h-2 w-2">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              diffDays <= 5 ? 'bg-rose-400' : 'bg-amber-400'
                            }`}
                          />
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              diffDays <= 5 ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                        </span>
                        <span>{diffDays > 0 ? `${diffDays} Days Left to Apply` : 'Closing Soon'}</span>
                      </div>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#0b2341] transition-colors leading-snug tracking-tight line-clamp-2">
                      {sch.title}
                    </h4>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2 font-medium">
                      <Building2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span className="line-clamp-1">
                        {sch.provider || 'Department of Social Justice, Empowerment & Minorities, Govt. of Punjab'}
                      </span>
                    </p>
                  </div>

                  {/* Central Grant & Live Countdown Console */}
                  <div
                    className={`mx-5 sm:mx-6 rounded-2xl bg-gradient-to-br ${theme.consoleBg} text-white p-5 shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden`}
                  >
                    <div
                      className={`absolute -right-8 -bottom-8 w-32 h-32 ${theme.glowColor} rounded-full blur-2xl pointer-events-none`}
                    />

                    {/* Grant Amount & Benefit */}
                    <div className="z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5 text-amber-400" />
                        Annual Grant Allowance
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          ₹{(sch.amount || 75000).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          /{sch.frequency?.toLowerCase() || 'annual'}
                        </span>
                      </div>
                      <span
                        className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${theme.benefitPillColor}`}
                      >
                        {theme.benefitPill}
                      </span>
                    </div>

                    {/* Live Digital Ticking Countdown Clock */}
                    <div className="z-10 shrink-0 w-full sm:w-auto flex flex-col items-start sm:items-end gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        Live Deadline Countdown
                      </span>
                      <LiveCountdownBadge deadline={sch.deadline} compact />
                      <span className="text-[10px] text-amber-200/90 font-medium mt-0.5">
                        Final Deadline: {formattedDeadline}
                      </span>
                    </div>
                  </div>

                  {/* Card Details & Highlights */}
                  <div className="p-5 sm:p-6 pt-4 flex flex-col flex-1 justify-between space-y-4">
                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {sch.description}
                    </p>

                    {/* Eligibility Highlights Grid */}
                    <div>
                      <h5 className="text-xs font-extrabold text-[#0b2341] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                        Mandatory Scheme Eligibility:
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="h-6 w-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                            SC
                          </div>
                          <div>
                            <strong className="text-slate-800 text-[11px] block">Community / Caste</strong>
                            <span className="text-slate-600 text-[11px]">
                              Strictly for <strong>SC</strong> candidates of Punjab.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Wallet className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <strong className="text-slate-800 text-[11px] block">Family Income Cap</strong>
                            <span className="text-slate-600 text-[11px]">
                              Gross ≤ <strong>₹{(sch.rules?.maxFamilyIncome || 250000).toLocaleString('en-IN')}/-</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="h-6 w-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <GraduationCap className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <strong className="text-slate-800 text-[11px] block">Eligible Programs</strong>
                            <span className="text-slate-600 text-[11px]">
                              B.Tech, M.Tech, MCA, MBA programs.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="h-6 w-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Calendar className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <strong className="text-slate-800 text-[11px] block">Academic Standing</strong>
                            <span className="text-slate-600 text-[11px]">
                              Min CGPA: {sch.rules?.minCgpa || 0} • Max Backlogs: {sch.rules?.maxBacklogs ?? 3}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Required Verification Documents */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileCheck2 className="h-3.5 w-3.5 text-slate-500" />
                        Mandatory Document Verification Checklist:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'SC Caste Certificate',
                          'Income Proof (≤ ₹2.50L)',
                          'Punjab Domicile',
                          'State Freeship Card',
                          'Academic Marksheet',
                          'Aadhaar Bank Book',
                        ].map((doc) => (
                          <span
                            key={doc}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-700 transition-colors"
                          >
                            <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="pt-3.5 border-t border-slate-100 mt-auto bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 gap-2">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">Active for 6 months • Direct DBT</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                          Official Scheme
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        {!user ? (
                          <>
                            <button
                              onClick={() => handleRegisterClick(sch)}
                              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-white text-slate-700 font-bold text-xs transition-all shadow-2xs text-center cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                              <span>Register</span>
                            </button>

                            <button
                              onClick={() => handleApplyClick(sch)}
                              className={`w-full py-2.5 px-3 rounded-xl ${theme.btnBg} text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
                            >
                              <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                              <span>Apply (Sign In)</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleApplyClick(sch)}
                            className={`col-span-1 sm:col-span-2 w-full py-2.5 px-4 rounded-xl ${theme.btnBg} text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer`}
                          >
                            {user.role === 'STUDENT' ? (
                              <>
                                <span>Apply for Scholarship Now</span>
                                <ArrowRight className="h-4 w-4 text-amber-400 shrink-0" />
                              </>
                            ) : (
                              <>
                                <span>Review Application Queue</span>
                                <ArrowRight className="h-4 w-4 shrink-0" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Step-by-Step Institutional Workflow */}
      <section className="bg-white py-14 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Standard Operating Procedure
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0b2341] mt-1">
              PMS Verification & Fee Exemption Workflow
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end steps for GNDEC Scheduled Caste students to claim zero-fee admission and DBT grant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative">
              <div className="h-8 w-8 rounded-full bg-[#0b2341] text-white flex items-center justify-center font-bold text-xs mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">State Freeship Card</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Register on Dr. Ambedkar State Portal (scholarships.punjab.gov.in) with Aadhaar and obtain your Freeship Card.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative">
              <div className="h-8 w-8 rounded-full bg-[#0b2341] text-white flex items-center justify-center font-bold text-xs mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">GNDEC Portal Setup</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Create your student profile with University Roll Number, B.Tech branch, SC category, and Aadhaar-seeded bank account.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative">
              <div className="h-8 w-8 rounded-full bg-[#0b2341] text-white flex items-center justify-center font-bold text-xs mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Document Scrutiny</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Upload Tehsildar Income Certificate, SC Caste Certificate, Marksheets, and passbook. GNDEC Scholarship Officer audits files.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 relative">
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-3">
                4
              </div>
              <h4 className="text-sm font-bold text-emerald-950">100% Fee Exemption</h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Upon committee certification, college tuition fees are waived 100%, and DBT maintenance allowance is released by state government.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact & Official Helpdesk */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0b2341] text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-black text-white">Need Assistance with your PMS Application?</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Visit the Scholarship & Welfare Cell, Room #104, Administrative Block, GNDEC Campus, Gill Road, Ludhiana.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-amber-400" />
                0161-2502700, 5064501 (Ext: 214)
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-amber-400" />
                scholarship@gndec.ac.in
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-400" />
                Gill Park, Gill Road, Ludhiana - 141006
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0b2341] font-extrabold text-xs transition-all shadow-md"
            >
              Scholarship Cell Login
            </button>
          </div>
        </div>
      </section>

      {/* 7. Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-bold text-slate-700">
            Guru Nanak Dev Engineering College, Ludhiana — An Autonomous College Under UGC Act - 1956
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Affiliated to I.K. Gujral Punjab Technical University (IKGPTU) Jalandhar • Accredited Grade 'A+' by NAAC • ISO 9001:2015 Certified
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            © 2026 GNDEC Ludhiana. Post-Matric Scholarship Scheme (PMS) for Scheduled Caste (SC) Students. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
