-- 1. Create a secure master system function to verify admin claims
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT is_admin FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Expand Policy for Users Schema
DROP POLICY IF EXISTS "Users can select own data or admin can view all" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data or admin" ON public.users;
DROP POLICY IF EXISTS "Users can update own data or admin" ON public.users;

CREATE POLICY "Users can select own data or admin can view all"
ON public.users FOR SELECT USING (
  auth.uid() = id OR public.is_admin()
);

CREATE POLICY "Users can insert own data or admin"
ON public.users FOR INSERT WITH CHECK (
  auth.uid() = id OR public.is_admin()
);

CREATE POLICY "Users can update own data or admin"
ON public.users FOR UPDATE USING (
  auth.uid() = id OR public.is_admin()
);

CREATE POLICY "Admin can delete users"
ON public.users FOR DELETE USING (
  public.is_admin()
);

-- 3. Expand Policy for Balances Schema
DROP POLICY IF EXISTS "Users can read own balances or admin can view all" ON public.balances;
DROP POLICY IF EXISTS "Users can insert own balances or admin" ON public.balances;
DROP POLICY IF EXISTS "Users can update own balances or admin" ON public.balances;

CREATE POLICY "Users can read own balances or admin can view all"
ON public.balances FOR SELECT USING (
  auth.uid() = uid OR public.is_admin()
);

CREATE POLICY "Users can insert own balances or admin"
ON public.balances FOR INSERT WITH CHECK (
  auth.uid() = uid OR public.is_admin()
);

CREATE POLICY "Users can update own balances or admin"
ON public.balances FOR UPDATE USING (
  auth.uid() = uid OR public.is_admin()
);

CREATE POLICY "Admin can delete balances"
ON public.balances FOR DELETE USING (
  public.is_admin()
);

-- 4. Expand Policy for Transactions Schema
DROP POLICY IF EXISTS "Users can view own transactions or admin can view all" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions or admin" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions or admin" ON public.transactions;

CREATE POLICY "Users can view own transactions or admin can view all"
ON public.transactions FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Users can insert own transactions or admin"
ON public.transactions FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Users can update own transactions or admin"
ON public.transactions FOR UPDATE USING (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Admin can delete transactions"
ON public.transactions FOR DELETE USING (
  public.is_admin()
);

-- 5. Expand Policy for Support Tickets
DROP POLICY IF EXISTS "Users can read own tickets or admin can view all" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets or admin" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets or admin" ON public.support_tickets;

CREATE POLICY "Users can read own tickets or admin can view all"
ON public.support_tickets FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Users can insert own tickets or admin"
ON public.support_tickets FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Users can update own tickets or admin"
ON public.support_tickets FOR UPDATE USING (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Admin can delete tickets"
ON public.support_tickets FOR DELETE USING (
  public.is_admin()
);

-- 6. Expand Policy for Cards Schema
DROP POLICY IF EXISTS "Users can read own cards or admin can view all" ON public.cards;
DROP POLICY IF EXISTS "Users can insert own cards or admin" ON public.cards;
DROP POLICY IF EXISTS "Users can update own cards or admin" ON public.cards;

CREATE POLICY "Users can read own cards or admin can view all"
ON public.cards FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Users can insert own cards or admin"
ON public.cards FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Users can update own cards or admin"
ON public.cards FOR UPDATE USING (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Admin can delete cards"
ON public.cards FOR DELETE USING (
  public.is_admin()
);
