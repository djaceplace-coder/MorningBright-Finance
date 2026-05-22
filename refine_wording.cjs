const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  [/Elite Vault/ig, "Account"],
  [/Sovereign Ledger/ig, "Transaction History"],
  [/Cryptopassword/ig, "Password"],
  [/Treasury Core/ig, "Core Banking"],
  [/Capital Node/ig, "Banking System"],
  [/Vault Access/ig, "Account Access"],
  [/Institutional Vault/ig, "Bank Account"],
  [/Quantum Banking/ig, "Digital Banking"],
  [/Crypto Layer/ig, "Security Layer"],
  [/Digital Treasury Network/ig, "Digital Banking Network"],
  [/Encrypted Ledger Core/ig, "Secure Banking Core"],
  [/Checking Vault/ig, "Checking Account"],
  [/checking vault/ig, "checking account"],
  [/Savings Vault/ig, "Savings Account"],
  [/savings vault/ig, "savings account"],
  [/Sub-Vaults/ig, "Savings Goals"],
  [/sub-vaults/ig, "savings goals"],
  [/sub-vault/ig, "savings goal"],
  [/Sub-Vault/ig, "Savings Goal"],
  [/Vault Ledger Feed/ig, "Transaction History"],
  [/Target Account Vault/ig, "Target Account"],
  [/Unfreeze Vault/ig, "Unfreeze Account"],
  [/Ledger events/ig, "Transaction events"],
  [/ledger logic/ig, "transaction logic"],
  [/filteredLedger/ig, "filteredTransactions"],
  [/Sync ledger link drop/ig, "Network connection error"],
  [/incoming ledger/ig, "incoming transaction"],
  [/Account Ledger Adjusted/ig, "Account Balance Adjusted"],
  [/transaction ledger:/ig, "transaction:"],
  [/Compound Savings Ledger/ig, "Compound Savings"],
  [/Cryptographic Biometrics/ig, "Biometric Security"],
  [/Compounding ledger charts/ig, "Savings growth charts"],
  [/Treasury Cash Sweepers/ig, "Automated Savings"],
  [/TREASURY OPERATIONS/ig, "ACCOUNT OPERATIONS"],
  [/browser ledger/ig, "banking portal"],
  [/vaulting/ig, "storage"],
  [/vault/ig, "account"],
  [/Vault/ig, "Account"],
  [/Sovereign privacy keys/ig, "Secure Privacy Keys"],
  [/administrative ledgers/ig, "administrative logs"],
  [/Encrypted Ledger Defense/ig, "Encrypted Data Defense"],
  [/exact lockstep ledger entries/ig, "accurate transaction histories"],
  [/precise, lockstep ledger entries/ig, "accurate transaction histories"],
  [/standalone treasury chartered bank/ig, "standalone chartered bank"],
  [/SOVEREIGN LEDGER PORTAL/ig, "ACCOUNT DASHBOARD"],
  [/Morning Bright Vault/ig, "Morning Bright Account"],
  [/Synced with Ledger/ig, "Synced with Server"],
  [/inside this ledger/ig, "inside this account"],
  [/Transaction Ledger/ig, "Transaction History"],
  [/SOVEREIGN WIRE TRANSFER TERMINAL/ig, "WIRE TRANSFER TERMINAL"],
  [/Sub-second Ledger Clearance/ig, "Instant Transfer Clearance"],
  [/LEDGER CENTRAL ARCHIVE/ig, "TRANSACTION ARCHIVE"],
  [/Comprehensive Ledger Archive/ig, "Comprehensive Transaction Archive"],
  [/COMPLETED LEDGER TRAIL/ig, "COMPLETED TRANSACTIONS"],
  [/Your ledger updates automatically/ig, "Your history updates automatically"],
  [/Structure Savings Account/ig, "Create Savings Goal"],
  [/Structure Account/ig, "Create Goal"],
  [/Structured Accounts/ig, "Savings Goals"],
  [/SOVEREIGN ACCOUNT CONFIGURATIONS/ig, "ACCOUNT CONFIGURATIONS"],
  [/Sovereign identity profile logs/ig, "Identity profile logs"],
  [/Cryptographic verification bounds/ig, "Identity verification settings"],
  [/Sovereign Overdraft Cleared/ig, "Overdraft Cleared"],
  [/master_audit_ledger/ig, "master_audit_log"],
  [/Sovereign/ig, "Secure"],
  [/sovereign/ig, "secure"],
  [/ledger/ig, "transaction"],
  [/Ledger/ig, "Transaction"]
];

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (let i = 0; i < replacements.length; i++) {
       content = content.replace(replacements[i][0], replacements[i][1]);
    }
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
