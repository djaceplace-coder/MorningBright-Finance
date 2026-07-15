/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from "zustand";
import toast from "react-hot-toast";
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
  mapTransactionFromDb,
} from "./supabase";

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
  Beneficiary,
  SupportTicket,
} from "./components/types";

// Helper to generate random 16 digit card
const randomCard = () =>
  Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000).toString(),
  ).join(" ");
const randomDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + Math.floor(Math.random() * 3 + 1));
  date.setMonth(Math.floor(Math.random() * 12));
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`;
};

// Initial interactive assets for onboarding environment
const INITIAL_TRANSACTIONS = (userId: string): BankTransaction[] => [
  {
    id: `tx_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    amount: 150.0,
    type: TransactionType.CARD_SPEND,
    merchant: 'Apple Store',
    category: 'Electronics',
    status: TransactionStatus.COMPLETED,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: `tx_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    amount: 25.50,
    type: TransactionType.CARD_SPEND,
    merchant: 'Starbucks',
    category: 'Food & Dining',
    status: TransactionStatus.COMPLETED,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  }
];
const INITIAL_CARDS = (userId: string, name: string): VirtualCard[] => [
  {
    id: `card_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    cardholderName: name.toUpperCase(),
    cardNumber: '4111 1111 1111 1111',
    expiryDate: '12/28',
    cvv: '123',
    isFrozen: false,
    spendingLimit: 10000,
    spentThisMonth: 175.50,
    cardType: 'ebony',
    createdAt: new Date().toISOString(),
  },
  {
    id: `card_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    cardholderName: name.toUpperCase(),
    cardNumber: '4242 4242 4242 4242',
    expiryDate: '09/27',
    cvv: '456',
    isFrozen: false,
    spendingLimit: 50000,
    spentThisMonth: 0,
    cardType: 'emerald',
    createdAt: new Date().toISOString(),
  },
  {
    id: `card_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    cardholderName: name.toUpperCase(),
    cardNumber: '4532 1123 4432 9982',
    expiryDate: '01/29',
    cvv: '999',
    isFrozen: false,
    spendingLimit: 25000,
    spentThisMonth: 0,
    cardType: 'physical',
    createdAt: new Date().toISOString(),
  }
];
const INITIAL_SAVINGS = (userId: string): SavingsGoal[] => [
  {
    id: `goal_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    title: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 2500,
    color: 'emerald',
    createdAt: new Date().toISOString(),
    autoSavePercentage: 5,
    autoSaveEnabled: true,
  },
  {
    id: `goal_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    title: 'Vacation',
    targetAmount: 5000,
    currentAmount: 1200,
    color: 'amber',
    createdAt: new Date().toISOString(),
    autoSavePercentage: 0,
    autoSaveEnabled: false,
  }
];
const INITIAL_NOTIFICATIONS = (userId: string): BankNotification[] => [
  {
    id: `notif_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    title: 'Welcome to Morning Bright',
    message: 'Your account has been successfully provisioned.',
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString(),
  }
];

// Support Ticket mappings
const mapTicketFromDb = (db: any): SupportTicket => ({
  id: db.id,
  userId: db.user_id,
  subject: db.subject,
  description: db.description,
  status: db.status,
  category: db.category,
  documentBase64: db.document_base64,
  createdAt: db.created_at,
});

interface BankState {
  // Current user state
  user: UserProfile | null;
  balance: UserBalance | null;
  transactions: BankTransaction[];
  cards: VirtualCard[];
  savings: SavingsGoal[];
  notifications: BankNotification[];
  tickets: SupportTicket[];
  settings: UserSecuritySettings | null;
  adminLogs: AdminLog[];
  adminTickets: SupportTicket[];
  usersList: UserProfile[]; // Cache for Admin console views
  beneficiaries: Beneficiary[];

  // App context flags
  loading: boolean;
  authChecked: boolean;
  biometricAuthenticated: boolean;
  pwaInstalled: boolean;

  // Error and success notifications
  errorMessage: string | null;
  successMessage: string | null;

  // Listeners unsubs
  listeners: (() => void)[];

  // Actions
  initAuthListener: () => () => void;
  signUpUser: (
    email: string,
    pass: string,
    first: string,
    last: string,
  ) => Promise<void>;
  logInUser: (email: string, pass: string) => Promise<void>;
  logOutUser: () => Promise<void>;
  checkBiometrics: () => Promise<boolean>;
  toggleBiometrics: (enabled: boolean) => void;
  clearError: () => void;
  clearSuccess: () => void;

  // Realtime loaders
  initRealtimeSubscriptions: (uid: string) => void;
  clearSubscriptions: () => void;

  // Core Financial Methods
  issueTransfer: (
    recipientEmail: string,
    amount: number,
    memo: string,
  ) => Promise<void>;
  addFunds: (amount: number, target: "checking" | "savings") => Promise<void>;
  createCard: (
    holder: string,
    cardType: "platinum" | "ebony" | "emerald",
  ) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  toggleCardFrozen: (cardId: string) => Promise<void>;
  updateCardLimit: (cardId: string, limit: number) => Promise<void>;
  createSavingsGoal: (
    title: string,
    target: number,
    color: string,
  ) => Promise<void>;
  contributeToSavings: (goalId: string, amount: number) => Promise<void>;
  toggleGoalAutoSave: (goalId: string, percentage: number) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  updatePinCode: (pin: string) => Promise<void>;
  updateProfile: (first: string, last: string) => Promise<void>;
  updateCurrency: (currency: 'USD' | 'EUR' | 'GBP') => Promise<void>;
  updatePasswordSecure: (pass: string) => Promise<void>;
  updateSettingsToggle: (
    key: keyof UserSecuritySettings,
    val: boolean | "light" | "dark" | "system",
  ) => Promise<void>;

  // Admin Controls
  adminLoadUsers: () => Promise<void>;
  adminEditBalance: (
    userId: string,
    checking: number,
    savings: number,
  ) => Promise<void>;
  adminAddSystemTransaction: (
    userId: string,
    amount: number,
    type: TransactionType,
    merchant: string,
    category: string,
  ) => Promise<void>;
  adminVerifyUser: (userId: string, isVerified: boolean) => Promise<void>;
  adminFreezeUser: (userId: string, frozen: boolean) => Promise<void>;
  adminSuspendUser: (userId: string, suspended: boolean) => Promise<void>;
  adminPushSystemNotification: (
    userId: string,
    title: string,
    message: string,
    type: "info" | "alert" | "success" | "system",
  ) => Promise<void>;
  adminBroadcastNotification: (
    title: string,
    message: string,
    type: "info" | "alert" | "success" | "system",
  ) => Promise<void>;
  // Support Tickets
  loadTickets: () => Promise<void>;
  createTicket: (
    subject: string,
    description: string,
    category: string,
    documentBase64?: string,
  ) => Promise<void>;

  // Admin Support Tickets
  adminLoadTickets: () => Promise<void>;
  adminUpdateTicketStatus: (
    ticketId: string,
    status: "open" | "in_progress" | "resolved",
  ) => Promise<void>;
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
    tickets: [],
    settings: null,
    adminLogs: [],
    adminTickets: [],
    usersList: [],
    beneficiaries: [],

    loading: false,
    authChecked: false,
    biometricAuthenticated: false,
    pwaInstalled: false,
    errorMessage: null,
    successMessage: null,
    listeners: [],

    clearError: () => set({ errorMessage: null }),
    clearSuccess: () => set({ successMessage: null }),

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
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
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
            authChecked: true,
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    },

    signUpUser: async (email, pass, first, last) => {
      set({ loading: true, errorMessage: null, successMessage: null });

      // Real auth register via Supabase
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              firstName: first,
              lastName: last,
            },
          },
        });

        if (error) {
          console.error("Supabase signUp error:", error);
          if (error.message.includes("already registered")) {
            throw new Error(
              "This email is already registered. Please sign in instead.",
            );
          }
          throw new Error(`Register error: ${error.message}`);
        }

        if (
          data.user &&
          data.user.identities &&
          data.user.identities.length === 0
        ) {
          throw new Error(
            "This email is already registered. Please sign in instead.",
          );
        }

        if (!data || !data.user) {
          throw new Error(
            "This email may already be registered, or the signup failed. Please try signing in instead.",
          );
        }

        // Provision initial relational records
        const profile: UserProfile = {
          uid: data.user.id,
          firstName: first,
          lastName: last,
          email,
          accountNumber: Math.floor(
            1000000000 + Math.random() * 9000000000,
          ).toString(),
          routingNumber: "122105155",
          isVerified: false,
          isAdmin: email === "support@morningbrightfinance.com",
          isFrozen: false,
          isSuspended: false,
          biometricsEnabled: false,
          createdAt: new Date().toISOString(),
        };

        const balance: UserBalance = {
          uid: data.user.id,
          checking: 0.0,
          savings: 0.0,
          updatedAt: new Date().toISOString(),
        };

        const settingsDoc: UserSecuritySettings = {
          uid: data.user.id,
          faceIdEnabled: false,
          webAuthnConfigured: false,
          pushNotifications: true,
          emailStatements: true,
          twoFactorEnabled: false,
          theme: "light",
        };

        // Insert primary relational credentials
        const { error: pErr } = await supabase
          .from("users")
          .upsert(mapUserToDb(profile));
        if (pErr) console.warn("Seed users error:", pErr);

        const { error: bErr } = await supabase
          .from("balances")
          .upsert(mapBalanceToDb(balance));
        if (bErr) console.warn("Seed balances error:", bErr);

        const { error: sErr } = await supabase
          .from("settings")
          .upsert(mapSettingsToDb(settingsDoc));
        if (sErr) console.warn("Seed settings error:", sErr);

        // Seed sub-records if any
        for (const tx of INITIAL_TRANSACTIONS(data.user.id)) {
          supabase.from("transactions").insert(mapTransactionToDb(tx)).then();
        }
        for (const card of INITIAL_CARDS(data.user.id, `${first} ${last}`)) {
          supabase.from("cards").insert(mapCardToDb(card)).then();
        }
        for (const goal of INITIAL_SAVINGS(data.user.id)) {
          supabase.from("savings_goals").insert(mapSavingsToDb(goal)).then();
        }
        for (const notif of INITIAL_NOTIFICATIONS(data.user.id)) {
          supabase
            .from("notifications")
            .insert(mapNotificationToDb(notif))
            .then();
        }

        // If email confirmation is required, session will be null.
        if (!data.session) {
          set({
            loading: false,
            successMessage:
              "Account registered successfully! Please sign in to continue.",
          });
          return;
        }

        set({ loading: false });
        // The subscription hook handles remaining layout changes automatically via onAuthStateChange
      } catch (e: any) {
        set({
          loading: false,
          errorMessage: e.message || "Error during secure registration",
        });
      }
    },

    logInUser: async (email, pass) => {
      set({ loading: true, errorMessage: null, successMessage: null });

      // Real auth user
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) throw error;
        set({ loading: false });
      } catch (e: any) {
        set({
          loading: false,
          errorMessage: e.message || "Invalid credentials",
        });
      }
    },

    logOutUser: async () => {
      get().clearSubscriptions();
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Sign out error:", e);
      }
      // Force clear local storage for supabase auth keys to prevent zombie sessions
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("sb-")) {
          localStorage.removeItem(key);
        }
      }
      set({
        user: null,
        balance: null,
        transactions: [],
        cards: [],
        savings: [],
        notifications: [],
        settings: null,
        biometricAuthenticated: false,
        authChecked: true,
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
          const { error } = await supabase.from("users").update({ biometrics_enabled: enabled })
            .eq("id", u.uid);
          if (error) throw error;
        } catch (e) {
          toast.error(e.message || "Operation failed"); throw e;
        }
      }
    },

    clearSubscriptions: () => {
      get().listeners.forEach((unsub) => unsub());
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
          resBench,
        ] = await Promise.all([
          supabase.from("users").select("*").eq("id", uid).maybeSingle(),
          supabase.from("balances").select("*").eq("uid", uid).maybeSingle(),
          supabase.from("settings").select("*").eq("uid", uid).maybeSingle(),
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false }),
          supabase.from("cards").select("*").eq("user_id", uid),
          supabase.from("savings_goals").select("*").eq("user_id", uid),
          supabase
            .from("notifications")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false }),
          supabase
            .from("beneficiaries")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false }),
        ]);

        if (resUser.error) console.error("resUser fetch error:", resUser.error);

        let userRecord = resUser.data;
        let balanceRecord = resBal.data;
        let settingsRecord = resSet.data;

        // Auto-recover disconnected auth users (if RLS blocked insert during sign up)
        if (!userRecord) {
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user) {
            const email = authData.user.email || "";
            const first = authData.user.user_metadata?.firstName || "Valued";
            const last = authData.user.user_metadata?.lastName || "Client";

            const profile: UserProfile = {
              uid: authData.user.id,
              firstName: first,
              lastName: last,
              email,
              accountNumber: Math.floor(
                1000000000 + Math.random() * 9000000000,
              ).toString(),
              routingNumber: "122105155",
              isVerified: false,
              isAdmin: email === "support@morningbrightfinance.com",
              isFrozen: false,
              isSuspended: false,
              biometricsEnabled: false,
              createdAt: new Date().toISOString(),
            };

            const balance: UserBalance = {
              uid: authData.user.id,
              checking: 0.0,
              savings: 0.0,
              updatedAt: new Date().toISOString(),
            };

            const settingsDoc: UserSecuritySettings = {
              uid: authData.user.id,
              faceIdEnabled: false,
              webAuthnConfigured: false,
              pushNotifications: true,
              emailStatements: true,
              twoFactorEnabled: false,
              theme: "light",
            };

            const mappedUser = mapUserToDb(profile);
            const ins1 = await supabase
              .from("users")
              .upsert(mappedUser)
              .maybeSingle();
            if (ins1.error)
              console.error("users auto-insert error:", ins1.error);

            const mappedBalance = mapBalanceToDb(balance);
            const ins2 = await supabase
              .from("balances")
              .upsert(mappedBalance)
              .maybeSingle();
            if (ins2.error)
              console.error("balances auto-insert error:", ins2.error);

            const mappedSettings = mapSettingsToDb(settingsDoc);
            const ins3 = await supabase
              .from("settings")
              .upsert(mappedSettings)
              .maybeSingle();
            if (ins3.error)
              console.error("settings auto-insert error:", ins3.error);

            // Re-fetch
            const u = await supabase
              .from("users")
              .select("*")
              .eq("id", uid)
              .maybeSingle();
            userRecord = u.data || mappedUser;
            const b = await supabase
              .from("balances")
              .select("*")
              .eq("uid", uid)
              .maybeSingle();
            balanceRecord = b.data || mappedBalance;
            const s = await supabase
              .from("settings")
              .select("*")
              .eq("uid", uid)
              .maybeSingle();
            settingsRecord = s.data || mappedSettings;

            // Re-fetch other data as well
            const recoveredTx = await supabase
              .from("transactions")
              .select("*")
              .eq("user_id", uid)
              .order("created_at", { ascending: false });
            if (recoveredTx.data) resTx.data = recoveredTx.data;
            const recoveredCards = await supabase
              .from("cards")
              .select("*")
              .eq("user_id", uid);
            if (recoveredCards.data) resCards.data = recoveredCards.data;
            const recoveredSavings = await supabase
              .from("savings_goals")
              .select("*")
              .eq("user_id", uid);
            if (recoveredSavings.data) resSavings.data = recoveredSavings.data;
            const recoveredNotifs = await supabase
              .from("notifications")
              .select("*")
              .eq("user_id", uid)
              .order("created_at", { ascending: false });
            if (recoveredNotifs.data) resNotifs.data = recoveredNotifs.data;
          }
        }

        if (userRecord) set({ user: mapUserFromDb(userRecord) });
        if (balanceRecord) set({ balance: mapBalanceFromDb(balanceRecord) });
        if (settingsRecord)
          set({ settings: mapSettingsFromDb(settingsRecord) });
        if (resTx.data)
          set({ transactions: resTx.data.map(mapTransactionFromDb) });
        if (resCards.data) set({ cards: resCards.data.map(mapCardFromDb) });
        if (resSavings.data)
          set({ savings: resSavings.data.map(mapSavingsFromDb) });
        if (resNotifs.data)
          set({ notifications: resNotifs.data.map(mapNotificationFromDb) });
        if (resBench.data)
          set({
            beneficiaries: resBench.data.map((b: any) => ({
              id: b.id,
              userId: b.user_id,
              name: b.name,
              email: b.email,
              createdAt: b.created_at,
            })),
          });

        set({ authChecked: true, loading: false });

        // Build continuous Postgres changes listener
        const channelName = `realtime_db_${uid}_${Date.now()}`;
        const mainChannel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "users",
              filter: `id=eq.${uid}`,
            },
            (payload) => {
              if (payload.eventType === "DELETE") {
                get().logOutUser();
              } else if (payload.new) {
                set({ user: mapUserFromDb(payload.new) });
              }
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "balances",
              filter: `uid=eq.${uid}`,
            },
            (payload) => {
              if (payload.new) {
                set({ balance: mapBalanceFromDb(payload.new) });
              }
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "settings",
              filter: `uid=eq.${uid}`,
            },
            (payload) => {
              if (payload.new) {
                set({ settings: mapSettingsFromDb(payload.new) });
              }
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "transactions",
              filter: `user_id=eq.${uid}`,
            },
            async () => {
              const { data } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", uid)
                .order("created_at", { ascending: false });
              if (data) set({ transactions: data.map(mapTransactionFromDb) });
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cards",
              filter: `user_id=eq.${uid}`,
            },
            async () => {
              const { data } = await supabase
                .from("cards")
                .select("*")
                .eq("user_id", uid);
              if (data) set({ cards: data.map(mapCardFromDb) });
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "savings_goals",
              filter: `user_id=eq.${uid}`,
            },
            async () => {
              const { data } = await supabase
                .from("savings_goals")
                .select("*")
                .eq("user_id", uid);
              if (data) set({ savings: data.map(mapSavingsFromDb) });
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${uid}`,
            },
            async (payload) => {
              if (payload.eventType === "INSERT") {
                const notif = mapNotificationFromDb(payload.new);
                toast.success(notif.message, {
                  icon: "🔔",
                  duration: 5000,
                  style: {
                    background: "#0f172a",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                  },
                });
              }
              const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", uid)
                .order("created_at", { ascending: false });
              if (data) set({ notifications: data.map(mapNotificationFromDb) });
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "beneficiaries",
              filter: `user_id=eq.${uid}`,
            },
            async () => {
              const { data } = await supabase
                .from("beneficiaries")
                .select("*")
                .eq("user_id", uid)
                .order("created_at", { ascending: false });
              if (data)
                set({
                  beneficiaries: data.map((b) => ({
                    id: b.id,
                    userId: b.user_id,
                    name: b.name,
                    email: b.email,
                    createdAt: b.created_at,
                  })),
                });
            },
          )
          .subscribe();

        const unsubFn = () => {
          mainChannel.unsubscribe();
        };

        set({ listeners: [unsubFn] });
      } catch (err: any) {
        set({
          loading: false,
          authChecked: true,
          errorMessage: err.message || "Network connection error",
        });
      }
    },

    // --- Core Financial Methods ---

    issueTransfer: async (recipientEmail, amount, memo) => {
      set({ loading: true, errorMessage: null });
      const currentBalance = get().balance;
      const userObj = get().user;

      if (!currentBalance || !userObj) {
        set({ loading: false, errorMessage: "Session state incomplete" });
        return;
      }

      if (userObj.isFrozen) {
        set({
          loading: false,
          errorMessage:
            "Account is frozen by administrators. Transfers declined.",
        });
        return;
      }

      if (currentBalance.checking < amount) {
        set({
          loading: false,
          errorMessage: "Insufficient funds in Checking Account",
        });
        return;
      }

      const txSent: BankTransaction = {
        id: "tx_s_" + Math.random().toString(36).substring(2, 10),
        userId: userObj.uid,
        amount,
        type: TransactionType.TRANSFER_SENT,
        category: "Transfers",
        merchant: memo || `Transfer to ${recipientEmail}`,
        recipientEmail,
        createdAt: new Date().toISOString(),
        status: TransactionStatus.COMPLETED,
      };

      const newChecking = currentBalance.checking - amount;

      // Real auth post via Supabase transactional entities updates
      try {
        // Post transaction record
        const { error: tErr } = await supabase.from("transactions").insert(mapTransactionToDb(txSent));
        if (tErr) throw tErr;

        // Deduct sender balance
        const { error: bErr } = await supabase.from("balances").update({
            checking: newChecking,
            updated_at: new Date().toISOString(),
          })
          .eq("uid", userObj.uid);
        if (bErr) throw bErr;

        // Post dispatch notification
        const notifId =
          "notif_dispatch_" + Math.random().toString(36).substring(2, 10);
        const notif: BankNotification = {
          id: notifId,
          userId: userObj.uid,
          title: "Transfer Dispatched",
          message: `Your wire of $${amount.toFixed(2)} to ${recipientEmail} has been securely authorized.`,
          isRead: false,
          type: "success",
          createdAt: new Date().toISOString(),
        };
        await supabase.from("notifications").insert(mapNotificationToDb(notif));

        // Inter-account relational trigger: find system user matching recipient email
        const { data: recipientUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", recipientEmail)
          .maybeSingle();
        if (recipientUser) {
          const rUid = recipientUser.id;

          // Get recipient balance record
          const { data: rBalData } = await supabase
            .from("balances")
            .select("*")
            .eq("uid", rUid)
            .maybeSingle();
          if (rBalData) {
            const currentRBal = mapBalanceFromDb(rBalData);
            const nextRChecking = currentRBal.checking + amount;

            // Increment recipient balance checking
            await supabase
              .from("balances")
              .update({
                checking: nextRChecking,
                updated_at: new Date().toISOString(),
              })
              .eq("uid", rUid);

            // Insert matching transaction incoming transaction
            const txReceived: BankTransaction = {
              id: "tx_r_" + Math.random().toString(36).substring(2, 10),
              userId: rUid,
              amount,
              type: TransactionType.TRANSFER_RECEIVED,
              category: "Transfers",
              merchant: `Inward wire from ${userObj.firstName} ${userObj.lastName}`,
              senderEmail: userObj.email,
              createdAt: new Date().toISOString(),
              status: TransactionStatus.COMPLETED,
            };
            const {error: txErr} = await supabase.from("transactions").insert(mapTransactionToDb(txReceived)); if (txErr) throw txErr;

            // Publish inward transfer notification
            const incomingNotifId =
              "notif_inc_" + Math.random().toString(36).substring(2, 10);
            const incomingNotif: BankNotification = {
              id: incomingNotifId,
              userId: rUid,
              title: "Wire Credits Cleared",
              message: `You received a matching wire of $${amount.toFixed(2)} from ${userObj.firstName} ${userObj.lastName}.`,
              isRead: false,
              type: "success",
              createdAt: new Date().toISOString(),
            };
            await supabase
              .from("notifications")
              .insert(mapNotificationToDb(incomingNotif));
          }
        }

        set({ loading: false });
      } catch (err: any) {
        set({
          loading: false,
          errorMessage: err.message || "Error transferring funds",
        });
      }
    },

    addFunds: async (amount, target) => {
      const curBal = get().balance;
      const u = get().user;
      if (!curBal || !u) return;

      const updatedVal =
        target === "checking"
          ? curBal.checking + amount
          : curBal.savings + amount;
      const newBalanceObj = {
        ...curBal,
        [target]: updatedVal,
        updatedAt: new Date().toISOString(),
      };

      const newTx: BankTransaction = {
        id: "tx_dep_" + Math.random().toString(36).substring(2, 10),
        userId: u.uid,
        amount,
        type: TransactionType.DEPOSIT,
        category: "Funding",
        merchant: "Self-External Wire Target",
        createdAt: new Date().toISOString(),
        status: TransactionStatus.COMPLETED,
      };

      try {
        await supabase
          .from("balances")
          .update({
            [target]: updatedVal,
            updated_at: new Date().toISOString(),
          })
          .eq("uid", u.uid);

        const {error: txErr} = await supabase.from("transactions").insert(mapTransactionToDb(newTx)); if (txErr) throw txErr;

        const notifId =
          "notif_dep_" + Math.random().toString(36).substring(2, 10);
        const notif: BankNotification = {
          id: notifId,
          userId: u.uid,
          title: "External Deposit Cleared",
          message: `Your self-wire funding of $${amount.toFixed(2)} into ${target} has cleared.`,
          isRead: false,
          type: "success",
          createdAt: new Date().toISOString(),
        };
        await supabase.from("notifications").insert(mapNotificationToDb(notif));
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    createCard: async (holder, cardType) => {
      const u = get().user;
      const bal = get().balance;
      if (!u || !bal) return;

      if (bal.checking < 50) {
        toast.error("Insufficient balance for $50 card initialization fee.");
        return;
      }

      const generateFullCard = () =>
        Array.from({ length: 4 }, () =>
          Math.floor(1000 + Math.random() * 9000)
            .toString()
            .padStart(4, "0"),
        ).join(" ");
      const newCard: VirtualCard = {
        id: "card_" + Math.random().toString(36).substring(2, 10),
        userId: u.uid,
        cardholderName: holder.toUpperCase(),
        cardNumber: generateFullCard(),
        expiryDate: `${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(new Date().getFullYear() + 6).substring(2)}`,
        cvv: String(Math.floor(100 + Math.random() * 900)).padStart(3, "0"),
        isFrozen: false,
        spendingLimit:
          cardType === "ebony"
            ? 50000
            : cardType === "platinum"
              ? 25000
              : 10000,
        spentThisMonth: 0,
        cardType: cardType as any,
        createdAt: new Date().toISOString(),
      };

      const txId = "tx_" + Math.random().toString(36).substring(2, 10);
      const feeTx: BankTransaction = {
        id: txId,
        userId: u.uid,
        amount: 50,
        type: TransactionType.CARD_SPEND,
        merchant: "Virtual Card Initialization Fee",
        category: "Card Provisioning",
        status: TransactionStatus.COMPLETED,
        createdAt: new Date().toISOString(),
      };

      try {
        const newChecking = bal.checking - 50;
        set({
           cards: [...get().cards, newCard],
           balance: { ...bal, checking: newChecking },
           transactions: [feeTx, ...get().transactions]
        });
        
        await supabase.from("cards").insert(mapCardToDb(newCard));
        await supabase.from("balances").update({ checking: newChecking, updated_at: new Date().toISOString() }).eq("uid", u.uid);
        await supabase.from("transactions").insert(mapTransactionToDb(feeTx));
      } catch (e) {
        // Rollback
        set({ 
           cards: get().cards.filter((c) => c.id !== newCard.id),
           balance: bal,
           transactions: get().transactions.filter(t => t.id !== txId)
        });
        toast.error((e as Error).message || "Operation failed"); throw e;
      }
    },

    deleteCard: async (cardId) => {
      const currentCards = get().cards;
      try {
        set({ cards: currentCards.filter((c) => c.id !== cardId) });
        await supabase.from("cards").delete().eq("id", cardId);
      } catch (e) {
        set({ cards: currentCards });
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    toggleCardFrozen: async (cardId) => {
      const targetCard = get().cards.find((c) => c.id === cardId);
      if (!targetCard) return;
      const nextFrozen = !targetCard.isFrozen;

      const currentCards = get().cards;
      try {
        set({
          cards: currentCards.map((c) =>
            c.id === cardId ? { ...c, isFrozen: nextFrozen } : c,
          ),
        });
        await supabase
          .from("cards")
          .update({ is_frozen: nextFrozen })
          .eq("id", cardId);
      } catch (e) {
        set({ cards: currentCards });
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    updateCardLimit: async (cardId, limit) => {
      const currentCards = get().cards;
      try {
        set({
          cards: currentCards.map((c) =>
            c.id === cardId ? { ...c, spendingLimit: limit } : c,
          ),
        });
        await supabase
          .from("cards")
          .update({ spending_limit: limit })
          .eq("id", cardId);
      } catch (e) {
        set({ cards: currentCards });
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    createSavingsGoal: async (title, target, color) => {
      const u = get().user;
      if (!u) return;

      const goal: SavingsGoal = {
        id: "goal_" + Math.random().toString(36).substring(2, 10),
        userId: u.uid,
        title,
        targetAmount: target,
        currentAmount: 0,
        autoSaveEnabled: false,
        autoSavePercentage: 5,
        color,
        createdAt: new Date().toISOString(),
      };

      try {
        await supabase.from("savings_goals").insert(mapSavingsToDb(goal));
      } catch (e) {
        handleSupabaseError(
          e,
          OperationType.CREATE,
          `savings_goals/${goal.id}`,
        );
      }
    },

    contributeToSavings: async (goalId, amount) => {
      const u = get().user;
      const b = get().balance;
      const targetGoal = get().savings.find((s) => s.id === goalId);
      if (!u || !b || !targetGoal) return;

      if (b.checking < amount) {
        set({
          errorMessage: "Insufficient funds in checking to transfer allocation",
        });
        return;
      }

      const nextGoalVal = targetGoal.currentAmount + amount;
      const nextChecking = b.checking - amount;
      const nextSavings = b.savings + amount;

      const newBalanceObj = {
        ...b,
        checking: nextChecking,
        savings: nextSavings,
        updatedAt: new Date().toISOString(),
      };

      const customTx: BankTransaction = {
        id: "tx_save_all_" + Math.random().toString(36).substring(2, 10),
        userId: u.uid,
        amount,
        type: TransactionType.WITHDRAWAL,
        category: "Savings Allocations",
        merchant: `Transfer to goal [${targetGoal.title}]`,
        createdAt: new Date().toISOString(),
        status: TransactionStatus.COMPLETED,
      };

      try {
        await supabase
          .from("savings_goals")
          .update({ current_amount: nextGoalVal })
          .eq("id", goalId);
        await supabase
          .from("balances")
          .update({
            checking: nextChecking,
            savings: nextSavings,
            updated_at: new Date().toISOString(),
          })
          .eq("uid", u.uid);
        const {error: txErr} = await supabase.from("transactions").insert(mapTransactionToDb(customTx)); if (txErr) throw txErr;
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    toggleGoalAutoSave: async (goalId, percentage) => {
      const u = get().user;
      const targetGoal = get().savings.find((s) => s.id === goalId);
      if (!u || !targetGoal) return;

      const nextAuto = !targetGoal.autoSaveEnabled;

      try {
        await supabase
          .from("savings_goals")
          .update({
            auto_save_enabled: nextAuto,
            auto_save_percentage: percentage,
          })
          .eq("id", goalId);
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    markNotificationAsRead: async (id) => {
      // Optimistic local update
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
      }));
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id);
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    updatePinCode: async (pin: string) => {
      const u = get().user;
      if (!u) return;

      try {
        await supabase.from("users").update({ pin_code: pin }).eq("id", u.uid);
        set({ user: { ...u, pinCode: pin }, errorMessage: null });
      } catch (e: any) {
        set({ errorMessage: e.message || "Error updating PIN" });
      }
    },

    updateProfile: async (first, last) => {
      const u = get().user;
      if (!u) return;

      try {
        await supabase
          .from("users")
          .update({
            first_name: first,
            last_name: last,
          })
          .eq("id", u.uid);
      } catch (e: any) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    updateCurrency: async (currency) => {
      const u = get().user;
      if (!u) return;
      try {
        await supabase.from("users").update({ currency }).eq("id", u.uid);
        set({ user: { ...u, currency } });
        toast.success(`Currency updated to ${currency}`);
      } catch (e: any) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    updatePasswordSecure: async (pass) => {
      set({ loading: true, errorMessage: null });

      try {
        const { error } = await supabase.auth.updateUser({ password: pass });
        if (error) throw error;
        set({ loading: false });
      } catch (e: any) {
        set({
          loading: false,
          errorMessage: e.message || "Error modifying database password",
        });
      }
    },

    updateSettingsToggle: async (key, val) => {
      const s = get().settings;
      if (!s) return;

      const nextSettings = { ...s, [key]: val };

      try {
        await supabase
          .from("settings")
          .update({ [mapSettingsToDb({ [key]: val } as any) as any]: val })
          .eq("uid", s.uid);

        // Generalize updating setting variables dynamically
        const dbKeyMapping: Record<string, string> = {
          faceIdEnabled: "face_id_enabled",
          webAuthnConfigured: "web_authn_configured",
          pushNotifications: "push_notifications",
          emailStatements: "email_statements",
          twoFactorEnabled: "two_factor_enabled",
          theme: "theme",
        };

        const dbCol = dbKeyMapping[key];
        if (dbCol) {
          await supabase
            .from("settings")
            .update({ [dbCol]: val })
            .eq("uid", s.uid);
        }
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    // --- ADMINISTRATIVE DASHBOARD CONTROLS ---

    adminLoadUsers: async () => {
      try {
        const { data, error } = await supabase.from("users").select("*");
        if (error) console.error("Admin Load Users error:", error);
        let list = data ? data.map(mapUserFromDb) : [];
        if (list.length === 0 && get().user) {
          list = [get().user];
        }
        set({ usersList: list });
      } catch (e) {
        console.error("Administrative profiles loader failed.", e);
        if (get().user) set({ usersList: [get().user] });
      }
    },

    adminEditBalance: async (userId, checking, savings) => {
      const adminMail = get().user?.email || "support@morningbrightfinance.com";
      const logId = "log_" + Math.random().toString(36).substring(2, 10);

      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || "admin_caller",
        adminEmail: adminMail,
        action: "EDIT_BALANCE",
        targetUserId: userId,
        details: `Updated assets balance: Checking $${checking.toFixed(2)}, Savings $${savings.toFixed(2)}`,
        timestamp: new Date().toISOString(),
      };

      try {
        const { error: balErr } = await supabase
          .from("balances")
          .update({
            checking,
            savings,
            updated_at: new Date().toISOString(),
          }).eq("uid", userId); 
        if (balErr) throw balErr;

        const {error: logErr} = await supabase.from("admin_logs").insert(mapLogToDb(log)); if (logErr) throw logErr;
        await get().adminLoadUsers();

        const notifId =
          "notif_adj_" + Math.random().toString(36).substring(2, 10);
        const notifObj: BankNotification = {
          id: notifId,
          userId,
          title: "Account Balance Adjusted",
          message: `Your balance balances have been administratively updated to Checking: $${checking.toFixed(2)}, Savings: $${savings.toFixed(2)}`,
          isRead: false,
          type: "alert",
          createdAt: new Date().toISOString(),
        };
        await supabase
          .from("notifications")
          .insert(mapNotificationToDb(notifObj));
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    adminAddSystemTransaction: async (
      userId,
      amount,
      type,
      merchant,
      category,
    ) => {
      const txId = "tx_adm_" + Math.random().toString(36).substring(2, 10);
      const logId = "log_" + Math.random().toString(36).substring(2, 10);

      const transaction: BankTransaction = {
        id: txId,
        userId,
        amount,
        type,
        category,
        merchant,
        createdAt: new Date().toISOString(),
        status: TransactionStatus.COMPLETED,
      };

      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || "admin_caller",
        adminEmail: get().user?.email || "support@morningbrightfinance.com",
        action: "INSERT_TRANSACTION",
        targetUserId: userId,
        details: `Injected transaction: $${amount.toFixed(2)} [${type}] at ${merchant}`,
        timestamp: new Date().toISOString(),
      };

      try {
        const { data: userBal, error: getBalErr } = await supabase.from("balances").select("*").eq("uid", userId).maybeSingle();
        if (getBalErr) throw getBalErr;

        let newChecking = userBal?.checking || 0;
        if (type === TransactionType.DEPOSIT || type === TransactionType.TRANSFER_RECEIVED) {
          newChecking += amount;
        } else if (type === TransactionType.WITHDRAWAL || type === TransactionType.TRANSFER_SENT || type === TransactionType.CARD_SPEND) {
          newChecking -= amount;
        }

        const { error: updBalErr } = await supabase.from("balances").update({ checking: newChecking, updated_at: new Date().toISOString() }).eq("uid", userId);
        if (updBalErr) throw updBalErr;

        const {error: txErr} = await supabase.from("transactions").insert(mapTransactionToDb(transaction)); if (txErr) throw txErr;
        const {error: logErr} = await supabase.from("admin_logs").insert(mapLogToDb(log)); if (logErr) throw logErr;
      } catch (e) {
        toast.error((e as Error).message || "Operation failed"); throw e;
      }
    },

    adminVerifyUser: async (userId, isVerified) => {
      const logId = "log_" + Math.random().toString(36).substring(2, 10);
      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || "admin_caller",
        adminEmail: get().user?.email || "support@morningbrightfinance.com",
        action: isVerified ? "VERIFY_USER" : "UNVERIFY_USER",
        targetUserId: userId,
        details: `${isVerified ? "Approved KYC" : "Revoked KYC"} for user`,
        timestamp: new Date().toISOString(),
      };

      try {
        const { error: usrErr } = await supabase
          .from("users")
          .update({ is_verified: isVerified }).eq("id", userId); 
        if (usrErr) throw usrErr;
        const {error: logErr} = await supabase.from("admin_logs").insert(mapLogToDb(log)); if (logErr) throw logErr;
        await get().adminLoadUsers();
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    adminFreezeUser: async (userId, frozen) => {
      const logId = "log_" + Math.random().toString(36).substring(2, 10);
      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || "admin_caller",
        adminEmail: get().user?.email || "support@morningbrightfinance.com",
        action: frozen ? "FREEZE_USER" : "UNFREEZE_USER",
        targetUserId: userId,
        details: `${frozen ? "Froze" : "Unfroze"} transactions channels and card capabilities`,
        timestamp: new Date().toISOString(),
      };

      try {
        const {error: usrErr} = await supabase.from("users").update({ is_frozen: frozen }).eq("id", userId); if (usrErr) throw usrErr;
        const {error: logErr} = await supabase.from("admin_logs").insert(mapLogToDb(log)); if (logErr) throw logErr;
        await get().adminLoadUsers();
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    adminSuspendUser: async (userId, suspended) => {
      const logId = "log_" + Math.random().toString(36).substring(2, 10);
      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || "admin_caller",
        adminEmail: get().user?.email || "support@morningbrightfinance.com",
        action: suspended ? "SUSPEND_USER" : "UNSUSPEND_USER",
        targetUserId: userId,
        details: `${suspended ? "Suspended" : "Reactivated"} user security token access`,
        timestamp: new Date().toISOString(),
      };

      try {
        const {error: usrErr} = await supabase.from("users").update({ is_suspended: suspended }).eq("id", userId); if (usrErr) throw usrErr;
        const {error: logErr} = await supabase.from("admin_logs").insert(mapLogToDb(log)); if (logErr) throw logErr;
        await get().adminLoadUsers();
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    adminPushSystemNotification: async (userId, title, message, type) => {
      const notifId =
        "notif_adm_" + Math.random().toString(36).substring(2, 10);
      const logId = "log_" + Math.random().toString(36).substring(2, 10);

      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || "admin_caller",
        adminEmail: get().user?.email || "support@morningbrightfinance.com",
        action: "PUSH_NOTIFICATION",
        targetUserId: userId,
        details: `Dispatched direct notify message: "${title}"`,
        timestamp: new Date().toISOString(),
      };

      const notif: BankNotification = {
        id: notifId,
        userId,
        title,
        message,
        isRead: false,
        type,
        createdAt: new Date().toISOString(),
      };

      try {
        await supabase.from("notifications").insert(mapNotificationToDb(notif));
        const {error: logErr} = await supabase.from("admin_logs").insert(mapLogToDb(log)); if (logErr) throw logErr;
      } catch (e) {
        handleSupabaseError(
          e,
          OperationType.CREATE,
          `notifications/${notifId}`,
        );
      }
    },

    adminBroadcastNotification: async (title, message, type) => {
      const logId = "log_" + Math.random().toString(36).substring(2, 10);

      const log: AdminLog = {
        id: logId,
        adminId: get().user?.uid || "admin_caller",
        adminEmail: get().user?.email || "support@morningbrightfinance.com",
        action: "BROADCAST_NOTIFICATION",
        targetUserId: "ALL_USERS",
        details: `Broadcast message: "${title}" to all users`,
        timestamp: new Date().toISOString(),
      };

      try {
        // Fetch all user IDs
        const { data: users, error } = await supabase
          .from("users")
          .select("id");
        if (error) throw error;

        if (users && users.length > 0) {
          const notifications = users.map((u) => ({
            id: "notif_adm_" + Math.random().toString(36).substring(2, 10),
            user_id: u.id,
            title,
            message,
            is_read: false,
            type,
            created_at: new Date().toISOString(),
          }));

          await supabase.from("notifications").insert(notifications);
        }
        const {error: logErr} = await supabase.from("admin_logs").insert(mapLogToDb(log)); if (logErr) throw logErr;
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    loadTickets: async () => {
      const { user } = get();
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", user.uid)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) {
          set({ tickets: data.map(mapTicketFromDb) });
        }
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    createTicket: async (subject, description, category, documentBase64) => {
      const { user } = get();
      if (!user) return;
      try {
        const payload = {
          user_id: user.uid,
          subject,
          description,
          category,
          document_base64: documentBase64 || null,
          status: "open",
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from("support_tickets")
          .insert(payload);
        if (error) throw error;
        await get().loadTickets();
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    adminLoadTickets: async () => {
      try {
        const { data, error } = await supabase
          .from("support_tickets")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) set({ adminTickets: data.map(mapTicketFromDb) });
      } catch (e) {
        console.error("Failed to load admin tickets", e);
      }
    },

    adminUpdateTicketStatus: async (ticketId, status) => {
      try {
        const { error } = await supabase
          .from("support_tickets")
          .update({ status })
          .eq("id", ticketId);
        if (error) throw error;
        await get().adminLoadTickets();
        const logId = "log_" + Math.random().toString(36).substring(2, 10);
        const log: AdminLog = {
          id: logId,
          adminId: get().user?.uid || "admin_caller",
          adminEmail: get().user?.email || "sys@admin",
          action: "TICKET_UPDATE",
          targetUserId: "system_ticket",
          details: `Updated ticket ${ticketId} to status ${status}`,
          timestamp: new Date().toISOString(),
        };
        const {error: logErr} = await supabase.from("admin_logs").insert(mapLogToDb(log)); if (logErr) throw logErr;
      } catch (e) {
        toast.error(e.message || "Operation failed"); throw e;
      }
    },

    adminLoadLogs: async () => {
      try {
        const { data, error } = await supabase
          .from("admin_logs")
          .select("*")
          .order("timestamp", { ascending: false });
        if (error) throw error;
        if (data) {
          set({ adminLogs: data.map(mapLogFromDb) });
        }

        // Subscribe to logs updates
        const logsChannel = supabase
          .channel(`admin_logs_realtime_${Date.now()}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "admin_logs" },
            async () => {
              const { data: fresh } = await supabase
                .from("admin_logs")
                .select("*")
                .order("timestamp", { ascending: false });
              if (fresh) {
                set({ adminLogs: fresh.map(mapLogFromDb) });
              }
            },
          )
          .subscribe();

        const unsubFn = () => {
          logsChannel.unsubscribe();
        };

        set({ listeners: [...get().listeners, unsubFn] });
      } catch (e) {
        console.error("Administrative auditing records loading rejected.", e);
      }
    },
  };
});
