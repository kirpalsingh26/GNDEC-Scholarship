import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  Building2,
  Users,
  Clock,
  BookOpen,
  ChevronRight,
  Lock,
  Download,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Award,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-amber-600 selection:text-white">
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
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0b2341] hover:bg-[#12335c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              Apply for PMS Scholarship (SC Only)
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

          {/* Key Scheme Pillars */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xl font-black text-slate-900">100% Fee Exemption</p>
              <p className="text-xs text-slate-500 mt-1">Full tuition, development, and university examination fees waived.</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Wallet className="h-6 w-6" />
              </div>
              <p className="text-xl font-black text-slate-900">≤ ₹2.50 Lakh</p>
              <p className="text-xs text-slate-500 mt-1">Gross annual family income ceiling (certified by Tehsildar/SDM).</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-xl font-black text-slate-900">SC Category Only</p>
              <p className="text-xs text-slate-500 mt-1">Dedicated social justice welfare scheme for Scheduled Caste students of Punjab.</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="text-xl font-black text-slate-900">DBT via PFMS</p>
              <p className="text-xs text-slate-500 mt-1">Annual maintenance allowance directly transferred to Aadhaar-seeded bank accounts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Scheme Spotlight: Dr. B.R. Ambedkar PMS Scheme */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-[#0b2341] text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-amber-400 text-xs font-black uppercase tracking-wider">
                Scheme Code: PB-PMS-SC
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Dr. B.R. Ambedkar Post-Matric Scholarship Scheme for SC Students
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Department of Social Justice, Empowerment & Minorities, Government of Punjab
              </p>
            </div>
            <div className="text-left md:text-right shrink-0">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                Active for Session 2025–26
              </span>
              <p className="text-xs text-slate-300 mt-1.5">Grant Value: Up to ₹75,000 / Year + Maintenance</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-extrabold text-[#0b2341] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Mandatory Eligibility Conditions (SC Only)
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Caste Category:</strong> Candidate must belong strictly to the <strong>Scheduled Caste (SC)</strong> community recognized in the State of Punjab.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Family Income Ceiling:</strong> Total annual gross family income from all sources must not exceed <strong>₹2,50,000/- (Rupees Two Lakh Fifty Thousand only)</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Punjab Domicile:</strong> Student must be a permanent resident / bonafide domicile of the State of Punjab.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Regular Enrollment:</strong> Enrolled in regular technical degree programs (B.Tech, M.Tech, MCA, MBA) at Guru Nanak Dev Engineering College.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Freeship Card:</strong> Must register on Punjab State Portal (scholarships.punjab.gov.in) and secure a valid Freeship Card.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-[#0b2341] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-amber-600" />
                  Mandatory Document Checklist for Verification
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span>1. SC Caste Certificate (SDM / Tehsildar Issued)</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Mandatory</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span>2. Income Certificate for FY 2025–26 (≤ ₹2.50 Lakh)</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Mandatory</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span>3. Punjab Domicile / Residence Certificate</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Mandatory</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span>4. 10th & 12th / Previous Semester Marksheet</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Mandatory</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span>5. Aadhaar-Seeded Bank Passbook / Cheque</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Mandatory</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span>6. Punjab State Freeship Card Printout</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Mandatory</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Note: Non-SC candidates and candidates with annual family income exceeding ₹2.50 Lakh are not eligible under this scheme.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0b2341] hover:bg-[#12335c] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
              >
                Start PMS Application
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
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
