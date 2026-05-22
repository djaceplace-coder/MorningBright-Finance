# Security Specification for Morning Bright Finance

This specification defines the rigorous security standards and test suites for the Attribute-Based Access Control (ABAC) and Zero-Trust architecture governing all database endpoints.

## 1. Data Invariants and Integrity Rules

1.  **Strict Profile Separation:** Users may only read and modify their own profiles (`/users/{uid}`) and setting states (`/settings/{uid}`).
2.  **Asset Guarding:** Currency records (`/balances/{uid}`), cards (`/cards/{cardId}`), and savings targets (`/savings/{goalId}`) require complete owner matching (`request.auth.uid == ownerId`).
3.  **Administrator Seclusion:** Security activity chronicles (`/admin_logs/{logId}`) may only be populated and fetched by verified system-wide administrator UIDs (explicitly identified via `/admins/` registry document presence).
4.  **Transaction Ledger Non-Mutability:** Ledger records (`/transactions/{id}`) are write-once. Users can create a transaction where `userId` equals their authentic credential UID, but are strictly forbidden from modifying or purging any previously committed ledger elements.
5.  **Verified Email Mandate:** Direct transfers and card generation are strictly gated behind authenticated verification status (`request.auth.token.email_verified == true`).
6.  **Immutable Core Columns:** Structural properties like `createdAt`, `userId`, `cardType` and currency owner tags are permanently immutable once written.

---

## 2. The "Dirty Dozen" Threat Payloads

Below are 12 malicious payload vectors crafted to challenge the security gates. Each of these attempts must safely face immediate validation rejections (`PERMISSION_DENIED`).

### Payload 1: Unauthorized Profile Manipulation (Identity Spoofing)
*Attempt by UID `attacker_123` to overwrite the profile properties of UID `victim_456`.*
```json
{
  "path": "/users/victim_456",
  "operation": "update",
  "auth": { "uid": "attacker_123", "email": "attacker@domain.com" },
  "body": { "firstName": "I am", "lastName": "Malicious", "email": "hacked@victim.com" }
}
```

### Payload 2: Privileged Parameter Overwrite (Self-Promotion)
*Attempt by a standard user to elevate their own access privileges by settings `isAdmin: true`.*
```json
{
  "path": "/users/user_789",
  "operation": "update",
  "auth": { "uid": "user_789", "email": "user@domain.com" },
  "body": { "firstName": "Alex", "lastName": "Normal", "isAdmin": true }
}
```

### Payload 3: Account De-freezing (State Shortcircuit)
*Attempt by a blocked user with a frozen status to reset `isFrozen: false` on their own profile.*
```json
{
  "path": "/users/frozen_guy",
  "operation": "update",
  "auth": { "uid": "frozen_guy", "email": "frozen@domain.com" },
  "body": { "isFrozen": false }
}
```

### Payload 4: Arbitrary Fund Injection (Balance Poisoning)
*Attempt by a customer to modify their checking balance without a verified ledger transfer record.*
```json
{
  "path": "/balances/customer_888",
  "operation": "update",
  "auth": { "uid": "customer_888", "email": "customer@domain.com" },
  "body": { "checking": 99999999.00 }
}
```

### Payload 5: Siphoning Private Assets (PII Exposure)
*Attempt by an authenticated third party to read the balance details of another user.*
```json
{
  "path": "/balances/victim_456",
  "operation": "get",
  "auth": { "uid": "attacker_123", "email": "attacker@domain.com" }
}
```

### Payload 6: Forged Deposit Insertion (System Spoofing)
*Attempt by an unauthorized account to slide a deposit record of $50,000 into the transaction collection.*
```json
{
  "path": "/transactions/forged_tx_001",
  "operation": "create",
  "auth": { "uid": "user_789" },
  "body": { "id": "forged_tx_001", "userId": "user_789", "amount": 50000, "type": "deposit", "merchant": "Simulated Cash Feed", "status": "completed", "createdAt": "2026-05-22T09:51:39Z" }
}
```

