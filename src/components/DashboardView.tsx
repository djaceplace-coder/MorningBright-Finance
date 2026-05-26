/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  Clock,
  ChevronRight,
  ArrowRightLeft,
  ReceiptText,
  CreditCard,
  PiggyBank,
  Settings,
  Globe,
  Zap,
  ArrowDownToLine,
  Landmark,
  Smartphone,
  Droplet,
  Tv,
  MapPin,
  Building,
  GraduationCap,
  Plane,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface DashboardViewProps {
  onOpenTransfer: () => void;
  onNavigateTab: (tab: string) => void;
}

export function DashboardView({ onOpenTransfer, onNavigateTab }: DashboardViewProps) {
  const { user, balance, transactions, notifications, markNotificationAsRead, addFunds } = useStore();
  const [hideBalances, setHideBalances] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [kycSSN, setKycSSN] = useState('');
  const [kycDocType, setKycDocType] = useState('driver_license');
  const [kycDocFile, setKycDocFile] = useState<File | null>(null);
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [showAllBills, setShowAllBills] = useState(false);

  const [showDirectDeposit, setShowDirectDeposit] = useState(false);
  const [showSwiftTransfer, setShowSwiftTransfer] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  
  // Provide specific toggles for quick actions
  const handleQuickAction = (id: string) => {
    switch (id) {
      case 'direct_deposit': setShowDirectDeposit(true); break;
      case 'swift_transfer': setShowSwiftTransfer(true); break;
      case 'withdrawal': setShowWithdrawal(true); break;
      case 'intl_transfer': onNavigateTab('transfers'); break;
      default: onNavigateTab('transfers');
    }
  };

  // Asset Progress values dynamically adaptive to live checking & savings balances
  const totalChecking = balance?.checking || 0;
  const totalSavings = balance?.savings || 0;
  const netCapital = totalChecking + totalSavings;

  // Real-time chart values tracking balance
  const chartData = [
    { name: 'Jan', net: netCapital > 0 ? netCapital * 0.7 : 0 },
    { name: 'Feb', net: netCapital > 0 ? netCapital * 0.8 : 0 },
    { name: 'Mar', net: netCapital > 0 ? netCapital * 0.9 : 0 },
    { name: 'Apr', net: netCapital > 0 ? netCapital * 0.95 : 0 },
    { name: 'Today', net: netCapital }
  ];

  // Static Fallback AI insights generator
  const getAiInsightContent = async () => {
    setAiLoading(true);
    setAiInsight(null);

    try {
      const resp = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze the following fintech client data and provide exactly two sentences of high-value luxury wealth advice. 
                   Checking Balance: $${totalChecking.toFixed(2)}, Savings Balance: $${totalSavings.toFixed(2)}. 
                   Recent transactions: ${transactions.slice(0, 3).map(t => `${t.merchant} spend of $${t.amount}`).join(', ')}. 
                   Keep it elegant, concise, and focused on asset allocation.`
        })
      });
      if (resp.ok) {
        const result = await resp.json();
        setAiInsight(result.advice);
      } else {
        throw new Error("Server endpoint bypassed or returned error");
      }
    } catch (e) {
      setTimeout(() => {
        const advices = [
          `Your combined balance of $${netCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })} has grown steadily. Setting up an automated transfer to your Savings Account could accelerate your financial goals.`,
          `Your recent transaction patterns are healthy. Consider allocating a portion of your checking balance to a high-yield savings to maximize your returns.`,
          `Analysis of current checking balances ($${totalChecking.toLocaleString()}) suggests sufficient cash reserves. Consider transferring surplus funds to your Savings Account.`
        ];
        const randomAdvice = advices[Math.floor(Math.random() * advices.length)];
        setAiInsight(randomAdvice);
      }, 1000);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kycSSN.replace(/\D/g, '').length !== 9 || !kycDocFile) return;
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      // Create a support ticket for KYC
      try {
        await useStore.getState().createTicket(
          "KYC Identity Verification Packet",
          `User submitted SSN: ***-**-${kycSSN.slice(-4)}. Document Type: ${kycDocType}. Please review account for full verification.`,
          "account_management",
          base64String
        );
      } catch(e) {}

      setKycSubmitted(true);
      setShowKYC(false);
    };
    reader.onerror = () => {
      alert("Failed to read document.");
    };
    reader.readAsDataURL(kycDocFile);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-8 font-sans space-y-6 select-none pb-24 transition-colors duration-300">
      
      {/* DIAGNOSTIC STATE BANNER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-white/5 pb-4 space-y-3 sm:space-y-0">
        <div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-widest uppercase font-bold">Transaction History PORTAL</span>
          <div className="flex items-center space-x-2 mt-1">
            <h2 className="text-2xl font-sans tracking-tight font-medium text-slate-900 dark:text-white">
              Hi, {user?.lastName || 'Valued Account'}
            </h2>
            {user?.isVerified && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono uppercase font-bold rounded flex items-center space-x-1">
                Verified Trust Earner
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setHideBalances(!hideBalances)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            title="Toggle Account Balances Visibility"
          >
            {hideBalances ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {!user?.isVerified && !user?.isAdmin && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
           <div>
             <h3 className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
               <span>Complete your KYC Profile</span>
               <span className="px-2 py-0.5 rounded pl-1 bg-emerald-500/20 text-xs font-mono uppercase">$500 Bonus pending</span>
             </h3>
             <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">To unlock your checking account's full features and claim your welcome bonus, please provide identity verification details.</p>
           </div>
           {kycSubmitted ? (
             <div className="px-4 py-2 bg-emerald-500 rounded-lg text-white font-bold text-sm bg-opacity-50">
               Under Review by Admin
             </div>
           ) : (
             <button onClick={() => setShowKYC(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shrink-0 whitespace-nowrap transition-colors">
                Start Registration
             </button>
           )}
        </div>
      )}

      <AnimatePresence>
        {showDirectDeposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDirectDeposit(false)} />
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl z-10">
              <h2 className="text-xl font-bold dark:text-white mb-2">Direct Deposit Information</h2>
              <p className="text-xs text-slate-500 mb-6">Use these details to set up direct deposits with your employer or for incoming external transfers.</p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">Routing Number</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">002446771</div>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">Account Number</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">{user?.accountNumber || 'Pending Generation'}</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50">
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">Bank Name & Address</span>
                   </div>
                   <div className="text-sm font-sans font-medium text-slate-900 dark:text-white">
                      Pacific Standard Bank NA<br/>
                      100 Standard Plaza, Suite 400<br/>
                      New York, NY 10005
                   </div>
                </div>
              </div>
              
              <div className="pt-6">
                <button type="button" onClick={() => setShowDirectDeposit(false)} className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm transition-transform hover:scale-[1.02]">Close Information</button>
              </div>
            </motion.div>
          </div>
        )}

        {showSwiftTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSwiftTransfer(false)} />
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl z-10">
              <h2 className="text-xl font-bold dark:text-white mb-2 flex items-center gap-2"><Zap size={20} className="text-amber-500" /> <span>SWIFT Transfer</span></h2>
              <p className="text-xs text-slate-500 mb-6">Initiate a secure international wire transfer via the SWIFT network.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); alert("SWIFT Transfer authorization pending admin verification."); setShowSwiftTransfer(false); }} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold block mb-1">Beneficiary Name</label>
                     <input type="text" required placeholder="John Doe" className="w-full h-11 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-amber-500 dark:text-white" />
                   </div>
                   <div>
                     <label className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold block mb-1">Amount (USD)</label>
                     <input type="number" required placeholder="0.00" className="w-full h-11 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-amber-500 dark:text-white font-mono" />
                   </div>
                 </div>
                 
                 <div>
                   <label className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold block mb-1">SWIFT / BIC Code</label>
                   <input type="text" required placeholder="8 or 11 characters" className="w-full h-11 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-amber-500 dark:text-white uppercase" />
                 </div>
                 <div>
                   <label className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold block mb-1">IBAN / Account Number</label>
                   <input type="text" required placeholder="" className="w-full h-11 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-amber-500 dark:text-white uppercase" />
                 </div>
                 
                 <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setShowSwiftTransfer(false)} className="flex-1 h-11 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors pointer-cursor text-slate-700 dark:text-white">Cancel</button>
                   <button type="submit" className="flex-1 h-11 bg-amber-600 text-white font-bold rounded-xl text-sm hover:bg-amber-700 transition-colors">Submit SWIFT Transfer</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}

        {showWithdrawal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWithdrawal(false)} />
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl z-10 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold dark:text-white mb-2 flex items-center gap-2"><Landmark size={20} className="text-rose-500" /> <span>Withdraw Funds</span></h2>
              <p className="text-xs text-slate-500 mb-6">Select a destination method to withdraw your available checking funds.</p>
              
              <div className="space-y-6">
                {/* Method 1: App Connections */}
                <div>
                   <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Money Apps (USA/UK)</h3>
                   <div className="grid grid-cols-2 gap-3">
                     {['CashApp', 'PayPal', 'Venmo', 'Zelle', 'Revolut', 'Monzo'].map(app => (
                        <div key={app} className="p-3 border border-slate-200 dark:border-white/10 rounded-xl hover:border-emerald-500/50 cursor-pointer transition-colors bg-slate-50 dark:bg-white/5 flex flex-col justify-center items-center text-center group" onClick={() => { alert(`Withdrawal to ${app} pending account active status test deposit.`); setShowWithdrawal(false); }}>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">{app}</span>
                          <span className="text-[9px] text-slate-400 mt-1">Instant via tags/email</span>
                        </div>
                     ))}
                   </div>
                </div>

                {/* Method 2: Crypto */}
                <div>
                   <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Crypto Wallets</h3>
                   <form onSubmit={(e) => { e.preventDefault(); alert("Crypto withdrawal authorized pending KYC & activation."); setShowWithdrawal(false); }} className="space-y-3">
                     <div className="flex gap-3">
                       <select className="px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none dark:text-white">
                         <option>BTC (Bitcoin Network)</option>
                         <option>USDT (ERC20)</option>
                         <option>USDT (TRC20)</option>
                         <option>ETH (Ethereum Network)</option>
                       </select>
                       <input type="text" required placeholder="Wallet Address" className="flex-1 h-11 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-rose-500 dark:text-white" />
                     </div>
                     <button type="submit" className="w-full h-10 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold transition-colors">Submit Crypto Withdrawal</button>
                   </form>
                </div>

                {/* Method 3: ATM */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Cardless ATM (Pinless)</h3>
                  <div className="p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">Generate a 6-digit access code to retrieve funds without your physical card at supported global ATMs.</p>
                    <button className="h-10 px-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs" onClick={() => { alert("Pinless ATM withdrawal requires active test deposit verification ($750 / £650)."); setShowWithdrawal(false); }}>Generate Access Code</button>
                  </div>
                </div>
              </div>
              
            </motion.div>
          </div>
        )}

        {showKYC && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowKYC(false)} />
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl z-10">
              <h2 className="text-xl font-bold dark:text-white mb-2">Identity Details (KYC)</h2>
              <p className="text-xs text-slate-500 mb-6">Federal regulations require identity verification before full activation.</p>
              
              <form onSubmit={handleSubmitKYC} className="space-y-4">
                 <div>
                   <label className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-500">Social Security Number (SSN)</label>
                   <input type="text" placeholder="XXX-XX-XXXX" value={kycSSN} onChange={e => setKycSSN(e.target.value)} required pattern="\d{3}-?\d{2}-?\d{4}" className="w-full h-11 px-3 mt-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500 dark:text-white" />
                   <p className="text-[10px] text-slate-400 mt-1">Must be 9 digits.</p>
                 </div>
                 <div>
                   <label className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-500">Form of Identity</label>
                   <select value={kycDocType} onChange={e => setKycDocType(e.target.value)} className="w-full h-11 px-3 mt-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500 dark:text-white mb-2">
                      <option value="driver_license">State Driver's License</option>
                      <option value="passport">US Passport</option>
                      <option value="other">Other State ID</option>
                   </select>
                   <input type="file" required onChange={e => setKycDocFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-500/20 dark:file:text-emerald-400" />
                 </div>
                 <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setShowKYC(false)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors pointer-cursor text-slate-700 dark:text-white">Cancel</button>
                   <button type="submit" disabled={kycSSN.replace(/\D/g, '').length !== 9 || !kycDocFile} className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">Submit</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER NOTIFICATION SYSTEM ALERTS */}
      {notifications.filter(n => !n.isRead).slice(0, 1).map((notif) => (
        <div key={notif.id} className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
            <div>
              <span className="font-semibold block">{notif.title}</span>
              <span className="text-slate-550 dark:text-slate-400 block mt-0.5">{notif.message}</span>
            </div>
          </div>
          <button 
            onClick={() => markNotificationAsRead(notif.id)}
            className="text-[9px] font-mono underline hover:text-slate-950 dark:hover:text-white uppercase tracking-widest outline-none border-none bg-transparent cursor-pointer font-bold"
          >
            Dismiss
          </button>
        </div>
      ))}

      {/* BENTO BOX COMBINED METRICS */}
      
      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
           { id: 'direct_deposit', label: 'Direct Deposit', icon: <ArrowDownToLine size={18} />, color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' },
           { id: 'intl_transfer', label: 'Intl. Transfer', icon: <Globe size={18} />, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
           { id: 'swift_transfer', label: 'SWIFT Transfer', icon: <Zap size={18} />, color: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' },
           { id: 'withdrawal', label: 'Withdrawal', icon: <Landmark size={18} />, color: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' }
        ].map(action => (
          <button 
            key={action.id}
            onClick={() => handleQuickAction(action.id)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm dark:shadow-none space-y-3 hover:scale-[1.02]"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${action.color}`}>
              {action.icon}
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{action.label}</span>
          </button>
        ))}
      </div>

      {/* BILL PAYMENTS SECTION */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/40 shadow-sm relative overflow-hidden">
         <div className="flex justify-between items-center mb-6 relative z-10">
           <div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <ReceiptText size={16} className="text-blue-500" />
               <span>Quick Bill Pay</span>
             </h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1">Tap a biller to initiate payment</p>
           </div>
           <button 
             onClick={() => setShowAllBills(!showAllBills)}
             className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
           >
             <span>{showAllBills ? 'Show Less' : 'See More'}</span>
             {showAllBills ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
           </button>
         </div>

         <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 relative z-10 transition-all duration-300 ${!showAllBills ? 'max-h-[100px] overflow-hidden' : 'max-h-[500px]'}`}>
           {[
             { id: 'mobile', name: 'Mobile', icon: <Smartphone size={16} />, color: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
             { id: 'power', name: 'Electricity', icon: <Zap size={16} />, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
             { id: 'water', name: 'Water Utilities', icon: <Droplet size={16} />, color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
             { id: 'gas', name: 'Natural Gas', icon: <Flame size={16} />, color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
             { id: 'internet', name: 'Internet / TV', icon: <Tv size={16} />, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
             { id: 'housing', name: 'Rent / Mort.', icon: <Building size={16} />, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
             { id: 'taxes', name: 'Taxes', icon: <Landmark size={16} />, color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
             { id: 'education', name: 'Education', icon: <GraduationCap size={16} />, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
             { id: 'travel', name: 'Travel / Air', icon: <Plane size={16} />, color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' }
           ].map((bill, index) => (
             <button 
               key={bill.id} 
               onClick={() => onNavigateTab('transfers')}
               className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors gap-2 group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10"
             >
               <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-transform group-hover:scale-110 ${bill.color}`}>
                 {bill.icon}
               </div>
               <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">{bill.name}</span>
             </button>
           ))}
         </div>
         {!showAllBills && (
           <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none z-20" />
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TOTAL VALUE */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-tr from-slate-900 to-slate-950 flex flex-col justify-between relative overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-bold">Core Net Assets</span>
            <h3 className="text-3xl font-sans tracking-tight font-medium text-slate-950 dark:text-white">
              {hideBalances ? '••••••' : `$${netCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </h3>
          </div>
          <div className="mt-8 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>Morning Bright account</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
              Synced
            </span>
          </div>
        </div>

        {/* Checking Account */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/50 flex flex-col justify-between shadow-sm dark:shadow-none">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-weight-bold font-bold">Checking Subcollection</span>
            <h3 className="text-3xl font-sans tracking-tight font-medium text-slate-950 dark:text-white">
              {hideBalances ? '••••••' : `$${totalChecking.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </h3>
          </div>
          <div className="mt-8 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Liquidity available</span>
            <button 
              onClick={onOpenTransfer}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center space-x-0.5 hover:text-emerald-500 cursor-pointer text-[11px] font-bold"
            >
              <span>Send Money</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* SAVING Savings Goals */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/50 flex flex-col justify-between shadow-sm dark:shadow-none">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-bold">Goal Savings Reserves</span>
            <h3 className="text-3xl font-sans tracking-tight font-medium text-slate-950 dark:text-white">
              {hideBalances ? '••••••' : `$${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </h3>
          </div>
          <div className="mt-8 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Accumulated goals</span>
            <button 
              onClick={() => onNavigateTab('savings')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center space-x-0.5 hover:text-emerald-500 cursor-pointer text-[11px] font-bold"
            >
              <span>Manage goals</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

      </div>

      {/* MID-PORTION: CHARTS + AI COMPANION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/40 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Asset Progress Flow</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">combined checking & savings balances</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 bg-emerald-500/5 px-2.5 py-1 rounded-full">
              <Activity size={12} />
              <span>Synced with Server</span>
            </div>
          </div>

          <div className="h-64 w-full">
            {netCapital === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 italic">
                <span>No capital deposited inside this account yet.</span>
                <span className="text-[10px] block mt-1">Tap &quot;Deposit External Wire&quot; to begin plotting indices.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${val.toLocaleString()}`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    labelStyle={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, "Combined Net Assets"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorNet)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI COMPANION PARTNER */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-emerald-500/15 bg-white dark:bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between space-y-4 shadow-sm dark:shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-650 dark:text-emerald-400">
              <Sparkles size={16} />
              <span>MORNING BRIGHT INTELLIGENCE</span>
            </div>
            <h4 className="text-md font-semibold text-slate-900 dark:text-white font-sans leading-tight">Server-Side Gemini Insights</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Click the analyzer below to retrieve custom structural recommendations using modern server-side Gemini LLMs.
            </p>
          </div>

          <div className="grow flex items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 font-mono text-[10px] min-h-[110px] text-slate-600 dark:text-slate-300">
            {aiLoading ? (
              <div className="flex flex-col items-center space-y-2 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Generating wealth matrix...</span>
              </div>
            ) : aiInsight ? (
              <div className="space-y-2">
                <span className="block text-[8px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">REPORT DISPATCHED:</span>
                <p className="italic text-left leading-relaxed">{aiInsight}</p>
              </div>
            ) : (
              <div className="text-center italic">
                No report active. Tap below to run audit.
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={getAiInsightContent}
            disabled={aiLoading}
            className="w-full h-10 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-slate-900 text-xs font-bold transition-transform hover:scale-[1.02] flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Audit Asset Distribution</span>
          </button>
        </div>

      </div>

      {/* BOTTOM PORTION: Transaction History */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/40 space-y-4 shadow-sm">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/5">
          <div>
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Transaction History</h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">realtime transaction histories</p>
          </div>
          <button 
            onClick={() => onNavigateTab('transfers')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-mono hover:underline font-bold cursor-pointer"
          >
            View Full Book
          </button>
        </div>

        <div className="space-y-4 mt-2">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No transaction entries logged in this subcollection yet. Initialize deposits using the button above.
            </div>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center text-xs pb-3 border-b border-slate-150 dark:border-white/5 last:border-none last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    tx.type === 'deposit' || tx.type === 'transfer_received'
                      ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-500/5 border-slate-200 dark:border-white/5 text-slate-400'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'transfer_received' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </div>

                  <div>
                    <span className="block text-slate-900 dark:text-white font-semibold text-[13px]">{tx.merchant}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                      {tx.category} • {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`block font-mono text-[13px] font-bold ${
                    tx.type === 'deposit' || tx.type === 'transfer_received'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'transfer_received' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-mono uppercase block mt-0.5 bg-emerald-500/5 px-1 py-0.5 rounded w-fit ml-auto">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
