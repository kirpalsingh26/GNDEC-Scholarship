import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, MessageSquare, CheckCircle2, User, Clock, Search, Sparkles } from 'lucide-react';
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

  const fetchTickets = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage,
        status: ticketStatus,
      });
      if (res.data.success) {
        setSelectedTicket(res.data.data);
        setReplyMessage('');
        addToast('success', 'Official response dispatched to student candidate.');
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to send response.');
    }
  };

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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-1.5 shadow-2xs">
          <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
          <span>Officer Triage & Student Support</span>
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
            <span className="font-mono text-[10px] font-bold text-slate-400">
              {tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, roll no, or ticket..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading student inquiries...</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                <p className="font-bold text-slate-700">No matching tickets</p>
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
                      ? 'bg-indigo-50/90 border-indigo-200 shadow-2xs scale-[1.01]'
                      : 'bg-white border-slate-100 hover:bg-slate-50/80 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {t.ticketNumber}
                    </span>
                    <Badge status={t.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {t.studentId ? `${t.studentId.firstName} ${t.studentId.lastName}` : 'Student'} ({t.studentId?.rollNumber || 'URN'}) • {t.category}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Conversation & Action */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between min-h-[540px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                      {selectedTicket.ticketNumber}
                    </span>
                    <Badge status={selectedTicket.status} />
                  </div>

                  {/* Status update dropdown */}
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white transition-colors"
                  >
                    <option value="OPEN">Status: OPEN</option>
                    <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                    <option value="WAITING_FOR_STUDENT">Status: WAITING FOR STUDENT</option>
                    <option value="RESOLVED">Status: RESOLVED ✓</option>
                    <option value="CLOSED">Status: CLOSED</option>
                  </select>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mt-2.5">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Student: <strong className="text-slate-800">{selectedTicket.studentId ? `${selectedTicket.studentId.firstName} ${selectedTicket.studentId.lastName}` : 'Student'}</strong> • Roll No: <span className="font-mono font-bold text-indigo-700">{selectedTicket.studentId?.rollNumber}</span>
                </p>
              </div>

              {/* Message History */}
              <div className="py-4 space-y-3.5 flex-1 overflow-y-auto max-h-[300px] pr-2">
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
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200/60'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Officer Reply Box */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type official officer response to candidate..."
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-16">
              <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
              Select a student query from the left queue to respond
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
