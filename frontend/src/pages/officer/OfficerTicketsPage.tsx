import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, MessageSquare, CheckCircle2, User, Clock, Search, Sparkles, ShieldCheck, Inbox } from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { SupportTicket } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export const OfficerTicketsPage: React.FC = () => {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      if (res.data.success) {
        setTickets(res.data.data);
        if (res.data.data.length > 0 && !selectedTicket) {
          setSelectedTicket(res.data.data[0]);
          setTicketStatus(res.data.data[0].status);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to retrieve ticket inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage,
        status: ticketStatus,
      });
      if (res.data.success) {
        setSelectedTicket(res.data.data);
        setReplyMessage('');
        addToast('success', 'Official response dispatched to candidate.');
        fetchTickets();
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to dispatch response.');
    } finally {
      setSending(false);
    }
  };

  const quickResponses = [
    'Your Punjab Freeship Card has been verified and registered with college accounts.',
    'Please re-upload your current session (2025–26) Income Certificate in Document Vault.',
    'Your scholarship application is undergoing committee review; expected timeline is 3-5 working days.',
    'Disbursement is authorized via PFMS. Grant will credit directly to your Aadhaar-linked DBT account.',
  ];

  const filtered = tickets.filter((t) => {
    return (
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      (t.studentId?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.studentId?.rollNumber || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-xs font-bold mb-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
          <span>Officer Triage & Student Support Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Student Inquiries & Helpdesk Triage
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Respond to student inquiries regarding document verification, eligibility audits, Freeship Card status, and grant disbursement.
        </p>
      </div>

      {/* 2-Column Split: Ticket List + Response Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Ticket List */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Inquiry Queue ({tickets.length})
            </h3>
            <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, roll no, or ticket..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <div className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-2" />
                Loading student inquiries...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No matching inquiries</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All candidate tickets resolved or none pending.</p>
              </div>
            ) : (
              filtered.map((t) => (
                <div
                  key={t._id}
                  onClick={() => {
                    setSelectedTicket(t);
                    setTicketStatus(t.status);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTicket?._id === t._id
                      ? 'bg-blue-50/90 border-blue-300 shadow-2xs ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-100 hover:bg-slate-50/80 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {t.ticketNumber}
                    </span>
                    <Badge status={t.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {t.studentId ? `${t.studentId.firstName} ${t.studentId.lastName}` : 'Candidate'} •{' '}
                    <span className="font-mono font-semibold text-slate-700">{t.studentId?.rollNumber || 'URN'}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Conversation & Action */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between min-h-[560px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                      {selectedTicket.ticketNumber}
                    </span>
                    <Badge status={selectedTicket.status} />
                  </div>

                  {/* Status update dropdown */}
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors self-start sm:self-auto"
                  >
                    <option value="OPEN">Status: OPEN</option>
                    <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                    <option value="WAITING_FOR_STUDENT">Status: WAITING FOR STUDENT</option>
                    <option value="RESOLVED">Status: RESOLVED ✓</option>
                    <option value="CLOSED">Status: CLOSED</option>
                  </select>
                </div>

                <h3 className="text-base font-black text-slate-900 mt-2.5">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Candidate:{' '}
                  <strong className="text-slate-800">
                    {selectedTicket.studentId
                      ? `${selectedTicket.studentId.firstName} ${selectedTicket.studentId.lastName}`
                      : 'Candidate'}
                  </strong>{' '}
                  • Roll No:{' '}
                  <span className="font-mono font-bold text-blue-700">
                    {selectedTicket.studentId?.rollNumber || 'URN'}
                  </span>
                </p>
              </div>

              {/* Message History */}
              <div className="py-4 space-y-3.5 flex-1 overflow-y-auto max-h-[280px] pr-2">
                {selectedTicket.messages.map((m, idx) => {
                  const isOfficer = m.senderRole !== 'STUDENT';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isOfficer ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-medium">
                        <span className="font-bold text-slate-700">{m.senderName} ({m.senderRole})</span>
                        <span>•</span>
                        <span>{new Date(m.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed shadow-2xs ${
                          isOfficer
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200/60'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Template Chips */}
              <div className="py-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Quick Institutional Remarks:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickResponses.map((qr, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReplyMessage(qr)}
                      className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-800 border border-slate-200 transition-colors line-clamp-1"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Officer Reply Box */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendReply()}
                  placeholder="Type official officer response to candidate..."
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={sending || !replyMessage.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/20 transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-20">
              <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">No inquiry selected</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Select a ticket from the left queue to read and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
