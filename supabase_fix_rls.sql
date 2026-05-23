-- 1. Create a security definer function to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop the broken recursive policies on users
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update user states" ON public.users;
DROP POLICY IF EXISTS "Admins can delete any user" ON public.users;

-- 3. Recreate the admin policies on users using the secure function
CREATE POLICY "Admins can select all profiles" ON public.users FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can update user states" ON public.users FOR UPDATE USING ( public.get_is_admin() );
CREATE POLICY "Admins can delete any user" ON public.users FOR DELETE USING ( public.get_is_admin() );

-- 4. Update the Balances table policies
DROP POLICY IF EXISTS "Admins can query all balance sheets" ON public.balances;
DROP POLICY IF EXISTS "Admins can update balances" ON public.balances;
DROP POLICY IF EXISTS "Admins can delete balances" ON public.balances;
CREATE POLICY "Admins can query all balance sheets" ON public.balances FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can update balances" ON public.balances FOR UPDATE USING ( public.get_is_admin() );
CREATE POLICY "Admins can delete balances" ON public.balances FOR DELETE USING ( public.get_is_admin() );

-- 5. Update the Transactions table policies
DROP POLICY IF EXISTS "Admins can query all transaction records" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert log adjustments" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;
CREATE POLICY "Admins can query all transaction records" ON public.transactions FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can insert log adjustments" ON public.transactions FOR INSERT WITH CHECK ( public.get_is_admin() );
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE USING ( public.get_is_admin() );
CREATE POLICY "Admins can delete transactions" ON public.transactions FOR DELETE USING ( public.get_is_admin() );

-- 6. Update the Admin Logs table policies
DROP POLICY IF EXISTS "Admins can query audit trail history" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can chronicle events" ON public.admin_logs;
CREATE POLICY "Admins can query audit trail history" ON public.admin_logs FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can chronicle events" ON public.admin_logs FOR INSERT WITH CHECK ( public.get_is_admin() );

-- 7. Update System notifications injection policy
DROP POLICY IF EXISTS "System notifications injection" ON public.notifications;
CREATE POLICY "System notifications injection" 
    ON public.notifications FOR INSERT 
    WITH CHECK (
        public.get_is_admin() or auth.uid() = user_id
    );
