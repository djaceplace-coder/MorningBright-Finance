const fs = require('fs');
let c = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

c = c.replace(/await (admin\w+)\(([^)]*)\);/g, 'try { await $1($2); } catch (e) { return; }');
c = c.replace(/showSuccessAlert/g, 'toast.success');
c = c.replace(/const showSuccessAlert = \(msg: string\) => \{\n\s*setSuccessMessage\(msg\);\n\s*setTimeout\(\(\) => setSuccessMessage\(null\), 3000\);\n\s*\};/g, '');
// Wait, I will just use multi_edit_file for AdminPanel instead of regex because regex can mess it up.
