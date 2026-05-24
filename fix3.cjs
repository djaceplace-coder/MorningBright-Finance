const fs = require('fs');
let c = fs.readFileSync('src/store.ts', 'utf8');
c = c.replace(/handleSupabaseError\(e,\s*OperationType\.[A-Z]+,\s*`([^`]*)`\);*/g, 'toast.error(e.message || "Operation failed"); throw e;');
c = c.replace(/console\.error\("Failed to \w+ \w+",\s*e\);/g, 'toast.error(e.message || "Operation failed"); throw e;');
fs.writeFileSync('src/store.ts', c);
