-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR TO FIX RLS AND ADD SUPPORT TABLES

-- 1. Create a secure function to check admin status (solves the infinite recursion issue)
CREATE OR REPLACE FUNCTION public.get_is_admin()
RETURNS boolean AS $$
DECLARE
    is_adm boolean;
BEGIN
    SELECT is_admin INTO is_adm FROM public.users WHERE id = auth.uid();
    RETURN coalesce(is_adm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the broken recursive policies on users
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update user states" ON public.users;
DROP POLICY IF EXISTS "Admins can delete any user" ON public.users;

-- 3. Recreate the admin policies on users
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

-- 8. Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    subject text not null,
    description text not null,
    status text default 'open' not null,
    category text not null,
    document_base64 text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
CREATE POLICY "Users can create their own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING (public.get_is_admin());
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE USING (public.get_is_admin());

-- Add to Realtime
alter publication supabase_realtime add table public.support_tickets;
