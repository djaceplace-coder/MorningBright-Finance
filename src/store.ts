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
  TransactionStatus,
  Beneficiary
} from './types';

// Helper to generate random 16 digit card
const randomCard = () => Array.from({length: 4}, () => Math.floor(1000 + Math.random() * 9000).toString()).join(' ');
const randomDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + Math.floor(Math.random() * 3 + 1));
  date.setMonth(Math.floor(Math.random() * 12));
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
}

// Initial interactive assets for onboarding environment
const INITIAL_TRANSACTIONS = (userId: string): BankTransaction[] => [
  {
    id: crypto.randomUUID(),
    userId,
    amount: 500,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.COMPLETED,
    merchant: 'Opening Deposit',
    category: 'Funding',
    createdAt: new Date().toISOString() // Fixed timestamp -> createdAt
  }
];
const INITIAL_CARDS = (userId: string, name: string): VirtualCard[] => [{
  id: crypto.randomUUID(),
  userId,
  cardNumber: randomCard(),
  cardholderName: name,
  expiryDate: randomDate(),
  cvv: Math.floor(100 + Math.random() * 900).toString(),
  cardType: 'platinum',
  spendingLimit: 5000,
  spentThisMonth: 0,
  isFrozen: false,
  createdAt: new Date().toISOString()
}];
const INITIAL_SAVINGS = (userId: string): SavingsGoal[] => [];
const INITIAL_NOTIFICATIONS = (userId: string): BankNotification[] => [{
  id: crypto.randomUUID(),
  userId,
  title: 'Welcome to Morning Bright',
  message: 'Your new digital banking account is ready. Your initial deposit has been credited and your virtual card is active.',
  type: 'system',
  isRead: false,
  createdAt: new Date().toISOString()
}];

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
  beneficiaries: Beneficiary[];
  
  // App context flags
  loading: boolean;
  authChecked: boolean;
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
    beneficiaries: [],
    
    loading: false,
    authChecked: false,
        biometricAuthenticated: false,
    pwaInstalled: false,
    errorMessage: null,
    listeners: [],

    clearError: () => set({ errorMessage: null }),

    
    initAuthListener: () => {
      // Restore cached session immediately
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          get().initRealtimeSubscriptions(session.user.id);
        } else {
          set({ authChecked: true });
        }
      });

      // Stream auth events
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        
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
        if (!data.user) throw new Error("Email may already be registered or unavailable if email security is enabled. Please try logging in.");

        // If email confirmation is required, session will be null.
        // We cannot insert records until the user verifies and signs in.
        if (!data.session) {
          set({ loading: false, errorMessage: 'Verification email sent. Please check your inbox and sign in.' });
          return;
        }

        // Provision initial relational records
        const profile: UserProfile = {
          uid: data.user.id,
          firstName: first,
          lastName: last,
          email,
          isVerified: false, 
          isAdmin: email === 'support@morningbrightfinance.com',
          isFrozen: false,
          isSuspended: false,
          biometricsEnabled: false,
          createdAt: new Date().toISOString()
        };

        const balance: UserBalance = {
          uid: data.user.id,
          checking: 500.00,
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
        for (const card of INITIAL_CARDS(data.user.id, `${first} ${last}`)) {
          await supabase.from('cards').insert(mapCardToDb(card));
        }
        for (const goal of INITIAL_SAVINGS(data.user.id)) {
          await supabase.from('savings_goals').insert(mapSavingsToDb(goal));
        }
        for (const notif of INITIAL_NOTIFICATIONS(data.user.id)) {
          await supabase.from('notifications').insert(mapNotificationToDb(notif));
        }

        set({ loading: false });
        // The subscription hook handles remaining layout changes automatically via onAuthStateChange
      } catch (e: any) {
        set({ loading: false, errorMessage: e.message || "Error during secure registration" });
      }
    },

    logInUser: async (email, pass) => {
      set({ loading: true, errorMessage: null });

      

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
      await supabase.auth.signOut();
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
          try {
            const { error } = await supabase.from('users').update({ biometrics_enabled: enabled }).eq('id', u.uid);
            if (error) throw error;
          } catch (e) {
            handleSupabaseError(e, OperationType.UPDATE, `users/${u.uid}`);
          }
      }
    },

    clearSubscriptions: () => {
      get().listeners.forEach(unsub => unsub());
      set({ listeners: [] });
      supabase.removeAllChannels();
    },

    initRealtimeSubscriptions: async (uid) => {
      get().clearSubscriptions();
      set({ loading: true });

      

      try {
        // Fetch baseline records immediately
        const [
          resUser, 
          resBal, 
          resSet, 
          resTx, 
          resCards, 
          resSavings, 
          resNotifs,
          resBench
        ] = await Promise.all([
          supabase.from('users').select('*').eq('id', uid).maybeSingle(),
          supabase.from('balances').select('*').eq('uid', uid).maybeSingle(),
          supabase.from('settings').select('*').eq('uid', uid).maybeSingle(),
          supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
          supabase.from('cards').select('*').eq('user_id', uid),
          supabase.from('savings_goals').select('*').eq('user_id', uid),
          supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
          supabase.from('beneficiaries').select('*').eq('user_id', uid).order('created_at', { ascending: false })
        ]);

        if (resUser.error) console.error("resUser fetch error:", resUser.error);
        
        let userRecord = resUser.data;
        let balanceRecord = resBal.data;
        let settingsRecord = resSet.data;

        // Auto-recover disconnected auth users (if RLS blocked insert during sign up)
        if (!userRecord) {
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user) {
            const email = authData.user.email || '';
            const first = authData.user.user_metadata?.firstName || 'Valued';
            const last = authData.user.user_metadata?.lastName || 'Client';
            
            const profile: UserProfile = {
              uid: authData.user.id,
              firstName: first,
              lastName: last,
              email,
              isVerified: false, 
              isAdmin: email === 'support@morningbrightfinance.com',
              isFrozen: false,
              isSuspended: false,
              biometricsEnabled: false,
              createdAt: new Date().toISOString()
            };
            
            const balance: UserBalance = {
              uid: authData.user.id,
              checking: 500.00,
              savings: 0.00,
              updatedAt: new Date().toISOString()
            };
            
            const settingsDoc: UserSecuritySettings = {
               uid: authData.user.id,
               faceIdEnabled: false,
               webAuthnConfigured: false,
               pushNotifications: true,
               emailStatements: true,
               twoFactorEnabled: false,
               theme: 'system'
            };

            const mappedUser = mapUserToDb(profile);
            const ins1 = await supabase.from('users').insert(mappedUser).maybeSingle();
            if (ins1.error) console.error("users auto-insert error:", ins1.error);
            
            const mappedBalance = mapBalanceToDb(balance);
            const ins2 = await supabase.from('balances').insert(mappedBalance).maybeSingle();
            if (ins2.error) console.error("balances auto-insert error:", ins2.error);
            
            const mappedSettings = mapSettingsToDb(settingsDoc);
            const ins3 = await supabase.from('settings').insert(mappedSettings).maybeSingle();
            if (ins3.error) console.error("settings auto-insert error:", ins3.error);

            // Seed sub-records for recovered user
            for (const tx of INITIAL_TRANSACTIONS(authData.user.id)) {
              await supabase.from('transactions').insert(mapTransactionToDb(tx));
            }
            for (const card of INITIAL_CARDS(authData.user.id, `${first} ${last}`)) {
              await supabase.from('cards').insert(mapCardToDb(card));
            }
            for (const goal of INITIAL_SAVINGS(authData.user.id)) {
              await supabase.from('savings_goals').insert(mapSavingsToDb(goal));
            }
            for (const notif of INITIAL_NOTIFICATIONS(authData.user.id)) {
              await supabase.from('notifications').insert(mapNotificationToDb(notif));
            }
            
            // Re-fetch
            const u = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
            userRecord = u.data || mappedUser;
            const b = await supabase.from('balances').select('*').eq('uid', uid).maybeSingle();
            balanceRecord = b.data || mappedBalance;
            const s = await supabase.from('settings').select('*').eq('uid', uid).maybeSingle();
            settingsRecord = s.data || mappedSettings;
            
            // Re-fetch other data as well
            const recoveredTx = await supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false });
            if (recoveredTx.data) resTx.data = recoveredTx.data;
            const recoveredCards = await supabase.from('cards').select('*').eq('user_id', uid);
            if (recoveredCards.data) resCards.data = recoveredCards.data;
            const recoveredSavings = await supabase.from('savings_goals').select('*').eq('user_id', uid);
            if (recoveredSavings.data) resSavings.data = recoveredSavings.data;
            const recoveredNotifs = await supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false });
            if (recoveredNotifs.data) resNotifs.data = recoveredNotifs.data;
          }
        }

        if (userRecord) set({ user: mapUserFromDb(userRecord) });
        if (balanceRecord) set({ balance: mapBalanceFromDb(balanceRecord) });
        if (settingsRecord) set({ settings: mapSettingsFromDb(settingsRecord) });
        if (resTx.data) set({ transactions: resTx.data.map(mapTransactionFromDb) });
        if (resCards.data) set({ cards: resCards.data.map(mapCardFromDb) });
        if (resSavings.data) set({ savings: resSavings.data.map(mapSavingsFromDb) });
        if (resNotifs.data) set({ notifications: resNotifs.data.map(mapNotificationFromDb) });
        if (resBench.data) set({
          beneficiaries: resBench.data.map((b: any) => ({
            id: b.id,
            userId: b.user_id,
            name: b.name,
            email: b.email,
            createdAt: b.created_at
          }))
        });

        set({ authChecked: true, loading: false });

        // Build continuous Postgres changes listener
        const channelName = `realtime_db_${uid}_${Date.now()}`;
        const mainChannel = supabase.channel(channelName)
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
          .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries', filter: `user_id=eq.${uid}` }, async () => {
             const { data } = await supabase.from('beneficiaries').select('*').eq('user_id', uid).order('created_at', { ascending: false });
             if (data) set({
               beneficiaries: data.map((b) => ({
                 id: b.id,
                 userId: b.user_id,
                 name: b.name,
                 email: b.email,
                 createdAt: b.created_at
               }))
             });
          })
          .subscribe();

        const unsubFn = () => {
          mainChannel.unsubscribe();
        };

        set({ listeners: [unsubFn] });

      } catch (err: any) {
        set({ loading: false, authChecked: true, errorMessage: err.message || "Network connection error" });
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
        set({ loading: false, errorMessage: 'Insufficient funds in Checking Account' });
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

            // Insert matching transaction incoming transaction
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
      

      try {
        await supabase.from('cards').update({ is_frozen: nextFrozen }).eq('id', cardId);
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `cards/${cardId}`);
      }
    },

    updateCardLimit: async (cardId, limit) => {
      

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
      

      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (e) {
        handleSupabaseError(e, OperationType.UPDATE, `notifications/${id}`);
      }
    },

    updateProfile: async (first, last) => {
      const u = get().user;
      if (!u) return;

      

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
      const adminMail = get().user?.email || 'support@morningbrightfinance.com';
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
          title: 'Account Balance Adjusted',
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
        adminEmail: get().user?.email || 'support@morningbrightfinance.com',
        action: 'INSERT_TRANSACTION',
        targetUserId: userId,
        details: `Injected transaction: $${amount.toFixed(2)} [${type}] at ${merchant}`,
        timestamp: new Date().toISOString()
      };

      

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
        adminEmail: get().user?.email || 'support@morningbrightfinance.com',
        action: frozen ? 'FREEZE_USER' : 'UNFREEZE_USER',
        targetUserId: userId,
        details: `${frozen ? 'Froze' : 'Unfroze'} transactions channels and card capabilities`,
        timestamp: new Date().toISOString()
      };

      

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
        adminEmail: get().user?.email || 'support@morningbrightfinance.com',
        action: suspended ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
        targetUserId: userId,
        details: `${suspended ? 'Suspended' : 'Reactivated'} user security token access`,
        timestamp: new Date().toISOString()
      };

      

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
        adminEmail: get().user?.email || 'support@morningbrightfinance.com',
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

      

      try {
        await supabase.from('notifications').insert(mapNotificationToDb(notif));
        await supabase.from('admin_logs').insert(mapLogToDb(log));
      } catch (e) {
        handleSupabaseError(e, OperationType.CREATE, `notifications/${notifId}`);
      }
    },

    adminLoadLogs: async () => {
      

      try {
        const { data, error } = await supabase.from('admin_logs').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        if (data) {
          set({ adminLogs: data.map(mapLogFromDb) });
        }

        // Subscribe to logs updates
        const logsChannel = supabase.channel(`admin_logs_realtime_${Date.now()}`)
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
