import { formatCurrency, getCurrencySymbol } from "../utils";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Receipt, Search, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function BillsView() {
  const { user, issueTransfer } = useStore();
  const currency = user?.currency || 'USD';
  const [search, setSearch] = useState('');
  const [selectedBiller, setSelectedBiller] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');

  const availableBillers = [
    { id: '1', name: 'Pacific Gas & Electric', type: 'utility', icon: '⚡' },
    { id: '2', name: 'AT&T Wireless', type: 'telecom', icon: '📱' },
    { id: '3', name: 'Xfinity Internet', type: 'subscription', icon: '🌐' },
    { id: '4', name: 'Geico Auto Insurance', type: 'insurance', icon: '🚗' },
    { id: '5', name: 'Netflix Subscription', type: 'subscription', icon: '🎬' },
    { id: '6', name: 'Chase Credit Card', type: 'credit card', icon: '💳' },
    { id: '7', name: 'Planet Fitness', type: 'membership', icon: '🏋️' },
    { id: '8', name: 'State Farm Home', type: 'insurance', icon: '🏠' },
    { id: '9', name: 'Con Edison Utility', type: 'utility', icon: '⚡' },
    { id: '10', name: 'Verizon Fios', type: 'telecom', icon: '📱' }
  ];

  const payBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiller || !amount || !accountNumber) return;
    await issueTransfer(
      selectedBiller.name.replace(/\s+/g, '').toLowerCase() + '@biller.net',
      parseFloat(amount),
      `Payment to ${selectedBiller.name} (Acct: ${accountNumber})`
    );
    setSelectedBiller(null);
    setAccountNumber('');
    setAmount('');
  };

  const filteredBillers = availableBillers.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-widest uppercase font-bold">Bill Pay</span>
            <h1 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white mt-1">Available Billers</h1>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">Select a company from the directory to initiate a payment.</p>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search billers directory..."
            className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {filteredBillers.map((biller) => (
            <div key={biller.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-colors group" onClick={() => setSelectedBiller(biller)}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl shadow-sm">
                  {biller.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{biller.name}</h3>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{biller.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedBiller && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedBiller(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <button 
                onClick={() => setSelectedBiller(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
               >
                 <X size={20} />
              </button>
              
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 text-2xl">
                {selectedBiller.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pay {selectedBiller.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please provide the required account information to complete this payment.</p>
              
              <form onSubmit={payBill} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-500">{selectedBiller.name} Account Number</label>
                  <input 
                     type="text" 
                     className="w-full h-11 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500 dark:text-white"
                     placeholder="e.g. 1234567890"
                     value={accountNumber}
                     onChange={(e) => setAccountNumber(e.target.value)}
                     required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-500">Payment Amount ({getCurrencySymbol(currency)})</label>
                  <input 
                     type="number"
                     step="0.01"
                     min="1"
                     className="w-full h-11 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500 dark:text-white"
                     placeholder="0.00"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     required
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2">
                    <Zap size={16} />
                    <span>Authorize Payment</span>
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
