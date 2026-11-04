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
  Inbox,
  ShieldCheck,
  X,
} from 'lucide-react';
import api from '../../services/api.js';
import { Badge } from '../../components/common/Badge.js';
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
  const [sending, setSending] = useState(false);
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
      setLoading(true);
      const res = await api.get('/tickets');
      if (res.data.success) {
        setTickets(res.data.data);
        if (res.data.data.length > 0 && !selectedTicket) {
          setSelectedTicket(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Unable to retrieve your inquiry history.');
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
        addToast('success', 'Support inquiry submitted! A ticket number has been assigned.');
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
    setSending(true);
    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage,
      });
      if (res.data.success) {
        setSelectedTicket(res.data.data);
        setReplyMessage('');
        addToast('info', 'Your message has been dispatched to the scholarship desk.');
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const quickTemplates = [
    'I have uploaded my renewed Annual Income Certificate to Document Vault.',
    'Could you please verify my Punjab SC Freeship Card status?',
    'What is the expected date for the next DBT grant disbursement cycle?',
    'My latest semester marksheet has been submitted for renewal.',
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
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-amber-50/40 p-6 sm:p-8 text-slate-900 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-amber-700" />
            <span>Scholarship Cell Helpdesk • Student Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Student Inquiries & Support Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Submit questions directly to GNDEC Scholarship Cell officers with real-time threaded message tracking and resolution logs.
          </p>
        </div>

        <button
          onClick={() => setIsNewOpen(true)}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-105 self-start sm:self-auto cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Open New Inquiry</span>
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
                className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-[#0b2341] text-amber-400 font-black shadow-2xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('OPEN')}
                className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === 'OPEN' ? 'bg-[#0b2341] text-amber-400 font-black shadow-2xs' : 'text-slate-500'
                }`}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === 'RESOLVED' ? 'bg-[#0b2341] text-amber-400 font-black shadow-2xs' : 'text-slate-500'
                }`}
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
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-amber-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-2" />
              Loading your inquiries...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No matching tickets</p>
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
                      ? 'bg-amber-50/80 border-amber-300 shadow-2xs ring-1 ring-amber-500/20'
                      : 'bg-white border-slate-100 hover:bg-slate-50/80 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
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
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <Badge status={selectedTicket.status} />
                </div>
                <h3 className="text-base font-black text-slate-900 mt-2">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned Desk: <strong className="text-slate-800">{selectedTicket.assignedOfficerName || 'GNDEC Scholarship Cell'}</strong>
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
                        <span className="font-bold text-slate-700">{isMe ? 'You (Candidate)' : m.senderName}</span>
                        <span>•</span>
                        <span>{new Date(m.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-[#0b2341] text-white rounded-br-xs'
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
                      className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-amber-50 hover:text-amber-900 px-2.5 py-1 rounded-xl border border-slate-200 transition-colors text-left cursor-pointer"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendReply()}
                    placeholder="Type follow-up message to officer..."
                    className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={sending || !replyMessage.trim()}
                    className="p-2.5 bg-[#0b2341] hover:bg-[#123158] text-amber-400 rounded-xl shadow-sm transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-20">
              <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">No ticket selected</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Select a query from the left queue to read conversation history.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW TICKET MODAL */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Open Support Inquiry</h3>
                  <p className="text-xs text-slate-500">Contact GNDEC scholarship verification officers</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewOpen(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50/50 hover:bg-white transition-colors"
                >
                  <option value="SCHOLARSHIP">Scholarship Scheme & Eligibility</option>
                  <option value="DOCUMENT">Document Verification & Freeship Card</option>
                  <option value="PAYMENT">DBT Bank Disbursement & PFMS</option>
                  <option value="TECHNICAL">Portal Account & Password</option>
                  <option value="OTHER">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Question Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Income Certificate verification pending for PMS SC"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide any details, application number, or certificate details to help the officer assist you..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50/50 hover:bg-white transition-colors leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
