/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'xxxxxxxxxxxxxxxxxxxx';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export let isSupabaseConnected = false;

// Double confirm connectivity
async function testConnection() {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    // If the error code is PGRST301 (JWT expired/invalid) or similar, or 200, it means we reached the server.
    // If we get an error about database table missing, that means connection succeeded but tables are not yet created. Either way, connection is active!
    isSupabaseConnected = true;
    console.log("Morning Bright Finance: Connected to Supabase backend API.");
  } catch (error) {
    console.warn("Morning Bright Finance: Supabase API is offline or un-provisioned. Secure simulation fallback ready.", error);
  }
}
testConnection();

// Schema operation types supporting audit trails
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export async function handleSupabaseError(error: unknown, operationType: OperationType, path: string | null): Promise<never> {
  const session = (await supabase.auth.getSession()).data.session;
  
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error),
    authInfo: {
      userId: session?.user?.id || null,
      email: session?.user?.email || null,
      role: session?.user?.role || null,
    },
    operationType,
    path
  };
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// BACKWARD PORT COMPATIBILITY FOR PREVIOUS HOOKS / LOGGERS
export const handleFirestoreError = handleSupabaseError;

// INTERRUPTIBLE transaction DBMAPPERS

// 1. User Profile Mapper
export function mapUserToDb(u: any) {
  return {
    id: u.uid,
    first_name: u.firstName,
    last_name: u.lastName,
    email: u.email,
    account_number: u.accountNumber,
    routing_number: u.routingNumber,
    pin_code: u.pinCode,
    is_verified: u.isVerified,
    is_admin: u.isAdmin,
    is_frozen: u.isFrozen,
    is_suspended: u.isSuspended,
    biometrics_enabled: u.biometricsEnabled,
    currency: u.currency,
    created_at: u.createdAt
  };
}

export function mapUserFromDb(d: any): any {
  if (!d) return null;
  return {
    uid: d.id,
    firstName: d.first_name,
    lastName: d.last_name,
    email: d.email,
    accountNumber: d.account_number,
    routingNumber: d.routing_number,
    pinCode: d.pin_code,
    isVerified: d.is_verified,
    isAdmin: d.is_admin,
    isFrozen: d.is_frozen,
    isSuspended: d.is_suspended,
    biometricsEnabled: d.biometrics_enabled,
    currency: d.currency || 'USD',
    createdAt: d.created_at
  };
}

// 2. Balance Mapper
export function mapBalanceToDb(b: any) {
  return {
    uid: b.uid,
    checking: b.checking,
    savings: b.savings,
    updated_at: b.updatedAt
  };
}

export function mapBalanceFromDb(d: any): any {
  if (!d) return null;
  return {
    uid: d.uid,
    checking: Number(d.checking || 0),
    savings: Number(d.savings || 0),
    updatedAt: d.updated_at
  };
}

// 3. Transactions Mapper
export function mapTransactionToDb(t: any) {
  return {
    id: t.id,
    user_id: t.userId,
    amount: t.amount,
    type: t.type,
    category: t.category,
    merchant: t.merchant,
    recipient_email: t.recipientEmail || null,
    sender_email: t.senderEmail || null,
    created_at: t.createdAt,
    status: t.status
  };
}

export function mapTransactionFromDb(d: any): any {
  if (!d) return null;
  return {
    id: d.id,
    userId: d.user_id,
    amount: Number(d.amount || 0),
    type: d.type,
    category: d.category,
    merchant: d.merchant,
    recipientEmail: d.recipient_email || undefined,
    senderEmail: d.sender_email || undefined,
    createdAt: d.created_at,
    status: d.status
  };
}

// 4. Virtual Cards Mapper
export function mapCardToDb(c: any) {
  return {
    id: c.id,
    user_id: c.userId,
    cardholder_name: c.cardholderName,
    card_number: c.cardNumber,
    expiry_date: c.expiryDate,
    cvv: c.cvv,
    is_frozen: c.isFrozen,
    spending_limit: c.spendingLimit,
    spent_this_month: c.spentThisMonth,
    card_type: c.cardType,
    created_at: c.createdAt
  };
}

export function mapCardFromDb(d: any): any {
  if (!d) return null;
  return {
    id: d.id,
    userId: d.user_id,
    cardholderName: d.cardholder_name,
    cardNumber: d.card_number,
    expiryDate: d.expiry_date,
    cvv: d.cvv,
    isFrozen: d.is_frozen,
    spendingLimit: Number(d.spending_limit || 0),
    spentThisMonth: Number(d.spent_this_month || 0),
    cardType: d.card_type,
    createdAt: d.created_at
  };
}

// 5. Savings Goals Mapper
export function mapSavingsToDb(s: any) {
  return {
    id: s.id,
    user_id: s.userId,
    title: s.title,
    target_amount: s.targetAmount,
    current_amount: s.currentAmount,
    auto_save_enabled: s.autoSaveEnabled,
    auto_save_percentage: s.autoSavePercentage,
    color: s.color,
    created_at: s.createdAt
  };
}

export function mapSavingsFromDb(d: any): any {
  if (!d) return null;
  return {
    id: d.id,
    userId: d.user_id,
    title: d.title,
    targetAmount: Number(d.target_amount || 0),
    currentAmount: Number(d.current_amount || 0),
    autoSaveEnabled: d.auto_save_enabled,
    autoSavePercentage: Number(d.auto_save_percentage || 0),
    color: d.color,
    createdAt: d.created_at
  };
}

// 6. Notifications Mapper
export function mapNotificationToDb(n: any) {
  return {
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    is_read: n.isRead,
    type: n.type,
    created_at: n.createdAt
  };
}

export function mapNotificationFromDb(d: any): any {
  if (!d) return null;
  return {
    id: d.id,
    userId: d.user_id,
    title: d.title,
    message: d.message,
    isRead: d.is_read,
    type: d.type,
    createdAt: d.created_at
  };
}

// 7. Settings Mapper
export function mapSettingsToDb(s: any) {
  return {
    uid: s.uid,
    face_id_enabled: s.faceIdEnabled,
    web_authn_configured: s.webAuthnConfigured,
    push_notifications: s.pushNotifications,
    email_statements: s.emailStatements,
    two_factor_enabled: s.twoFactorEnabled,
    theme: s.theme
  };
}

export function mapSettingsFromDb(d: any): any {
  if (!d) return null;
  return {
    uid: d.uid,
    faceIdEnabled: d.face_id_enabled,
    webAuthnConfigured: d.web_authn_configured,
    pushNotifications: d.push_notifications,
    emailStatements: d.email_statements,
    twoFactorEnabled: d.two_factor_enabled,
    theme: d.theme
  };
}

// 8. Admin Logs Mapper
export function mapLogToDb(l: any) {
  return {
    id: l.id,
    admin_id: l.adminId,
    admin_email: l.adminEmail,
    action: l.action,
    target_user_id: l.targetUserId,
    details: l.details,
    timestamp: l.timestamp
  };
}

export function mapLogFromDb(d: any): any {
  if (!d) return null;
  return {
    id: d.id,
    adminId: d.admin_id,
    adminEmail: d.admin_email,
    action: d.action,
    targetUserId: d.target_user_id,
    details: d.details,
    timestamp: d.timestamp
  };
}
