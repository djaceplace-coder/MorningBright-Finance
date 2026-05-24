const fs = require('fs');
let c = fs.readFileSync('src/store.ts', 'utf8');

c = c.replace(/await supabase\.from\("admin_logs"\)\.insert\(mapLogToDb\(log\)\);/g, 
  'const {error: logErr} = await supabase.from("admin_logs").insert(mapLogToDb(log)); if (logErr) throw logErr;');

c = c.replace(/await supabase\s*\.from\("balances"\)\s*\.update\(\{([\s\S]*?)\}\)\s*\.eq\("uid",\s*userId\);/g, 
  'const {error: balErr} = await supabase.from("balances").update({$1}).eq("uid", userId); if (balErr) throw balErr;');

c = c.replace(/await supabase\s*\.from\("transactions"\)\s*\.insert\((\s*mapTransactionToDb\(.*?\)\s*)\);/g, 
  'const {error: txErr} = await supabase.from("transactions").insert($1); if (txErr) throw txErr;');

c = c.replace(/await supabase\s*\.from\("users"\)\s*\.update\(\{([\s\S]*?)\}\)\s*\.eq\("id",\s*userId\);/g,
  'const {error: usrErr} = await supabase.from("users").update({$1}).eq("id", userId); if (usrErr) throw usrErr;');

fs.writeFileSync('src/store.ts', c);
