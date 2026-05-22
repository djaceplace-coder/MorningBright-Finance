/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from './store';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { Logo } from './components/Logo';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { CardsView } from './components/CardsView';
import { TransfersView } from './components/TransfersView';
import { SavingsView } from './components/SavingsView';
import { SettingsView } from './components/SettingsView';
import { AdminPanel } from './components/AdminPanel';
import { 
  LogOut, 
  Menu, 
  X, 
  User, 
  TrendingUp, 
  ShieldAlert, 
  Radio, 
  Sparkles,
  Database,
  Lock,
  LockKeyhole
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { user, settings, simulationActive, setSimulationMode, logOutUser } = useStore();
  const [currentTab, setCurrentTab] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Theme Sync effect (Light / Dark / System)
  React.useEffect(() => {
    const applyTheme = (t: 'light' | 'dark' | 'system') => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      
      let resolvedTheme: 'light' | 'dark' = 'dark';
      if (t === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolvedTheme = systemPrefersDark ? 'dark' : 'light';
      } else {
        resolvedTheme = t;
      }
      
      root.classList.add(resolvedTheme);
      localStorage.setItem('mb_theme', t);
    };

    const targetTheme = settings?.theme || (localStorage.getItem('mb_theme') as any) || 'system';
    applyTheme(targetTheme);

    if (targetTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings?.theme]);

  const handleActivateDemo = async () => {
    // Attempt login as administrative bootstrapped profile
    await useStore.getState().logInUser('adereraadenike@gmail.com', 'finance101');
    const hasError = useStore.getState().errorMessage;
    if (hasError) {
      // Create it if it doesn't exist
      await useStore.getState().signUpUser('adereraadenike@gmail.com', 'finance101', 'Alex', 'Morningstar');
    }
  };

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  // If user is suspended, block navigation and display recovery gate
  if (user?.isSuspended) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-red-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md bg-slate-900 border border-red-500/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-5 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 mb-2">
            <LockKeyhole size={32} />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight text-white">Owner Credentials Suspended</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Morning Bright Premium Security Isolation
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            We registered abnormal transactional outlays that conflict with sovereign compliance rules. This node checking subcollection has been temporarily sandboxed.
          </p>

          <div className="pt-4 border-t border-white/5 w-full flex flex-col space-y-3">
            <button 
              onClick={logOutUser}
              className="h-11 rounded-lg bg-white text-black font-bold text-xs"
            >
              Sign Out Securely
            </button>
            <div className="text-[10px] font-mono text-slate-600 uppercase font-bold tracking-widest text-center mt-1">By order of compliance</div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER LANDING PAGE OR PRIVATE DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      
      {!user ? (
        // PUBLIC FACING SITE
        <>
          <LandingPage 
            onEnterApp={handleOpenAuth} 
            onActivateDemo={handleActivateDemo}
            simulationActive={simulationActive}
          />
          <AnimatePresence>
            {isAuthModalOpen && (
              <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onSuccess={() => setCurrentTab('home')}
              />
            )}
          </AnimatePresence>
        </>
      ) : (
        // PRIVATE DASHBOARD CLIENT PORTAL
        <div className="flex min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          
          {/* DESKTOP SIDEBAR */}
          <Sidebar currentTab={currentTab} onChangeTab={setCurrentTab} />

          {/* MAIN PAGE BODY */}
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            
            {/* MOBILE NAVIGATION HEADER */}
            <header className="md:hidden h-16 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 z-45 transition-colors">
              <div className="flex items-center space-x-2.5">
                <Logo className="w-7 h-7" withBackground={true} />
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Morning Bright</span>
              </div>

              <div className="flex items-center space-x-3.5 text-slate-900 dark:text-white">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase font-mono font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                
                <button 
                  onClick={logOutUser}
                  className="p-1 rounded bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  title="Close Session"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </header>

            {/* VIEWS SWAP CONTAINER */}
            <main className="flex-1 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {currentTab === 'home' && (
                    <DashboardView 
                      onOpenTransfer={() => setCurrentTab('transfers')}
                      onNavigateTab={setCurrentTab}
                    />
                  )}
                  {currentTab === 'transfers' && <TransfersView />}
                  {currentTab === 'cards' && <CardsView />}
                  {currentTab === 'savings' && <SavingsView />}
                  {currentTab === 'settings' && <SettingsView />}
                  {currentTab === 'admin' && user?.isAdmin && <AdminPanel />}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* MOBILE BOTTOM NAVIGATION tabs */}
            <MobileNav currentTab={currentTab} onChangeTab={setCurrentTab} />

          </div>

        </div>
      )}

    </div>
  );
}
