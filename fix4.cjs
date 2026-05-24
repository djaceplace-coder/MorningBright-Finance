const fs = require('fs');
let c = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!c.includes('import toast')) {
  c = c.replace(/import React/, 'import toast from "react-hot-toast";\nimport React');
}

c = c.replace(/await adminEditBalance([^;]+);\n\s*showSuccessAlert\(`([^`]+)`\);/, 'try { await adminEditBalance$1; toast.success(`$2`); } catch (err) {}');
c = c.replace(/await adminAddSystemTransaction([^;]+);\n\s*showSuccessAlert\(`([^`]+)`\);/, 'try { await adminAddSystemTransaction$1; toast.success(`$2`); } catch (err) {}');
c = c.replace(/await adminBroadcastNotification([^;]+);\n\s*showSuccessAlert\(`([^`]+)`\);/, 'try { await adminBroadcastNotification$1; toast.success(`$2`); } catch (err) {}');
c = c.replace(/await adminPushSystemNotification([^;]+);\n\s*showSuccessAlert\(`([^`]+)`\);/, 'try { await adminPushSystemNotification$1; toast.success(`$2`); } catch (err) {}');

c = c.replace(/await adminFreezeUser([^;]+);\n\s*showSuccessAlert\(`([^`]+)`\);/, 'try { await adminFreezeUser$1; toast.success(`$2`); } catch (err) {}');
c = c.replace(/await adminSuspendUser([^;]+);\n\s*showSuccessAlert\(`([^`]+)`\);/, 'try { await adminSuspendUser$1; toast.success(`$2`); } catch (err) {}');
c = c.replace(/await adminVerifyUser([^;]+);\n\s*showSuccessAlert\(`([^`]+)`\);/, 'try { await adminVerifyUser$1; toast.success(`$2`); } catch (err) {}');

fs.writeFileSync('src/components/AdminPanel.tsx', c);
console.log('Fixed AdminPanel');
