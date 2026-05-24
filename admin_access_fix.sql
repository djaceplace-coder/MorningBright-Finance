-- RUN THIS IN SUPABASE SQL EDITOR TO FIX EVERYTHING FOREVER

-- 1. Make your personal email and the support email both admins permanently
UPDATE public.users 
SET is_admin = true 
WHERE email IN ('support@morningbrightfinance.com', 'adereraadenike@gmail.com');

-- 2. We will change the get_is_admin function to not even query the users table,
-- which completely eliminates the recursion/missing user problem. It will check the jwt token directly!
CREATE OR REPLACE FUNCTION public.get_is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email') IN ('support@morningbrightfinance.com', 'adereraadenike@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-apply the secure bypass policies (just in case they were reverted)
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update user states" ON public.users;
CREATE POLICY "Admins can select all profiles" ON public.users FOR SELECT USING ( public.get_is_admin() );
CREATE POLICY "Admins can update user states" ON public.users FOR UPDATE USING ( public.get_is_admin() );
