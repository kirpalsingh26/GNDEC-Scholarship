import React from 'react';
import { QrCode, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { Modal } from './Modal.js';
import { StudentProfile } from '../../types/index.js';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile | null;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, profile }) => {
  if (!profile) return null;

  const verifyUrl = `${window.location.origin}/verify/${profile.qrVerificationToken}`;
  // Generate safe SVG QR representation
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    verifyUrl
  )}&bgcolor=FFFFFF&color=1E3A8A&margin=2`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Student Scholarship Verification Pass"
      subtitle="Official GNDEC Cryptographic Verification Token"
      maxWidth="md"
    >
      <div className="flex flex-col items-center text-center">
        {/* Pass Card */}
        <div className="w-full rounded-2xl bg-gradient-to-b from-indigo-900 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-left">
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                Guru Nanak Dev Engineering College
              </p>
              <h4 className="text-base font-black tracking-tight">SCHOLARSHIP VERIFIED PASS</h4>
            </div>
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
          </div>

          {/* QR Code */}
          <div className="my-5 flex flex-col items-center">
            <div className="rounded-xl bg-white p-3 shadow-inner">
              <img
                src={qrSvgUrl}
                alt="Student Verification QR"
                className="h-36 w-36 object-contain"
              />
            </div>
            <span className="mt-2 font-mono text-[10px] text-slate-400 tracking-wider">
              TOKEN: {profile.qrVerificationToken.slice(0, 18)}...
            </span>
          </div>

          {/* Student Safe Info */}
          <div className="rounded-xl bg-white/5 p-3.5 border border-white/10 text-left space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Student Name:</span>
              <span className="font-bold">{profile.firstName} {profile.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Roll Number / URN:</span>
              <span className="font-mono font-bold text-amber-300">{profile.rollNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-semibold">{profile.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current CGPA:</span>
              <span className="font-bold text-emerald-400">{profile.cgpa} / 10.0</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active Certified Enrolled Candidate
          </div>
        </div>

        {/* Public Link Notice */}
        <div className="mt-4 w-full">
          <a
            href={verifyUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open Public Safe Verification Page
          </a>
          <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
            Privacy Guaranteed: This QR code exposes only non-sensitive institutional status verification. Bank accounts, Aadhaar, phone numbers, and private documents remain protected.
          </p>
        </div>
      </div>
    </Modal>
  );
};
