-- 1. Ensure both accounts are registered internally as admin
UPDATE public.users 
SET is_admin = true 
WHERE email IN ('support@morningbrightfinance.com', 'adereraadenike@gmail.com');

-- 2. Re-create get_is_admin function to completely bypass recursive table querying. 
-- It now checks the signed JWT token of the current session directly. 
CREATE OR REPLACE FUNCTION public.get_is_admin()
RETURNS boolean AS $$
DECLARE 
    current_email text;
BEGIN
    current_email := current_setting('request.jwt.claims', true)::json->>'email';
    -- Grant explicit true admin to BOTH support and your personal email
    IF current_email IN ('support@morningbrightfinance.com', 'adereraadenike@gmail.com') THEN
        RETURN true;
    END IF;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Un-restrict ALL admin policies replacing them with the JWT based function

-- Users
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update user states" ON public.users;
DROP POLICY IF EXISTS "Admins can delete any user" ON public.users;
CREATE POLICY "Admins can select all profiles" ON public.users FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can update user states" ON public.users FOR UPDATE USING ( public.get_is_admin() );
CREATE POLICY "Admins can delete any user" ON public.users FOR DELETE USING ( public.get_is_admin() );

-- Balances
DROP POLICY IF EXISTS "Admins can query all balance sheets" ON public.balances;
DROP POLICY IF EXISTS "Admins can update balances" ON public.balances;
DROP POLICY IF EXISTS "Admins can delete balances" ON public.balances;
CREATE POLICY "Admins can query all balance sheets" ON public.balances FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can update balances" ON public.balances FOR UPDATE USING ( public.get_is_admin() );
CREATE POLICY "Admins can delete balances" ON public.balances FOR DELETE USING ( public.get_is_admin() );

-- Transactions
DROP POLICY IF EXISTS "Admins can query all transaction records" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert log adjustments" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;
CREATE POLICY "Admins can query all transaction records" ON public.transactions FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can insert log adjustments" ON public.transactions FOR INSERT WITH CHECK ( public.get_is_admin() );
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE USING ( public.get_is_admin() );
CREATE POLICY "Admins can delete transactions" ON public.transactions FOR DELETE USING ( public.get_is_admin() );

-- Notifications
DROP POLICY IF EXISTS "Admins can see all notifications" ON public.notifications;
DROP POLICY IF EXISTS "System notifications injection" ON public.notifications;
CREATE POLICY "Admins can see all notifications" ON public.notifications FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "System notifications injection" ON public.notifications FOR INSERT WITH CHECK ( public.get_is_admin() or auth.uid() = user_id );

-- Support Tickets
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE USING ( public.get_is_admin() );

-- Settings
DROP POLICY IF EXISTS "Admins can query all settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
CREATE POLICY "Admins can query all settings" ON public.settings FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE USING ( public.get_is_admin() );
