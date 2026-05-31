/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  User, 
  DollarSign, 
  AlertCircle, 
  Check, 
  Sparkles,
  Clock,
  HelpCircle,
  X,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function TransfersView() {
  const { user, balance, transactions, issueTransfer, loading, errorMessage, clearError, beneficiaries } = useStore();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('wire');
  const [bank, setBank] = useState('');
  
  // Search and tabs state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposits' | 'withdrawals'>('all');

  // Success display states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);

  const totalChecking = balance?.checking || 0;

  const handlePayeeClick = (email: string) => {
    setRecipientEmail(email);
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      useStore.setState({ errorMessage: "Please input a valid positive amount." });
      return;
    }

    if (val > totalChecking) {
      useStore.setState({ errorMessage: "Insufficient liquidity available in your checkings account." });
      return;
    }

    // Always block withdrawals and show strict modal per system request
    setShowKycModal(true);
    return;

    // The rest of the withdrawal logic is unreachable natively, but left intact for structural parity.
    if (user?.pinCode) {
      const enteredPin = window.prompt("Enter your 4-digit transfer PIN to authorize this transaction:");
      if (!enteredPin || enteredPin !== user.pinCode) {
        useStore.setState({ errorMessage: "Invalid transfer PIN. Transaction aborted." });
        return;
      }
    }

    await issueTransfer(recipientEmail, val, description);
    const hasError = useStore.getState().errorMessage;
    if (!hasError) {
      setSuccessMessage(`Transferred $${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${recipientEmail} with sub-second firestore clearance.`);
      setRecipientEmail('');
      setAmount('');
      setDescription('');
    }
  };

  // Filter & Search transaction logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());

    const isDepositType = tx.type === 'deposit' || tx.type === 'transfer_received';
    const isWithdrawType = tx.type === 'transfer_sent' || tx.type === 'withdrawal' || tx.type === 'card_spend';

    if (filterType === 'deposits') return matchesSearch && isDepositType;
    if (filterType === 'withdrawals') return matchesSearch && isWithdrawType;
    return matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-100 p-6 md:p-8 font-sans space-y-8 select-none pb-24 transition-colors duration-300">
      
      {/* TITLE HEAD */}
      <div className="border-b border-slate-205 dark:border-white/5 pb-4 text-slate-900 dark:text-white">
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-widest uppercase font-bold">WIRE TRANSFER TERMINAL</span>
        <h2 className="text-2xl font-sans tracking-tight font-medium text-slate-900 dark:text-white mt-1">
          Hi, {user?.lastName || 'Client'} - Transfers & Wire Desk
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-900 dark:text-slate-100">
        
        {/* DISPATCH CONTROL WORKSPACE */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-5 shadow-sm dark:shadow-none">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Instant Money Transfer</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Instant Transfer Clearance</p>
            </div>

            {/* STATUS DIALOGS */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg border border-red-500/15 bg-red-500/5 text-xs text-red-500 flex items-start space-x-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-lg border border-emerald-500/15 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 flex items-start space-x-2">
                <Check size={15} className="shrink-0 mt-0.5 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSendMoney} className="space-y-4 text-slate-950 dark:text-white">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Receiving Institution</label>
                <select 
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="" disabled>Choose receiving bank...</option>
                  <option value="internal">Morning Bright (Internal Transfer)</option>
                  <optgroup label="United States">
                    <option value="chase">JPMorgan Chase</option>
                    <option value="bofa">Bank of America</option>
                    <option value="wells">Wells Fargo</option>
                    <option value="citi">Citibank</option>
                    <option value="usbank">U.S. Bank</option>
                    <option value="capitalone">Capital One</option>
                    <option value="td">TD Bank</option>
                    <option value="pnc">PNC Bank</option>
                    <option value="truist">Truist Financial</option>
                    <option value="goldman">Goldman Sachs</option>
                    <option value="bny">BNY Mellon</option>
                    <option value="statestreet">State Street</option>
                    <option value="discover">Discover Bank</option>
                    <option value="ally">Ally Bank</option>
                    <option value="synchrony">Synchrony Bank</option>
                    <option value="barclays_us">Barclays US</option>
                    <option value="citizens">Citizens Bank</option>
                    <option value="fifth_third">Fifth Third Bank</option>
                    <option value="keybank">KeyBank</option>
                    <option value="huntington">Huntington National Bank</option>
                    <option value="zions">Zions Bank</option>
                  </optgroup>
                  <optgroup label="United Kingdom & Europe">
                    <option value="barclays">Barclays</option>
                    <option value="hsbc">HSBC</option>
                    <option value="natwest">NatWest</option>
                    <option value="lloyds">Lloyds Banking Group</option>
                    <option value="rbs">Royal Bank of Scotland</option>
                    <option value="santander_uk">Santander UK</option>
                    <option value="standard_chartered">Standard Chartered</option>
                    <option value="monzo">Monzo</option>
                    <option value="bnp">BNP Paribas</option>
                    <option value="db">Deutsche Bank</option>
                    <option value="revolut">Revolut</option>
                    <option value="n26">N26</option>
                    <option value="socgen">Société Générale</option>
                    <option value="credit_agricole">Crédit Agricole</option>
                    <option value="commerzbank">Commerzbank</option>
                    <option value="ubs">UBS</option>
                    <option value="ing">ING Group</option>
                    <option value="abn_amro">ABN AMRO</option>
                    <option value="rabobank">Rabobank</option>
                  </optgroup>
                  <optgroup label="Canada">
                    <option value="rbc">Royal Bank of Canada</option>
                    <option value="td_canada">TD Canada Trust</option>
                    <option value="scotiabank">Scotiabank</option>
                    <option value="bmo">Bank of Montreal</option>
                    <option value="cibc">CIBC</option>
                    <option value="national_bank">National Bank of Canada</option>
                  </optgroup>
                  <optgroup label="Asia Pacific & Oceania">
                    <option value="sg">DBS Bank (Singapore)</option>
                    <option value="ocbc">OCBC Bank</option>
                    <option value="uob">UOB</option>
                    <option value="mufg">MUFG Bank (Japan)</option>
                    <option value="smbc">SMBC</option>
                    <option value="mizuho">Mizuho Bank</option>
                    <option value="anz">ANZ (Australia)</option>
                    <option value="cba">Commonwealth Bank (Australia)</option>
                    <option value="westpac">Westpac</option>
                    <option value="nab">National Australia Bank</option>
                    <option value="hkma">Bank of China (Hong Kong)</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                  </optgroup>
                  <optgroup label="Digital / Crypto">
                    <option value="crypto_btc">Bitcoin Network</option>
                    <option value="crypto_eth">Ethereum Network (ERC-20)</option>
                    <option value="crypto_sol">Solana Network</option>
                    <option value="kraken">Kraken Exchange</option>
                    <option value="coinbase">Coinbase</option>
                    <option value="binance">Binance</option>
                    <option value="gemini">Gemini</option>
                    <option value="crypto_com">Crypto.com</option>
                  </optgroup>
                </select>
              </div>

              {bank && (
                <div className="space-y-4 animate-in slide-in-from-top-2 opacity-100 duration-300">
                  {bank !== 'internal' && !bank.startsWith('crypto_') && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">SWIFT / BIC Code</label>
                        <input type="text" placeholder="e.g. BOFAUS3N" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Routing Number</label>
                        <input type="text" placeholder="e.g. 121000358" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500" required />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Recipient Account Name</label>
                        <input type="text" placeholder="Exact name on target account" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500" required />
                      </div>
                    </div>
                  )}
                  
                  {bank.startsWith('crypto_') && (
                    <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 mt-2 space-y-1.5">
                        <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">Destination Wallet Address</label>
                        <input type="text" placeholder="e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono" required />
                    </div>
                  )}

                  <div className="space-y-1.5 mt-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Recipient Account Address</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="e.g. elizabeth@sterling.com"
                        className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Principal Wire Value (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-xs font-mono text-slate-400 font-bold">$</span>
                      <input 
                        type="number" 
                        required
                        step="5"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono">Checkings Liquidity: ${totalChecking.toLocaleString()}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Optional Memo Logs</label>
                    <input 
                      type="text" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Inflow consulting wire"
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-slate-900 text-xs font-bold transition-transform hover:scale-[1.01] flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-widest mt-2"
                  >
                    <Send size={13} />
                    <span>Confirm Wire</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* INSTANT PAYEE SHORTCUT MODULE */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-4 shadow-sm dark:shadow-none">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Authorized Client Directory</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Quick direct transfers</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {beneficiaries.map((payee) => (
                <button
                  key={payee.email}
                  type="button"
                  onClick={() => handlePayeeClick(payee.email)}
                  className="p-3 text-left rounded-xl border border-slate-150 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 hover:border-emerald-500/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs cursor-pointer select-none"
                >
                  <span className="block text-slate-900 dark:text-white font-semibold truncate text-[11px]">{payee.name}</span>
                  <span className="block text-[8px] text-slate-500 truncate mt-0.5 font-mono lowercase">{payee.email}</span>
                </button>
              ))}
              {beneficiaries.length === 0 && (
                <div className="col-span-2 p-4 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-500 italic">
                  No saved beneficiaries yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TRANSACTION ARCHIVE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-5 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Comprehensive Transaction Archive</h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">verified double-entry transaction record</p>
              </div>

              {/* Filtering TABS */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 text-[9px] font-mono uppercase tracking-wider font-bold">
                {[
                  { id: 'all', label: 'All Wires' },
                  { id: 'deposits', label: 'Deposits' },
                  { id: 'withdrawals', label: 'Withdraws' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      filterType === t.id 
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-bold shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH GRID INDICES */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transaction by transaction description, category or voucher ID..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-100/5 text-xs text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* COMPLETED TRANSACTIONS */}
            <div className="space-y-3.5 pt-2">
              {filteredTransactions.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-500 italic flex flex-col items-center justify-center">
                  <Clock className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="font-semibold text-slate-900 dark:text-white">No transactions yet</span>
                  <span className="block text-[10px] font-mono text-slate-450 mt-0.5">Your history updates automatically in real time</span>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isDeposit = tx.type === 'deposit' || tx.type === 'transfer_received';
                  
                  return (
                    <div 
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-150 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20 text-xs transition-all hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                          isDeposit
                            ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-500/5 border-slate-250 dark:border-white/10 text-slate-500'
                        }`}>
                          {isDeposit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                        </div>

                        <div>
                          <span className="block text-slate-900 dark:text-white font-bold text-[13px]">{tx.merchant}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                            Voucher ID: {tx.id.slice(0, 16).toUpperCase()} • {tx.category.toUpperCase()} • {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`block font-mono text-[13px] font-bold ${
                          isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {isDeposit ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-mono uppercase block mt-1 bg-emerald-500/5 px-1 py-0.5 rounded w-fit ml-auto">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {showKycModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowKycModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Action Required</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Your account is currently in provisional mode. To enable external transfers and unlock your personal account and routing numbers, you must complete the Know Your Customer (KYC) identity verification process and make an initial test deposit.
              </p>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-mono mt-0.5 shrink-0 text-[9px] font-bold">1</span>
                  <span>Navigate to Profile Settings and upload KYC documents (if you haven't already).</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-mono mt-0.5 shrink-0 text-[9px] font-bold">2</span>
                  <span>Make a minimum test deposit of $750 (or £650) to confirm account activity.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-mono mt-0.5 shrink-0 text-[9px] font-bold">3</span>
                  <span>Contact Support with your payment receipt to instantly unlock your account features.</span>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button 
                  onClick={() => setShowKycModal(false)}
                  className="w-full h-11 rounded-lg bg-emerald-500 text-white text-xs font-bold transition-transform hover:scale-[1.01]"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
