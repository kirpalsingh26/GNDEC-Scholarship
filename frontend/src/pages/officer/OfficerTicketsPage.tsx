import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, MessageSquare, CheckCircle2, User, Clock } from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { SupportTicket } from '../../types/index.js';

export const OfficerTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [loading, setLoading] = useState(true);

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
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Student Inquiries & Helpdesk Triage
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Respond to student questions regarding document rejection, scholarship deadlines, and eligibility criteria.
        </p>
      </div>

      {/* 2-Column Split: Ticket List + Response Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Open Student Tickets ({tickets.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading inquiries...</div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => {
                    setSelectedTicket(t);
                    setTicketStatus(t.status);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTicket?._id === t._id
                      ? 'bg-indigo-50/80 border-indigo-200 shadow-xs'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{t.ticketNumber}</span>
                    <Badge status={t.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t.studentId ? `${t.studentId.firstName} ${t.studentId.lastName}` : 'Student'} • {t.category}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation & Action */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between min-h-[520px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {selectedTicket.ticketNumber}
                    </span>
                    <Badge status={selectedTicket.status} />
                  </div>

                  {/* Status update dropdown */}
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value)}
                    className="px-3 py-1 text-xs font-semibold border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_FOR_STUDENT">Waiting for Student</option>
                    <option value="RESOLVED">Resolved ✓</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500">
                  Student:{' '}
                  <strong className="text-slate-800">
                    {selectedTicket.studentId ? `${selectedTicket.studentId.firstName} ${selectedTicket.studentId.lastName}` : 'Student'}
                  </strong>{' '}
                  ({selectedTicket.studentId?.rollNumber})
                </p>
              </div>

              {/* Message History */}
              <div className="py-4 space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-2">
                {selectedTicket.messages.map((m, idx) => {
                  const isOfficer = m.senderRole !== 'STUDENT';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isOfficer ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-semibold">
                        <span>{m.senderName} ({m.senderRole})</span>
                        <span>•</span>
                        <span>{new Date(m.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-md ${
                          isOfficer
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-900 rounded-bl-xs'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Officer Reply Box */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type official officer response to candidate..."
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendReply}
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-12">
              <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
              Select a query from the left queue to respond
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
