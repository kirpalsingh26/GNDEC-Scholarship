import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  X,
  Search,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileCheck2,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  actionLabel?: string;
  actionPath?: string;
}

export const HelpAssistantWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 'pms-sc-eligibility',
      category: 'PMS Scheme Eligibility',
      question: 'What are the eligibility criteria for Punjab Post-Matric (PMS) SC Scholarship?',
      answer:
        '1. Category: Must belong to Scheduled Caste (SC) of Punjab State.\n2. Domicile: Must be a bonafide resident of Punjab.\n3. Family Income: Gross annual family income from all sources must not exceed ₹2,50,000/- (verified by SDM/Tehsildar).\n4. Academic: Enrolled in regular engineering/technical program at GNDEC Ludhiana with valid Freeship Card.',
      actionLabel: 'View PMS Scheme Details',
      actionPath: '/student/scholarships',
    },
    {
      id: 'freeship-card',
      category: 'Freeship Card Process',
      question: 'What is a Freeship Card and how do I apply for it?',
      answer:
        'A Freeship Card is issued by the Department of Social Justice, Govt. of Punjab via Dr. Ambedkar Scholarship Portal (scholarships.punjab.gov.in). It entitles eligible SC students to 100% zero-fee college admission. Once generated, upload the Freeship Card in your GNDEC Document Vault.',
      actionLabel: 'Open Document Vault',
      actionPath: '/student/documents',
    },
    {
      id: 'mandatory-docs',
      category: 'Required Certificates',
      question: 'Which documents are mandatory for verification at GNDEC Scholarship Cell?',
      answer:
        '1. Scheduled Caste (SC) Certificate (issued by competent authority/Tehsildar)\n2. Current Financial Year Income Certificate (issued on/after 1st April)\n3. Punjab Residence / Domicile Certificate\n4. 10th & 12th Marksheets / Latest Semester Marksheet\n5. Aadhaar Card (student & parents)\n6. Bank Passbook / Cheque with Aadhaar-seeded account',
      actionLabel: 'Upload Certificates',
      actionPath: '/student/documents',
    },
    {
      id: 'dbt-aadhaar',
      category: 'Direct Benefit Transfer (DBT)',
      question: 'How will the maintenance allowance be disbursed to my account?',
      answer:
        'Maintenance allowance is disbursed directly by the Punjab Government via DBT (Direct Benefit Transfer) through PFMS into your Aadhaar-linked savings account. Ensure your bank account is active and seeded with Aadhaar at your bank branch.',
      actionLabel: 'Check Bank Profile',
      actionPath: '/student/profile',
    },
    {
      id: 'renewal-process',
      category: 'Annual Renewal',
      question: 'How do continuing SC students renew their PMS grant for the next year?',
      answer:
        'Continuing students must submit an updated income affidavit (valid for current FY), latest semester university marksheet, and renew their Freeship Card on the state portal. GNDEC Scholarship Cell will verify and approve continued fee exemption.',
      actionLabel: 'Submit Renewal',
      actionPath: '/student/renewals',
    },
    {
      id: 'grievance-contact',
      category: 'Official Helpdesk',
      question: 'Where can I meet the Scholarship Officer for document queries?',
      answer:
        'You can visit the GNDEC Scholarship & Welfare Cell, Room #104, Administrative Block, GNDEC Campus, Gill Road, Ludhiana. Office hours are Monday through Friday, 9:00 AM to 5:00 PM.',
      actionLabel: 'Raise Helpdesk Ticket',
      actionPath: '/student/tickets',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0b2341] hover:bg-[#12335c] text-white font-bold text-xs shadow-xl border border-amber-500/30 transition-all hover:scale-105 active:scale-95"
          aria-label="Open GNDEC PMS Helpdesk"
        >
          <div className="relative">
            <HelpCircle className="h-5 w-5 text-amber-400" />
          </div>
          <span className="hidden sm:inline">GNDEC PMS Helpdesk</span>
        </button>
      </div>

      {/* Assistant Modal / Flyout */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#0b2341] text-white p-4 flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                  GNDEC Scholarship Cell
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PMS SC Helpdesk
                  </span>
                </h4>
                <p className="text-[10px] text-slate-300">Official Guidance & Verification Support</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PMS guidelines (e.g. 'income', 'freeship', 'caste')..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* FAQs & Knowledge Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <HelpCircle className="h-6 w-6 mx-auto mb-2 text-slate-300" />
                <p>No matching questions found.</p>
                <p className="text-[10px] mt-1">Try keywords like 'income', 'freeship', or 'caste'.</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = activeFaqId === faq.id;
                return (
                  <div key={faq.id} className="pt-2 first:pt-0">
                    <button
                      onClick={() => setActiveFaqId(isExpanded ? null : faq.id)}
                      className="w-full text-left flex items-start justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 block mb-0.5">
                          {faq.category}
                        </span>
                        <p className="text-xs font-bold text-slate-900 leading-snug">{faq.question}</p>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 text-slate-400 shrink-0 mt-0.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90 text-amber-600' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-1.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-slate-700 space-y-2 animate-in fade-in">
                        <p className="whitespace-pre-line leading-relaxed">{faq.answer}</p>
                        {faq.actionLabel && faq.actionPath && (
                          <button
                            onClick={() => {
                              navigate(faq.actionPath!);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-2xs transition-all hover:scale-[1.02]"
                          >
                            <span>{faq.actionLabel}</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Scholarship Cell Contact Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-amber-600" />
              GNDEC Scholarship Cell, Admin Block Room #104
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" />
                scholarship@gndec.ac.in
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                0161-2502700 (Ext. 214)
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
