/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { 
  supabase, 
  handleSupabaseError, 
  OperationType,
  mapUserToDb,
  mapUserFromDb,
  mapBalanceToDb,
  mapBalanceFromDb,
  mapCardToDb,
  mapCardFromDb,
  mapSavingsToDb,
  mapSavingsFromDb,
  mapNotificationToDb,
  mapNotificationFromDb,
  mapSettingsToDb,
  mapSettingsFromDb,
  mapLogToDb,
  mapLogFromDb,
  mapTransactionToDb,
  mapTransactionFromDb
} from './supabase';

import { 
  UserProfile, 
  UserBalance, 
  BankTransaction, 
  VirtualCard, 
  SavingsGoal, 
  BankNotification, 
  UserSecuritySettings, 
  AdminLog,
  TransactionType,
  TransactionStatus
} from './types';

// Initial interactive assets for mock session or fallback sandbox environment
const INITIAL_TRANSACTIONS = (userId: string): BankTransaction[] => [];
const INITIAL_CARDS = (userId: string): VirtualCard[] => [];
const INITIAL_SAVINGS = (userId: string): SavingsGoal[] => [];
const INITIAL_NOTIFICATIONS = (userId: string): BankNotification[] => [];

interface BankState {
  // Current user state
  user: UserProfile | null;
  balance: UserBalance | null;
  transactions: BankTransaction[];
  cards: VirtualCard[];
  savings: SavingsGoal[];
  notifications: BankNotification[];
  settings: UserSecuritySettings | null;
  adminLogs: AdminLog[];
  usersList: UserProfile[]; // Cache for Admin console views
  
  // App context flags
  loading: boolean;
  authChecked: boolean;
  simulationActive: boolean;
  biometricAuthenticated: boolean;
  pwaInstalled: boolean;

  // Error notifications
  errorMessage: string | null;

  // Listeners unsubs
  listeners: (() => void)[];

  // Actions
  initAuthListener: () => () => void;
  signUpUser: (email: string, pass: string, first: string, last: string) => Promise<void>;
  logInUser: (email: string, pass: string) => Promise<void>;
  logOutUser: () => Promise<void>;
  checkBiometrics: () => Promise<boolean>;
  toggleBiometrics: (enabled: boolean) => void;
  setSimulationMode: (active: boolean) => void;
  clearError: () => void;
  
  // Realtime loaders
  initRealtimeSubscriptions: (uid: string) => void;
  clearSubscriptions: () => void;

  // Core Financial Methods
  issueTransfer: (recipientEmail: string, amount: number, memo: string) => Promise<void>;
  addFunds: (amount: number, target: 'checking' | 'savings') => Promise<void>;
  createCard: (holder: string, cardType: 'platinum' | 'ebony' | 'emerald') => Promise<void>;
  toggleCardFrozen: (cardId: string) => Promise<void>;
  updateCardLimit: (cardId: string, limit: number) => Promise<void>;
  createSavingsGoal: (title: string, target: number, color: string) => Promise<void>;
  contributeToSavings: (goalId: string, amount: number) => Promise<void>;
  toggleGoalAutoSave: (goalId: string, percentage: number) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  updateProfile: (first: string, last: string) => Promise<void>;
  updatePasswordSecure: (pass: string) => Promise<void>;
  updateSettingsToggle: (key: keyof UserSecuritySettings, val: boolean | 'light' | 'dark' | 'system') => Promise<void>;

  // Admin Controls
  adminLoadUsers: () => Promise<void>;
  adminEditBalance: (userId: string, checking: number, savings: number) => Promise<void>;
  adminAddSystemTransaction: (userId: string, amount: number, type: TransactionType, merchant: string, category: string) => Promise<void>;
  adminFreezeUser: (userId: string, frozen: boolean) => Promise<void>;
  adminSuspendUser: (userId: string, suspended: boolean) => Promise<void>;
  adminPushSystemNotification: (userId: string, title: string, message: string, type: 'info' | 'alert' | 'success' | 'system') => Promise<void>;
  adminLoadLogs: () => Promise<void>;
}

