/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  TrendingUp, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  Fingerprint, 
  Lock, 
  ChevronRight, 
  Database, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Laptop,
  Users,
  Building,
  PiggyBank,
  Check,
  MapPin,
  Clock,
  Briefcase,
  Layers,
  PhoneCall,
  DollarSign,
  QrCode,
  LockKeyhole,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { LegalPage } from './LegalPage';
import { Logo } from './Logo';

interface LandingProps {
  onEnterApp: () => void;
  onActivateDemo: () => void;
  simulationActive: boolean;
}

export function LandingPage({ onEnterApp, onActivateDemo, simulationActive }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState<'cards' | 'savings' | 'business' | 'security'>('cards');
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'cookie' | 'security' | 'acceptable' | null>(null);

  // Savings Estimator state
  const [savingsPrincipal, setSavingsPrincipal] = useState<number>(10000);
  const [savingsMonthly, setSavingsMonthly] = useState<number>(300);
  const [savingsYears, setSavingsYears] = useState<number>(5);

  // Business Financing Estimator state
  const [loanAmount, setLoanAmount] = useState<number>(75000);
  const [loanTerm, setLoanTerm] = useState<number>(36); // months

  const { settings, updateSettingsToggle } = useStore();
  const currentTheme = settings?.theme || (localStorage.getItem('mb_theme') as any) || 'system';

  // Master theme toggler for public portal
  const handleThemeToggle = async () => {
    let nextTheme: 'light' | 'dark' | 'system' = 'dark';
    if (currentTheme === 'dark') nextTheme = 'light';
    else if (currentTheme === 'light') nextTheme = 'system';
    
    if (settings) {
      await updateSettingsToggle('theme', nextTheme);
    } else {
      localStorage.setItem('mb_theme', nextTheme);
      // Trigger temporary DOM swap directly
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (nextTheme === 'system') {
        const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(pref);
      } else {
        root.classList.add(nextTheme);
      }
    }
  };

  // Savings Calculation Logic
  const savingsResults = useMemo(() => {
    const rateMB = 0.0485; // 4.85% APY
    const rateTraditional = 0.0045; // 0.45% APY (National Average)
    
    const months = savingsYears * 12;
    const monthlyRateMB = rateMB / 12;
    const monthlyRateTD = rateTraditional / 12;

    let totalMB = savingsPrincipal;
    let totalTD = savingsPrincipal;

    for (let i = 0; i < months; i++) {
      totalMB = totalMB * (1 + monthlyRateMB) + savingsMonthly;
      totalTD = totalTD * (1 + monthlyRateTD) + savingsMonthly;
    }

    const totalDeposited = savingsPrincipal + (savingsMonthly * months);
    const earningsMB = Math.max(0, totalMB - totalDeposited);
    const earningsTD = Math.max(0, totalTD - totalDeposited);
    const difference = Math.max(0, totalMB - totalTD);

    return {
      mbTotal: Math.round(totalMB),
      tdTotal: Math.round(totalTD),
      mbEarnings: Math.round(earningsMB),
      tdEarnings: Math.round(earningsTD),
      difference: Math.round(difference),
      totalDeposited: Math.round(totalDeposited)
    };
  }, [savingsPrincipal, savingsMonthly, savingsYears]);

  // Loan Calculation Logic (fixed 6.25% APR)
  const financingResults = useMemo(() => {
    const annualRate = 0.0625; // 6.25% APR Fixed
    const monthlyRate = annualRate / 12;
    const numPayments = loanTerm;

    // Monthly repayment formula: P * (i * (1+i)^n) / ((1+i)^n - 1)
    const factor = Math.pow(1 + monthlyRate, numPayments);
    const monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
    const totalRepaid = monthlyPayment * numPayments;
    const totalInterest = totalRepaid - loanAmount;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalRepaid: Math.round(totalRepaid)
    };
  }, [loanAmount, loanTerm]);

  // If a legal document view is selected, mount it over the landing elements
  if (legalTab) {
    return (
      <LegalPage 
        initialTab={legalTab} 
        onClose={() => setLegalTab(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black transition-colors duration-300 relative overflow-hidden">
      
      {/* GLOWING AMBIENT FIELDS - Deep and Subtle, Less Futuristic */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 dark:opacity-15 transition-opacity">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-slate-300 dark:bg-emerald-950/20 blur-[130px]" />
        <div className="absolute top-1/3 left-10 w-[500px] h-[500px] rounded-full bg-slate-200 dark:bg-indigo-950/10 blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5 bg-slate-50/90 dark:bg-slate-950/90 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo className="w-9 h-9" withBackground={true} />
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Morning Bright
              </span>
              <span className="text-xs block text-slate-400 dark:text-slate-500 font-medium tracking-widest font-mono uppercase">Finance</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            <a href="#personal" className="hover:text-slate-900 dark:hover:text-white transition-colors">Personal Banking</a>
            <a href="#business" className="hover:text-slate-900 dark:hover:text-white transition-colors">Business Support</a>
            <a href="#savings" className="hover:text-slate-900 dark:hover:text-white transition-colors">Wealth Planning</a>
            <a href="#security" className="hover:text-slate-900 dark:hover:text-white transition-colors">Defense & FDIC</a>
            <button 
              onClick={() => setLegalTab('privacy')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors uppercase cursor-pointer text-xs font-semibold"
            >
              Regulatory Matrix
            </button>
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title={`Theme: ${currentTheme}. Click to swap.`}
            >
              {currentTheme === 'light' ? <Sun size={15} /> : currentTheme === 'dark' ? <Moon size={15} /> : <Laptop size={15} />}
            </button>

            <button 
              onClick={onActivateDemo}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-mono underline underline-offset-4 px-3 py-2 cursor-pointer"
            >
              [Explore Live Demo]
            </button>
            
            <button 
              onClick={onEnterApp}
              className="h-10 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs transition-all hover:scale-[1.03] active:scale-95 shadow-md cursor-pointer border border-transparent dark:border-white/10"
            >
              Access Accounts
            </button>
          </div>

          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={handleThemeToggle}
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 mr-1 flex items-center justify-center text-slate-400"
            >
              {currentTheme === 'light' ? <Sun size={14} /> : currentTheme === 'dark' ? <Moon size={14} /> : <Laptop size={14} />}
            </button>
            <button 
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="lg:hidden fixed inset-x-0 top-20 z-40 p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 flex flex-col space-y-4 shadow-xl text-sm transition-colors duration-200"
          >
            <a 
              href="#personal" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium"
            >
              Personal Banking
            </a>
            <a 
              href="#business" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium"
            >
              Business Support
            </a>
            <a 
              href="#savings" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium"
            >
              Wealth Planning
            </a>
            <a 
              href="#security" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium"
            >
              Defense & FDIC
            </a>
            <button 
              onClick={() => { setMobileMenuOpen(false); setLegalTab('privacy'); }}
              className="text-left text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium cursor-pointer"
            >
              Regulatory Matrix
            </button>
            
            <div className="pt-4 flex flex-col space-y-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); onActivateDemo(); }}
                className="w-full text-center text-xs text-slate-700 dark:text-slate-300 font-mono py-2"
              >
                [Explore Live Demo]
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onEnterApp(); }}
                className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center justify-center shadow-md"
              >
                Access Accounts <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION - TRUST & CONFIDENCE */}
      <section className="relative px-6 pt-16 pb-24 md:pt-28 md:pb-32 max-w-7xl mx-auto w-full transition-all">
        {/* Subtle grid accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-[0.2] dark:opacity-20 -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 w-fit shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-600 dark:text-slate-300">
                FDIC-Insured Custodial Accounts Partner
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-sans tracking-tight leading-[1.08] font-semibold text-slate-900 dark:text-white max-w-2xl">
              Chartered banking values. <br />
              <span className="text-slate-400 dark:text-slate-500 font-normal">Modern digital precision.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              At Morning Bright Finance, we combine established operational experience with advanced digital banking convenience. We are built to serve people, families, and American businesses with secure accounts, long-term stability, and continuous personal support.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button 
                onClick={onEnterApp}
                className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 shadow-lg hover:shadow-emerald-500/5 cursor-pointer"
              >
                <span>Access Digital Services</span>
                <ArrowRight size={15} />
              </button>
              
              <button 
                onClick={onActivateDemo}
                className="h-12 px-6 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/40 dark:bg-white/5 text-xs text-slate-700 dark:text-slate-200 transition-all font-mono tracking-widest uppercase hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <span>Interactive Preview Portal</span>
              </button>
            </div>

            {/* Nationwide reassurance figures */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-white/5 max-w-lg">
              <div>
                <span className="block text-xl md:text-2xl font-bold font-sans text-slate-900 dark:text-white">$250k</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block mt-0.5">FDIC Protection Limit</span>
              </div>
              <div>
                <span className="block text-xl md:text-2xl font-bold font-sans text-slate-900 dark:text-white">55,000+</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block mt-0.5">Fee-Free ATMs Coast to Coast</span>
              </div>
              <div>
                <span className="block text-xl md:text-2xl font-bold font-sans text-slate-900 dark:text-white">24/7 Support</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block mt-0.5">U.S. Operational Help desk</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center md:h-[480px]">
            {/* Soft Ambient Shadow Backdrop */}
            <div className="absolute inset-0 bg-slate-100 dark:bg-emerald-950/10 blur-[80px] rounded-full dark:opacity-30" />
            
            {/* Realistic human-oriented architectural banking card structure & premium photography card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="relative w-full max-w-[420px] rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-1 shadow-2xl transition-all flex flex-col overflow-hidden"
            >
              {/* Premium human-centered photo representation */}
              <div className="relative h-60 w-full rounded-2xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200" 
                  alt="Morning Bright National Plaza" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-400 font-semibold block">HEADQUARTERS</span>
                  <p className="text-sm font-sans font-medium tracking-tight text-white mt-1">
                    Morning Bright Plaza, NYC Financial District
                  </p>
                  <p className="text-[10px] text-slate-300 font-mono block mt-0.5">
                    Operational stability since inception
                  </p>
                </div>
              </div>

              {/* Secure status and account summary panel */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-medium border-b border-slate-100 dark:border-white/5 pb-3">
                  <span>SYSTEM CLOUD SECURE</span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ENC ROUTING SIGNATURES</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-semibold">Morning Checking Core</h3>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-emerald-950/25 border border-slate-200 dark:border-emerald-500/10 rounded text-[9px] font-mono text-slate-600 dark:text-emerald-400 font-bold uppercase">Active</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-sans font-semibold text-slate-900 dark:text-white">$12,450.80</span>
                    <span className="text-xs text-slate-400 font-mono">Routing: 021000021</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    Private capital deposits managed with complete physical database security rules.
                  </p>
                </div>

                {/* Instant action callout for the preview */}
                <div className="pt-2">
                  <button 
                    onClick={onEnterApp}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 font-sans font-semibold text-xs text-slate-800 dark:text-white flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Activate Online Deposit Services</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CORE BANKING PRINCIPLES / INSTITUTIONAL CALM BAR */}
      <section className="bg-white dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-white/5 py-12 px-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 text-left">
          <div className="max-w-md">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block">TRUSTED GOVERNANCE</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              We stand apart from volatile modern financial startups. Our capital is handled with care, absolute confidentiality, and complete compliance standards to ensure long-term stability.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 items-center pt-2 md:pt-0">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">GLBA Secure Partner</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">Equal Housing Lender</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">FCRA Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONAL BANKING SOLUTIONS */}
      <section id="personal" className="py-24 sm:py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 flex flex-col space-y-6 text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block">EVERYDAY BANKING SECURITY</span>
            <h2 className="text-3xl sm:text-4xl font-sans tracking-tight font-semibold text-slate-900 dark:text-white leading-[1.1]">
              Everyday banking built around your life&apos;s goals.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Experience the clarity of checking and debit tools structured for reliability. Morning Checking provides convenient, high-capacity balances that operate fee-free, backed by modern remote tools.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                { title: "No Administrative Monthly Maintenance Fees", desc: "Keep savings focused entirely on compounding values." },
                { title: "Nationwide Fee-Free ATM Network", desc: "Access funds at over 55,000 Allpoint® terminals without surcharges." },
                { title: "Early Direct Deposits", desc: "Gain secure access to recurring wages up to two payroll days early." },
                { title: "Personal Savings Lockers", desc: "Partition allocations inside high-yield subchecking pools on demand." }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-left">
                  <div className="mt-1 shrink-0 w-4 h-4 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block">{item.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button 
                onClick={onEnterApp}
                className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-semibold text-xs tracking-tight transition-all flex items-center space-x-2"
              >
                <span>Compare Account Types</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900/40 blur-[90px] rounded-full dark:opacity-30" />
            
            {/* Interactive checking and savings visual card panel */}
            <div className="relative p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-xl transition-all flex flex-col space-y-6">
              <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200" 
                  alt="Personal checking and trust account overview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-5 left-5 text-white">
                  <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-bold">SOCIALLY ENGAGED BANKING</span>
                  <p className="text-base font-semibold leading-tight text-white mt-1">Guarding Household Wealth Strategically</p>
                </div>
              </div>

              {/* Dynamic interest simulation block */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-white/5">
                  <span className="text-xs font-mono uppercase tracking-widest font-bold">Morning Interest Estimator</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">4.85% APY Compounding</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Slider 1: Principal representation */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Initial Capital Balance</label>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">${savingsPrincipal.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1000" 
                      max="100000" 
                      step="1000"
                      value={savingsPrincipal}
                      onChange={(e) => setSavingsPrincipal(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Monthly contributions */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Monthly Deposits Addition</label>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">${savingsMonthly.toLocaleString()} / mo</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="5000" 
                      step="50"
                      value={savingsMonthly}
                      onChange={(e) => setSavingsMonthly(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left pt-2">
                  <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Target Timeline Duration</label>
                  <div className="flex space-x-2">
                    {[3, 5, 10, 15].map((y) => (
                      <button 
                        key={y}
                        onClick={() => setSavingsYears(y)}
                        className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                          savingsYears === y 
                            ? 'bg-slate-900 border border-transparent dark:bg-white text-white dark:text-black shadow-sm' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5'
                        }`}
                      >
                        {y} Years
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation outcomes comparison table */}
                <div className="p-4 rounded-xl dark:bg-slate-950/60 bg-slate-50 border border-slate-200/60 dark:border-white/5 space-y-3 mt-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-sans text-slate-500 dark:text-slate-400">Total Contributed Capital:</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">${savingsResults.totalDeposited.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-sans font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
                      <span>Morning Bright Growth ({savingsYears} yrs):</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${savingsResults.mbTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-sans flex items-center space-x-1">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300 mr-1.5" />
                      <span>Traditional Average Account (0.45%):</span>
                    </span>
                    <span className="font-mono">${savingsResults.tdTotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-white/5 pt-2.5 mt-2 flex justify-between items-center">
                    <span className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-200">Difference Secured:</span>
                    <span className="text-xs md:text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      +${savingsResults.difference.toLocaleString()} in compounding interest
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUSINESS BANKING & ENTERPRISE SUPPORT */}
      <section id="business" className="py-24 sm:py-32 bg-slate-100/55 dark:bg-slate-900/20 border-y border-slate-200/65 dark:border-white/5 px-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 lg:order-2 flex flex-col space-y-6 text-left">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block">COMMERCIAL BANKING FACILITIES</span>
              <h2 className="text-3xl sm:text-4xl font-sans tracking-tight font-semibold text-slate-900 dark:text-white leading-[1.1]">
                Institutional resources for scaling American enterprise.
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Empower your operational cash flow. We coordinate treasury, payroll, physical commercial expansions, and institutional corporate checking profiles with rigorous compliance infrastructure.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                    <Building className="w-4.5 h-4.5 text-emerald-500" />
                    <span>Treasury Administration</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Safely coordinate sweeping services, zero-balance configurations, and automated credit lines.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                    <Briefcase className="w-4.5 h-4.5 text-emerald-500" />
                    <span>Commercial Borrowing Facilities</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Procure term limits, plant capitalization, and expanding corporate liquidity instruments securely.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                    <Users className="w-4.5 h-4.5 text-emerald-500" />
                    <span>Team Spending Control Caps</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Audit payroll expenditures and issue individual checking caps for managers with high-end visibility.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                    <Laptop className="w-4.5 h-4.5 text-emerald-500" />
                    <span>U.S. Wires Transfer Integration</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Perform wire transmissions via Fedwire/SWIFT with standardized clearing and real-time validations.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={onEnterApp}
                  className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-semibold text-xs tracking-tight transition-all flex items-center space-x-2"
                >
                  <span>Inquire About Corporate Solutions</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 lg:order-1 relative">
              <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900/30 blur-[90px] rounded-full dark:opacity-20" />
              
              {/* Business panel representation card */}
              <div className="relative p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/60 shadow-xl transition-all flex flex-col space-y-6">
                <div className="relative h-48 sm:h-52 rounded-2xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200" 
                    alt="Corporate Business Banking Services" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 text-white">
                    <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-bold">ESTABLISHED ENTERPRISES</span>
                    <p className="text-base font-semibold leading-tight text-white mt-1">Capitalized Growth Logistics</p>
                  </div>
                </div>

                {/* Interactive loan estimator */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-white/5">
                    <span className="text-xs font-mono uppercase tracking-widest font-bold">Commercial Capital Planner</span>
                    <span className="text-[10px] text-slate-500 font-mono">6.25% APR Fixed Rate</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Input: Loan amount */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Acquisition Funding Requested</label>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">${loanAmount.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="10000" 
                        max="250000" 
                        step="5000"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Timeline range */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Target Amortization Plan</label>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{loanTerm} Months</span>
                      </div>
                      <input 
                        type="range" 
                        min="12" 
                        max="60" 
                        step="12"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Estimation outputs */}
                  <div className="p-4 rounded-xl dark:bg-slate-950/60 bg-slate-50 border border-slate-200/60 dark:border-white/5 text-left grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">Estimated Monthly Pay</span>
                      <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white font-mono block mt-1">
                        ${financingResults.monthlyPayment.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">Total Interest Costs</span>
                      <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white font-mono block mt-1">
                        ${financingResults.totalInterest.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">Aggregate Clearance</span>
                      <span className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 font-mono block mt-1">
                        ${financingResults.totalRepaid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block text-center leading-normal italic">
                    *Rates subject to formal underwriting criteria and credit review committees.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SAVINGS & WEALTH PLANNING */}
      <section id="savings" className="py-24 sm:py-32 px-6 max-w-7xl mx-auto w-full transition-all">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20 text-left md:text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block">SAVINGS & TRUST FACILITIES</span>
          <h2 className="text-3xl sm:text-4xl font-sans font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
            Guaranteed yields, preservation, and legacy planning.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Build a solid barrier against inflation with certificate rates and retirement plans designed with complete institutional clarity. Zero-maintenance fees. Guaranteed security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              title: "High-Yield CD Terms",
              desc: "Lock in guaranteed yield rates of up to 5.10% APY in 12-month configurations, structured for riskless capital preservation and secure returns, with no administrative overhead."
            },
            {
              icon: <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              title: "Custodian Trust Accounts",
              desc: "Configure secure legacy trusts and generational transfers. Safely gift and secure investment capitals for child educational assets under comprehensive, long-term frameworks."
            },
            {
              icon: <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              title: "Joint Domestic Solutions",
              desc: "Coordinate joint spousalChecking profiles. Co-manage household budgets, lock shared transaction limitations, and build mutual savings thresholds seamlessly with total transparency."
            }
          ].map((item, index) => (
            <div 
              key={index}
              className="p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-sm flex flex-col space-y-4 text-left transition-all hover:border-emerald-500/30"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-emerald-500/5 border border-slate-200 dark:border-emerald-400/10 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-md font-semibold text-slate-900 dark:text-white font-sans">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DETAILED INTERACTIVE DYNAMIC SHOWCASE */}
      <section id="showcase" className="py-24 bg-slate-100/30 dark:bg-slate-900/10 border-t border-slate-200 dark:border-white/5 px-6 max-w-7xl mx-auto w-full rounded-t-[32px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 flex flex-col space-y-6 text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Interactive Walkthrough</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
              A comprehensive portal.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore how we design online banking dashboards, instant spending locks, legacy custody assets, and secure multi-factor integrations.
            </p>

            {/* Toggle group buttons */}
            <div className="flex flex-col space-y-2 pt-2">
              {[
                { id: 'cards', label: 'Debit Cards Issuing' },
                { id: 'savings', label: 'Compound Savings Ledger' },
                { id: 'business', label: 'Corporate Accounts Portal' },
                { id: 'security', label: 'Cryptographic Biometrics' }
              ].map((btn) => (
                <button 
                  key={btn.id}
                  onClick={() => setActiveShowcase(btn.id as any)}
                  className={`p-4 rounded-xl text-left border text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                    activeShowcase === btn.id 
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold' 
                      : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{btn.label}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 p-1 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-sm min-h-[380px] flex items-center justify-center transition-colors shadow-sm">
            <div className="w-full h-full p-6 md:p-8">
              <AnimatePresence mode="wait">
                {activeShowcase === 'cards' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    key="cards-show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                  >
                    <div className="relative aspect-[1.586/1] w-full max-w-[320px] rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-hidden mx-auto text-white">
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase block font-bold">EMERALD PLATINUM</span>
                          <span className="block text-[10px] tracking-tight text-slate-400 mt-0.5">National Corporate Debit</span>
                        </div>
                        <Logo className="w-6 h-6" withBackground={false} />
                      </div>
                      <div className="text-base text-white font-mono tracking-widest my-4">
                        •••• •••• •••• 5590
                      </div>
                      <div className="flex justify-between items-end text-slate-400 text-[9px] font-mono uppercase">
                        <div>
                          <span>EXPIRATION / CVV</span>
                          <span className="block text-white">09/30 &nbsp;&bull;&bull;&bull;</span>
                        </div>
                        <span className="text-white tracking-widest leading-none font-bold text-xs">VISA</span>
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                        ACTIVE FRAUD PREVENTION
                      </div>
                      <h3 className="text-xl font-medium text-slate-950 dark:text-white">Lock virtual cards instantly</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Toggle frozen states, configure custom monthly domestic limitations, and secure online PIN adjustments instantly without calling branches.
                      </p>
                      <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        <li className="flex items-center space-x-2">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span>Custom parent tools for children spending limits</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span>Biometric approvals required for rapid card unlocks</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeShowcase === 'savings' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    key="spend-show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                  >
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 flex flex-col space-y-4 shadow-sm text-left">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/5">
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold uppercase font-mono">Compounding State</span>
                        <span className="text-[9px] font-mono text-slate-500">Uninitialized</span>
                      </div>
                      <div className="py-8 text-center text-xs text-slate-400 italic">
                        Initialize accounts inside the preview portal to view compounding interest progress.
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/5 text-[9px] font-mono text-sky-600 dark:text-sky-400 uppercase font-bold">
                        D3 COMPLIANT MODELS
                      </div>
                      <h3 className="text-xl font-medium text-slate-950 dark:text-white">Compounding ledger charts</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Safely study your savings yields visual progress under professional D3 and Recharts frameworks. Real rates, calculated with mathematical precision.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeShowcase === 'business' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    key="business-show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                  >
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 flex flex-col space-y-3 shadow-md text-left text-slate-800 dark:text-slate-200 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-slate-500">Corporate Checking</span>
                        <span className="text-[9px] text-emerald-500 uppercase font-mono font-bold">Routing Linked</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-xl space-y-1">
                        <span className="text-[9px] text-slate-400 font-mono">Treasury Cash Sweepers</span>
                        <p className="font-semibold text-slate-900 dark:text-white">$85,200.00 Authorized</p>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono tracking-widest text-right block uppercase">Corporate protection enabled</span>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-[9px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                        TREASURY OPERATIONS
                      </div>
                      <h3 className="text-xl font-medium text-slate-950 dark:text-white">Seamless commercial views</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Transition between domestic and corporate profiles smoothly inside our unified browser ledger. Standardized, calm, compartmentalized structures to ensure clean compliance reports.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeShowcase === 'security' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    key="security-show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                  >
                    <div className="p-5 rounded-2xl border border-emerald-500/15 bg-slate-900 shadow-xl flex flex-col space-y-4 text-white">
                      <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold">
                        <Fingerprint className="w-4 h-4" />
                        <span>HARDWARE ACCESS SECURITY</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 text-[11px] leading-relaxed text-slate-300">
                        &quot;WebAuthn cryptographic signatures validate identity at device level. Authentication occurs locally, meaning credentials remain completely sealed in your physical hardware elements.&quot;
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono tracking-widest text-right uppercase">Sovereign privacy keys</span>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                        MFA VALIDATION
                      </div>
                      <h3 className="text-xl font-medium text-slate-950 dark:text-white">Hardware signing signatures</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Configure Biometric Touch/Face logins inside settings. Validates capital deployments instantly, providing complete safety without cumbersome multi-step corporate keyfobs.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED ZERO TRUST SECURITY ARCHITECTURE */}
      <section id="security" className="py-24 sm:py-32 bg-white dark:bg-black/40 border-y border-slate-200 dark:border-white/5 px-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block font-semibold">ACCOUNT INFRASTRUCTURE DEFENSE</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
              A fortress of security protocols, backed by standard FDIC protection.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We operate with structural data boundaries. Your funds are kept in trust at established partner institutions which are members of the FDIC. All digital operations, profiling sweeps, and checking logs are verified server-side.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Pass-Through FDIC Protection</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Morning Bright checking funds are deposited into partner clearing houses and are insured up to $250,000.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm">
                  <Database className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Administrative Audit Trails</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every credit movement, card status toggle, and registration adjustment is fully logged in central administrative ledgers.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm">
                  <LockKeyhole className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Strict Profile Isolation</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Advanced server rules prevent cross-identity leakages, ensuring database records are isolated to you alone.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm">
                  <PhoneCall className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Personal Support Guardians</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Dedicated fraud prevention specialists monitor account anomalies and proactively contact you regarding risks.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1" />

          {/* Secure graphical card display */}
          <div className="lg:col-span-5 relative flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm min-h-[300px]">
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
            
            <div className="relative flex flex-col items-center text-center space-y-4 p-4 md:p-6">
              <div className="relative w-20 h-20 rounded-full border border-slate-200 dark:border-emerald-400/20 bg-slate-100 dark:bg-emerald-950/25 flex items-center justify-center mb-2 shadow-inner">
                <div className="absolute inset-0 border border-emerald-500/10 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '5s' }} />
                <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
              </div>
              
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 tracking-wider uppercase font-bold">Encrypted Ledger Defense</span>
              <p className="text-[10px] text-slate-400 max-w-xs font-mono leading-relaxed uppercase">
                AES-256 Storage Shields &bull; TLS v1.3 Transit Channels &bull; FDIC Insured Partner Vaulting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REASSURING CLIENT TESTIMONIALS */}
      <section className="py-24 sm:py-32 px-6 max-w-7xl mx-auto w-full transition-all text-left">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block">CLIENT CONFIDENCE</span>
            <h3 className="text-2xl sm:text-3xl font-sans tracking-tight font-semibold text-slate-900 dark:text-white leading-snug">
              Accountability that earns loyalty.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We evaluate our success purely based on the long-term prosperity, secure planning, and growth stability of the people and corporations who depend on us.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                quote: "Morning Bright Finance has supported our engineering firm through two regional expansions. Their online dashboard services are remarkably direct, and their institutional support during wire adjustments is absolutely consistent.",
                author: "Catherine G., Principal",
                loc: "Dallas, TX — Business Client Since 2018"
              },
              {
                quote: "Organizing custodial savings accounts and educational CDs for our three children gave us absolute domestic clarity. Having guaranteed yield rates with zero hidden checking fees is exactly what we were seeking.",
                author: "Marcus & Elena S., Professionals",
                loc: "Seattle, WA — depositors since 2019"
              },
              {
                quote: "Managing business checking allocations alongside our home mortgages requires precise, lockstep ledger entries. Morning Bright delivers elegant portals with serious banking reliability.",
                author: "Elizabeth T., Consulting Director",
                loc: "Chicago, IL — Client Since 2020"
              },
              {
                quote: "The complete absence of unneeded system telemetry interfaces and high-yield interest options makes this our primary domestic banking choice.",
                author: "Jonathan P., Architect",
                loc: "Boston, MA — Account holder since 2021"
              }
            ].map((t, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  &quot;{t.quote}&quot;
                </p>
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">{t.author}</span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mt-0.5">{t.loc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NATIONWIDE ACCESSIBILITY & MOBILE CONVENIENCE CTA */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="relative rounded-[32px] border border-slate-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900 p-8 md:p-14 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 dark:bg-emerald-900/5 blur-3xl rounded-full dark:opacity-60 pointer-events-none" />
          
          <div className="flex flex-col space-y-5 text-left max-w-xl">
            <Smartphone className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-2.5xl sm:text-3xl font-sans font-semibold tracking-tight text-slate-900 dark:text-white">
              Secure digital services, accessible anywhere.
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Experience the same premium platform design whether accessed via tablet, office laptop, or secure smartphone browsers. Instantly access real-time deposit routes, wire services, spending locks, and interest projections.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Responsive Modern Web Layouts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>U.S. Multi-Factor Key Credentials</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Standardized Mobile PDF Statements</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Persistent Theme Interface Preferences</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row lg:flex-col space-y-3 sm:space-y-0 lg:space-y-3 sm:space-x-4 lg:space-x-0 w-full sm:w-auto shrink-0">
            <button 
              onClick={onEnterApp}
              className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 border border-transparent dark:border-white/10"
            >
              <span>Launch Account Services</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={onActivateDemo}
              className="h-12 px-8 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs uppercase tracking-wider font-mono font-bold cursor-pointer bg-slate-50/50 dark:bg-white/5"
            >
              Explore Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-black py-16 px-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo className="w-7 h-7" withBackground={true} />
              <span className="font-bold text-md text-slate-900 dark:text-white">Morning Bright</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs font-mono uppercase font-semibold">
              Established digital checking and strategic wealth planning structures, protected by regulatory guidelines and standard FDIC insurances.
            </p>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono leading-relaxed mt-4">
              <span className="block font-bold">EXCELLENCE IN BANKING</span>
              <span>Serving nationwide depositors online.</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-905 dark:text-slate-300 font-bold">Solutions Overview</h4>
            <ul className="space-y-2 text-[11px] text-slate-500">
              <li><a href="#personal" className="hover:text-slate-900 dark:hover:text-white transition-colors">Morning Checking</a></li>
              <li><a href="#business" className="hover:text-slate-900 dark:hover:text-white transition-colors">Commercial Sweeps</a></li>
              <li><a href="#savings" className="hover:text-slate-900 dark:hover:text-white transition-colors">Guaranteed CD Rates</a></li>
              <li><a href="#showcase" className="hover:text-slate-900 dark:hover:text-white transition-colors">Client Layout Tours</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-905 dark:text-slate-300 font-bold">Legals & Disclosures</h4>
            <ul className="space-y-2 text-[11px] text-slate-500">
              <li><button onClick={() => setLegalTab('privacy')} className="hover:text-slate-900 dark:hover:text-white cursor-pointer hover:underline text-left font-mono uppercase text-[10px]">Privacy Policy</button></li>
              <li><button onClick={() => setLegalTab('terms')} className="hover:text-slate-900 dark:hover:text-white cursor-pointer hover:underline text-left font-mono uppercase text-[10px]">Terms of Service</button></li>
              <li><button onClick={() => setLegalTab('cookie')} className="hover:text-slate-900 dark:hover:text-white cursor-pointer hover:underline text-left font-mono uppercase text-[10px]">Cookie Policy</button></li>
              <li><button onClick={() => setLegalTab('security')} className="hover:text-slate-900 dark:hover:text-white cursor-pointer hover:underline text-left font-mono uppercase text-[10px]">FDIC & Security Disclosures</button></li>
              <li><button onClick={() => setLegalTab('acceptable')} className="hover:text-slate-900 dark:hover:text-white cursor-pointer hover:underline text-left font-mono uppercase text-[10px]">Acceptable Use Guidelines</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-905 dark:text-slate-300 font-bold">NYC Operations Office</h4>
            <ul className="space-y-2 text-[11px] text-slate-500 leading-relaxed font-mono">
              <li><span className="text-slate-950 dark:text-slate-300 font-semibold">adereraadenike@gmail.com</span></li>
              <li><span className="block text-slate-400">Wall Street Financial District, NYC</span></li>
              <li><span className="block text-slate-400">Toll-Free Helpline: 1-800-MBF-LIVE</span></li>
              <li><span className="block text-emerald-600 dark:text-emerald-400 font-bold text-[9px] uppercase tracking-wider mt-1 flex items-center">
                <ShieldCheck size={10} className="mr-1" /> STANDARD FDIC MEMBER PARTNER
              </span></li>
            </ul>
          </div>
        </div>

        {/* Regulatory FDIC & Equal Housing Lender Statement */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col space-y-4 text-[10px] text-slate-400 dark:text-slate-500 font-mono text-left leading-normal">
          <p>
            Morning Bright Finance is a digital banking platform, not a standalone treasury chartered bank. Banking deposit accounts are structured via clearing houses with partner banks that are fully recognized members of the Federal Deposit Insurance Corporation (FDIC). Deposit limits are subject to standard $250,000 protection limitations.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-2 border-t border-slate-200/40 dark:border-white/5">
            <span>&copy; {new Date().getFullYear()} Morning Bright Finance Corp. All rights reserved.</span>
            <span className="flex items-center space-x-1 mt-1 font-semibold uppercase text-slate-900 dark:text-slate-400 text-[9px] tracking-wider">
              <span>EQUAL HOUSING LENDER</span>
              <span className="mx-2">&bull;</span>
              <span>STANDARD FDIC INSURED MEMBER PARTNER</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
