import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'djaceplace@gmail.com',
    password: 'Password123!', // The user didn't give the password. We can't log in without it!
  });
  console.log("Auth err:", authErr);

  console.log("Auth:", auth);
  let id = auth?.user?.id;
  if (!id) return;
  const { data: users, error } = await supabase.from('users').select('*');
  console.log("Users:", users);
  console.log("Error:", error);
}

check();
