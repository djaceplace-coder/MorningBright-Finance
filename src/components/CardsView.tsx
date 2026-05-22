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
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CardsView() {
  const { cards, createCard, toggleCardFrozen, updateCardLimit, transactions } = useStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showCardNumbers, setShowCardNumbers] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardType, setNewCardType] = useState<'ebony' | 'emerald' | 'platinum'>('ebony');
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
            Virtual Touch Cards
          </h2>
        </div>

        <button 
          onClick={() => setCreateModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center space-x-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus size={14} />
          <span>Spawn Virtual Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CARDS CAROUSEL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-slate-505 dark:text-slate-500 font-mono uppercase tracking-widest block font-bold">Your Active Plastic Collection</span>
            <button 
              onClick={() => setShowCardNumbers(!showCardNumbers)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white flex items-center space-x-1 font-mono cursor-pointer"
            >
              {showCardNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="text-[10px]">{showCardNumbers ? 'Mask Card' : 'Unmask Card'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {cards.length === 0 ? (
              <div className="p-12 border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 text-center text-xs text-slate-500 italic rounded-2xl py-14">
                <CreditCard className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <span className="block text-slate-900 dark:text-white font-medium">No virtual cards created yet</span>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Initialize a customizable Visa below</span>
              </div>
            ) : (
              cards.map((card) => {
                const isSelected = activeCard && activeCard.id === card.id;
                
                // Set skin colors
                let cardGradient = "from-slate-900 via-slate-950 to-slate-900 border-white/10";
                let textSkin = "text-white";
                let labelSkin = "EBONY METALLIC";
                let accentCircle = "bg-emerald-400/10";

                if (card.cardType === 'emerald') {
                  cardGradient = "from-emerald-950 via-slate-950 to-emerald-950 border-emerald-500/20";
                  textSkin = "text-emerald-400";
                  labelSkin = "EMERALD GOLD";
                  accentCircle = "bg-emerald-500/20";
                } else if (card.cardType === 'platinum') {
                  cardGradient = "from-slate-900 via-zinc-950 to-slate-900 border-white/5 opacity-80 border-dashed";
                  textSkin = "text-slate-200";
                  labelSkin = "PLATINUM PREMIUM";
                  accentCircle = "bg-white/5";
                }

                return (
                  <motion.div
                    key={card.id}
                    onClick={() => handleCardClick(card.id, card.spendingLimit)}
                    className={`relative aspect-[1.586/1] w-full rounded-2xl border p-6 flex flex-col justify-between shadow-xl cursor-pointer transition-all overflow-hidden select-none ${cardGradient} ${
                      isSelected ? 'ring-2 ring-emerald-500/50 scale-[1.01]' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 blur-2xl pointer-events-none" />

                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-mono tracking-widest ${textSkin} block font-bold`}>{labelSkin}</span>
                        <span className="block text-xs font-semibold text-slate-200 mt-1">{card.cardholderName}</span>
                      </div>
                      
                      {card.isFrozen ? (
                        <div className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-mono uppercase tracking-widest flex items-center space-x-1">
                          <Lock size={10} />
                          <span>Frozen</span>
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono uppercase tracking-widest flex items-center space-x-1">
                          <Unlock size={10} />
                          <span>Active</span>
                        </div>
                      )}
                    </div>

                    <div className="text-lg font-mono tracking-widest text-slate-100 my-4">
                      {showCardNumbers ? card.cardNumber : `••••  ••••  ••••  ${card.cardNumber.slice(-4)}`}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex space-x-6 text-[9px] font-mono text-slate-500">
                        <div>
                          <span className="block uppercase text-[7px] text-slate-600">EXPIRY</span>
                          <span className="text-slate-300 font-semibold">{card.expiryDate}</span>
                        </div>
                        <div>
                          <span className="block uppercase text-[7px] text-slate-600">CVV PROTECT</span>
                          <span className="text-slate-300 font-semibold">{showCardNumbers ? card.cvv : '•••'}</span>
                        </div>
                      </div>

                      <div className="w-9 h-6 rounded bg-white/10 flex items-center justify-center">
                        <span className="text-[7px] font-bold text-slate-400 font-mono tracking-tight">VISA</span>
                      </div>
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED SETTINGS AND HISTORIES FOR THE SELECTED CARD */}
        <div className="lg:col-span-1" />

        <div className="lg:col-span-6 space-y-6">
          {activeCard ? (
            <div className="space-y-6">
              
              {/* INTERACTIVE ACTIONS BOX */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-5 transition-all text-slate-800 dark:text-slate-200">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Card Security Lock</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Instant suspension triggers</p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-905 dark:text-white block font-medium">Temporarily Freeze Card</span>
                    <span className="text-[10px] text-slate-500 block leading-normal">
                      Blocks all cash withdrawals and terminal authorizations immediately.
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCardFrozen(activeCard.id)}
                    className={`h-9 px-4 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer ${
                      activeCard.isFrozen 
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' 
                        : 'border border-red-500/20 text-red-500 hover:bg-red-500/5'
                    }`}
                  >
                    {activeCard.isFrozen ? (
                      <>
                        <Unlock size={12} />
                        <span>Unfreeze Vault</span>
                      </>
                    ) : (
                      <>
                        <Lock size={12} />
                        <span>Freeze Card</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CARD LIMITS SLIDERS */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-5 transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Digital Spending Limits</h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Cumulative monthly allocation</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded">
                    ${tempLimit.toLocaleString()} Daily Limit
                  </span>
                </div>

                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="500" 
                    max="10000" 
                    step="500"
                    value={tempLimit}
                    onChange={(e) => setTempLimit(parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>$500 Min</span>
                    <span>$10,000 Max Cap</span>
                  </div>

                  <button 
                    onClick={handleSaveLimits}
                    className="w-full h-11 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-slate-900 text-xs font-bold transition-all flex items-center justify-center space-x-1 uppercase tracking-wider cursor-pointer"
                  >
                    <Sliders size={13} />
                    <span>Apply Limit Bounds</span>
                  </button>
                </div>
              </div>

              {/* CARD TRANSACTIONS TRACKING */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 space-y-4 transition-all text-slate-900 dark:text-white">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Filtered Card Wires</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Ledger events for selected card</p>
                </div>

                <div className="space-y-3 pt-2">
                  {filteredCardTransactions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 italic border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                      No card activities logged. Initiate checking wires to populate indices.
                    </div>
                  ) : (
                    filteredCardTransactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center text-xs pb-3 border-b border-slate-100 dark:border-white/5 last:border-none last:pb-0">
                        <div>
                          <span className="block text-slate-955 dark:text-slate-100 font-bold">{tx.merchant}</span>
                          <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">-${tx.amount.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-xs text-slate-550 italic p-12 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              Select or generate a virtual touch card terminal to reveal diagnostic configuration parameters.
            </div>
          )}
        </div>

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
