/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TransactionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER_SENT = 'transfer_sent',
  TRANSFER_RECEIVED = 'transfer_received',
  CARD_SPEND = 'card_spend',
}

export interface BankTransaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  merchant: string;
  recipientEmail?: string;
  senderEmail?: string;
  createdAt: string; // ISO String or Timestamp
  status: TransactionStatus;
}

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  accountNumber?: string;
  routingNumber?: string;
  pinCode?: string;
  isVerified: boolean;
  isAdmin: boolean;
  isFrozen: boolean;
  isSuspended: boolean;
  biometricsEnabled: boolean;
  createdAt: string;
}

export interface UserBalance {
  uid: string;
  checking: number;
  savings: number;
  invested?: number;
  updatedAt: string;
}

export interface VirtualCard {
  id: string;
  userId: string;
  cardholderName: string;
  cardNumber: string; // Masked or masked-retrieve
  expiryDate: string;
  cvv: string;
  isFrozen: boolean;
  spendingLimit: number;
  spentThisMonth: number;
  cardType: 'platinum' | 'ebony' | 'emerald';
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  autoSaveEnabled: boolean;
  autoSavePercentage: number; // e.g., 5% rounded up or fixed allocation
  color: string;
  createdAt: string;
}

export interface BankNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'info' | 'alert' | 'success' | 'system';
  createdAt: string;
}

export interface UserSecuritySettings {
  uid: string;
  faceIdEnabled: boolean;
  webAuthnConfigured: boolean;
  pushNotifications: boolean;
  emailStatements: boolean;
  twoFactorEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUserId: string;
  details: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  documentBase64?: string | null;
  createdAt: string;
}

export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}
