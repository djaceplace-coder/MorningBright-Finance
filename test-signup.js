import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'xxxxx';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const email = `test_${Math.random()}@example.com`;
  console.log("Signing up:", email);
  
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth event:", event, session ? "Session present" : "No session");
  });

  const { data, error } = await supabase.auth.signUp({
    email,
    password: "Password123!",
  });
  
  console.log("SignUp result:", { error: error?.message, sessionPresent: !!data?.session });
}
test();
