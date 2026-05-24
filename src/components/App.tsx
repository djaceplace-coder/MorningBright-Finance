/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { LandingPage } from './LandingPage';
import { AuthModal } from './AuthModal';
import { Sidebar } from './Sidebar';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { NotificationBell } from './NotificationBell';
import { DashboardView } from './DashboardView';
import { CardsView } from './CardsView';
import { TransfersView } from './TransfersView';
import { BillsView } from './BillsView';
import { SavingsView } from './SavingsView';
import { SettingsView } from './SettingsView';
import { SupportView } from './SupportView';
import { AdminPanel } from './AdminPanel';
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
  LockKeyhole,
  ChevronDown,
  Settings,
  Download
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'react-hot-toast';

declare global {
  interface Window {
    deferredPrompt: any;
    installPWA: () => void;
  }
}

export default function App() {
  const { user, settings, logOutUser, initAuthListener } = useStore();
  const [currentTab, setCurrentTab] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialIsSignUp, setAuthModalInitialIsSignUp] = useState(false);
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  const [isPWA, setIsPWA] = useState(false);

  // Setup PWA listener
  React.useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    setIsPWA(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setIsPWA(e.matches);
    media.addEventListener('change', listener);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    });

    window.installPWA = async () => {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          window.deferredPrompt = null;
        }
      } else {
        setShowInstallModal(true);
      }
    };
    
    return () => media.removeEventListener('change', listener);
  }, []);

  // Startup persistent auth session restore effect
  React.useEffect(() => {
    const unsub = initAuthListener();
    return () => {
      unsub?.();
    };
  }, [initAuthListener]);

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

    const targetTheme = settings?.theme || (localStorage.getItem('mb_theme') as any) || 'light';
    applyTheme(targetTheme);

    if (targetTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings?.theme]);

  const handleOpenAuth = () => {
    setAuthModalInitialIsSignUp(false);
    setIsAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalInitialIsSignUp(true);
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
            <h3 className="text-xl font-medium tracking-tight text-white">Account Suspended</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Morning Bright Risk Operations
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            We registered abnormal transactional activity. This account has been temporarily restricted for your safety. Please contact our support team.
          </p>

          <div className="pt-4 border-t border-white/5 w-full flex flex-col space-y-3">
            <button 
              onClick={logOutUser}
              className="h-11 rounded-lg bg-white text-black font-bold text-xs"
            >
              Sign Out Securely
            </button>
            <div className="text-[10px] font-mono text-slate-600 uppercase font-bold tracking-widest text-center mt-1">Please contact support</div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER LANDING PAGE OR PRIVATE DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300 flex flex-col">
      <Toaster position="top-center" />
      {!isPWA && (
        <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between z-50 shadow-sm relative">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center shrink-0">
              <Download size={14} />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Install Morning Bright App</p>
            </div>
          </div>
          <button 
            onClick={() => window.installPWA?.()}
            className="px-3 py-1 bg-white text-emerald-600 rounded-md text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Install
          </button>
        </div>
      )}
      
      <div className="flex-1 flex flex-col relative w-full h-full">
      {!user ? (
        // PUBLIC FACING SITE
        <div className="flex flex-col flex-1">
          <LandingPage 
            onEnterApp={handleOpenAuth} 
            onSignUp={handleOpenSignUp}
          />
          <AnimatePresence>
            {isAuthModalOpen && (
              <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onSuccess={() => setCurrentTab('home')}
                initialIsSignUp={authModalInitialIsSignUp}
              />
            )}
          </AnimatePresence>
        </div>
      ) : (
        // PRIVATE DASHBOARD CLIENT PORTAL
        <div className={`flex flex-1 w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${isPWA ? 'max-w-[480px] mx-auto border-x border-slate-200 dark:border-white/5 shadow-2xl z-0' : 'z-0'}`}>
          
          {/* DESKTOP SIDEBAR */}
          <div className={isPWA ? "hidden" : "hidden md:block"}>
            <Sidebar currentTab={currentTab} onChangeTab={setCurrentTab} />
          </div>

          {/* MAIN PAGE BODY */}
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            
            {/* MOBILE NAVIGATION HEADER */}
            <header className={`${isPWA ? 'flex' : 'md:hidden flex'} h-16 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 items-center justify-between px-6 z-45 transition-colors`}>
              <div className="flex items-center space-x-2.5">
                <Logo className="w-7 h-7" withBackground={true} />
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Hi, {user?.lastName || 'Client'}</span>
              </div>

              <div className="flex items-center space-x-3.5 text-slate-900 dark:text-white relative z-40">
                <NotificationBell />
                <button 
                  onClick={() => setIsHeaderDropdownOpen(!isHeaderDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase font-mono font-bold">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isHeaderDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isHeaderDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/20 z-50 overflow-hidden"
                    >
                      <div className="p-1.5 flex flex-col space-y-1">
                        <button
                          onClick={() => { setCurrentTab('settings'); setIsHeaderDropdownOpen(false); }}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          <User size={14} className="text-emerald-500" />
                          <span>Profile Details</span>
                        </button>
                        
                        <button
                          onClick={() => { setCurrentTab('settings'); setIsHeaderDropdownOpen(false); }}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          <Settings size={14} className="text-emerald-500" />
                          <span>Security Settings</span>
                        </button>

                        <div className="h-px bg-slate-200 dark:bg-white/10 my-1 mx-2" />

                        <button
                          onClick={() => {
                            setIsHeaderDropdownOpen(false);
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
                  {currentTab === 'bills' && <BillsView />}
                  {currentTab === 'cards' && <CardsView />}
                  {currentTab === 'savings' && <SavingsView />}
                  {currentTab === 'support' && <SupportView />}
                  {currentTab === 'settings' && <SettingsView />}
                  {currentTab === 'admin' && <AdminPanel />}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* MOBILE BOTTOM NAVIGATION tabs */}
            <MobileNav currentTab={currentTab} onChangeTab={setCurrentTab} />

          </div>

        </div>
      )}

      </div>

      {/* PWA INSTALL MODAL */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-xl relative"
            >
              <button 
                onClick={() => setShowInstallModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <Download className="w-8 h-8 text-emerald-500" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Install App</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    To install Morning Bright locally, tap your browser's <strong className="text-slate-900 dark:text-slate-200">Share</strong> menu (iOS) or <strong className="text-slate-900 dark:text-slate-200">Menu bar</strong> (Android) and select <strong className="text-slate-900 dark:text-slate-200">Add to Home Screen</strong>.
                  </p>
                </div>
                
                <button 
                  onClick={() => setShowInstallModal(false)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
