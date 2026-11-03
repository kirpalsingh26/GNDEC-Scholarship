import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  User,
  Clock,
  Search,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
import { Modal } from '../../components/common/Modal.js';
import { SupportTicket } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const StudentTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

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
        addToast('success', 'Support inquiry submitted successfully! A ticket number has been assigned.');
        await fetchTickets();
        setSelectedTicket(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to submit inquiry.');
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
        addToast('info', 'Your message has been sent to the scholarship officer.');
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to send reply.');
    }
  };

  const quickTemplates = [
    'I have uploaded the renewed Income Certificate to Document Vault.',
    'Could you please verify my Punjab SC Freeship Card status?',
    'What is the expected date for the next grant disbursement cycle?',
  ];

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'OPEN' && t.status !== 'RESOLVED' && t.status !== 'CLOSED') ||
      (statusFilter === 'RESOLVED' && (t.status === 'RESOLVED' || t.status === 'CLOSED'));
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-1.5 shadow-2xs">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
            <span>Financial Aid Helpdesk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Student Inquiries & Support Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit questions directly to GNDEC Scholarship Cell officers with real-time threaded message tracking.
          </p>
        </div>

        <button
          onClick={() => setIsNewOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Open New Inquiry
        </button>
      </div>

      {/* Ticket Layout: Left List + Right Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Tickets List */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Your Inquiries ({tickets.length})
            </h3>
            <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200/60 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-0.5 rounded-md transition-all ${statusFilter === 'ALL' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('OPEN')}
                className={`px-2 py-0.5 rounded-md transition-all ${statusFilter === 'OPEN' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-2 py-0.5 rounded-md transition-all ${statusFilter === 'RESOLVED' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
              >
                Resolved
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket # or keyword..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <div className="h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-2" />
              Loading your inquiries...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-1.5 stroke-[1.5]" />
              <p className="font-bold text-slate-700">No matching tickets found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click &apos;Open New Inquiry&apos; to submit a question.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredTickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTicket?._id === t._id
                      ? 'bg-indigo-50/90 border-indigo-200 shadow-2xs scale-[1.01]'
                      : 'bg-white border-slate-100 hover:bg-slate-50/80 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {t.ticketNumber}
                    </span>
                    <Badge status={t.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{t.category}</span>
                    <span>{t.messages?.length || 1} msg(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Active Conversation Thread */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between min-h-[540px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between">
              {/* Thread Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <Badge status={selectedTicket.status} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-2">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned Officer: <strong className="text-slate-800">{selectedTicket.assignedOfficerName || 'GNDEC Scholarship Desk'}</strong>
                </p>
              </div>

              {/* Messages Flow */}
              <div className="py-4 space-y-3.5 flex-1 overflow-y-auto max-h-[300px] pr-2">
                {selectedTicket.messages.map((m, idx) => {
                  const isMe = m.senderRole === 'STUDENT';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-medium">
                        <span className="font-bold text-slate-700">{m.senderName}</span>
                        <span>•</span>
                        <span>{new Date(m.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed shadow-2xs ${
                          isMe
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

              {/* Quick Reply Chips */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Quick Reply Templates:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {quickTemplates.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyMessage(tpl)}
                      className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-xl border border-slate-200/70 transition-colors text-left"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>

                {/* Reply Input Box */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type your message to the scholarship officer..."
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
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-16">
              <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
              Select an inquiry from the left queue to view the reply thread
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="Submit Scholarship / Aid Inquiry"
        subtitle="Our financial aid officer will respond within 24 business hours"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Inquiry Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="SCHOLARSHIP">Scholarship Application / Approval Status</option>
              <option value="DOCUMENTS">Document Rejection / Re-upload Help</option>
              <option value="FREESHIP_CARD">Punjab Freeship Card / State Portal Issue</option>
              <option value="ELIGIBILITY">Eligibility Criteria & Income Ceiling Clarification</option>
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
              className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Query Description</label>
            <textarea
              required
              rows={4}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Provide specific details about your question, application ID, or document..."
              className="mt-1 block w-full px-3.5 py-2.5 text-xs border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]"
            >
              {creating ? 'Submitting Inquiry...' : 'Submit Inquiry Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
