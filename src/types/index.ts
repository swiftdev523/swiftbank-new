// Type definitions for the application

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  accounts?: Account[];
  profile?: UserProfile;
}

export type UserRole = 'admin' | 'customer' | 'manager' | 'support';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: Address;
  dateOfBirth?: string;
  preferredLanguage?: string;
  notifications?: NotificationPreferences;
}

// Account Types
export interface Account {
  accountNumber: string;
  type: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  lastActivity?: string;
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment';

export type AccountStatus = 'active' | 'inactive' | 'frozen' | 'closed';

// Transaction Types
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: TransactionStatus;
  fromAccount?: string;
  toAccount?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

// Authentication Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Permission Types
export type Permission = 
  | 'account_view'
  | 'account_edit'
  | 'transaction_create'
  | 'transaction_approve'
  | 'user_manage'
  | 'admin_panel'
  | '*';

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// Common Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Error {
  type: string;
  message: string;
  details?: Record<string, any>;
}

// Context Types
export interface AppContextState {
  auth: AuthState;
  loading: LoadingState;
  notifications: Notification[];
}

export interface LoadingState {
  [key: string]: boolean;
}

// Firebase Types (to be expanded when implementing Firebase)
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}