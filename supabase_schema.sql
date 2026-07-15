-- Full Database Schema & RLS Policies for Morning Bright Finance
-- Includes multi-currency support and resolves the infinite recursion issue.

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create or Update Tables

-- USERS
CREATE TABLE IF NOT EXISTS public.users (
  id uuid references auth.users not null primary key,
  first_name text,
  last_name text,
  email text not null,
  account_number text,
  routing_number text,
  pin_code text,
  is_verified boolean default false,
  is_admin boolean default false,
  is_frozen boolean default false,
  is_suspended boolean default false,
  biometrics_enabled boolean default false,
  currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ADD CURRENCY IF IT DOESN'T EXIST
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'currency') THEN
        ALTER TABLE public.users ADD COLUMN currency text default 'USD';
    END IF;
END $$;

-- BALANCES
CREATE TABLE IF NOT EXISTS public.balances (
  uid uuid references public.users(id) not null primary key,
  checking numeric default 0,
  savings numeric default 0,
  invested numeric default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id text primary key,
  user_id uuid references public.users(id) not null,
  amount numeric not null,
  type text not null,
  category text,
  merchant text,
  recipient_email text,
  sender_email text,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CARDS
CREATE TABLE IF NOT EXISTS public.cards (
  id text primary key,
  user_id uuid references public.users(id) not null,
  card_number text not null,
  expiry text not null,
  cvv text not null,
  card_type text not null,
  is_frozen boolean default false,
  daily_limit numeric default 5000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SAVINGS GOALS
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id text primary key,
  user_id uuid references public.users(id) not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id text primary key,
  user_id uuid references public.users(id) not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id text primary key,
  user_id uuid references public.users(id) not null,
  subject text not null,
  message text not null,
  status text default 'open',
  category text,
  document_base64 text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  uid uuid references public.users(id) not null primary key,
  theme text default 'light',
  notifications_enabled boolean default true,
  two_factor_enabled boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ADMIN LOGS
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id text primary key,
  admin_id uuid not null,
  target_user_id uuid,
  action text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BENEFICIARIES
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id text primary key,
  user_id uuid references public.users(id) not null,
  name text not null,
  account_number text not null,
  routing_number text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;


-- 4. FIX INFINITE RECURSION BY USING JWT CLAIMS
-- By checking the JWT email directly, we don't query the users table and eliminate the recursive loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email' = 'support@morningbrightfinance.com',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. APPLY POLICIES

-- Users
DROP POLICY IF EXISTS "Users can select own data or admin can view all" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data or admin" ON public.users;
DROP POLICY IF EXISTS "Users can update own data or admin" ON public.users;

CREATE POLICY "Users can select own data or admin can view all"
ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own data or admin"
ON public.users FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own data or admin"
ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Balances
DROP POLICY IF EXISTS "Users can read own balances or admin can view all" ON public.balances;
DROP POLICY IF EXISTS "Users can insert own balances or admin" ON public.balances;
DROP POLICY IF EXISTS "Users can update own balances or admin" ON public.balances;

CREATE POLICY "Users can read own balances or admin can view all"
ON public.balances FOR SELECT USING (auth.uid() = uid OR public.is_admin());

CREATE POLICY "Users can insert own balances or admin"
ON public.balances FOR INSERT WITH CHECK (auth.uid() = uid OR public.is_admin());

CREATE POLICY "Users can update own balances or admin"
ON public.balances FOR UPDATE USING (auth.uid() = uid OR public.is_admin());

-- Transactions
DROP POLICY IF EXISTS "Users can view own transactions or admin can view all" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions or admin" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions or admin" ON public.transactions;

CREATE POLICY "Users can view own transactions or admin can view all"
ON public.transactions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own transactions or admin"
ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own transactions or admin"
ON public.transactions FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Cards
DROP POLICY IF EXISTS "Users can view own cards or admin" ON public.cards;
DROP POLICY IF EXISTS "Users can insert own cards or admin" ON public.cards;
DROP POLICY IF EXISTS "Users can update own cards or admin" ON public.cards;

CREATE POLICY "Users can view own cards or admin"
ON public.cards FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own cards or admin"
ON public.cards FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own cards or admin"
ON public.cards FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Savings Goals
DROP POLICY IF EXISTS "Users can view own goals or admin" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can insert own goals or admin" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can update own goals or admin" ON public.savings_goals;

CREATE POLICY "Users can view own goals or admin"
ON public.savings_goals FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own goals or admin"
ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own goals or admin"
ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications or admin" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications or admin" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications or admin" ON public.notifications;

CREATE POLICY "Users can view own notifications or admin"
ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own notifications or admin"
ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own notifications or admin"
ON public.notifications FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Support Tickets
DROP POLICY IF EXISTS "Users can read own tickets or admin can view all" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets or admin" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets or admin" ON public.support_tickets;

CREATE POLICY "Users can read own tickets or admin can view all"
ON public.support_tickets FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own tickets or admin"
ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own tickets or admin"
ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Settings
DROP POLICY IF EXISTS "Users can view own settings or admin" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings or admin" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings or admin" ON public.settings;

CREATE POLICY "Users can view own settings or admin"
ON public.settings FOR SELECT USING (auth.uid() = uid OR public.is_admin());

CREATE POLICY "Users can insert own settings or admin"
ON public.settings FOR INSERT WITH CHECK (auth.uid() = uid OR public.is_admin());

CREATE POLICY "Users can update own settings or admin"
ON public.settings FOR UPDATE USING (auth.uid() = uid OR public.is_admin());

-- Admin Logs (Admin Only)
DROP POLICY IF EXISTS "Admin can view logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admin can insert logs" ON public.admin_logs;

CREATE POLICY "Admin can view logs"
ON public.admin_logs FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can insert logs"
ON public.admin_logs FOR INSERT WITH CHECK (public.is_admin());

-- Beneficiaries
DROP POLICY IF EXISTS "Users can view own beneficiaries or admin" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can insert own beneficiaries or admin" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can update own beneficiaries or admin" ON public.beneficiaries;

CREATE POLICY "Users can view own beneficiaries or admin"
ON public.beneficiaries FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own beneficiaries or admin"
ON public.beneficiaries FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own beneficiaries or admin"
ON public.beneficiaries FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
