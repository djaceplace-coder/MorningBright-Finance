const fs = require('fs');
let c = fs.readFileSync('src/store.ts', 'utf8');
c = c.replace(/\.throwOnError\(\)/g, '');
fs.writeFileSync('src/store.ts', c);