export const useStore = create<BankState>((set, get) => {
  // Load initial simulation settings from local storage
  const isSimulation = localStorage.getItem('mb_simulation') !== 'false';

  return {
    user: null,
    balance: null,
    transactions: [],
    cards: [],
    savings: [],
    notifications: [],
    settings: null,
    adminLogs: [],
    usersList: [],
    
    loading: false,
    authChecked: false,
    simulationActive: isSimulation,
    biometricAuthenticated: false,
    pwaInstalled: false,
    errorMessage: null,
    listeners: [],

    clearError: () => set({ errorMessage: null }),

    setSimulationMode: (active: boolean) => {
      localStorage.setItem('mb_simulation', String(active));
      set({ simulationActive: active });
      // Reload profile triggers
      const currentUi = get().user?.uid;
      if (currentUi) {
        get().initRealtimeSubscriptions(currentUi);
      }
    },

    initAuthListener: () => {
      // Restore cached session immediately
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          if (!get().simulationActive) {
            get().initRealtimeSubscriptions(session.user.id);
          }
        } else {
          set({ authChecked: true });
        }
      });

      // Stream auth events
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (get().simulationActive) return;

        if (session?.user) {
          get().initRealtimeSubscriptions(session.user.id);
        } else {
          get().clearSubscriptions();
          set({
            user: null,
            balance: null,
            transactions: [],
            cards: [],
            savings: [],
            notifications: [],
            settings: null,
            biometricAuthenticated: false,
            authChecked: true
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    },

    signUpUser: async (email, pass, first, last) => {
      set({ loading: true, errorMessage: null });
      
      if (get().simulationActive) {
        // Simulation path
        setTimeout(() => {
          const fakeUid = 'sim_' + Math.random().toString(36).substring(2, 10);
          const fakeProfile: UserProfile = {
            uid: fakeUid,
            firstName: first,
            lastName: last,
            email,
            isVerified: true,
            isAdmin: email === 'adereraadenike@gmail.com',
            isFrozen: false,
            isSuspended: false,
            biometricsEnabled: false,
            createdAt: new Date().toISOString()
          };

          const fakeBalance: UserBalance = {
            uid: fakeUid,
            checking: 5000.00,
            savings: 25000.00,
            updatedAt: new Date().toISOString()
          };

          const fakeSettings: UserSecuritySettings = {
            uid: fakeUid,
            faceIdEnabled: false,
            webAuthnConfigured: false,
            pushNotifications: true,
            emailStatements: true,
            twoFactorEnabled: false,
            theme: 'system'
          };

          localStorage.setItem(`sim_user_${fakeUid}`, JSON.stringify(fakeProfile));
          localStorage.setItem(`sim_balance_${fakeUid}`, JSON.stringify(fakeBalance));
          localStorage.setItem(`sim_settings_${fakeUid}`, JSON.stringify(fakeSettings));
          localStorage.setItem(`sim_txs_${fakeUid}`, JSON.stringify(INITIAL_TRANSACTIONS(fakeUid)));
          localStorage.setItem(`sim_cards_${fakeUid}`, JSON.stringify(INITIAL_CARDS(fakeUid)));
          localStorage.setItem(`sim_savings_${fakeUid}`, JSON.stringify(INITIAL_SAVINGS(fakeUid)));
          localStorage.setItem(`sim_notifications_${fakeUid}`, JSON.stringify(INITIAL_NOTIFICATIONS(fakeUid)));

          set({
            user: fakeProfile,
            balance: fakeBalance,
            transactions: INITIAL_TRANSACTIONS(fakeUid),
            cards: INITIAL_CARDS(fakeUid),
            savings: INITIAL_SAVINGS(fakeUid),
            notifications: INITIAL_NOTIFICATIONS(fakeUid),
            settings: fakeSettings,
            loading: false
          });
        }, 1500);
        return;
      }

      // Real auth register via Supabase
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              firstName: first,
              lastName: last
            }
          }
        });

        if (error) throw error;
        if (!data.user) throw new Error("Credentials processing conflict.");

        // Provision initial relational records
        const profile: UserProfile = {
          uid: data.user.id,
          firstName: first,
          lastName: last,
          email,
          isVerified: false, 
          isAdmin: email === 'adereraadenike@gmail.com',
          isFrozen: false,
          isSuspended: false,
          biometricsEnabled: false,
          createdAt: new Date().toISOString()
        };

        const balance: UserBalance = {
          uid: data.user.id,
          checking: 0.00,
          savings: 0.00,
          updatedAt: new Date().toISOString()
        };

        const settingsDoc: UserSecuritySettings = {
          uid: data.user.id,
          faceIdEnabled: false,
          webAuthnConfigured: false,
          pushNotifications: true,
          emailStatements: true,
          twoFactorEnabled: false,
          theme: 'system'
        };

        // Insert primary relational credentials
        const { error: pErr } = await supabase.from('users').insert(mapUserToDb(profile));
        if (pErr) throw pErr;

        const { error: bErr } = await supabase.from('balances').insert(mapBalanceToDb(balance));
        if (bErr) throw bErr;

        const { error: sErr } = await supabase.from('settings').insert(mapSettingsToDb(settingsDoc));
        if (sErr) throw sErr;

        // Seed sub-records if any
        for (const tx of INITIAL_TRANSACTIONS(data.user.id)) {
          await supabase.from('transactions').insert(mapTransactionToDb(tx));
        }
        for (const card of INITIAL_CARDS(data.user.id)) {
          await supabase.from('cards').insert(mapCardToDb(card));
        }
        for (const goal of INITIAL_SAVINGS(data.user.id)) {
          await supabase.from('savings_goals').insert(mapSavingsToDb(goal));
        }
        for (const notif of INITIAL_NOTIFICATIONS(data.user.id)) {
          await supabase.from('notifications').insert(mapNotificationToDb(notif));
        }

        set({ loading: false });
        // The subscription hook handles remaining layout changes
        get().initRealtimeSubscriptions(data.user.id);
      } catch (e: any) {
        set({ loading: false, errorMessage: e.message || "Error during secure registration" });
      }
    },

    logInUser: async (email, pass) => {
      set({ loading: true, errorMessage: null });

      if (get().simulationActive) {
        // Find existing sim user or bootstrap simulation
        setTimeout(() => {
          const simUid = 'sim_demo';
          const stored = localStorage.getItem(`sim_user_${simUid}`);
          if (stored) {
            set({
              user: JSON.parse(stored),
              balance: JSON.parse(localStorage.getItem(`sim_balance_${simUid}`) || '{}'),
              transactions: JSON.parse(localStorage.getItem(`sim_txs_${simUid}`) || '[]'),
              cards: JSON.parse(localStorage.getItem(`sim_cards_${simUid}`) || '[]'),
              savings: JSON.parse(localStorage.getItem(`sim_savings_${simUid}`) || '[]'),
              notifications: JSON.parse(localStorage.getItem(`sim_notifications_${simUid}`) || '[]'),
              settings: JSON.parse(localStorage.getItem(`sim_settings_${simUid}`) || '{}'),
              loading: false
            });
          } else {
            // Bootstrap a fully responsive sim workspace
            const profile: UserProfile = {
              uid: simUid,
              firstName: 'Alex',
              lastName: 'Morningstar',
              email,
              isVerified: true,
              isAdmin: email === 'adereraadenike@gmail.com',
              isFrozen: false,
              isSuspended: false,
              biometricsEnabled: false,
              createdAt: new Date().toISOString()
            };
            const balance: UserBalance = {
              uid: simUid,
              checking: 5000.00,
              savings: 25000.00,
              updatedAt: new Date().toISOString()
            };
            const settingsObj: UserSecuritySettings = {
              uid: simUid,
              faceIdEnabled: true,
              webAuthnConfigured: true,
              pushNotifications: true,
              emailStatements: false,
              twoFactorEnabled: true,
              theme: 'system'
            };

            localStorage.setItem(`sim_user_${simUid}`, JSON.stringify(profile));
            localStorage.setItem(`sim_balance_${simUid}`, JSON.stringify(balance));
            localStorage.setItem(`sim_settings_${simUid}`, JSON.stringify(settingsObj));
            localStorage.setItem(`sim_txs_${simUid}`, JSON.stringify(INITIAL_TRANSACTIONS(simUid)));
            localStorage.setItem(`sim_cards_${simUid}`, JSON.stringify(INITIAL_CARDS(simUid)));
            localStorage.setItem(`sim_savings_${simUid}`, JSON.stringify(INITIAL_SAVINGS(simUid)));
            localStorage.setItem(`sim_notifications_${simUid}`, JSON.stringify(INITIAL_NOTIFICATIONS(simUid)));

            set({
              user: profile,
              balance,
              transactions: INITIAL_TRANSACTIONS(simUid),
              cards: INITIAL_CARDS(simUid),
              savings: INITIAL_SAVINGS(simUid),
              notifications: INITIAL_NOTIFICATIONS(simUid),
              settings: settingsObj,
              loading: false
            });
          }
        }, 1200);
        return;
      }

      // Real auth user
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        set({ loading: false });
      } catch (e: any) {
        set({ loading: false, errorMessage: e.message || "Invalid credentials" });
      }
    },

    logOutUser: async () => {
      get().clearSubscriptions();
      if (!get().simulationActive) {
        await supabase.auth.signOut();
      }
      set({
        user: null,
        balance: null,
        transactions: [],
        cards: [],
        savings: [],
        notifications: [],
        settings: null,
        biometricAuthenticated: false
      });
    },

    checkBiometrics: async () => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          set({ biometricAuthenticated: true });
          resolve(true);
        }, 1000);
      });
    },

    toggleBiometrics: async (enabled) => {
      const u = get().user;
      if (u) {
        const nextProfile = { ...u, biometricsEnabled: enabled };
        set({ user: nextProfile });
        if (get().simulationActive) {
          localStorage.setItem(`sim_user_${u.uid}`, JSON.stringify(nextProfile));
        } else {
          try {
            const { error } = await supabase.from('users').update({ biometrics_enabled: enabled }).eq('id', u.uid);
            if (error) throw error;
          } catch (e) {
            handleSupabaseError(e, OperationType.UPDATE, `users/${u.uid}`);
          }
        }
      }
    },

    clearSubscriptions: () => {
      get().listeners.forEach(unsub => unsub());
      set({ listeners: [] });
    },

    initRealtimeSubscriptions: async (uid) => {
      get().clearSubscriptions();
      set({ loading: true });

      if (get().simulationActive) {
        set({ loading: false, authChecked: true });
        return;
      }

      try {
        // Fetch baseline records immediately
        const [
          resUser, 
          resBal, 
          resSet, 
          resTx, 
          resCards, 
          resSavings, 
          resNotifs
        ] = await Promise.all([
          supabase.from('users').select('*').eq('id', uid).maybeSingle(),
          supabase.from('balances').select('*').eq('uid', uid).maybeSingle(),
          supabase.from('settings').select('*').eq('uid', uid).maybeSingle(),
          supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
          supabase.from('cards').select('*').eq('user_id', uid),
          supabase.from('savings_goals').select('*').eq('user_id', uid),
          supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false })
        ]);

        if (resUser.data) set({ user: mapUserFromDb(resUser.data) });
        if (resBal.data) set({ balance: mapBalanceFromDb(resBal.data) });
        if (resSet.data) set({ settings: mapSettingsFromDb(resSet.data) });
        if (resTx.data) set({ transactions: resTx.data.map(mapTransactionFromDb) });
        if (resCards.data) set({ cards: resCards.data.map(mapCardFromDb) });
        if (resSavings.data) set({ savings: resSavings.data.map(mapSavingsFromDb) });
        if (resNotifs.data) set({ notifications: resNotifs.data.map(mapNotificationFromDb) });

        set({ authChecked: true, loading: false });

        // Build continuous Postgres changes listener
        const mainChannel = supabase.channel(`realtime_db_${uid}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${uid}` }, (payload) => {
            if (payload.eventType === 'DELETE') {
              get().logOutUser();
            } else if (payload.new) {
              set({ user: mapUserFromDb(payload.new) });
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'balances', filter: `uid=eq.${uid}` }, (payload) => {
            if (payload.new) {
              set({ balance: mapBalanceFromDb(payload.new) });
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: `uid=eq.${uid}` }, (payload) => {
            if (payload.new) {
              set({ settings: mapSettingsFromDb(payload.new) });
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${uid}` }, async () => {
            const { data } = await supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false });
            if (data) set({ transactions: data.map(mapTransactionFromDb) });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'cards', filter: `user_id=eq.${uid}` }, async () => {
            const { data } = await supabase.from('cards').select('*').eq('user_id', uid);
            if (data) set({ cards: data.map(mapCardFromDb) });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals', filter: `user_id=eq.${uid}` }, async () => {
            const { data } = await supabase.from('savings_goals').select('*').eq('user_id', uid);
            if (data) set({ savings: data.map(mapSavingsFromDb) });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, async () => {
            const { data } = await supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false });
            if (data) set({ notifications: data.map(mapNotificationFromDb) });
          })
          .subscribe();

        const unsubFn = () => {
          mainChannel.unsubscribe();
        };

        set({ listeners: [unsubFn] });

      } catch (err: any) {
        set({ loading: false, authChecked: true, errorMessage: err.message || "Sync ledger link drop" });
      }
    },

    // --- Core Financial Methods ---

    issueTransfer: async (recipientEmail, amount, memo) => {
      set({ loading: true, errorMessage: null });
      const currentBalance = get().balance;
      const userObj = get().user;

      if (!currentBalance || !userObj) {
        set({ loading: false, errorMessage: 'Session state incomplete' });
        return;
      }

      if (userObj.isFrozen) {
        set({ loading: false, errorMessage: 'Account is frozen by administrators. Transfers declined.' });
        return;
      }

      if (currentBalance.checking < amount) {
        set({ loading: false, errorMessage: 'Insufficient funds in checking vault' });
        return;
      }

      const txSent: BankTransaction = {
        id: 'tx_s_' + Math.random().toString(36).substring(2, 10),
        userId: userObj.uid,
        amount,
        type: TransactionType.TRANSFER_SENT,
        category: 'Transfers',
        merchant: memo || `Transfer to ${recipientEmail}`,
        recipientEmail,
        createdAt: new Date().toISOString(),
        status: TransactionStatus.COMPLETED
      };

      const newChecking = currentBalance.checking - amount;

      if (get().simulationActive) {
        // Simulation path
        const updatedBalance = { ...currentBalance, checking: newChecking, updatedAt: new Date().toISOString() };
        const updatedTxs = [txSent, ...get().transactions];
        
        const notif: BankNotification = {
          id: 'n_' + Math.random().toString(36).substring(2, 10),
          userId: userObj.uid,
          title: 'Transfer Dispatched',
          message: `Your wire of $${amount.toFixed(2)} to ${recipientEmail} has been securely authorized.`,
          isRead: false,
          type: 'success',
          createdAt: new Date().toISOString()
        };
        const updatedNotifs = [notif, ...get().notifications];

        localStorage.setItem(`sim_balance_${userObj.uid}`, JSON.stringify(updatedBalance));
        localStorage.setItem(`sim_txs_${userObj.uid}`, JSON.stringify(updatedTxs));
        localStorage.setItem(`sim_notifications_${userObj.uid}`, JSON.stringify(updatedNotifs));

        set({
          balance: updatedBalance,
          transactions: updatedTxs,
          notifications: updatedNotifs,
          loading: false
        });
        return;
      }

      // Real auth post via Supabase transactional entities updates
      try {
        // Post transaction record
        const { error: tErr } = await supabase.from('transactions').insert(mapTransactionToDb(txSent));
        if (tErr) throw tErr;

        // Deduct sender balance
        const { error: bErr } = await supabase.from('balances').update({
          checking: newChecking,
          updated_at: new Date().toISOString()
        }).eq('uid', userObj.uid);
        if (bErr) throw bErr;

        // Post dispatch notification
        const notifId = 'notif_dispatch_' + Math.random().toString(36).substring(2, 10);
        const notif: BankNotification = {
          id: notifId,
          userId: userObj.uid,
          title: 'Transfer Dispatched',
          message: `Your wire of $${amount.toFixed(2)} to ${recipientEmail} has been securely authorized.`,
          isRead: false,
          type: 'success',
          createdAt: new Date().toISOString()
        };
        await supabase.from('notifications').insert(mapNotificationToDb(notif));

        // Inter-account relational trigger: find system user matching recipient email
        const { data: recipientUser } = await supabase.from('users').select('id').eq('email', recipientEmail).maybeSingle();
        if (recipientUser) {
          const rUid = recipientUser.id;
          
          // Get recipient balance record
          const { data: rBalData } = await supabase.from('balances').select('*').eq('uid', rUid).maybeSingle();
          if (rBalData) {
            const currentRBal = mapBalanceFromDb(rBalData);
            const nextRChecking = currentRBal.checking + amount;
            
            // Increment recipient balance checking
            await supabase.from('balances').update({
              checking: nextRChecking,
              updated_at: new Date().toISOString()
            }).eq('uid', rUid);

            // Insert matching transaction incoming ledger
            const txReceived: BankTransaction = {
              id: 'tx_r_' + Math.random().toString(36).substring(2, 10),
              userId: rUid,
              amount,
              type: TransactionType.TRANSFER_RECEIVED,
              category: 'Transfers',
              merchant: `Inward wire from ${userObj.firstName} ${userObj.lastName}`,
              senderEmail: userObj.email,
              createdAt: new Date().toISOString(),
              status: TransactionStatus.COMPLETED
            };
            await supabase.from('transactions').insert(mapTransactionToDb(txReceived));

            // Publish inward transfer notification
            const incomingNotifId = 'notif_inc_' + Math.random().toString(36).substring(2, 10);
            const incomingNotif: BankNotification = {
              id: incomingNotifId,
              userId: rUid,
              title: 'Wire Credits Cleared',
              message: `You received a matching wire of $${amount.toFixed(2)} from ${userObj.firstName} ${userObj.lastName}.`,
              isRead: false,
              type: 'success',
              createdAt: new Date().toISOString()
            };
            await supabase.from('notifications').insert(mapNotificationToDb(incomingNotif));
          }
        }

        set({ loading: false });
      } catch (err: any) {
        set({ loading: false, errorMessage: err.message || 'Error transferring funds' });
      }
    },

    addFunds: async (amount, target) => {
      const curBal = get().balance;
      const u = get().user;
      if (!curBal || !u) return;

      const updatedVal = target === 'checking' ? curBal.checking + amount : curBal.savings + amount;
      const newBalanceObj = {
        ...curBal,
        [target]: updatedVal,
        updatedAt: new Date().toISOString()
      };

      const newTx: BankTransaction = {
        id: 'tx_dep_' + Math.random().toString(36).substring(2,10),
        userId: u.uid,
        amount,
        type: TransactionType.DEPOSIT,
        category: 'Funding',
        merchant: 'Self-External Wire Target',
        createdAt: new Date().toISOString(),
        status: TransactionStatus.COMPLETED
      };

      if (get().simulationActive) {
        localStorage.setItem(`sim_balance_${u.uid}`, JSON.stringify(newBalanceObj));
        const finalTxs = [newTx, ...get().transactions];
        localStorage.setItem(`sim_txs_${u.uid}`, JSON.stringify(finalTxs));
        
        const notif: BankNotification = {
          id: 'n_f_' + Math.random().toString(36).substring(2,10),
          userId: u.uid,
          title: 'External Deposit Cleared',
          message: `Your self-wire funding of $${amount.toFixed(2)} into ${target} has cleared.`,
          isRead: false,
          type: 'success',
          createdAt: new Date().toISOString()
        };
        const finalNotifs = [notif, ...get().notifications];
        localStorage.setItem(`sim_notifications_${u.uid}`, JSON.stringify(finalNotifs));

        set({
          balance: newBalanceObj,
          transactions: finalTxs,
          notifications: finalNotifs
        });
        return;
      }

      try {
        await supabase.from('balances').update({
          [target]: updatedVal,
          updated_at: new Date().toISOString()
        }).eq('uid', u.uid);

        await supabase.from('transactions').insert(mapTransactionToDb(newTx));

        const notifId = 'notif_dep_' + Math.random().toString(36).substring(2,10);
        const notif: BankNotification = {
          id: notifId,
          userId: u.uid,
          title: 'External Deposit Cleared',
          message: `Your self-wire funding of $${amount.toFixed(2)} into ${target} has cleared.`,
          isRead: false,
          type: 'success',
          createdAt: new Date().toISOString()
        };
        await supabase.from('notifications').insert(mapNotificationToDb(notif));
      } catch (e) {
        handleSupabaseError(e, OperationType.WRITE, `balances/${u.uid}`);
      }
    },

    createCard: async (holder, cardType) => {
      const u = get().user;
      if (!u) return;

      const randomDigits = () => Math.floor(1000 + Math.random() * 9000);
      const newCard: VirtualCard = {
        id: 'card_' + Math.random().toString(36).substring(2,10),
        userId: u.uid,
        cardholderName: holder.toUpperCase(),
        cardNumber: `•••• •••• •••• ${randomDigits()}`,
        expiryDate: `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear() + 6).substring(2)}`,
        cvv: String(Math.floor(100 + Math.random() * 900)),
        isFrozen: false,
        spendingLimit: cardType === 'ebony' ? 50000 : cardType === 'platinum' ? 25000 : 10000,
        spentThisMonth: 0,
        cardType,
        createdAt: new Date().toISOString()
      };

      if (get().simulationActive) {
        const updatedCards = [...get().cards, newCard];
        localStorage.setItem(`sim_cards_${u.uid}`, JSON.stringify(updatedCards));
        set({ cards: updatedCards });
        return;
      }

      try {
        await supabase.from('cards').insert(mapCardToDb(newCard));
      } catch (e) {
        handleSupabaseError(e, OperationType.CREATE, `cards/${newCard.id}`);
      }
    },

    toggleCardFrozen: async (cardId) => {
      const targetCard = get().cards.find(c => c.id === cardId);
      if (!targetCard) return;

      const nextFrozen = !targetCard.isFrozen;
      if (get().simulationActive) {
        const nextCards = get().cards.map(c => c.id === cardId ? { ...c, isFrozen: nextFrozen } : c);
        localStorage.setItem(`sim_cards_${get().user?.uid}`, JSON.stringify(nextCards));
        set({ cards: nextCards });
        return;
      }

      try {
        await supabase.from('cards').update({ is_frozen: nextFrozen }).eq('id', cardId);
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `cards/${cardId}`);
      }
    },

    updateCardLimit: async (cardId, limit) => {
      if (get().simulationActive) {
        const nextCards = get().cards.map(c => c.id === cardId ? { ...c, spendingLimit: limit } : c);
        localStorage.setItem(`sim_cards_${get().user?.uid}`, JSON.stringify(nextCards));
        set({ cards: nextCards });
        return;
      }

      try {
        await supabase.from('cards').update({ spending_limit: limit }).eq('id', cardId);
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `cards/${cardId}`);
      }
    },

    createSavingsGoal: async (title, target, color) => {
      const u = get().user;
      if (!u) return;

      const goal: SavingsGoal = {
        id: 'goal_' + Math.random().toString(36).substring(2,10),
        userId: u.uid,
        title,
        targetAmount: target,
        currentAmount: 0,
        autoSaveEnabled: false,
        autoSavePercentage: 5,
        color,
        createdAt: new Date().toISOString()
      };

      if (get().simulationActive) {
        const updated = [...get().savings, goal];
        localStorage.setItem(`sim_savings_${u.uid}`, JSON.stringify(updated));
        set({ savings: updated });
        return;
      }

      try {
        await supabase.from('savings_goals').insert(mapSavingsToDb(goal));
      } catch (e) {
        handleSupabaseError(e, OperationType.CREATE, `savings_goals/${goal.id}`);
      }
    },

    contributeToSavings: async (goalId, amount) => {
      const u = get().user;
      const b = get().balance;
      const targetGoal = get().savings.find(s => s.id === goalId);
      if (!u || !b || !targetGoal) return;

      if (b.checking < amount) {
        set({ errorMessage: 'Insufficient funds in checking to transfer allocation' });
        return;
      }

      const nextGoalVal = targetGoal.currentAmount + amount;
      const nextChecking = b.checking - amount;
      const nextSavings = b.savings + amount;

      const newBalanceObj = {
        ...b,
        checking: nextChecking,
        savings: nextSavings,
        updatedAt: new Date().toISOString()
      };

      const customTx: BankTransaction = {
        id: 'tx_save_all_' + Math.random().toString(36).substring(2,10),
        userId: u.uid,
        amount,
        type: TransactionType.WITHDRAWAL,
        category: 'Savings Allocations',
        merchant: `Transfer to goal [${targetGoal.title}]`,
        createdAt: new Date().toISOString(),
        status: TransactionStatus.COMPLETED
      };

      if (get().simulationActive) {
        const updatedGoals = get().savings.map(s => s.id === goalId ? { ...s, currentAmount: nextGoalVal } : s);
        localStorage.setItem(`sim_savings_${u.uid}`, JSON.stringify(updatedGoals));
        localStorage.setItem(`sim_balance_${u.uid}`, JSON.stringify(newBalanceObj));
        
        const nextTxs = [customTx, ...get().transactions];
        localStorage.setItem(`sim_txs_${u.uid}`, JSON.stringify(nextTxs));

        set({
          savings: updatedGoals,
          balance: newBalanceObj,
          transactions: nextTxs
        });
        return;
      }

      try {
        await supabase.from('savings_goals').update({ current_amount: nextGoalVal }).eq('id', goalId);
        await supabase.from('balances').update({
          checking: nextChecking,
          savings: nextSavings,
          updated_at: new Date().toISOString()
        }).eq('uid', u.uid);
        await supabase.from('transactions').insert(mapTransactionToDb(customTx));
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `savings_goals/${goalId}`);
      }
    },

    toggleGoalAutoSave: async (goalId, percentage) => {
      const u = get().user;
      const targetGoal = get().savings.find(s => s.id === goalId);
      if (!u || !targetGoal) return;

      const nextAuto = !targetGoal.autoSaveEnabled;

      if (get().simulationActive) {
        const updated = get().savings.map(s => s.id === goalId ? { ...s, autoSaveEnabled: nextAuto, autoSavePercentage: percentage } : s);
        localStorage.setItem(`sim_savings_${u.uid}`, JSON.stringify(updated));
        set({ savings: updated });
        return;
      }

      try {
        await supabase.from('savings_goals').update({
          auto_save_enabled: nextAuto,
          auto_save_percentage: percentage
        }).eq('id', goalId);
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `savings_goals/${goalId}`);
      }
    },

    markNotificationAsRead: async (id) => {
      if (get().simulationActive) {
        const updated = get().notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        localStorage.setItem(`sim_notifications_${get().user?.uid}`, JSON.stringify(updated));
        set({ notifications: updated });
        return;
      }

      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `notifications/${id}`);
      }
    },

    updateProfile: async (first, last) => {
      const u = get().user;
      if (!u) return;

      if (get().simulationActive) {
        const nextProf = { ...u, firstName: first, lastName: last };
        localStorage.setItem(`sim_user_${u.uid}`, JSON.stringify(nextProf));
        set({ user: nextProf });
        return;
      }

      try {
        await supabase.from('users').update({
          first_name: first,
          last_name: last
        }).eq('id', u.uid);
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `users/${u.uid}`);
      }
    },

    updatePasswordSecure: async (pass) => {
      set({ loading: true, errorMessage: null });
      if (get().simulationActive) {
        setTimeout(() => set({ loading: false }), 800);
        return;
      }

      try {
        const { error } = await supabase.auth.updateUser({ password: pass });
        if (error) throw error;
        set({ loading: false });
      } catch (e: any) {
        set({ loading: false, errorMessage: e.message || 'Error modifying database password' });
      }
    },

    updateSettingsToggle: async (key, val) => {
      const s = get().settings;
      if (!s) return;

      const nextSettings = { ...s, [key]: val };
      if (get().simulationActive) {
        localStorage.setItem(`sim_settings_${s.uid}`, JSON.stringify(nextSettings));
        set({ settings: nextSettings });
        return;
      }

      try {
        await supabase.from('settings').update({ [mapSettingsToDb({ [key]: val } as any) as any]: val }).eq('uid', s.uid);
        
        // Generalize updating setting variables dynamically
        const dbKeyMapping: Record<string, string> = {
          faceIdEnabled: 'face_id_enabled',
          webAuthnConfigured: 'web_authn_configured',
          pushNotifications: 'push_notifications',
          emailStatements: 'email_statements',
          twoFactorEnabled: 'two_factor_enabled',
          theme: 'theme'
        };

        const dbCol = dbKeyMapping[key];
        if (dbCol) {
          await supabase.from('settings').update({ [dbCol]: val }).eq('uid', s.uid);
        }
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `settings/${s.uid}`);
      }
    },

    // --- ADMINISTRATIVE DASHBOARD CONTROLS ---

    adminLoadUsers: async () => {
      if (get().simulationActive) {
        const mockAccounts: UserProfile[] = [
          {
            uid: 'sim_demo',
            firstName: 'Alex',
            lastName: 'Morningstar',
            email: 'demo@morningbright.com',
            isVerified: true,
            isAdmin: false,
            isFrozen: false,
            isSuspended: false,
            biometricsEnabled: true,
            createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
          },
          {
            uid: 'sim_demo_admin',
            firstName: 'System',
            lastName: 'Admin',
            email: 'adereraadenike@gmail.com',
            isVerified: true,
            isAdmin: true,
            isFrozen: false,
            isSuspended: false,
            biometricsEnabled: false,
            createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
          },
          {
            uid: 'sim_client_3',
            firstName: 'Elizabeth',
            lastName: 'Sterling',
            email: 'liz@sterlingcaps.io',
            isVerified: true,
            isAdmin: false,
            isFrozen: true,
            isSuspended: false,
            biometricsEnabled: false,
            createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
          }
        ];
        set({ usersList: mockAccounts });
        return;
      }

      try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        if (data) {
          set({ usersList: data.map(mapUserFromDb) });
        }
      } catch (e) {
        console.error("Administrative profiles loader failed.", e);
      }
    },

    adminEditBalance: async (userId, checking, savings) => {
      const adminMail = get().user?.email || 'admin@morningbright.com';
      const logId = 'log_' + Math.random().toString(36).substring(2,10);

      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || 'admin_caller',
        adminEmail: adminMail,
        action: 'EDIT_BALANCE',
        targetUserId: userId,
        details: `Updated assets balance: Checking $${checking.toFixed(2)}, Savings $${savings.toFixed(2)}`,
        timestamp: new Date().toISOString()
      };

      if (get().simulationActive) {
        const targetBal = { uid: userId, checking, savings, updatedAt: new Date().toISOString() };
        localStorage.setItem(`sim_balance_${userId}`, JSON.stringify(targetBal));
        
        const nextLogs = [log, ...get().adminLogs];
        localStorage.setItem('sim_admin_logs', JSON.stringify(nextLogs));

        const notif: BankNotification = {
          id: 'n_a_' + Math.random().toString(36).substring(2,10),
          userId,
          title: 'Account Ledger Adjusted',
          message: `Your balance balances have been administratively updated to Checking: $${checking.toFixed(2)}, Savings: $${savings.toFixed(2)}`,
          isRead: false,
          type: 'alert',
          createdAt: new Date().toISOString()
        };
        const currentSimNotifs = JSON.parse(localStorage.getItem(`sim_notifications_${userId}`) || '[]');
        localStorage.setItem(`sim_notifications_${userId}`, JSON.stringify([notif, ...currentSimNotifs]));

        set({ adminLogs: nextLogs });
        
        if (get().user?.uid === userId) {
          set({ balance: targetBal, notifications: [notif, ...get().notifications] });
        }
        return;
      }

      try {
        await supabase.from('balances').update({
          checking,
          savings,
          updated_at: new Date().toISOString()
        }).eq('uid', userId);

        await supabase.from('admin_logs').insert(mapLogToDb(log));

        const notifId = 'notif_adj_' + Math.random().toString(36).substring(2,10);
        const notifObj: BankNotification = {
          id: notifId,
          userId,
          title: 'Account Ledger Adjusted',
          message: `Your balance balances have been administratively updated to Checking: $${checking.toFixed(2)}, Savings: $${savings.toFixed(2)}`,
          isRead: false,
          type: 'alert',
          createdAt: new Date().toISOString()
        };
        await supabase.from('notifications').insert(mapNotificationToDb(notifObj));
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `balances/${userId}`);
      }
    },

    adminAddSystemTransaction: async (userId, amount, type, merchant, category) => {
      const txId = 'tx_adm_' + Math.random().toString(36).substring(2,10);
      const logId = 'log_' + Math.random().toString(36).substring(2,10);

      const transaction: BankTransaction = {
        id: txId,
        userId,
        amount,
        type,
        category,
        merchant,
        createdAt: new Date().toISOString(),
        status: TransactionStatus.COMPLETED
      };

      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || 'admin_caller',
        adminEmail: get().user?.email || 'admin@morningbright.com',
        action: 'INSERT_TRANSACTION',
        targetUserId: userId,
        details: `Injected transaction ledger: $${amount.toFixed(2)} [${type}] at ${merchant}`,
        timestamp: new Date().toISOString()
      };

      if (get().simulationActive) {
        const storedTxs = JSON.parse(localStorage.getItem(`sim_txs_${userId}`) || '[]');
        const nextTxs = [transaction, ...storedTxs];
        localStorage.setItem(`sim_txs_${userId}`, JSON.stringify(nextTxs));
        
        const nextLogs = [log, ...get().adminLogs];
        localStorage.setItem('sim_admin_logs', JSON.stringify(nextLogs));

        set({ adminLogs: nextLogs });

        if (get().user?.uid === userId) {
          set({ transactions: nextTxs });
        }
        return;
      }

      try {
        await supabase.from('transactions').insert(mapTransactionToDb(transaction));
        await supabase.from('admin_logs').insert(mapLogToDb(log));
      } catch (e) {
        handleSupabaseError(e, OperationType.CREATE, `transactions/${txId}`);
      }
    },

    adminFreezeUser: async (userId, frozen) => {
      const logId = 'log_' + Math.random().toString(36).substring(2,10);
      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || 'admin_caller',
        adminEmail: get().user?.email || 'admin@morningbright.com',
        action: frozen ? 'FREEZE_USER' : 'UNFREEZE_USER',
        targetUserId: userId,
        details: `${frozen ? 'Froze' : 'Unfroze'} transactions channels and card capabilities`,
        timestamp: new Date().toISOString()
      };

      if (get().simulationActive) {
        const updatedList = get().usersList.map(u => u.uid === userId ? { ...u, isFrozen: frozen } : u);
        set({ usersList: updatedList });

        const targetStored = localStorage.getItem(`sim_user_${userId}`);
        if (targetStored) {
          const parsed = JSON.parse(targetStored);
          parsed.isFrozen = frozen;
          localStorage.setItem(`sim_user_${userId}`, JSON.stringify(parsed));
          if (get().user?.uid === userId) {
            set({ user: parsed });
          }
        }

        const nextLogs = [log, ...get().adminLogs];
        localStorage.setItem('sim_admin_logs', JSON.stringify(nextLogs));
        set({ adminLogs: nextLogs });
        return;
      }

      try {
        await supabase.from('users').update({ is_frozen: frozen }).eq('id', userId);
        await supabase.from('admin_logs').insert(mapLogToDb(log));
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `users/${userId}`);
      }
    },

    adminSuspendUser: async (userId, suspended) => {
      const logId = 'log_' + Math.random().toString(36).substring(2,10);
      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || 'admin_caller',
        adminEmail: get().user?.email || 'admin@morningbright.com',
        action: suspended ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
        targetUserId: userId,
        details: `${suspended ? 'Suspended' : 'Reactivated'} user security token access`,
        timestamp: new Date().toISOString()
      };

      if (get().simulationActive) {
        const updatedList = get().usersList.map(u => u.uid === userId ? { ...u, isSuspended: suspended } : u);
        set({ usersList: updatedList });

        const targetStored = localStorage.getItem(`sim_user_${userId}`);
        if (targetStored) {
          const parsed = JSON.parse(targetStored);
          parsed.isSuspended = suspended;
          localStorage.setItem(`sim_user_${userId}`, JSON.stringify(parsed));
          if (get().user?.uid === userId) {
            set({ user: parsed });
          }
        }

        const nextLogs = [log, ...get().adminLogs];
        localStorage.setItem('sim_admin_logs', JSON.stringify(nextLogs));
        set({ adminLogs: nextLogs });
        return;
      }

      try {
        await supabase.from('users').update({ is_suspended: suspended }).eq('id', userId);
        await supabase.from('admin_logs').insert(mapLogToDb(log));
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `users/${userId}`);
      }
    },

    adminPushSystemNotification: async (userId, title, message, type) => {
      const notifId = 'notif_adm_' + Math.random().toString(36).substring(2,10);
      const logId = 'log_' + Math.random().toString(36).substring(2,10);

      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || 'admin_caller',
        adminEmail: get().user?.email || 'admin@morningbright.com',
        action: 'PUSH_NOTIFICATION',
        targetUserId: userId,
        details: `Dispatched direct notify message: "${title}"`,
        timestamp: new Date().toISOString()
      };

      const notif: BankNotification = {
        id: notifId,
        userId,
        title,
        message,
        isRead: false,
        type,
        createdAt: new Date().toISOString()
      };

      if (get().simulationActive) {
        const storedNotifs = JSON.parse(localStorage.getItem(`sim_notifications_${userId}`) || '[]');
        const nextNotifs = [notif, ...storedNotifs];
        localStorage.setItem(`sim_notifications_${userId}`, JSON.stringify(nextNotifs));

        const nextLogs = [log, ...get().adminLogs];
        localStorage.setItem('sim_admin_logs', JSON.stringify(nextLogs));

        set({ adminLogs: nextLogs });

        if (get().user?.uid === userId) {
          set({ notifications: nextNotifs });
        }
        return;
      }

      try {
        await supabase.from('notifications').insert(mapNotificationToDb(notif));
        await supabase.from('admin_logs').insert(mapLogToDb(log));
      } catch (e) {
        handleSupabaseError(e, OperationType.CREATE, `notifications/${notifId}`);
      }
    },

    adminLoadLogs: async () => {
      if (get().simulationActive) {
        const cached = localStorage.getItem('sim_admin_logs');
        if (cached) {
          set({ adminLogs: JSON.parse(cached) });
        } else {
          const starterLogs: AdminLog[] = [
            {
              id: 'log_starter_1',
              adminId: 'sim_demo_admin',
              adminEmail: 'adereraadenike@gmail.com',
              action: 'BOOTSTRAP_SYSTEM',
              targetUserId: 'ALL',
              details: 'Seeded initial credit ledger and digital checking vaults.',
              timestamp: new Date(Date.now() - 3600 * 1000).toISOString()
            }
          ];
          localStorage.setItem('sim_admin_logs', JSON.stringify(starterLogs));
          set({ adminLogs: starterLogs });
        }
        return;
      }

      try {
        const { data, error } = await supabase.from('admin_logs').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        if (data) {
          set({ adminLogs: data.map(mapLogFromDb) });
        }

        // Subscribe to logs updates
        const logsChannel = supabase.channel('admin_logs_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_logs' }, async () => {
            const { data: fresh } = await supabase.from('admin_logs').select('*').order('timestamp', { ascending: false });
            if (fresh) {
              set({ adminLogs: fresh.map(mapLogFromDb) });
            }
          })
          .subscribe();

        const unsubFn = () => {
          logsChannel.unsubscribe();
        };

        set({ listeners: [...get().listeners, unsubFn] });

      } catch (e) {
        console.error("Administrative auditing records loading rejected.", e);
      }
    }
  };
});
