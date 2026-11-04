import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar.js';
import { Navbar } from '../components/common/Navbar.js';
import { HelpAssistantWidget } from '../components/common/HelpAssistantWidget.js';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans relative selection:bg-amber-500 selection:text-slate-950">
      {/* Subtle Background Light Grid Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
      <div className="flex-1 flex flex-row relative z-10">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            <Outlet />
          </main>
        </div>
        <HelpAssistantWidget />
      </div>
    </div>
  );
};

