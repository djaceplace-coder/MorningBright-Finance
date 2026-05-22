/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  ArrowLeftRight, 
  CreditCard, 
  Target, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  User,
  ChevronDown,
  Sparkles,
  Database,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { Logo } from './Logo';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export function Sidebar({ currentTab, onChangeTab }: SidebarProps) {
  const { user, logOutUser } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'transfers', label: 'Transfers', icon: <ArrowLeftRight size={18} /> },
    { id: 'bills', label: 'Bill Payments', icon: <Sparkles size={18} /> },
    { id: 'cards', label: 'Cards', icon: <CreditCard size={18} /> },
    { id: 'savings', label: 'Savings', icon: <Target size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 flex flex-col justify-between py-6 px-4 shrink-0 font-sans select-none hidden md:flex sticky top-0 h-screen transition-colors">
      
      {/* BRAND HEADER */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-2">
          <Logo className="w-9 h-9" withBackground={true} />
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block">Morning Bright</span>
            <span className="text-[9px] block text-slate-500 font-semibold tracking-widest font-mono uppercase">FINANCE</span>
          </div>
        </div>
 
        {/* ACCOUNT SNAPSHOT BRAND */}
        {user && (
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-200/45 dark:bg-white/5 flex items-center justify-between cursor-pointer hover:bg-slate-200/80 dark:hover:bg-white/10 transition-colors text-left"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs font-mono uppercase">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <span className="block text-xs font-medium text-slate-900 dark:text-white tracking-tight truncate">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="block text-[9px] text-slate-500 font-mono truncate lowercase">
                    {user.email}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/20 z-50 overflow-hidden"
                >
                  <div className="p-1.5 flex flex-col space-y-1">
                    <button
                      onClick={() => { onChangeTab('settings'); setIsDropdownOpen(false); }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                    >
                      <User size={14} className="text-emerald-500" />
                      <span>Profile Details</span>
                    </button>
                    
                    <button
                      onClick={() => { onChangeTab('settings'); setIsDropdownOpen(false); }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                    >
                      <Settings size={14} className="text-emerald-500" />
                      <span>Security Settings</span>
                    </button>

                    <div className="h-px bg-slate-200 dark:bg-white/10 my-1 mx-2" />

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logOutUser();
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-xs text-red-600 dark:text-red-400 font-medium cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
 
        {/* MAIN MENU ITEMS */}
        <nav className="space-y-1.5 pt-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full h-11 px-3 rounded-lg flex items-center space-x-3 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === item.id 
                  ? 'bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-950 hover:dark:text-white'
              }`}
            >
              <span className={currentTab === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
 
      {/* FOOTER CONTROLS */}
      <div className="space-y-4">
        {/* Placeholder if needed */}
      </div>

    </aside>
  );
}
