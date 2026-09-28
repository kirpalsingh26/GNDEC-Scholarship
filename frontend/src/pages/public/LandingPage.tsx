import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCheck2,
  TrendingUp,
  Award,
  Zap,
  Building2,
  Users,
  Clock,
  BookOpen,
  ChevronRight,
  Lock,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, quickSwitchDemo } = useAuth();
  const [scholarships, setScholarships] = useState<any[]>([]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const res = await api.get('/scholarships');
        if (res.data.success) {
          setScholarships(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPublicData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Glass Navigation */}
      <nav className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 px-6 py-3.5 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                ScholarSphere
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  GNDEC
                </span>
              </span>
              <p className="text-[10px] text-slate-400">Guru Nanak Dev Engineering College</p>
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
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-105 flex items-center gap-1.5"
                >
                  Student Register
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Highlight Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="h-4 w-4 text-amber-400" />
          Session 2025-26 Financial Aid & Post-Matric Applications Open
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Empowering Engineering Talent Through{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Smart Financial Aid
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          ScholarSphere centralizes government scholarships, alumni endowments, explainable eligibility audits, immutable document verification, and algorithmic attendance recovery for GNDEC students.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            Apply for Scholarships
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Lock className="h-4 w-4 text-indigo-400" />
            1-Click Demo Portals
          </button>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left">
            <p className="text-2xl sm:text-3xl font-black text-white">₹1.48 Cr+</p>
            <p className="text-xs text-slate-400 mt-0.5">Disbursed Aid Funds</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left">
            <p className="text-2xl sm:text-3xl font-black text-indigo-400">100%</p>
            <p className="text-xs text-slate-400 mt-0.5">Transparent Eligibility</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">75%</p>
            <p className="text-xs text-slate-400 mt-0.5">Attendance Compliance Target</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left">
            <p className="text-2xl sm:text-3xl font-black text-blue-400">3-Day</p>
            <p className="text-xs text-slate-400 mt-0.5">Average Verification Turnaround</p>
          </div>
        </div>
      </section>

      {/* Featured Scholarships Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Institutional & State Grants
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Active Scholarship Programs
            </h2>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 md:mt-0 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Explore All Schemes <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scholarships.map((sch) => (
            <div
              key={sch._id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                    {sch.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Active
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {sch.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{sch.provider}</p>

                <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Award:</span>
                    <span className="font-bold text-white">₹{sch.amount.toLocaleString('en-IN')}/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min CGPA:</span>
                    <span className="font-bold text-indigo-400">≥ {sch.rules?.minCgpa || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Attendance:</span>
                    <span className="font-bold text-emerald-400">≥ {sch.rules?.minAttendance || 75}%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/register')}
                className="mt-6 w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                Apply for this Grant <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Grid: Core Platform Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            System Capabilities
          </span>
          <h2 className="text-3xl font-black text-white mt-1">
            Engineered for Transparency & Integrity
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Every module addresses a specific bottleneck in university financial aid workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Explainable Rule Engine</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Evaluates student CGPA, mandatory attendance, family income ceilings, and backlogs in real time, explaining exactly why an application passes or fails.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Attendance Recovery Math</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Calculates exact consecutive upcoming classes required to regain compliance (N = ceil((0.75T - A)/0.25)), preventing grant cancellation.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3-Column Verification Desk</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Side-by-side student credentials, high-resolution document viewer, simulated optical OCR confidence score, and immutable version audit history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-slate-500">
        <p>© 2026 Guru Nanak Dev Engineering College (GNDEC), Ludhiana. ScholarSphere Platform.</p>
        <p className="text-[11px] mt-1 text-slate-600">
          Autonomous College Under UGC Act • Affiliated to IKGPTU Jalandhar
        </p>
      </footer>
    </div>
  );
};
