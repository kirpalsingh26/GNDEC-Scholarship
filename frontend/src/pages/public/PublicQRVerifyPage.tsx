import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, CheckCircle2, XCircle, Award, FileCheck2, Building2 } from 'lucide-react';
import api from '../../services/api.js';

export const PublicQRVerifyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await api.get(`/public/verify/${token}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Verification token is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-md w-full text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm">
          <GraduationCap className="h-6 w-6" />
          <span>ScholarSphere — GNDEC Portal</span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
            Validating cryptographic student pass token...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verification Failed</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{error}</p>
          </div>
        ) : (
          <div>
            {/* Valid Badge Banner */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center mb-6">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Officially Certified Enrolled Student
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                Guru Nanak Dev Engineering College (GNDEC), Ludhiana
              </p>
            </div>

            {/* Public Profile Details */}
            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 font-medium">Candidate Name:</span>
                <span className="font-bold text-slate-900">{data?.student?.fullName}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 font-medium">Roll Number / URN:</span>
                <span className="font-mono font-bold text-indigo-700">{data?.student?.rollNumber}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 font-medium">Department:</span>
                <span className="font-semibold text-slate-800">{data?.student?.department}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 font-medium">Program & Year:</span>
                <span className="font-semibold text-slate-800">
                  {data?.student?.course} (Year {data?.student?.year}, Sem {data?.student?.semester})
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 font-medium">Verified Certificates:</span>
                <span className="font-bold text-emerald-600">
                  {data?.verifiedDocumentsCount} Official Documents Certified
                </span>
              </div>
            </div>

            {/* Scholarship Schemes Applied/Granted */}
            {data?.scholarshipApplications && data.scholarshipApplications.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  Active Scholarship Records
                </h4>
                <div className="space-y-2">
                  {data.scholarshipApplications.map((app: any) => (
                    <div
                      key={app._id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{app.scholarshipId?.title}</p>
                        <p className="text-[10px] text-slate-500">{app.academicYear}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Disclaimer Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">
                Institutional Data Security: In compliance with privacy standards, financial bank data and identity proofs remain encrypted and restricted to authorized college officers.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
