/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, ArrowLeftRight, CreditCard, Target, Settings, ShieldAlert } from 'lucide-react';
import { useStore } from '../store';

interface MobileNavProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export function MobileNav({ currentTab, onChangeTab }: MobileNavProps) {
  const { user } = useStore();

  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'transfers', label: 'Transfers', icon: <ArrowLeftRight size={20} /> },
    { id: 'cards', label: 'Cards', icon: <CreditCard size={20} /> },
    { id: 'savings', label: 'Savings', icon: <Target size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-white/5 flex justify-around items-center px-2 z-40 select-none pb-safe transition-colors">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onChangeTab(item.id)}
          className={`flex flex-col items-center justify-center space-y-1 w-12 h-12 rounded-xl transition-all cursor-pointer ${
            currentTab === item.id ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'
          }`}
        >
          {item.icon}
          <span className="text-[9px] font-medium tracking-tight font-sans">
            {item.label}
          </span>
        </button>
      ))}

      {/* Admin shortcut on Mobile if user is Admin */}
      {user?.isAdmin && (
        <button
          onClick={() => onChangeTab('admin')}
          className={`flex flex-col items-center justify-center space-y-1 w-12 h-12 rounded-xl transition-all cursor-pointer ${
            currentTab === 'admin' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
          }`}
        >
          <ShieldAlert size={20} />
          <span className="text-[9px] font-medium tracking-tight font-sans">
            Admin
          </span>
        </button>
      )}
    </nav>
  );
}
