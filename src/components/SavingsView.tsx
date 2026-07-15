import { formatCurrency, getCurrencySymbol } from "../utils";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Target, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Coins, 
  CheckCircle, 
  Percent, 
  X,
  PlusCircle,
  PiggyBank,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SavingsView() {
  const { user, balance, savings, createSavingsGoal, contributeToSavings, loading, errorMessage, clearError } = useStore();
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalInitial, setGoalInitial] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Transfer into goal
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundGoalModalOpen, setFundGoalModalOpen] = useState(false);

  const totalChecking = balance?.checking || 0;

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const targetVal = parseFloat(goalTarget);
    const initialVal = parseFloat(goalInitial || '0');

    if (isNaN(targetVal) || targetVal <= 0) {
      useStore.setState({ errorMessage: "Target amount must be a positive number." });
      return;
    }

    if (initialVal < 0) {
      useStore.setState({ errorMessage: "Initial balance cannot be negative." });
      return;
    }

    if (initialVal > totalChecking) {
      useStore.setState({ errorMessage: "Insufficient funds in your checking account to transfer initial balance." });
      return;
    }

    // Create the goal with emerald green as fallback color
    await createSavingsGoal(goalName, targetVal, '#059669');
    
    // If user provided initial deposit, apply contribution
    if (initialVal > 0) {
      // Find the created goal ID
      const updatedGoals = useStore.getState().savings;
      const targetG = updatedGoals.find(g => g.title === goalName);
      if (targetG) {
        await contributeToSavings(targetG.id, initialVal);
      }
    }

    setGoalName('');
    setGoalTarget('');
    setGoalInitial('');
    setCreateModalOpen(false);
  };

  const handleFundGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!selectedGoalId) return;

    const val = parseFloat(fundAmount);
    if (isNaN(val) || val <= 0) {
      useStore.setState({ errorMessage: "Transfer amount must be positive." });
      return;
    }

    if (val > totalChecking) {
      useStore.setState({ errorMessage: "Insufficient available checking liquidity." });
      return;
    }

    const success = await contributeToSavings(selectedGoalId, val);
    setFundAmount('');
    setFundGoalModalOpen(false);
  };

  const openFundModal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setFundGoalModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-100 p-6 md:p-8 font-sans space-y-8 select-none pb-24 transition-colors duration-300">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-white/5 pb-4 space-y-3 sm:space-y-0 text-slate-900 dark:text-white">
        <div>
          <span className="text-[10px] text-emerald-605 dark:text-emerald-400 font-mono tracking-widest uppercase font-bold">SAVINGS PROTOCOLS</span>
          <h2 className="text-2xl font-sans tracking-tight font-medium text-slate-900 dark:text-white mt-1">
            Hi, {user?.lastName || 'Client'} - Goal Reserves & Savings Goals
          </h2>
        </div>

        <button 
          onClick={() => setCreateModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center space-x-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Savings Goal</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/15 bg-red-500/5 text-xs text-red-500 flex items-center space-x-3">
          <span>{errorMessage}</span>
          <button onClick={clearError} className="ml-auto text-[10px] font-mono uppercase tracking-wider text-red-400">Dismiss</button>
        </div>
      )}

      {/* CORE STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-950 dark:text-slate-100">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-905 bg-white dark:bg-slate-950/40 flex justify-between items-center shadow-sm dark:shadow-none">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Total Goal Allocations</span>
            <span className="text-2xl font-mono text-emerald-600 dark:text-emerald-400 font-bold">
               {formatCurrency(balance?.savings || 0, currency)}
            </span>
          </div>
          <PiggyBank className="w-10 h-10 text-emerald-500/20 dark:text-emerald-500/10" />
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-905 bg-white dark:bg-slate-950/40 flex justify-between items-center shadow-sm dark:shadow-none">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Active Reserves Structured</span>
            <span className="text-2xl font-mono text-slate-900 dark:text-white font-bold">{savings.length} Savings Goals</span>
          </div>
          <Target className="w-10 h-10 text-slate-400/20 dark:text-slate-500/10" />
        </div>
      </div>

      {/* SAVINGS Savings Goals GRID */}
      <div className="space-y-4">
        <span className="text-[10px] text-slate-505 dark:text-slate-500 font-mono uppercase tracking-widest block font-bold px-1">Your Savings Goals</span>

        {savings.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-250 dark:border-white/10 bg-white dark:bg-slate-950/20 rounded-2xl text-xs text-slate-500 italic py-16">
            <PiggyBank className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <span className="block text-slate-900 dark:text-white font-medium">No savings goals created yet</span>
            <span className="block text-[10px] font-mono mt-0.5">Your activity will update in real time</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-900 dark:text-slate-100">
            {savings.map((goal) => {
              const percent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
              
              return (
                <div 
                  key={goal.id} 
                  className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/40 hover:border-emerald-500/20 transition-all flex flex-col justify-between space-y-5 shadow-sm dark:shadow-none"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-md font-semibold text-slate-900 dark:text-white font-sans">{goal.title}</h3>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">account UID: {goal.id.slice(0, 10)}</span>
                    </div>

                    <div className="px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {percent}% Completed
                    </div>
                  </div>

                  {/* Glass progress bars */}
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-800 dark:text-white">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Saved </span>
                        <span className="font-bold font-mono">${goal.currentAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">/ ${goal.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center space-x-1 text-[9px] font-mono text-slate-400 uppercase font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>compounding auto-save</span>
                    </div>

                    <button
                      onClick={() => openFundModal(goal.id)}
                      className="h-8 px-3 rounded-lg bg-slate-950 dark:bg-white hover:bg-slate-900 duration-150 text-white dark:text-black font-semibold text-[10px] font-mono tracking-wider uppercase flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Wire cash</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILED SAVINGS EXPLANATION */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/25 space-y-4 shadow-sm text-slate-800 dark:text-slate-200 transition-all">
        <div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Compound Sweep Rules</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Automated savings policies</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-xs">
          <div className="space-y-2">
            <span className="text-emerald-550 dark:text-emerald-400 font-bold font-mono">01/ Auto Roundups</span>
            <p className="text-slate-505 dark:text-slate-400 leading-relaxed text-[11px]">
              Sweeps the loose decimals of checking card outlays automatically into your top selected goal savings goal.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-emerald-555 dark:text-emerald-400 font-bold font-mono">02/ Encrypted Isolation</span>
            <p className="text-slate-505 dark:text-slate-400 leading-relaxed text-[11px]">
              savings goal balances are protected under our Secure checkings subcollection schema to prevent double-spending liabilities.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-emerald-555 dark:text-emerald-400 font-bold font-mono">03/ Instant Defrost</span>
            <p className="text-slate-505 dark:text-slate-400 leading-relaxed text-[11px]">
              Retrieve capitals from structured Savings Goals immediately back to your checking pool without custom locks or transfer delay.
            </p>
          </div>
        </div>
      </div>

      {/* CREATE GOAL RES MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h3 className="text-lg font-sans font-medium text-slate-900 dark:text-white">Create Savings Goal</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Define wealth parameters and allocation</p>
                </div>
                <button 
                  onClick={() => setCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4 text-slate-950">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-slate-500">account Label</label>
                  <input 
                    type="text" 
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g. Porsche Cayman Reserve"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-slate-500">Target Capital Capacity (USD)</label>
                  <input 
                    type="number" 
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-slate-500">Initial Deposit from Checking Account (USD)</label>
                  <input 
                    type="number" 
                    value={goalInitial}
                    onChange={(e) => setGoalInitial(e.target.value)}
                    placeholder="e.g. 500 (Optional)"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[9px] text-slate-450 block font-mono">Checking Pool Balance: ${totalChecking.toLocaleString()}</span>
                </div>

                <button 
                  type="submit"
                  className="w-full h-11 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-slate-900 text-xs font-bold uppercase tracking-widest cursor-pointer mt-4"
                >
                  Structure savings goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEPOSIT INTO SUB-GOAL account STATE MODAL */}
      <AnimatePresence>
        {fundGoalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h3 className="text-lg font-sans font-medium text-slate-900 dark:text-white">Wire checking cash</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Defrost and allocate liquidity instantly</p>
                </div>
                <button 
                  onClick={() => setFundGoalModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleFundGoal} className="space-y-4 text-slate-950">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-slate-500">Contribution Sum (USD)</label>
                  <input 
                    type="number" 
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="text-[9px] text-slate-450 block font-mono">Available Liquidity: ${totalChecking.toLocaleString()}</span>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setFundGoalModalOpen(false)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-slate-955 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    Apply sweep
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
