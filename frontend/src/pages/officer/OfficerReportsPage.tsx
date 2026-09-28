import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, FileCode, CheckCircle2, Building2 } from 'lucide-react';
import api from '../../services/api.js';

export const OfficerReportsPage: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const handleDownload = async (format: 'csv' | 'excel', endpoint: string, filename: string) => {
    setDownloading(format);
    setMsg('');
    try {
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMsg(`Report successfully downloaded as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Institutional Reports & Audit Exports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate compliant institutional financial aid spreadsheets, attendance rosters, and state audit summaries in Excel, CSV, and PDF.
        </p>
      </div>

      {msg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applications Master Report */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Scholarship Applications Master Register</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Complete register with candidate roll numbers, branches, academic CGPAs, attendance percentages, scheme allocations, and committee approval statuses.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() =>
                handleDownload('csv', '/reports/applications/csv', `GNDEC_Applications_${Date.now()}.csv`)
              }
              disabled={downloading !== null}
              className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              onClick={() =>
                handleDownload('excel', '/reports/applications/excel', `GNDEC_Applications_${Date.now()}.xlsx`)
              }
              disabled={downloading !== null}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Export Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* State SC/ST Welfare Audit Bundle */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Department of Social Justice State Audit</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Punjab Post-Matric Scholarship compliance register with income certification numbers, verification timestamps, and Tehsildar seals.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() =>
                handleDownload('excel', '/reports/applications/excel', `State_Audit_Register_${Date.now()}.xlsx`)
              }
              disabled={downloading !== null}
              className="w-full py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download Official Audit Workbook (.xlsx)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
