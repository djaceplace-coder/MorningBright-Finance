/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Home, 
  ArrowLeftRight, 
  CreditCard, 
  Target, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Sparkles,
  Database,
  Radio
} from 'lucide-react';
import { useStore } from '../store';
import { Logo } from './Logo';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export function Sidebar({ currentTab, onChangeTab }: SidebarProps) {
  const { user, logOutUser, simulationActive, setSimulationMode } = useStore();

  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'transfers', label: 'Transfers', icon: <ArrowLeftRight size={18} /> },
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
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-200/45 dark:bg-white/5 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
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
 
          {/* PRIVILEGED ADMINISTRATIVE DASHBOARD */}
          {user?.isAdmin && (
            <button
              onClick={() => onChangeTab('admin')}
              className={`w-full h-11 px-3 rounded-lg flex items-center space-x-3 text-xs font-semibold uppercase tracking-wider transition-all pt-2 mt-4 border-t border-slate-200 dark:border-white/5 cursor-pointer ${
                currentTab === 'admin' 
                  ? 'bg-amber-500/10 border-l-2 border-amber-500 text-amber-600 dark:text-amber-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-950 hover:dark:text-white'
              }`}
            >
              <ShieldAlert size={18} className={currentTab === 'admin' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'} />
              <span>Admin Console</span>
            </button>
          )}
        </nav>
      </div>
 
      {/* FOOTER CONTROLS */}
      <div className="space-y-4">
        {/* ENVIRONMENT PREFERENCE CHIP */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500">
            <span>Database Node:</span>
            <span className={`w-2 h-2 rounded-full ${simulationActive ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          </div>
          
          <button 
            onClick={() => setSimulationMode(!simulationActive)}
            className="w-full py-1.5 rounded-lg border text-[9px] font-mono uppercase tracking-wider text-center cursor-pointer select-none transition-all font-semibold block bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          >
            {simulationActive ? '⚡ Simulation Sandbox' : '📡 Real Cloud Live'}
          </button>
        </div>
 
        {/* SECURE LOGOUT */}
        <button
          onClick={logOutUser}
          className="w-full h-10 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-red-500/5 transition-all text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 border border-slate-200 dark:border-white/5 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Close Session</span>
        </button>
      </div>

    </aside>
  );
}
