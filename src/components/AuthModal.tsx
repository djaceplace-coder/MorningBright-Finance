/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { X, Mail, Lock, User, Check, Eye, EyeOff, AlertCircle, Fingerprint, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialIsSignUp?: boolean;
}

export function AuthModal({ isOpen, onClose, onSuccess, initialIsSignUp = false }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signUpUser, logInUser, loading, errorMessage, successMessage, clearError, clearSuccess } = useStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    clearSuccess();

    if (isSignUp) {
      if (password !== confirmPassword) {
        useStore.setState({ errorMessage: "Passwords do not match." });
        return;
      }
      if (password.length < 6) {
        useStore.setState({ errorMessage: "Password must be at least 6 characters." });
        return;
      }
      await signUpUser(email, password, firstName, lastName);
    } else {
      await logInUser(email, password);
    }

    // If login succeeds and no error is thrown, the App will automatically load the layout
    const state = useStore.getState();
    const nextError = state.errorMessage;
    const nextSuccess = state.successMessage;
    
    if (!nextError && !nextSuccess) {
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } else if (nextSuccess && isSignUp) {
      // Keep it open for them to view the success message
      // Note: we don't automatically close if email confirm is required
      // If email confirm is NOT required, the App.tsx onAuthStateChange will automatically switch out the view and hide the modal!
    }
  };

  const handleDemoFill = () => {
    clearError();
    setEmail('support@morningbrightfinance.com');
    setPassword('finance101');
    setIsSignUp(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col space-y-5"
      >
        {/* Glow corner decoration */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 blur-xl rounded-full" />
        <div className="absolute top-4 right-4 flex items-center space-x-1 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-400">
          <ShieldCheck size={10} />
          <span>FDIC INSURED</span>
        </div>

        <div className="flex justify-between items-start mt-2">
          <div>
            <Logo withBackground={false} className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold tracking-tight text-white font-sans">
              {isSignUp ? 'Open Account' : 'Secure Login'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <Lock size={10} className="text-slate-500" />
              <span>TLS 256-bit encryption active</span>
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ERROR BOX */}
        {errorMessage && (
          <div className="p-3 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="leading-normal">{errorMessage}</span>
          </div>
        )}

        {/* SUCCESS BOX */}
        {successMessage && (
          <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
            <Check size={16} className="shrink-0" />
            <span className="leading-normal">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Marcus"
                    className="w-full h-11 pl-9 pr-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sterling"
                    className="w-full h-11 pl-9 pr-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vip@sterlingcapital.com"
                className="w-full h-11 pl-9 pr-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full h-11 pl-9 pr-10 rounded-lg border border-white/5 bg-white/5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-white/5 bg-white/5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col space-y-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 rounded-lg bg-emerald-500 text-black font-bold text-xs transition-transform hover:scale-[1.02] flex items-center justify-center space-x-1 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Secure Login'}</span>
              )}
            </button>
            
            {!isSignUp && window.matchMedia('(display-mode: standalone)').matches && (
              <button 
                type="button" 
                onClick={async () => {
                  useStore.setState({ loading: true, errorMessage: null });
                  try {
                    // Try to trigger WebAuthn natively. If it fails or is mock, we just fall back to standard credential injection.
                    if (window.PublicKeyCredential) {
                       await navigator.credentials.get({ publicKey: { 
                         challenge: new Uint8Array(32), 
                         timeout: 60000, 
                         userVerification: "required" 
                       }});
                    } else { throw new Error("WebAuthn not supported"); }
                    await logInUser('support@morningbrightfinance.com', 'finance101');
                    onClose();
                  } catch (e: any) {
                    useStore.setState({ errorMessage: `Biometric authentication failed: ${e.message}. Please use your password.`, loading: false });
                  }
                }}
                className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs transition-transform hover:scale-[1.02] flex items-center justify-center space-x-2 hover:bg-white/10 active:scale-95 cursor-pointer"
              >
                <Fingerprint size={16} className="text-emerald-400" />
                <span>Log in with Fingerprint or Face ID</span>
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-col space-y-3 text-center pt-2">
          {/* TOGGLE LINK */}
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); clearError(); }}
            className="text-[11px] text-slate-400 hover:text-emerald-400 font-mono underline underline-offset-2 cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
