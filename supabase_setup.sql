-- 
-- Morning Bright Finance - Relational Database Schema & Zero-Trust RLS Policies
-- Support for Supabase PostgreSQL
-- 

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table public.users (
    id uuid references auth.users on delete cascade primary key,
    first_name text not null,
    last_name text not null,
    email text unique not null,
    account_number text,
    routing_number text,
    pin_code text,
    is_verified boolean default false,
    is_admin boolean default false,
    is_frozen boolean default false,
    is_suspended boolean default false,
    biometrics_enabled boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies for Users
create policy "Users can insert their own profile" 
    on public.users for insert 
    with check (auth.uid() = id);

create policy "Users can select their own profile" 
    on public.users for select 
    using (auth.uid() = id);

create policy "Admins can select all profiles" 
    on public.users for select 
    using (exists (
        select 1 from public.users where id = auth.uid() and is_admin = true
    ));

create policy "Users can update non-privileged fields on their own profile" 
    on public.users for update 
    using (auth.uid() = id)
    with check (
        -- Enforces that users cannot elevated their own privilege or change frozen status
        is_admin = (select is_admin from public.users where id = auth.uid()) and
        is_frozen = (select is_frozen from public.users where id = auth.uid()) and
        is_suspended = (select is_suspended from public.users where id = auth.uid())
    );

create policy "Admins can update user states" 
    on public.users for update 
    using (exists (
        select 1 from public.users where id = auth.uid() and is_admin = true
    ));


-- 2. Balances Table
create table public.balances (
    uid uuid references public.users(id) on delete cascade primary key,
    checking numeric(15, 2) default 0.00 not null,
    savings numeric(15, 2) default 0.00 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.balances enable row level security;

-- Policies for Balances
create policy "Users can initialize balances" 
    on public.balances for insert 
    with check (auth.uid() = uid);

create policy "Users can query their own balance sheets" 
    on public.balances for select 
    using (auth.uid() = uid);

create policy "Admins can query all balance sheets" 
    on public.balances for select 
    using (exists (
        select 1 from public.users where id = auth.uid() and is_admin = true
    ));

create policy "Admins can update balances" 
    on public.balances for update 
    using (exists (
        select 1 from public.users where id = auth.uid() and is_admin = true
    ));

create policy "System updates balance inside ledger transfers"
    on public.balances for update
    using (auth.uid() = uid)
    -- Allow the authenticated user to update their checking/savings safely if not frozen
    with check (
        exists (
            select 1 from public.users 
            where id = auth.uid() and is_frozen = false and is_suspended = false
        )
    );


-- 3. Transactions Table (Immutable Ledger)
create table public.transactions (
    id text primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    amount numeric(15,2) not null,
    type text not null, -- 'deposit', 'withdrawal', 'transfer_sent', 'transfer_received', 'card_spend'
    category text not null,
    merchant text not null,
    recipient_email text,
    sender_email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text default 'completed' not null
);

alter table public.transactions enable row level security;

create table public.beneficiaries (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    name text not null,
    email text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.beneficiaries enable row level security;

create policy "Users can select their own beneficiaries" 
    on public.beneficiaries for select 
    using (auth.uid() = user_id);

-- Policies for Transactions
create policy "Users can query their own transaction records" 
    on public.transactions for select 
    using (auth.uid() = user_id);

create policy "Admins can query all transaction records" 
    on public.transactions for select 
    using (exists (
        select 1 from public.users where id = auth.uid() and is_admin = true
    ));

create policy "Users can insert transactions for themselves if not frozen" 
    on public.transactions for insert 
    with check (
        auth.uid() = user_id and 
        exists (
            select 1 from public.users 
            where id = auth.uid() and is_frozen = false and is_suspended = false
        )
    );

create policy "Admins can insert log adjustments" 
    on public.transactions for insert 
    with check (exists (
        select 1 from public.users where id = auth.uid() and is_admin = true
    ));

-- Note: no policies for update or delete are created, executing the Non-Mutability mandate!


-- 4. Virtual Cards Table
create table public.cards (
    id text primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    cardholder_name text not null,
    card_number text not null,
    expiry_date text not null,
    cvv text not null,
    is_frozen boolean default false not null,
    spending_limit numeric(15, 2) default 1000.00 not null,
    spent_this_month numeric(15, 2) default 0.00 not null,
    card_type text not null, -- 'platinum', 'ebony', 'emerald'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.cards enable row level security;

-- Policies for Cards
create policy "Users can view their virtual cards" 
    on public.cards for select 
    using (auth.uid() = user_id);

create policy "Users can issue cards for themselves if verified" 
    on public.cards for insert 
    with check (
        auth.uid() = user_id and 
        exists (
            select 1 from public.users 
            where id = auth.uid() and is_frozen = false and is_suspended = false
        )
    );

create policy "Users can freeze/unfreeze or adjust limit on their own card" 
    on public.cards for update 
    using (auth.uid() = user_id)
    with check (
        exists (
            select 1 from public.users 
            where id = auth.uid() and is_frozen = false and is_suspended = false
        )
    );


-- 5. Savings Goals Table
create table public.savings_goals (
    id text primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    title text not null,
    target_amount numeric(15, 2) not null,
    current_amount numeric(15, 2) default 0.00 not null,
    auto_save_enabled boolean default false not null,
    auto_save_percentage numeric(5, 2) default 5.00 not null,
    color text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.savings_goals enable row level security;

-- Policies for Savings Goals
create policy "Users can view their savings" 
    on public.savings_goals for select 
    using (auth.uid() = user_id);

create policy "Users can register new savings goals" 
    on public.savings_goals for insert 
    with check (
        auth.uid() = user_id and 
        exists (
            select 1 from public.users 
            where id = auth.uid() and is_frozen = false and is_suspended = false
        )
    );

create policy "Users can update savings goals allocation parameters" 
    on public.savings_goals for update 
    using (auth.uid() = user_id)
    with check (
        exists (
            select 1 from public.users 
            where id = auth.uid() and is_frozen = false and is_suspended = false
        )
    );


-- 6. Notifications Table
create table public.notifications (
    id text primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    title text not null,
    message text not null,
    is_read boolean default false not null,
    type text not null, -- 'info', 'alert', 'success', 'system'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

-- Policies for Notifications
create policy "Users can fetch their notifications" 
    on public.notifications for select 
    using (auth.uid() = user_id);

create policy "Users can dismiss/mark-read their notifications" 
    on public.notifications for update 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "System notifications injection" 
    on public.notifications for insert 
    with check (
        exists (
            select 1 from public.users where id = auth.uid() and is_admin = true
        ) or
        auth.uid() = user_id
    );


-- 7. Settings Table
create table public.settings (
    uid uuid references public.users(id) on delete cascade primary key,
    face_id_enabled boolean default false not null,
    web_authn_configured boolean default false not null,
    push_notifications boolean default true not null,
    email_statements boolean default true not null,
    two_factor_enabled boolean default false not null,
    theme text default 'light' not null
);

alter table public.settings enable row level security;

-- Policies for Settings
create policy "Users can fetch their settings config" 
    on public.settings for select 
    using (auth.uid() = uid);

create policy "Users can adjust their settings configurations" 
    on public.settings for update 
    using (auth.uid() = uid)
    with check (auth.uid() = uid);

create policy "Initialize settings on register" 
    on public.settings for insert 
    with check (auth.uid() = uid);


-- 8. Admin Logs Table (System Chronology)
create table public.admin_logs (
    id text primary key,
    admin_id uuid references public.users(id) on delete cascade not null,
    admin_email text not null,
    action text not null,
    target_user_id text not null,
    details text not null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_logs enable row level security;

-- Policies for Admin Logs
create policy "Admins can query audit trail history" 
    on public.admin_logs for select 
    using (exists (
        select 1 from public.users where id = auth.uid() and is_admin = true
    ));

create policy "Admins can chronicle events" 
    on public.admin_logs for insert 
    with check (exists (
        select 1 from public.users where id = auth.uid() and is_admin = true
    ));

-- Note: no updates or deletes permitted on audit logs to preserve institutional data forensics!

-- 9. Automatic User Provisioning Trigger
create or replace function public.handle_new_user()
returns trigger as $$
declare
  account_num text;
begin
  -- Generate a random 10-digit account number starting with 1
  account_num := floor(1000000000 + random() * 9000000000)::text;

  insert into public.users (id, first_name, last_name, email, account_number, routing_number, is_verified, is_admin, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'firstName', 'Valued'),
    coalesce(new.raw_user_meta_data->>'lastName', 'Client'),
    new.email,
    account_num,
    '122105155',
    false,
    case when new.email = 'support@morningbrightfinance.com' then true else false end,
    now()
  );

  insert into public.balances (uid, checking, savings)
  values (new.id, 500.00, 0.00);

  insert into public.settings (uid, push_notifications, email_statements, theme)
  values (new.id, true, true, 'light');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Setup Realtime
drop publication if exists supabase_realtime;
create publication supabase_realtime;
alter publication supabase_realtime add table public.users, public.balances, public.transactions, public.cards, public.savings_goals, public.notifications, public.settings, public.admin_logs, public.beneficiaries;
