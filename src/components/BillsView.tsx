/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Receipt, Plus, Search, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function BillsView() {
  const { user, balance, issueTransfer } = useStore();
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<any>(null);

  const predefinedBills = [
    { id: '1', name: 'Electric Utility', type: 'utility', amount: 145.20, dueDate: '2026-05-28' },
    { id: '2', name: 'Water & Sewer', type: 'utility', amount: 65.10, dueDate: '2026-05-30' },
    { id: '3', name: 'Internet Provider', type: 'subscription', amount: 89.99, dueDate: '2026-06-02' },
    { id: '4', name: 'Car Insurance', type: 'insurance', amount: 210.00, dueDate: '2026-06-05' },
    { id: '5', name: 'Streaming Service', type: 'subscription', amount: 15.99, dueDate: '2026-06-10' },
  ];

  const payBill = async () => {
    if (!selectedBill) return;
    await issueTransfer(selectedBill.name.replace(/\s+/g, '').toLowerCase() + '@biller.net', selectedBill.amount, `Payment for ${selectedBill.name}`);
    setSelectedBill(null);
  };

  const filteredBills = predefinedBills.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">Bill Payments</h1>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">Manage and pay your automated billers.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="h-10 px-4 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center space-x-2">
              <Plus size={16} />
              <span>Add Biller</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search billers..."
            className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBills.map((bill) => (
            <div key={bill.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={() => setSelectedBill(bill)}>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{bill.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{bill.type} • Due {bill.dueDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">${bill.amount.toFixed(2)}</p>
                <ChevronRight size={16} className="text-slate-400 ml-auto mt-1" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedBill(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pay {selectedBill.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This will deduct funds from your Checking balance.</p>
              
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Amount Due</span>
                <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">${selectedBill.amount.toFixed(2)}</span>
              </div>

              <div className="mt-8 flex space-x-3">
                <button onClick={() => setSelectedBill(null)} className="flex-1 h-11 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={payBill} className="flex-1 h-11 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">
                  Confirm Pay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
