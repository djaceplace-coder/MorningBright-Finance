/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Fingerprint, 
  Bell, 
  ShieldCheck, 
  CheckCircle, 
  Mail, 
  Lock, 
  Key,
  Smartphone,
  Check,
  SmartphoneNfc,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabase';

export function SettingsView() {
  const { user, settings, updateProfile, updateSettingsToggle, loading, errorMessage, clearError } = useStore();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentTheme = settings?.theme || (localStorage.getItem('mb_theme') as any) || 'system';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    clearError();

    try {
      await updateProfile(firstName, lastName);
      setSuccessMsg("Master profile metadata updated successfully.");
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateTheme = async (nextTheme: 'light' | 'dark' | 'system') => {
    setSuccessMsg(null);
    if (settings) {
      await updateSettingsToggle('theme', nextTheme);
      setSuccessMsg(`System color theme configuration updated to: ${nextTheme.toUpperCase()}`);
    } else {
      localStorage.setItem('mb_theme', nextTheme);
      // Fallback DOM update
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (nextTheme === 'system') {
        const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(pref);
      } else {
        root.classList.add(nextTheme);
      }
      setSuccessMsg(`Local color theme updated to: ${nextTheme.toUpperCase()}`);
    }
  };

  const handleToggleFaceId = async () => {
    if (settings) {
      await updateSettingsToggle('faceIdEnabled', !settings.faceIdEnabled);
      setSuccessMsg("Security biometrics configurations adjusted successfully.");
    }
  };

  const handleToggleTwoFactor = async () => {
    if (settings) {
      await updateSettingsToggle('twoFactorEnabled', !settings.twoFactorEnabled);
      setSuccessMsg("Transaction passcode gates adjusted successfully.");
    }
  };

  const handleTogglePushNotifications = async () => {
    if (settings) {
      await updateSettingsToggle('pushNotifications', !settings.pushNotifications);
    }
  };

  const handleToggleEmailStatements = async () => {
    if (settings) {
      await updateSettingsToggle('emailStatements', !settings.emailStatements);
    }
  };

  const handleVerificationRequest = async () => {
    setSuccessMsg(null);
    if (!user?.email) return;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) {
      setSuccessMsg(`Failed to send: ${error.message}`);
    } else {
      setSuccessMsg("A secure verification credential dispatch link has been pushed to your email.");
    }
  };

  const isVerified = user?.isVerified || false;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-8 font-sans space-y-8 select-none pb-24 transition-colors duration-300">
      
      {/* TITLE HEAD */}
      <div className="border-b border-slate-200 dark:border-white/5 pb-4">
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-widest uppercase font-bold">ACCOUNT CONFIGURATIONS</span>
        <h2 className="text-2xl font-sans tracking-tight font-medium text-slate-900 dark:text-white mt-1">
          Settings & Security Matrix
        </h2>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-3 transition-all">
          <CheckCircle size={16} className="shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/15 bg-red-500/5 text-xs text-red-500 flex items-center space-x-3">
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PROFILE METADATA SETTINGS */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* INTERFACE COLOR CUSTOMIZER */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-5 transition-all">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Interface Customization</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Toggle light, dark, and system themes</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light', icon: <Sun size={14} /> },
                { id: 'dark', label: 'Dark', icon: <Moon size={14} /> },
                { id: 'system', label: 'System', icon: <Laptop size={14} /> }
              ].map((themeOpt) => (
                <button
                  key={themeOpt.id}
                  onClick={() => handleUpdateTheme(themeOpt.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    currentTheme === themeOpt.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-450 font-bold shadow-md scale-[1.02]'
                      : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="mb-1.5">{themeOpt.icon}</span>
                  <span className="text-[10px]">{themeOpt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-5 transition-all">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Account Details</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Identity profile logs</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">First Name</label>
                  <input 
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Last Name</label>
                  <input 
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Email Address</label>
                <input 
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full h-11 px-3 rounded-lg border border-slate-250 dark:border-white/5 bg-slate-100 dark:bg-white/5 text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-11 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-black text-xs font-bold transition-transform hover:scale-[1.01] cursor-pointer"
              >
                Update Profile
              </button>
            </form>
          </div>

          {/* EMAIL VERIFICATION BOX */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-4 transition-all">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Credential Verification</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Identity verification settings</p>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 block leading-relaxed">
              Ensure your secure mail account is certified in order to execute large-value external wires.
            </span>

            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5">
              <div className="space-y-1">
                <span className="text-xs text-slate-950 dark:text-white font-medium block">Verification Criteria</span>
                <span className={`text-xs font-semibold font-mono ${isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {isVerified ? 'Certified Valid' : 'Pending Verification'}
                </span>
              </div>
              {!isVerified && (
                <button 
                  onClick={handleVerificationRequest}
                  disabled={loading}
                  className="h-9 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-slate-300 hover:dark:border-white/20 text-xs text-slate-900 dark:text-slate-200 font-mono uppercase tracking-wider cursor-pointer font-bold"
                >
                  Send Verification Email
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECURITY SETTINGS & ACCESS CODES */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-5 transition-all">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Biometric & Access Controls</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Device biometrics and login security</p>
            </div>

            <div className="space-y-4">
              
              {/* BIOMETRIC SWITCH */}
              <div className="flex justify-between items-center p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-900 dark:text-white font-semibold">
                    <Fingerprint className="w-4 h-4 text-emerald-500" />
                    <span>Biometric Face/Touch Log-In</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-normal">
                    Authorize biometric authentication. Fast secure access without password entry.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFaceId}
                  className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none cursor-pointer ${
                    settings?.faceIdEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'
                  }`}
                >
                  <span 
                    className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white dark:bg-black rounded-full transition-transform ${
                      settings?.faceIdEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* TWOFOUNDATION PASSPROCESSOR */}
              <div className="flex justify-between items-center p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-900 dark:text-white font-semibold">
                    <Key className="w-4 h-4 text-emerald-500" />
                    <span>Transaction PIN Gates</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-normal">
                    Queries credential code whenever transfer sum exceeds $1,000.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleTwoFactor}
                  className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none cursor-pointer ${
                    settings?.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'
                  }`}
                >
                  <span 
                    className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white dark:bg-black rounded-full transition-transform ${
                      settings?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* DYNAMIC NOTIFICATIONS FILTERS */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-4 transition-all">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">System Signal Alerts</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Realtime push parameters</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings?.pushNotifications || false}
                  onChange={handleTogglePushNotifications}
                  className="rounded bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-emerald-500 focus:ring-opacity-0 h-4 w-4"
                />
                <span>Alert checkings balance changes immediately</span>
              </label>

              <label className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings?.emailStatements || false}
                  onChange={handleToggleEmailStatements}
                  className="rounded bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-emerald-500 focus:ring-opacity-0 h-4 w-4"
                />
                <span>Synthesize goal achievements in bottom-bars</span>
              </label>
            </div>
          </div>

          {/* ENCRYPTION DEVICE ENDPOINTS */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-4 transition-all">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Trusted Devices & Access points</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Devices authorized to access your accounts</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white transition-all">
                <div className="flex items-center space-x-2.5">
                  <SmartphoneNfc className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="block text-slate-900 dark:text-white font-semibold">Apple iPhone 16 Pro Max</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block">Signature Token: ab41-9c02-e8ba-5bb2</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 rounded text-emerald-600 dark:text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-bold">Primary</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
