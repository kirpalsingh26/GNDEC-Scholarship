import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Building2, CheckCircle2, ShieldCheck, Sparkles, Calendar } from 'lucide-react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

export const OfficerReportsPage: React.FC = () => {
  const { addToast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (format: 'csv' | 'excel', endpoint: string, filename: string) => {
    setDownloading(format);
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
      addToast('success', `Report successfully exported as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
      addToast('error', `Failed to export ${format.toUpperCase()} report.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-1.5 shadow-2xs">
          <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-600" />
          <span>Audit Compliance & Exports</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Institutional Reports & Audit Exports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate compliant institutional financial aid spreadsheets, PMS SC candidate registers, and state audit summaries in Excel, CSV, and PDF.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applications Master Report */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all group">
          <div>
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-2xs">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Scholarship Applications Master Register</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Complete register with candidate roll numbers, branches, academic CGPAs, SC caste verification, Freeship Card status, and committee approval statuses.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() =>
                handleDownload('csv', '/reports/applications/csv', `GNDEC_Applications_${Date.now()}.csv`)
              }
              disabled={downloading !== null}
              className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              onClick={() =>
                handleDownload('excel', '/reports/applications/excel', `GNDEC_Applications_${Date.now()}.xlsx`)
              }
              disabled={downloading !== null}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 transition-all hover:scale-105"
            >
              <Download className="h-3.5 w-3.5" />
              Export Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Punjab SC Welfare Audit Bundle */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all group">
          <div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-2xs">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Punjab Department of Social Justice Audit</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Dr. B.R. Ambedkar Post-Matric Scholarship compliance register with SC certification numbers, verification timestamps, and Tehsildar seals.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() =>
                handleDownload('excel', '/reports/applications/excel', `State_Audit_Register_${Date.now()}.xlsx`)
              }
              disabled={downloading !== null}
              className="w-full py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs hover:scale-[1.01]"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              Download Official Audit Workbook (.xlsx)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
