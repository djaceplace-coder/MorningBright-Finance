import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { ShieldAlert, HelpCircle, FileText, Activity, Send, CheckCircle2, ChevronRight, Upload, CreditCard, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

const CopyableText = ({ text, label }: { text: string, label: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
      <div className="flex flex-col">
        <span className="text-[9px] font-mono uppercase text-slate-500 mb-0.5">{label}</span>
        <span className="text-xs font-mono text-slate-900 dark:text-slate-200 font-bold">{text}</span>
      </div>
      <button onClick={handleCopy} className="p-2 bg-white dark:bg-white/10 rounded-md hover:bg-slate-100 dark:hover:bg-white/20 transition-colors">
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-500" />}
      </button>
    </div>
  );
};

export const SupportView = () => {
  const { user, tickets, loadTickets, createTicket } = useStore();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'giftcard'>('crypto');
  const [cryptoAsset, setCryptoAsset] = useState<'usdt_erc20' | 'usdt_trc20' | 'btc' | ''>('');
  const [activationFileBase64, setActivationFileBase64] = useState<string | null>(null);
  
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

  const handleActivationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActivationFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleActivationSubmit = async () => {
    if (!activationFileBase64) return;
    await createTicket("Account Activation Payment Receipt", `User submitted a payment receipt for account activation. Method selected: ${paymentMethod}`, "verification", activationFileBase64);
    setActivationFileBase64(null);
    alert("Receipt submitted successfully. It will be reviewed by administrators shortly.");
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

      {/* ACCOUNT ACTIVATION / UPGRADE PANEL */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border-2 border-emerald-500/20 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white flex items-center space-x-2">
          <ShieldAlert size={20} className="text-emerald-500" />
          <span>Account Features Unlock</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Unlock full withdrawals, direct deposits, routing numbers, and secure physical cards. Complete your account activation with a structural deposit. <span className="font-bold text-slate-700 dark:text-slate-300">Account features unlock fee: $750.</span>
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">1. Select Payment Bridge</h3>
            <div className="flex space-x-3">
              <button 
                onClick={() => setPaymentMethod('crypto')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${paymentMethod === 'crypto' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'}`}
              >
                Cryptocurrency
              </button>
              <button 
                onClick={() => setPaymentMethod('giftcard')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${paymentMethod === 'giftcard' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'}`}
              >
                Gift Cards
              </button>
              <button 
                disabled
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed hidden sm:block"
              >
                PayPal (Soon)
              </button>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50">
              {paymentMethod === 'crypto' ? (
                <div className="space-y-4 min-h-[140px]">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    Send funds via the networks designated below.
                  </p>
                  
                  <select 
                    value={cryptoAsset}
                    onChange={(e) => setCryptoAsset(e.target.value as any)}
                    className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500/50 transition-colors mb-4"
                  >
                    <option value="" disabled>Select Asset Network</option>
                    <option value="usdt_erc20">USDT (ERC20 - Ethereum Network)</option>
                    <option value="usdt_trc20">USDT (TRC20 - Tron Network)</option>
                    <option value="btc">BITCOIN (BTC Network)</option>
                  </select>

                  {cryptoAsset === 'usdt_erc20' && <CopyableText label="USDT (ERC20) Wallet Address" text="0x6420440fe3052422134229ff5ac904ec1aadf882" />}
                  {cryptoAsset === 'usdt_trc20' && <CopyableText label="USDT (TRC20) Wallet Address" text="TY1rjXKoLM4MKUmUMAJNaqngxdXAUQDrUG" />}
                  {cryptoAsset === 'btc' && <CopyableText label="BITCOIN Wallet Address" text="1M4CxHqAhCeWQnoF3HgmzhS4sxKgDWwF1g" />}
                </div>
              ) : (
                <div className="space-y-4 relative min-h-[140px]">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Purchase and upload images of valid, unregistered gift cards (front and back exposing code). Minimum aggregated value $750.
                  </p>
                  
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400 rounded-lg text-xs leading-relaxed">
                    <span className="font-bold block mb-1">Recommended / Verified Safe:</span>
                    Steam, Apple Store, and Amazon.
                  </div>
                  
                  <div className="text-[10px] space-y-1 text-slate-500">
                    <p>Accepted USA/UK/Europe specific stores:</p>
                    <p className="italic">Google Play, Razer Gold, Sephora, Target, Vanilla Visa, Walmart, eBay.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">2. Upload Proof of Clearing</h3>
            
            <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-4">
                <Upload size={20} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                Attach receipt screenshot, TxHash image, or clear photos of purchased gift cards.
              </p>
              
              <label className="mt-4 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer">
                {activationFileBase64 ? 'Document Selected' : 'Select File'}
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleActivationUpload} />
              </label>

              {activationFileBase64 && (
                <button 
                  onClick={handleActivationSubmit}
                  className="mt-3 px-6 py-2.5 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold transition-all"
                >
                  Confirm Upload & Submit
                </button>
              )}
            </div>
          </div>

        </div>
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
                  <option value="loans">Loans & Applications</option>
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
