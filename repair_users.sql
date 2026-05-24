-- Run this in Supabase SQL Editor
-- This will find any accounts in auth.users that failed to create proper banking profiles 
-- (due to the email verification early return) and provision them properly.

INSERT INTO public.users (id, first_name, last_name, email, account_number, routing_number, is_verified, is_admin, created_at)
SELECT 
  id, 
  coalesce(raw_user_meta_data->>'firstName', 'Valued'), 
  coalesce(raw_user_meta_data->>'lastName', 'Client'), 
  email, 
  floor(1000000000 + random() * 9000000000)::text,
  '122105155',
  false,
  false,
  now()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- Give them zero balances
INSERT INTO public.balances (uid, checking, savings)
SELECT id, 0, 0
FROM auth.users
WHERE id NOT IN (SELECT uid FROM public.balances);

-- Give them default settings
INSERT INTO public.settings (uid, theme, push_notifications, email_statements, face_id_enabled, web_authn_configured, two_factor_enabled)
SELECT id, 'light', true, true, false, false, false
FROM auth.users
WHERE id NOT IN (SELECT uid FROM public.settings);
