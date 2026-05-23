import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { ShieldAlert, HelpCircle, FileText, Activity, Send, CheckCircle2, ChevronRight, Upload } from 'lucide-react';
import { motion } from 'motion/react';

export const SupportView = () => {
  const { user, tickets, loadTickets, createTicket } = useStore();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    await createTicket(subject, description, category, fileBase64 || undefined);
    setSubject('');
    setDescription('');
    setFileBase64(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 pb-24 md:pb-8">
      <div>
        <h1 className="text-2xl font-bold font-sans text-slate-900 dark:text-white">Support & Service</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Open tickets, upload documents, or request account management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
            <h2 className="text-sm font-semibold mb-6 flex items-center space-x-2 text-slate-800 dark:text-slate-100">
              <HelpCircle size={16} className="text-amber-500" />
              <span>Create New Request</span>
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Query Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="general">General Support</option>
                  <option value="verification">Verification & Documents</option>
                  <option value="account_manager">Request Account Manager</option>
                  <option value="dispute">Transaction Dispute</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Subject</label>
                <input 
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief title of your request"
                  className="w-full h-11 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details for our team..."
                  className="w-full py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500/50 transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Upload Attachments (Optional)</label>
                <label className="w-full h-11 flex items-center justify-center space-x-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 border-dashed rounded-xl px-4 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <Upload size={14} />
                  <span>{fileBase64 ? 'Document Attached' : 'Select Document'}</span>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
                </label>
              </div>

              <button 
                type="submit"
                className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium transition-transform hover:scale-[1.01] flex items-center justify-center space-x-2 mt-4"
              >
                <Send size={14} />
                <span>Submit Request</span>
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
            <h2 className="text-sm font-semibold mb-6 flex items-center space-x-2 text-slate-800 dark:text-slate-100">
              <Activity size={16} className="text-emerald-500" />
              <span>Recent Tickets</span>
            </h2>

            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="p-4 rounded-xl text-xs text-slate-500 italic text-center border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50">
                  No support tickets found.
                </div>
              ) : (
                tickets.map(t => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/30 flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.subject}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                          t.status === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          t.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{t.description}</p>
                      <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400">
                        <span className="capitalize">{t.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
