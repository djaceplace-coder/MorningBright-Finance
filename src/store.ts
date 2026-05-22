/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where,
  deleteDoc
} from 'firebase/firestore';
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

// Initial interactive assets for mock session or fallback sandbox environment - cleared for production-ready empty states
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

      // Real auth register
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await sendEmailVerification(cred.user);

        // Provision initial document profiles
        const profile: UserProfile = {
          uid: cred.user.uid,
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
          uid: cred.user.uid,
          checking: 0.00,
          savings: 0.00,
          updatedAt: new Date().toISOString()
        };

        const settingsDoc: UserSecuritySettings = {
          uid: cred.user.uid,
          faceIdEnabled: false,
          webAuthnConfigured: false,
          pushNotifications: true,
          emailStatements: true,
          twoFactorEnabled: false,
          theme: 'system'
        };

        // Put down the database roots
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        await setDoc(doc(db, 'balances', cred.user.uid), balance);
        await setDoc(doc(db, 'settings', cred.user.uid), settingsDoc);

        // Seed initial subcollections documents
        for (const tx of INITIAL_TRANSACTIONS(cred.user.uid)) {
          await setDoc(doc(db, 'transactions', tx.id), tx);
        }
        for (const card of INITIAL_CARDS(cred.user.uid)) {
          await setDoc(doc(db, 'cards', card.id), card);
        }
        for (const goal of INITIAL_SAVINGS(cred.user.uid)) {
          await setDoc(doc(db, 'savings', goal.id), goal);
        }
        for (const notif of INITIAL_NOTIFICATIONS(cred.user.uid)) {
          await setDoc(doc(db, 'notifications', notif.id), notif);
        }

        set({ loading: false });
        get().initRealtimeSubscriptions(cred.user.uid);
      } catch (e) {
        set({ loading: false, errorMessage: e instanceof Error ? e.message : "Error during secure registration" });
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
            const parsedProfile = JSON.parse(stored);
            set({
              user: parsedProfile,
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
              checking: 0.00,
              savings: 0.00,
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
        await signInWithEmailAndPassword(auth, email, pass);
        // Rest handled by Auth change callback inside App.tsx
        set({ loading: false });
      } catch (e) {
        set({ loading: false, errorMessage: e instanceof Error ? e.message : "Invalid credentials" });
      }
    },

    logOutUser: async () => {
      get().clearSubscriptions();
      if (!get().simulationActive) {
        await signOut(auth);
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
      // Simulate standard WebAuthn cryptographic touch loop
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          set({ biometricAuthenticated: true });
          resolve(true);
        }, 1000);
      });
    },

    toggleBiometrics: (enabled) => {
      const u = get().user;
      if (u) {
        const nextProfile = { ...u, biometricsEnabled: enabled };
        set({ user: nextProfile });
        if (get().simulationActive) {
          localStorage.setItem(`sim_user_${u.uid}`, JSON.stringify(nextProfile));
        } else {
          updateDoc(doc(db, 'users', u.uid), { biometricsEnabled: enabled }).catch(e => {
            handleFirestoreError(e, OperationType.UPDATE, `users/${u.uid}`);
          });
        }
      }
    },

    clearSubscriptions: () => {
      get().listeners.forEach(unsub => unsub());
      set({ listeners: [] });
    },

    initRealtimeSubscriptions: (uid) => {
      get().clearSubscriptions();
      set({ loading: true });

      if (get().simulationActive) {
        // Fallback sim loaded instantly
        set({ loading: false });
        return;
      }

      // 1. Subscribe Profile
      const unsubProfile = onSnapshot(doc(db, 'users', uid), (snapshot) => {
        if (snapshot.exists()) {
          set({ user: snapshot.data() as UserProfile });
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`));

      // 2. Subscribe Balance
      const unsubBalance = onSnapshot(doc(db, 'balances', uid), (snapshot) => {
        if (snapshot.exists()) {
          set({ balance: snapshot.data() as UserBalance });
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, `balances/${uid}`));

      // 3. Subscribe Settings
      const unsubSettings = onSnapshot(doc(db, 'settings', uid), (snapshot) => {
        if (snapshot.exists()) {
          set({ settings: snapshot.data() as UserSecuritySettings });
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, `settings/${uid}`));

      // 4. Subscribe Transactions Feed
      const txQuery = query(collection(db, 'transactions'), where('userId', '==', uid));
      const unsubTransactions = onSnapshot(txQuery, (snapshot) => {
        const txs: BankTransaction[] = [];
        snapshot.forEach((snap) => {
          txs.push(snap.data() as BankTransaction);
        });
        // Sort newest first
        txs.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
        set({ transactions: txs });
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));

      // 5. Subscribe Cards Feed
      const cardsQuery = query(collection(db, 'cards'), where('userId', '==', uid));
      const unsubCards = onSnapshot(cardsQuery, (snapshot) => {
        const cards: VirtualCard[] = [];
        snapshot.forEach((snap) => {
          cards.push(snap.data() as VirtualCard);
        });
        set({ cards });
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'cards'));

      // 6. Subscribe Savings goals
      const savingsQuery = query(collection(db, 'savings'), where('userId', '==', uid));
      const unsubSavings = onSnapshot(savingsQuery, (snapshot) => {
        const goals: SavingsGoal[] = [];
        snapshot.forEach((snap) => {
          goals.push(snap.data() as SavingsGoal);
        });
        set({ savings: goals });
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'savings'));

      // 7. Subscribe Notifications
      const notifsQuery = query(collection(db, 'notifications'), where('userId', '==', uid));
      const unsubNotifs = onSnapshot(notifsQuery, (snapshot) => {
        const list: BankNotification[] = [];
        snapshot.forEach((snap) => {
          list.push(snap.data() as BankNotification);
        });
        list.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
        set({ notifications: list });
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));

      set({
        listeners: [
          unsubProfile, 
          unsubBalance, 
          unsubSettings, 
          unsubTransactions, 
          unsubCards, 
          unsubSavings, 
          unsubNotifs
        ],
        loading: false
      });
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
        // simulation write
        const updatedBalance = { ...currentBalance, checking: newChecking, updatedAt: new Date().toISOString() };
        const updatedTxs = [txSent, ...get().transactions];
        
        // Notify
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

      // Real auth post
      try {
        await setDoc(doc(db, 'transactions', txSent.id), txSent);
        await updateDoc(doc(db, 'balances', userObj.uid), {
          checking: newChecking,
          updatedAt: new Date().toISOString()
        });

        const notifId = 'notif_dispatch_' + Math.random().toString(36).substring(2, 10);
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: userObj.uid,
          title: 'Transfer Dispatched',
          message: `Your wire of $${amount.toFixed(2)} to ${recipientEmail} has been securely authorized.`,
          isRead: false,
          type: 'success',
          createdAt: new Date().toISOString()
        });
        set({ loading: false });
      } catch (err) {
        set({ loading: false, errorMessage: err instanceof Error ? err.message : 'Error transferring funds' });
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
        await updateDoc(doc(db, 'balances', u.uid), {
          [target]: updatedVal,
          updatedAt: new Date().toISOString()
        });
        await setDoc(doc(db, 'transactions', newTx.id), newTx);

        const notifId = 'notif_dep_' + Math.random().toString(36).substring(2,10);
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: u.uid,
          title: 'External Deposit Cleared',
          message: `Your self-wire funding of $${amount.toFixed(2)} into ${target} has cleared.`,
          isRead: false,
          type: 'success',
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `balances/${u.uid}`);
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
        await setDoc(doc(db, 'cards', newCard.id), newCard);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `cards/${newCard.id}`);
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
        await updateDoc(doc(db, 'cards', cardId), { isFrozen: nextFrozen });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `cards/${cardId}`);
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
        await updateDoc(doc(db, 'cards', cardId), { spendingLimit: limit });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `cards/${cardId}`);
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
        await setDoc(doc(db, 'savings', goal.id), goal);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `savings/${goal.id}`);
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
        await updateDoc(doc(db, 'savings', goalId), { currentAmount: nextGoalVal });
        await updateDoc(doc(db, 'balances', u.uid), {
          checking: nextChecking,
          savings: nextSavings,
          updatedAt: new Date().toISOString()
        });
        await setDoc(doc(db, 'transactions', customTx.id), customTx);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `savings/${goalId}`);
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
        await updateDoc(doc(db, 'savings', goalId), {
          autoSaveEnabled: nextAuto,
          autoSavePercentage: percentage
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `savings/${goalId}`);
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
        await updateDoc(doc(db, 'notifications', id), { isRead: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
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
        await updateDoc(doc(db, 'users', u.uid), {
          firstName: first,
          lastName: last
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${u.uid}`);
      }
    },

    updatePasswordSecure: async (pass) => {
      set({ loading: true, errorMessage: null });
      if (get().simulationActive) {
        setTimeout(() => set({ loading: false }), 800);
        return;
      }

      try {
        const u = auth.currentUser;
        if (u) {
          await updatePassword(u, pass);
        }
        set({ loading: false });
      } catch (e) {
        set({ loading: false, errorMessage: e instanceof Error ? e.message : 'Error modifying database password' });
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
        await updateDoc(doc(db, 'settings', s.uid), { [key]: val });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `settings/${s.uid}`);
      }
    },

    // --- ADMINISTRATIVE DASHBOARD CONTROLS ---

    adminLoadUsers: async () => {
      if (get().simulationActive) {
        // Mock list of registry accounts from storage keys or default profiles
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
            isFrozen: true, // Initially frozen user to demonstrate freeze UX
            isSuspended: false,
            biometricsEnabled: false,
            createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
          }
        ];
        set({ usersList: mockAccounts });
        return;
      }

      // Real auth fetch user indices (Note: normally requires node side API functions.
      // But we can pull records from users collection if logged in as Admin using Firestore queries).
      try {
        // Query users collection directly
        const usersCol = collection(db, 'users');
        onSnapshot(usersCol, (snap) => {
          const list: UserProfile[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as UserProfile);
          });
          set({ usersList: list });
        });
      } catch (e) {
        console.error("Administrative profiles loader failed. Missing privileges.", e);
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
        // Update user balances in sim store
        const targetBal = { uid: userId, checking, savings, updatedAt: new Date().toISOString() };
        localStorage.setItem(`sim_balance_${userId}`, JSON.stringify(targetBal));
        
        // Push admin log
        const nextLogs = [log, ...get().adminLogs];
        localStorage.setItem('sim_admin_logs', JSON.stringify(nextLogs));

        // Push notify to target customer
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
        
        // Refresher triggers
        if (get().user?.uid === userId) {
          set({ balance: targetBal, notifications: [notif, ...get().notifications] });
        }
        return;
      }

      try {
        await updateDoc(doc(db, 'balances', userId), {
          checking,
          savings,
          updatedAt: new Date().toISOString()
        });
        await setDoc(doc(db, 'admin_logs', logId), log);

        const notifId = 'notif_adj_' + Math.random().toString(36).substring(2,10);
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId,
          title: 'Account Ledger Adjusted',
          message: `Your balance balances have been administratively updated to Checking: $${checking.toFixed(2)}, Savings: $${savings.toFixed(2)}`,
          isRead: false,
          type: 'alert',
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `balances/${userId}`);
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
        await setDoc(doc(db, 'transactions', txId), transaction);
        await setDoc(doc(db, 'admin_logs', logId), log);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `transactions/${txId}`);
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
        // Adjust usersList
        const updatedList = get().usersList.map(u => u.uid === userId ? { ...u, isFrozen: frozen } : u);
        set({ usersList: updatedList });

        // Update target profile
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
        await updateDoc(doc(db, 'users', userId), { isFrozen: frozen });
        await setDoc(doc(db, 'admin_logs', logId), log);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
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
        // Adjust usersList
        const updatedList = get().usersList.map(u => u.uid === userId ? { ...u, isSuspended: suspended } : u);
        set({ usersList: updatedList });

        // Update target profile
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
        await updateDoc(doc(db, 'users', userId), { isSuspended: suspended });
        await setDoc(doc(db, 'admin_logs', logId), log);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
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
        await setDoc(doc(db, 'notifications', notifId), notif);
        await setDoc(doc(db, 'admin_logs', logId), log);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `notifications/${notifId}`);
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
        const q = query(collection(db, 'admin_logs'));
        onSnapshot(q, (snap) => {
          const logs: AdminLog[] = [];
          snap.forEach(docSnap => {
            logs.push(docSnap.data() as AdminLog);
          });
          logs.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
          set({ adminLogs: logs });
        });
      } catch (e) {
        console.error("Administrative auditing records loading rejected.", e);
      }
    }
  };
});
