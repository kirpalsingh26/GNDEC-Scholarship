import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Send, MessageSquare, AlertCircle, CheckCircle2, User } from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { Modal } from '../../components/common/Modal.js';
import { SupportTicket } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

export const StudentTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // New Ticket Modal State
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('SCHOLARSHIP');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      if (res.data.success) {
        setTickets(res.data.data);
        if (res.data.data.length > 0 && !selectedTicket) {
          setSelectedTicket(res.data.data[0]);
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/tickets', {
        category: newCategory,
        subject: newSubject,
        description: newDesc,
        priority: newPriority,
      });
      if (res.data.success) {
        setIsNewOpen(false);
        setNewSubject('');
        setNewDesc('');
        await fetchTickets();
        setSelectedTicket(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Student Support & Helpdesk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit inquiries directly to the GNDEC Scholarship & Financial Aid Committee with threaded message tracking.
          </p>
        </div>

        <button
          onClick={() => setIsNewOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Open New Query Ticket
        </button>
      </div>

      {/* Ticket Layout: Left List + Right Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Your Support Inquiries ({tickets.length})
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No support tickets found.</div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
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
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Conversation Thread */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between">
              {/* Thread Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {selectedTicket.ticketNumber}
                  </span>
                  <Badge status={selectedTicket.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500">
                  Assigned Officer: {selectedTicket.assignedOfficerName || 'Scholarship Desk'}
                </p>
              </div>

              {/* Messages Flow */}
              <div className="py-4 space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-2">
                {selectedTicket.messages.map((m, idx) => {
                  const isMe = m.senderRole === 'STUDENT';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-semibold">
                        <span>{m.senderName}</span>
                        <span>•</span>
                        <span>{new Date(m.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-md ${
                          isMe
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

              {/* Reply Input Box */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type your response to the officer..."
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
              Select a ticket on the left to view the reply thread
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="Open Support / Scholarship Inquiry Ticket"
        subtitle="Our financial aid officer will respond within 24 business hours"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Inquiry Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="SCHOLARSHIP">Scholarship Application / Approval</option>
              <option value="DOCUMENTS">Document Rejection / Re-upload</option>
              <option value="ATTENDANCE">Attendance Threshold / Shortage</option>
              <option value="ELIGIBILITY">Eligibility Criteria Clarification</option>
              <option value="RENEWAL">Annual Scholarship Renewal</option>
              <option value="TECHNICAL">Portal Technical Issue</option>
              <option value="OTHER">General Query</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Subject</label>
            <input
              type="text"
              required
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Issue regarding Income Certificate digital seal"
              className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Query Description</label>
            <textarea
              required
              rows={4}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Provide specific details about your question or document..."
              className="mt-1 block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              {creating ? 'Submitting Ticket...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