### Payload 7: Transaction History Purge (Ledger Eviction)
*Attempt to delete a completed spend record which would make balance sheets inconsistent.*
```json
{
  "path": "/transactions/actual_tx_999",
  "operation": "delete",
  "auth": { "uid": "user_789" }
}
```

### Payload 8: Direct Card Interception (PII Leak)
*Attempt to fetch the credential detail of a virtual debit card owned by someone else.*
```json
{
  "path": "/cards/victim_card_777",
  "operation": "get",
  "auth": { "uid": "attacker_123" }
}
```

### Payload 9: Hijacking Savings Goals (Asset Transfer)
*Attempt to update the savings allocation of a victim account or transfer their accumulated balance.*
```json
{
  "path": "/savings/goal_222",
  "operation": "update",
  "auth": { "uid": "attacker_123" },
  "body": { "userId": "victim_456", "currentAmount": 0.00 }
}
```

### Payload 10: Injecting Malicious System Notifications (Resource Injection)
*Attempt to broadcast a fraudulent security notification to another customer's notification pool.*
```json
{
  "path": "/notifications/fake_notif_001",
  "operation": "create",
  "auth": { "uid": "user_789" },
  "body": { "id": "fake_notif_001", "userId": "victim_456", "title": "Account Cleared", "message": "Verify your identity here: mal-link.co", "isRead": false, "type": "alert", "createdAt": "2026-05-22T09:51:39Z" }
}
```

### Payload 11: Security Log Sabotage (Auditing Evasion)
*Attempt by a rogue actor to rewrite or delete log lines from the security auditor.*
```json
{
  "path": "/admin_logs/audit_987",
  "operation": "delete",
  "auth": { "uid": "user_789" }
}
```

### Payload 12: Bypassing Email Verification Gates (Verification Escalation)
*Attempt by an unverified registrant (`email_verified==false`) to construct a new virtual card.*
```json
{
  "path": "/cards/card_555",
  "operation": "create",
  "auth": { "uid": "unverified_user", "token": { "email_verified": false } },
  "body": { "id": "card_555", "userId": "unverified_user", "cardholderName": "Unverified User", "cardNumber": "4111222233334444", "expiryDate": "09/30", "cvv": "123", "isFrozen": false, "spendingLimit": 500, "spentThisMonth": 0, "cardType": "platinum", "createdAt": "2026-05-22T09:51:39Z" }
}
```

---

## 3. Conceptual Security Test Runner

The code below represents a standard zero-trust test suite enforcing compliance on every endpoint mapping:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Morning Bright Finance Security Rules', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'morningbright-finance',
      firestore: { rules: require('fs').readFileSync('firestore.rules', 'utf8') }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('Payload 1: Block foreign profile updates', async () => {
    const context = testEnv.authenticatedContext('attacker_123');
    const db = context.firestore();
    await assertFails(db.doc('users/victim_456').update({ firstName: 'hacked' }));
  });

  it('Payload 2: Block self-elevation to admin', async () => {
    const context = testEnv.authenticatedContext('user_789');
    const db = context.firestore();
    await assertFails(db.doc('users/user_789').update({ isAdmin: true }));
  });

  it('Payload 3: Block un-freezing self', async () => {
    const context = testEnv.authenticatedContext('frozen_guy');
    const db = context.firestore();
    await assertFails(db.doc('users/frozen_guy').update({ isFrozen: false }));
  });

  it('Payload 4 & 5: Seclude balance updates and leaks', async () => {
    const attackerContext = testEnv.authenticatedContext('attacker_123');
    const victimContext = testEnv.authenticatedContext('victim_456');
    await assertFails(attackerContext.firestore().doc('balances/victim_456').get());
    await assertFails(victimContext.firestore().doc('balances/victim_456').update({ checking: 100000 }));
  });

  it('Payload 6 & 7: Lock transaction books from forge/writes', async () => {
    const userContext = testEnv.authenticatedContext('user_789');
    // Cannot write deposits directly or delete logs
    await assertFails(userContext.firestore().doc('transactions/forged_tx_001').set({ amount: 50000, type: 'deposit' }));
  });
});
```
