/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface LegalPageProps {
  initialTab?: 'privacy' | 'terms' | 'cookie' | 'security' | 'acceptable';
  onClose: () => void;
}

export function LegalPage({ initialTab = 'privacy', onClose }: LegalPageProps) {
  const [activeTab, setActiveTab] = React.useState<string>(initialTab);

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: <Lock size={14} /> },
    { id: 'terms', label: 'Terms of Service', icon: <FileText size={14} /> },
    { id: 'cookie', label: 'Cookie Policy', icon: <Info size={14} /> },
    { id: 'security', label: 'Security Policy', icon: <Shield size={14} /> },
    { id: 'acceptable', label: 'Acceptable Use Policy', icon: <CheckCircle size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans z-50 selection:bg-emerald-500 selection:text-black relative">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative">
        {/* Navigation back and header */}
        <header className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-white/5 gap-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onClose}
              className="p-2.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
              aria-label="Back to Homepage"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">REGULATORY & SECRECY MATRIX</span>
              </div>
              <h1 className="text-2xl font-medium tracking-tight mt-1 text-white">Morning Bright Legal Center</h1>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">Last updated: May 2026</span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sider options */}
          <nav className="lg:col-span-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-2 lg:pb-0 border-b lg:border-none border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-left transition-all flex items-center space-x-3 shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-400 font-bold shadow-md'
                    : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Legal document reader container */}
          <main className="lg:col-span-8 p-8 sm:p-10 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md min-h-[500px] text-slate-300">
            {/* PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <article className="space-y-6">
                <h2 className="text-xl font-medium text-white tracking-tight border-b border-white/5 pb-3">Privacy & Secrecy Policy</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Morning Bright Finance Corp is committed to protecting the privacy of high-net-worth sovereign digital bank assets.
                </p>
                
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">1. Scope of Secrecy</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    We strictly implement the Gramm-Leach-Bliley Act (GLBA) and global data isolation standards. Zero logs regarding your biometric enclaves are ever shared, transmitted, or hosted outside of your device's physical secure hardware element. No tracking metrics or account histories are monetized or provided to third-party advertisers.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">2. Data Acquisition Standards</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    We collect only relevant identity details required for U.S. Federal compliance (KYC/AML rules). This includes your legal name, certified email addresses, and secure authentication metadata. Transaction sub-ledgers are cryptographically sealed in Supabase PostgreSQL database tables and isolated per account index.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">3. Third Party Disclosures</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Financial communications and transaction wires are directly routed via certified partner clearings. Morning Bright Finance does not lease, sell, or delegate customer details to proprietary trading desks, credit agencies, or shadow brokers.
                  </p>
                </section>
              </article>
            )}

            {/* TERMS OF SERVICE */}
            {activeTab === 'terms' && (
              <article className="space-y-6">
                <h2 className="text-xl font-medium text-white tracking-tight border-b border-white/5 pb-3">Banking Platform Terms of Service</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Morning Bright Finance is an online financial services platform, not a bank. Banking services are provided by our partner clearing banks.
                </p>
                
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">1. Core Service Mandate</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    By launching this platform, you certify that all assets deposited are of sovereign, verifiable origins. Deposits placed in Checking or Savings reserves are allocated under FDIC pass-through coverage up to USD $250,000 via our designated clearance partners.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">2. Biometric Touch Authorizations</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    You acknowledge that biometric touch gestures, WebAuthn handshakes, and card toggle parameters updated in your mobile interface constitute binding signatures. Morning Bright Finance is not liable for allocations dispatched under authenticated hardware touch-points.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">3. Ledger Finality</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    All outbound transfers, virtual card operations, or subcollection allocations processed through the API are subject to near-instant finality. Disputed card charges can be filed securely through our customer support hubs.
                  </p>
                </section>
              </article>
            )}

            {/* COOKIE POLICY */}
            {activeTab === 'cookie' && (
              <article className="space-y-6">
                <h2 className="text-xl font-medium text-white tracking-tight border-b border-white/5 pb-3">Cookie & Session Policy</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Transparency regarding minimal HTTP storage markers. We use no tracker cookies.
                </p>
                
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">1. Functional Identity Sessions</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    This digital banking platform relies on local state markers to cache your secure authentication state and preserve visual interface configurations such as theme settings (Light/Dark preferences) across page refreshments. No advertising trackers are placed on your terminal.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">2. Essential Tokens Cached</h3>
                  <ul className="list-disc pl-5 text-xs space-y-2 leading-relaxed">
                    <li><strong className="text-white">localStorage (`mb_theme`):</strong> Remembers your dark/light settings.</li>
                    <li><strong className="text-white">localStorage (`mb_simulation`):</strong> Declares terminal execution environments.</li>
                    <li><strong className="text-white">Supabase Auth Sessions:</strong> Safely persists your login token.</li>
                  </ul>
                </section>
              </article>
            )}

            {/* SECURITY POLICY */}
            {activeTab === 'security' && (
              <article className="space-y-6">
                <h2 className="text-xl font-medium text-white tracking-tight border-b border-white/5 pb-3">Product Security Policy</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Hardened architectural isolating protocols.
                </p>
                
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">1. Zero-Trust Access Control</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Every ledger query, wire dispatch, and card toggle is validated server-side. Supabase Row-Level Security (RLS) policies enforce attributes matching `auth.uid() = user_id` instantly, preventing cross-profile security gaps.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">2. SSL & Transit Standards</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Data is cryptographically isolated in transit using TLS 1.3 encryption, and guarded at rest within Cloud Run containment nodes.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">3. Ethical Disclosure Protocol</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Vulnerabilities or operational bugs can be logged immediately to: <span className="font-mono text-emerald-400">adereraadenike@gmail.com</span> for active remediation.
                  </p>
                </section>
              </article>
            )}

            {/* ACCEPTABLE USE */}
            {activeTab === 'acceptable' && (
              <article className="space-y-6">
                <h2 className="text-xl font-medium text-white tracking-tight border-b border-white/5 pb-3">Acceptable Use Policy</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Enforces fair-use standards to maintain platform integrity.
                </p>
                
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">1. Commercial & Institutional Compliance</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Outbound check wire dispatches must not associate with unlawful offshore operations, structural round-trips, credit card routing loops, or shadow treasury markets.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">2. Programmatic Automation</h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Clients are strictly forbidden from placing automated scrapers, crawlers, or loop scripts inside our virtual card endpoints. Account profiles generating artificial ledger velocities will be instantly isolated by our security panels.
                  </p>
                </section>
              </article>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
