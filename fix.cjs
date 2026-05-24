const fs = require('fs');
let c = fs.readFileSync('src/store.ts', 'utf8');
c = c.replace(/(\.update\(.*?\)\s*\.eq\(.*?\))/gs, '$1.throwOnError()');
c = c.replace(/(\.insert\(.*?\))/gs, '$1.throwOnError()');
// remove throwOnError().then() if we accidentally caused that
c = c.replace(/\.throwOnError\(\)\.then\(\)/gs, '.then()');
fs.writeFileSync('src/store.ts', c);
console.log('Fixed errors');
