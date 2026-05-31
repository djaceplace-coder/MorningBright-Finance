/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  CreditCard, 
  Lock, 
  Unlock, 
  Plus, 
  Check, 
  Sliders, 
  Eye, 
  EyeOff, 
  Sparkles, 
  X,
  PlusCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CardsView() {
  const { user, cards, createCard, toggleCardFrozen, updateCardLimit, transactions } = useStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showCardNumbers, setShowCardNumbers] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardType, setNewCardType] = useState<'ebony' | 'emerald' | 'platinum'>('ebony');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [cardTab, setCardTab] = useState<'virtual' | 'physical'>('virtual');

  // States for limits
  const [tempLimit, setTempLimit] = useState<number>(3000);

  const activeCard = cards.find(c => c.id === selectedCardId) || cards[0];

  React.useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
      setTempLimit(cards[0].spendingLimit);
    }
  }, [cards, selectedCardId]);

  const handleCardClick = (id: string, limit: number) => {
    setSelectedCardId(id);
    setTempLimit(limit);
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    await createCard(newCardName, newCardType);
    setNewCardName('');
    setCreateModalOpen(false);
    
    // Auto select newest card
    const currentCards = useStore.getState().cards;
    if (currentCards.length > 0) {
      const newest = currentCards[currentCards.length - 1];
      setSelectedCardId(newest.id);
      setTempLimit(newest.spendingLimit);
    }
  };

  const handleSaveLimits = async () => {
    if (activeCard) {
      await updateCardLimit(activeCard.id, tempLimit);
    }
  };

  const filteredCardTransactions = transactions.filter(t => t.category === 'cards' || t.merchant.includes('Coffee') || t.merchant.includes('Store'));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-100 p-6 md:p-8 font-sans space-y-8 select-none pb-24 transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-white/5 pb-4 space-y-3 sm:space-y-0">
        <div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-widest uppercase font-bold">CARDS MATRIX</span>
          <h2 className="text-2xl font-sans tracking-tight font-medium text-slate-900 dark:text-white mt-1">
            Hi, {user?.lastName || 'Client'} - Card Operations
          </h2>
        </div>

        <div className="flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1">
          <button 
            onClick={() => setCardTab('virtual')} 
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${cardTab === 'virtual' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Virtual 
          </button>
          <button 
            onClick={() => setCardTab('physical')} 
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${cardTab === 'physical' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Physical
          </button>
        </div>
      </div>

      {/* CARDS VIEW - UNIFIED LAYOUT */}
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        {cards.filter(c => cardTab === 'virtual' ? c.cardType !== 'physical' : c.cardType === 'physical').length === 0 ? (
          <div className="p-8 md:p-12 border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-slate-900/60 shadow-xl overflow-hidden relative flex flex-col md:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="flex-1 space-y-6 z-10">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest rounded-full border border-emerald-500/20">Available Now</span>
              <h3 className="text-3xl font-bold font-sans text-slate-900 dark:text-white leading-tight">The {cardTab === 'virtual' ? 'Secure Virtual' : 'Obsidian Physical'} Card</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                Experience borderless spending with our premium {cardTab === 'virtual' ? 'digital' : 'metal crafted'} card. Provides direct linkage to your checking balances securely.
              </p>
              
              <ul className="space-y-3 mb-6">
                {[
                  'Zero foreign transaction fees', 
                  cardTab === 'virtual' ? 'Instantly provisioned digital secure numbers' : 'Complimentary ATM withdrawals globally', 
                  cardTab === 'virtual' ? 'Auto-cancels after 3 failed charges' : 'Enhanced physical EVM chip security', 
                  'Card linkage for seamless payments'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center space-x-3 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                <div>
                  <span className="block text-slate-900 dark:text-white font-bold mb-1">Provision & Activation</span>
                  <span className="block text-xs text-slate-500">
                    {cardTab === 'virtual' 
                      ? 'A $50.00 initialization fee applies per virtual card.' 
                      : 'The $500.00 payment is for physical card activation and processing and includes free delivery globally.'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-mono text-slate-500 uppercase">Activation Fee</span>
                     <span className="text-lg font-bold text-slate-900 dark:text-white">{cardTab === 'virtual' ? '$50.00' : '$500.00'}</span>
                   </div>
                </div>

                <a 
                  href="#support" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (cardTab === 'virtual') {
                      setCreateModalOpen(true);
                    } else {
                      alert("Please navigate to the Support tab to complete physical activation."); 
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 text-sm cursor-pointer"
                >
                   {cardTab === 'virtual' ? 'Provision Virtual Card' : 'Complete Activation via Support'}
                </a>
              </div>
            </div>

            <div className="w-full max-w-[280px] shrink-0 z-10 relative">
               <div className="aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden transform -rotate-12 transition-transform hover:rotate-[-5deg]">
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                 <div className="flex justify-between items-start">
                   <span className="text-[10px] font-mono tracking-widest text-slate-400 block font-bold">OBSIDIAN {cardTab === 'virtual' ? 'VIRTUAL' : 'METAL'}</span>
                   <div className="w-8 h-6 rounded bg-yellow-600/30 border border-yellow-600/50 flex items-center justify-center overflow-hidden">
                     <div className="w-full h-px bg-yellow-600/40" />
                     <div className="w-px h-full bg-yellow-600/40 absolute" />
                   </div>
                 </div>
                 <div className="text-lg font-mono tracking-widest text-slate-100 my-4">
                   ••••  ••••  ••••  ••••
                 </div>
                 <div className="flex justify-between items-end">
                   <span className="block text-xs font-semibold text-slate-300">{user?.firstName ? `${user.firstName} ${user.lastName}`.toUpperCase() : 'VALUED CLIENT'}</span>
                   <span className="text-[10px] font-bold text-slate-100 font-mono tracking-tight">VISA</span>
                 </div>
               </div>
               <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-500/30 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {activeCard && (
              <div className="p-8 md:p-12 border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-slate-900/60 shadow-xl overflow-hidden relative flex flex-col md:flex-row items-center gap-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                
                {/* Left Column: Management & Stats */}
                <div className="flex-1 space-y-8 z-10 w-full">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest rounded-full border border-emerald-500/20">Active {cardTab === 'virtual' ? 'Virtual' : 'Physical'}</span>
                      {activeCard.isFrozen && <span className="px-3 py-1 bg-red-500/10 text-red-500 font-mono text-[10px] uppercase font-bold tracking-widest rounded-full border border-red-500/20">Frozen</span>}
                    </div>
                    <h3 className="text-3xl font-bold font-sans text-slate-900 dark:text-white leading-tight">{activeCard.cardholderName || 'Card Account'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mt-2">
                      Your secure endpoint. Adjust limits instantly or freeze to prevent unauthorized transactions.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Limit Control */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-500 font-bold uppercase tracking-widest">Monthly Limit</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">${tempLimit.toLocaleString()}</span>
                      </div>
                      <input type="range" min="500" max="10000" step="500" value={tempLimit} onChange={(e) => setTempLimit(parseInt(e.target.value))} onMouseUp={handleSaveLimits} onTouchEnd={handleSaveLimits} className="w-full accent-emerald-500" />
                    </div>

                    {/* Quick Actions */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 flex flex-col justify-center space-y-2">
                      <button onClick={() => toggleCardFrozen(activeCard.id)} className={`w-full h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${activeCard.isFrozen ? 'bg-emerald-500 text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                        {activeCard.isFrozen ? <><Unlock size={12}/>Unfreeze</> : <><Lock size={12}/>Freeze</>}
                      </button>
                      <button onClick={async () => { if(window.confirm("Delete card permanently?")) { await useStore.getState().deleteCard(activeCard.id); setSelectedCardId(null); } }} className="w-full h-8 rounded-lg bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                        Destroy Card
                      </button>
                    </div>
                  </div>

                  <button onClick={() => { if(cardTab==='virtual') { setCreateModalOpen(true); } else { alert('Contact support for another physical card.'); } }} className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 capitalize">
                    <PlusCircle size={14} /> Provision another {cardTab} card
                  </button>
                </div>

                {/* Right Column: The Grand Card & Selector */}
                <div className="w-full max-w-[280px] md:max-w-[340px] shrink-0 z-10 relative flex flex-col items-center">
                  
                  {/* The Rendered Grand Card using Physical Obsidian styling but mapped coloring */}
                  <div className={`aspect-[1.586/1] w-full rounded-2xl border p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all select-none
                    ${activeCard.cardType === 'emerald' ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 border-emerald-500/30' : 
                      activeCard.cardType === 'platinum' ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-white/20' : 
                      'bg-gradient-to-br from-slate-900 via-zinc-900 to-black border-white/10'}
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                    <div className="flex justify-between items-start z-10">
                       <span className={`text-[10px] font-mono tracking-widest block font-bold ${activeCard.cardType === 'emerald' ? 'text-emerald-400' : 'text-slate-300'}`}>
                         {activeCard.cardType === 'emerald' ? 'EMERALD METAL' : activeCard.cardType === 'platinum' ? 'PLATINUM METAL' : 'OBSIDIAN METAL'}
                       </span>
                       <button onClick={() => setShowCardNumbers(!showCardNumbers)} className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer">
                         {showCardNumbers ? <EyeOff size={10} /> : <Eye size={10} />}
                       </button>
                    </div>
                    <div className="text-xl font-mono tracking-widest text-white my-4 text-center z-10 drop-shadow-md">
                      {showCardNumbers ? activeCard.cardNumber : `••••  ••••  ••••  ${activeCard.cardNumber.slice(-4)}`}
                    </div>
                    <div className="flex justify-between items-end z-10">
                      <div className="flex space-x-6 text-[9px] font-mono p-2 rounded-lg bg-black/20 backdrop-blur-md border border-white/5">
                        <div>
                          <span className="block uppercase text-[7px] text-slate-400">EXPIRY</span>
                          <span className="text-white font-semibold">{activeCard.expiryDate}</span>
                        </div>
                        <div>
                          <span className="block uppercase text-[7px] text-slate-400">CVV</span>
                          <span className="text-white font-semibold">{showCardNumbers ? activeCard.cvv : '•••'}</span>
                        </div>
                      </div>
                      <span className="text-[12px] font-bold text-slate-100 font-mono tracking-tight">VISA</span>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
                  </div>

                  {/* Card Selector Horizontal List */}
                  {cards.filter(c => cardTab === 'virtual' ? c.cardType !== 'physical' : c.cardType === 'physical').length > 1 && (
                    <div className="w-full flex overflow-x-auto gap-2 p-2 mt-6 pb-2 scrollbar-hide">
                       {cards.filter(c => cardTab === 'virtual' ? c.cardType !== 'physical' : c.cardType === 'physical').map(card => (
                         <button 
                           key={card.id}
                           onClick={() => handleCardClick(card.id, card.spendingLimit)}
                           className={`shrink-0 w-16 h-10 rounded-lg border flex flex-col justify-center items-center overflow-hidden relative cursor-pointer
                             ${card.id === selectedCardId ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-white/10 opacity-60 hover:opacity-100'}
                             ${card.cardType === 'emerald' ? 'bg-emerald-950/50' : card.cardType === 'platinum' ? 'bg-slate-800' : 'bg-slate-900'}`}
                         >
                           <span className="text-[7px] font-mono text-white tracking-widest">{card.cardNumber.slice(-4)}</span>
                         </button>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW CARD SPAWNING MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-sans font-medium text-slate-900 dark:text-white">Spawn Card Device</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Provision isolated virtual visa endpoint</p>
                </div>
                <button 
                  onClick={() => setCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleCreateCard} className="space-y-4 text-slate-950">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-slate-500">Label Cardholder Nickname</label>
                  <input 
                    type="text" 
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    placeholder="e.g. Daily Operations"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-emerald-500 font-sans"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-slate-500 font-bold">Aesthetic Metal Class</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ebony', label: 'Ebony' },
                      { id: 'emerald', label: 'Emerald' },
                      { id: 'platinum', label: 'Platinum' }
                    ].map((t) => (
                      <button 
                        key={t.id}
                        type="button"
                        onClick={() => setNewCardType(t.id as any)}
                        className={`h-10 text-[10px] uppercase font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                          newCardType === t.id 
                            ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold' 
                            : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-11 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest transition-transform hover:scale-[1.01] cursor-pointer mt-4"
                >
                  Clear & Provision Visa
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
