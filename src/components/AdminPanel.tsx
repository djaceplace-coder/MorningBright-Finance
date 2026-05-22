/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  ShieldAlert, 
  Send, 
  Lock, 
  Unlock, 
  Ban, 
  Database,
  Search,
  Check,
  Globe,
  Plus
} from 'lucide-react';
import { TransactionType } from '../types';

export function AdminPanel() {
  const { 
    user, 
    usersList,
    adminLogs, 
    adminLoadUsers,
    adminLoadLogs,
    adminEditBalance, 
    adminAddSystemTransaction, 
    adminPushSystemNotification, 
    adminFreezeUser, 
    adminSuspendUser,
    simulationActive 
  } = useStore();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  // Update Balances Form
  const [checkingInput, setCheckingInput] = useState('15000');
  const [savingsInput, setSavingsInput] = useState('65000');

  // Create Transaction Form
  const [txAmount, setTxAmount] = useState('250');
  const [txType, setTxType] = useState<TransactionType>(TransactionType.CARD_SPEND);
  const [txMerchant, setTxMerchant] = useState('Monaco Yacht Harbor');
  const [txCategory, setTxCategory] = useState('Travel & Yachts');

  // Push Notification Form
  const [notifTitle, setNotifTitle] = useState('Sovereign Overdraft Cleared');
  const [notifMsg, setNotifMsg] = useState('Your checking sub-vault has successfully cleared international wire clearance tags.');

  // Alert Success triggers
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  useEffect(() => {
    adminLoadUsers();
    adminLoadLogs();
  }, []);

  // Sync selected user when list changes
  useEffect(() => {
    if (usersList.length > 0 && !selectedUserId) {
      setSelectedUserId(usersList[0].uid);
    }
  }, [usersList, selectedUserId]);

  const activeTargetProfile = usersList.find(u => u.uid === selectedUserId) || user;

  const showSuccessAlert = (message: string) => {
    setAlertSuccess(message);
    setTimeout(() => {
      setAlertSuccess(null);
    }, 4000);
  };

  const handleUpdateBalances = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    const chk = parseFloat(checkingInput);
    const sav = parseFloat(savingsInput);

    if (isNaN(chk) || isNaN(sav)) return;
    await adminEditBalance(selectedUserId, chk, sav);
    showSuccessAlert(`Adjusted ledger for user ${activeTargetProfile?.email || selectedUserId} to Checking: $${chk}, Savings: $${sav}`);
  };

  const handleInsertTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) return;

    await adminAddSystemTransaction(selectedUserId, amt, txType, txMerchant, txCategory);
    showSuccessAlert(`Injected transaction of $${amt} for ${activeTargetProfile?.email || selectedUserId}.`);
    setTxAmount('100');
  };

  const handlePushNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !notifTitle.trim() || !notifMsg.trim()) return;

    await adminPushSystemNotification(selectedUserId, notifTitle, notifMsg, 'system');
    showSuccessAlert(`Alert alert dispatched successfully to ${activeTargetProfile?.email || selectedUserId}.`);
    setNotifTitle('');
    setNotifMsg('');
  };

  const handleToggleFreeze = async () => {
    if (!activeTargetProfile) return;
    const nextFreeze = !activeTargetProfile.isFrozen;
    await adminFreezeUser(activeTargetProfile.uid, nextFreeze);
    showSuccessAlert(`User ${activeTargetProfile.email} frozen status set to: ${nextFreeze}`);
  };

  const handleToggleSuspend = async () => {
    if (!activeTargetProfile) return;
    const nextSuspended = !activeTargetProfile.isSuspended;
    await adminSuspendUser(activeTargetProfile.uid, nextSuspended);
    showSuccessAlert(`User ${activeTargetProfile.email} suspend isolation set to: ${nextSuspended}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8 font-sans space-y-8 select-none pb-24">
      
      {/* TITLE HEAD */}
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase font-bold">VIP PRIVILEGE CONTROL PANEL</span>
          <h2 className="text-2xl font-sans tracking-tight font-medium text-white mt-1">
            System Admin Workspace
          </h2>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-amber-400 border border-amber-500/10 bg-amber-500/5 px-2.5 py-1 rounded-full">
          <ShieldAlert size={12} strokeWidth={2.5} />
          <span>Sovereign Security Mode Active</span>
        </div>
      </div>

      {alertSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-xs text-emerald-400 font-mono tracking-wide">
          ✓ {alertSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ROW 1: USER POOL SELECTOR CARD */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-5">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">01/ Target User Sub-Lease</span>
            <p className="text-xs text-slate-400 mt-0.5">Select client to inspect or adjust values</p>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {usersList.length === 0 ? (
              <div className="p-4 rounded-xl text-xs text-slate-400 italic text-center border border-white/5">
                No indexed user accounts found. Loading simulation indices...
              </div>
            ) : (
              usersList.map((u) => {
                const matches = u.uid === selectedUserId;
                return (
                  <button
                    key={u.uid}
                    type="button"
                    onClick={() => setSelectedUserId(u.uid)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex justify-between items-center cursor-pointer ${
                      matches 
                        ? 'border-amber-500/30 bg-amber-500/5 text-amber-400 font-medium' 
                        : 'border-white/5 bg-slate-950/40 hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-semibold text-white">{u.firstName} {u.lastName}</span>
                      <span className="block text-[9px] font-mono text-slate-500 leading-normal lowercase">{u.email}</span>
                    </div>
                    <div className="text-right flex flex-col items-end space-y-1">
                      <span className="px-1.5 py-0.5 text-[7px] font-mono rounded bg-white/5 border border-white/10 uppercase tracking-widest text-slate-300">
                        {u.isAdmin ? 'system admin' : 'vip client'}
                      </span>
                      {u.isFrozen && (
                        <span className="px-1 py-0.2 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[7px] font-mono uppercase">FROZEN</span>
                      )}
                      {u.isSuspended && (
                        <span className="px-1 py-0.2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded text-[7px] font-mono uppercase">SUSPENDED</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* DANGEROUS QUICK LOCK CONTROLS */}
          {activeTargetProfile && (
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-[9px] text-red-500 font-mono uppercase tracking-widest block font-bold">Node State Overrides ({activeTargetProfile.firstName})</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={handleToggleFreeze}
                  className={`h-10 text-[10px] uppercase font-mono tracking-wider font-semibold transition-all rounded-lg border w-full cursor-pointer ${
                    activeTargetProfile?.isFrozen 
                      ? 'bg-red-500 text-black border-red-500 font-bold' 
                      : 'border-red-500/20 text-red-400 hover:bg-red-500/5'
                  }`}
                >
                  <span>{activeTargetProfile?.isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                </button>

                <button 
                  type="button"
                  onClick={handleToggleSuspend}
                  className={`h-10 text-[10px] uppercase font-mono tracking-wider font-semibold transition-all rounded-lg border w-full cursor-pointer ${
                    activeTargetProfile?.isSuspended 
                      ? 'bg-orange-500 text-black border-orange-500 font-bold' 
                      : 'border-orange-500/20 text-orange-400 hover:bg-orange-500/5'
                  }`}
                >
                  <span>{activeTargetProfile?.isSuspended ? 'Reactivate' : 'Suspend'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTROLS: ADJUST BALANCES + NOTIFICATION DISPATCH */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ADJUST BALANCES FORM */}
          <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">02/ Force Balances Modifications</span>
              <p className="text-xs text-slate-400 mt-0.5">Appends values instantly to target user</p>
            </div>

            <form onSubmit={handleUpdateBalances} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Checking (USD)</label>
                <input 
                  type="number"
                  value={checkingInput}
                  onChange={(e) => setCheckingInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Goal Savings (USD)</label>
                <input 
                  type="number"
                  value={savingsInput}
                  onChange={(e) => setSavingsInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-10 rounded-lg bg-amber-500 text-black text-xs font-bold transition-transform hover:scale-[1.01]"
              >
                Force Adjust Balances
              </button>
            </form>
          </div>

          {/* DISPATCH CUSTOM SYSTEM ALERT */}
          <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">03/ System Alert Broadcaster</span>
              <p className="text-xs text-slate-400 mt-0.5">Pushes premium text alerts directly to app header</p>
            </div>

            <form onSubmit={handlePushNotification} className="space-y-3">
              <input 
                type="text"
                placeholder="Alert Header Title"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white placeholder-slate-600"
              />

              <textarea 
                placeholder="Detailed alert message body..."
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                className="w-full h-16 p-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/30 resize-none"
              />

              <button 
                type="submit"
                className="w-full h-10 rounded-lg bg-white text-black text-xs font-bold transition-transform hover:scale-[1.01] flex items-center justify-center space-x-1"
              >
                <Send size={12} />
                <span>BroadCast System Alert</span>
              </button>
            </form>
          </div>

        </div>

        {/* CREATE TRANSACTION FORM */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">04/ Generate Ledger Transactions</span>
            <p className="text-xs text-slate-400 mt-0.5">Force inject debit outlays or cash deposits</p>
          </div>

          <form onSubmit={handleInsertTransaction} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">Merchant / Creditor Description</label>
              <input 
                type="text"
                value={txMerchant}
                onChange={(e) => setTxMerchant(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">Category Tag</label>
              <input 
                type="text"
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400">Principal (USD)</label>
                <input 
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400">Directional Flow</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white focus:outline-none bg-slate-900"
                >
                  <option value={TransactionType.DEPOSIT}>Deposit</option>
                  <option value={TransactionType.CARD_SPEND}>Card Spend</option>
                  <option value={TransactionType.WITHDRAWAL}>Withdrawal</option>
                  <option value={TransactionType.TRANSFER_RECEIVED}>Transfer Received</option>
                  <option value={TransactionType.TRANSFER_SENT}>Transfer Sent</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full h-10 rounded-lg bg-white hover:bg-slate-100 text-black text-xs font-bold transition-transform hover:scale-[1.01]"
            >
              Inject Master Ledger Entry
            </button>
          </form>
        </div>

      </div>

      {/* ENTIRE HISTORIC AUDIT TRAILS LOGS */}
      <div className="p-6 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white">Immutable Administrative Decryptions</h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">realtime master security audit logging documents</p>
        </div>

        <div className="space-y-3.5 pt-2 max-h-80 overflow-y-auto pr-1">
          {adminLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-600 font-mono italic">
              No security logging entries recorded in master_audit_ledger.
            </div>
          ) : (
            adminLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-white/5 bg-slate-950/60 font-mono text-[11px] leading-relaxed flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <div>
                    <span className="text-white font-medium">[SECURITY_TRACE]: </span>
                    <span className="text-slate-300 font-semibold">{log.action}</span>
                    <span className="block text-[9px] text-slate-500 mt-1 uppercase">target UID-email: {log.targetUserId} • admin: {log.adminEmail}</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-500 shrink-0">
                  <span className="block text-slate-400 font-medium">Log Hash: {log.id.slice(0, 12)}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
