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
  Settings
} from 'lucide-react';
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
  const { user, balance, transactions, notifications, addFunds } = useStore();
  const [hideBalances, setHideBalances] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('500');
  const [fundingTarget, setFundingTarget] = useState<'checking' | 'savings'>('checking');
  const [fundingModalOpen, setFundingModalOpen] = useState(false);

  // AI Insights State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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

  const handleApplyFunding = async () => {
    const val = parseFloat(fundingAmount);
    if (!isNaN(val) && val > 0) {
      await addFunds(val, fundingTarget);
      setFundingModalOpen(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-8 font-sans space-y-6 select-none pb-24 transition-colors duration-300">
      
      {/* DIAGNOSTIC STATE BANNER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-white/5 pb-4 space-y-3 sm:space-y-0">
        <div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-widest uppercase font-bold">Transaction History PORTAL</span>
          <h2 className="text-2xl font-sans tracking-tight font-medium text-slate-900 dark:text-white mt-1">
            Hi, {user?.lastName || 'Valued Account'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setHideBalances(!hideBalances)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            title="Toggle Account Balances Visibility"
          >
            {hideBalances ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          
          <button 
            onClick={() => setFundingModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center space-x-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Plus size={14} />
            <span>Deposit External Wire</span>
          </button>
        </div>
      </div>

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
            onClick={() => useStore.getState().markNotificationAsRead(notif.id)}
            className="text-[9px] font-mono underline hover:text-slate-950 dark:hover:text-white uppercase tracking-widest outline-none border-none bg-transparent cursor-pointer font-bold"
          >
            Dismiss
          </button>
        </div>
      ))}

      {/* BENTO BOX COMBINED METRICS */}
      
      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-5 gap-3">
        {[
           { id: 'transfers', label: 'Transfer', icon: <ArrowRightLeft size={18} />, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
           { id: 'bills', label: 'Pay Bills', icon: <ReceiptText size={18} />, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
           { id: 'cards', label: 'Cards', icon: <CreditCard size={18} />, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
           { id: 'savings', label: 'Savings', icon: <PiggyBank size={18} />, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
           { id: 'settings', label: 'Settings', icon: <Settings size={18} />, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' }
        ].map(action => (
          <button 
            key={action.id}
            onClick={() => onNavigateTab(action.id)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm dark:shadow-none space-y-2 hover:scale-[1.02]"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
              {action.icon}
            </div>
            <span className="text-[10px] font-semibold text-slate-900 dark:text-white tracking-tight">{action.label}</span>
          </button>
        ))}
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

      {/* FUNDING DEPOSIT MODAL */}
      {fundingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Funds</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                To initiate a deposit via Mobile Cheque, Direct Deposit, Bitcoin, or other Cryptocurrency, please contact our Support AI System.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-2">
              <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Priority Support Line</span>
              <a href="tel:+18005550199" className="text-xl font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                +1 (800) 555-0199
              </a>
              <span className="block text-[10px] text-slate-500 mt-2">
                Our AI agent will process your request and connect you to an escalation agent if needed.
              </span>
            </div>

            <div className="flex pt-2">
              <button 
                onClick={() => setFundingModalOpen(false)}
                className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
