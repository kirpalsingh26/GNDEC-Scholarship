import React from 'react';
import { ExternalLink, ShieldCheck, User, Users, Sliders, Lock } from 'lucide-react';
import { getPortalMode, PORTALS, PortalType } from '../../utils/portalConfig.js';

export const PortalSwitcherBar: React.FC = () => {
  const currentMode = getPortalMode();

  const portalList: { type: PortalType; icon: React.FC<{ className?: string }>; port: number; name: string }[] = [
    { type: 'STUDENT', icon: User, port: 5173, name: 'Student Portal (5173)' },
    { type: 'TEACHER', icon: Users, port: 5174, name: 'Faculty Officer (5174)' },
    { type: 'ADMIN', icon: Sliders, port: 5175, name: 'Super Admin (5175)' },
  ];

  return (
    <div className="bg-[#061325] text-slate-300 py-1.5 px-4 border-b border-slate-800 text-[11px] font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Active Portal Identity */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-slate-400 font-medium">Active Environment:</span>
          <span className="font-extrabold text-white flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
            {currentMode === 'TEACHER' && '🛡️ Faculty & Officer Console (Port 5174)'}
            {currentMode === 'ADMIN' && '⚙️ Super Admin Master Console (Port 5175)'}
            {currentMode === 'STUDENT' && '🎓 Student & Public Portal (Port 5173)'}
          </span>
          <span className="hidden md:inline-block text-[10px] text-slate-500 font-mono">
            • Isolated Storage & Privacy Boundary
          </span>
        </div>

        {/* Right: Quick Tab Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mr-1 hidden lg:inline">
            Open in New Tab:
          </span>
          {portalList.map((p) => {
            const isCurrent = p.type === currentMode;
            const Icon = p.icon;
            return (
              <a
                key={p.type}
                href={PORTALS[p.type].url}
                target={isCurrent ? '_self' : '_blank'}
                rel="noreferrer"
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] transition-all ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 shadow-xs cursor-default'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer'
                }`}
                title={`Open ${PORTALS[p.type].name} on port ${p.port}`}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span>{p.name}</span>
                {!isCurrent && <ExternalLink className="h-2.5 w-2.5 opacity-60 ml-0.5" />}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
