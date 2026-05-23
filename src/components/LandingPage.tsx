import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Landmark, Search, Lock, Users, ArrowRight, CheckCircle2, ChevronRight, Menu, X, BookOpen, CreditCard, Home, Briefcase, Heart, PieChart, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

interface LandingProps {
  onEnterApp: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onEnterApp, onSignUp }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* LAYER 1: LEGITIMACY INFRASTRUCTURE (FDIC Badge) */}
      <div className="bg-slate-900 dark:bg-[#03081a] text-slate-300 px-4 py-2 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 font-medium"><ShieldCheck size={14} className="text-emerald-500" /> <span>Member FDIC</span></span>
            <span className="flex items-center space-x-1.5 font-medium"><Home size={14} className="text-emerald-500" /> <span>Equal Housing Lender</span></span>
            <span>Deposits insured up to $250,000</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-white transition-colors">Locations</a>
            <a href="#" className="hover:text-white transition-colors">Help</a>
            <a href="#" className="hover:text-white transition-colors">English (US)</a>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Logo className="w-8 h-8" withBackground={true} />
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Morning Bright</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {['Checking', 'Savings', 'Credit Cards', 'Loans', 'Investing'].map(link => (
              <a key={link} href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {link}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {/* Isolated Sign In top-right creates psychological ownership */}
            <button 
              onClick={onSignUp}
              className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-4 py-2"
            >
              Open Account
            </button>
            <button 
              onClick={onEnterApp}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center space-x-2"
            >
              <Lock size={16} />
              <span>Log In</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <button onClick={onEnterApp} className="text-sm font-bold text-emerald-600">Log In</button>
            <button className="p-2 text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-[64px] z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shadow-lg"
          >
            <div className="p-4 flex flex-col space-y-4">
              {['Checking', 'Savings', 'Credit Cards', 'Loans', 'Investing'].map(link => (
                <a key={link} href="#" className="text-base font-medium text-slate-700 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-white/5">
                  {link}
                </a>
              ))}
              <div className="pt-2 flex flex-col space-y-3">
                <button onClick={() => { setMobileMenuOpen(false); onSignUp(); }} className="w-full py-3 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-center">Open an Account</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 2: THE NUMBER HOOK & LAYER 7: PROMO */}
      <section className="relative pt-10 pb-16 md:pt-20 md:pb-24 px-4 md:px-8 border-b border-slate-200 dark:border-white/5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 space-y-6 md:pr-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Earn <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-200 dark:decoration-emerald-900/50 underline-offset-8">6.00% APY</span> on savings.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-lg mb-8">
              No monthly maintenance fees. Access to <span className="font-bold text-slate-900 dark:text-white">25,000+</span> fee-free ATMs. Open an account with just a <span className="font-bold text-slate-900 dark:text-white">$0 minimum</span>.
            </p>
            
            <div className="p-5 md:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg shadow-emerald-900/5 max-w-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <span className="font-bold text-lg">$</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Get a $500 bonus</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">When you set up qualifying direct deposit.</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">1</div>
                  <span>Open a new checking account</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">2</div>
                  <span>Receive $2,000 in direct deposits in 90 days</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">3</div>
                  <span>Bonus hits your account within 30 days</span>
                </div>
              </div>
              <button onClick={onSignUp} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
                Open Account Now
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 mt-12 md:mt-0 relative hidden md:block">
            {/* Visual representation of a physical card or app to ground the abstract features */}
            <div className="absolute right-0 -top-10 w-96 h-64 bg-gradient-to-br from-slate-900 to-black rounded-2xl shadow-2xl overflow-hidden transform rotate-3 border border-white/20 p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <Logo withBackground={false} className="w-10 h-10 text-white" />
                <span className="text-white/60 font-mono tracking-widest text-sm">DEBIT</span>
              </div>
              <div className="pt-16">
                <div className="w-12 h-8 bg-slate-400/20 rounded-md mb-4 flex items-center px-2">
                  <div className="w-6 h-4 border border-slate-300/50 rounded-sm grid grid-cols-2 gap-1 p-0.5">
                    <div className="bg-slate-300/50 rounded-[1px]"></div>
                    <div className="bg-slate-300/50 rounded-[1px]"></div>
                  </div>
                </div>
                <div className="text-xl tracking-[0.2em] font-mono text-white/90">
                  4000 1234 5678 9010
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LAYER 3: SERVICES CONFIDENCE MAP */}
      <section className="py-20 max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-10 text-center md:text-left">What we offer</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Landmark, title: 'Checking' },
            { icon: PieChart, title: 'Savings' },
            { icon: CreditCard, title: 'Credit Cards' },
            { icon: Home, title: 'Mortgages' },
            { icon: Search, title: 'Auto Loans' },
            { icon: Briefcase, title: 'Investing' },
            { icon: Users, title: 'Small Business' },
            { icon: Heart, title: 'Wealth Management' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group">
              <item.icon size={32} className="text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">{item.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* LAYER 5: SECURITY AS A VISIBLE FEATURE */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
              <Shield size={16} />
              <span>Full Spectrum Protection</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Your security is our primary architecture.</h2>
            <p className="text-slate-400 text-lg mb-8">We don't just protect your money; we protect your identity. Our systems run on the same encryption protocols used by global intelligence agencies.</p>
            
            <ul className="space-y-4">
              {['Biometric hardware authentication', 'Zero-liability fraud guarantee', 'AES-256 military-grade encryption'].map((text, i) => (
                <li key={i} className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <span className="font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl mx-auto md:mr-0 w-full max-w-md">
            <h3 className="font-bold text-xl mb-6">Security Dashboard</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Vulnerability Status</span>
                  <span className="text-emerald-400 font-bold">Excellent</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start space-x-3">
                <ShieldCheck className="text-emerald-400 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-sm text-emerald-400">Account Protected</h4>
                  <p className="text-xs text-slate-400 mt-1">Multi-factor authentication (MFA) is actively guarding your logins.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LAYER 4: BRAND AS EDUCATOR */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Better Money Habits</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Knowledge is your most valuable asset.</p>
            </div>
            <button className="hidden md:flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              <span>Explore learning center</span>
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'The new rules of retirement saving in 2026', img: 'bg-blue-100 dark:bg-blue-900/30' },
              { title: 'How to build your credit score from scratch', img: 'bg-emerald-100 dark:bg-emerald-900/30' },
              { title: 'Is buying a house still a smart investment?', img: 'bg-purple-100 dark:bg-purple-900/30' }
            ].map((article, i) => (
              <div key={i} className="group cursor-pointer">
                <div className={`w-full h-48 ${article.img} rounded-2xl mb-4 flex items-center justify-center`}>
                   <BookOpen size={40} className="text-slate-400 dark:text-slate-500 opacity-50 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{article.title}</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-2">Read article ↗</p>
              </div>
            ))}
          </div>
          <button className="mt-8 md:hidden text-emerald-600 font-bold w-full text-center">Explore learning center →</button>
        </div>
      </section>

      {/* LAYER 6: SERP SITELINKS ARCHITECTURE (In Footer) */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <Logo className="w-6 h-6 text-emerald-600" />
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Morning Bright</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">We are committed to making banking clear, transparent, and fair for everyone.</p>
              <div className="flex space-x-4">
                 {/* Social placeholders */}
                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
              </div>
            </div>
            
            {/* Intent-based Links Structure */}
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-4">Transactional</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><button onClick={onEnterApp} className="hover:text-emerald-600 transition-colors">Log In</button></li>
                <li><button onClick={onSignUp} className="hover:text-emerald-600 transition-colors">Open Account</button></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Activate Card</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Forgot Password</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-4">Products</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Checking Accounts</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Savings Accounts</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Credit Cards</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Mortgages</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Locations & ATMs</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Security Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-4">About</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Company Info</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Investor Relations</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Newsroom</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-white/10 pt-8 mt-12 text-xs text-slate-500 space-y-4">
            <p>Morning Bright Financial Services is not a real bank. This is a demonstration interface built by AI.</p>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <p>© 2026 Morning Bright. All rights reserved.</p>
              <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Cookie Policy</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">AdChoices</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
