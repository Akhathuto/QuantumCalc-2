# Security Specification - QuantumCalc

## Data Invariants
1. A **User** profile must match the `request.auth.uid`. `role` and `isAdmin` (if any) cannot be set by the user.
2. A **HistoryEntry** must belong to the authenticated user (`userId == request.auth.uid`). Document ID should ideally be specified by the system but we allow client-side generated IDs for offline support, provided ownership is verified.
3. A **Note** must belong to the authenticated user (`userId == request.auth.uid`).
4. **ContactMessages** can be created by anyone but only read/updated/deleted by Admins. Status must always be 'new' on creation.
5. **Settings** are per-user.

## The "Dirty Dozen" Payloads (Attacks)

### 1. Identity Spoofing (Users)
**Description:** Attempt to create a user profile for a different UID.
**Payload:** `{ "uid": "victim_uid", "email": "attacker@gmail.com", ... }` targeting `/users/victim_uid`.
**Expected Result:** `PERMISSION_DENIED`.

### 2. Privilege Escalation (Users)
**Description:** Attempt to grant self a 'teacher' or 'admin' role during updates.
**Payload:** `{ "role": "teacher" }` targeting `/users/attacker_uid`.
**Expected Result:** `PERMISSION_DENIED` (unless handled by a specific whitelisted update branch).

### 3. Resource Poisoning (History)
**Description:** Attempt to inject a massive string (1MB) as an expression to exhaust resources or cost.
**Payload:** `{ "expression": "A".repeat(10^6), ... }` targeting `/history/some_id`.
**Expected Result:** `PERMISSION_DENIED` (due to .size() checks).

### 4. Orphaned Record (Notes)
**Description:** Attempt to create a note with a mismatching `userId`.
**Payload:** `{ "userId": "victim_uid", "content": "spy", ... }` targeting `/notes/new_note`.
**Expected Result:** `PERMISSION_DENIED`.

### 5. Shadow Update (Settings)
**Description:** Attempt to update settings with a "Ghost Field" (e.g., `isPremium: true`).
**Payload:** `{ "isPremium": true }` targeting `/settings/attacker_uid`.
**Expected Result:** `PERMISSION_DENIED` (due to `hasOnly()` checks).

### 6. PII Blanket Read (Users)
**Description:** Attempt to list all users to scrape emails.
**Query:** `db.collection('users').get()`
**Expected Result:** `PERMISSION_DENIED`.

### 7. State Shortcut (Contact Messages)
**Description:** Attempt to create a contact message that is already marked as 'replied'.
**Payload:** `{ "status": "replied", ... }` targeting `/contact_messages/new_id`.
**Expected Result:** `PERMISSION_DENIED`.

### 8. Unauthorized Deletion (Notes)
**Description:** Attempt to delete a note belonging to another user.
**Operation:** `db.doc('notes/victim_note').delete()`
**Expected Result:** `PERMISSION_DENIED`.

### 9. Time Spoofing (Contact Messages)
**Description:** Attempt to set a `createdAt` in the future.
**Payload:** `{ "createdAt": Date.now() + 1000000, ... }`
**Expected Result:** `PERMISSION_DENIED` (due to `serverTimestamp` check).

### 10. Junk Character Poisoning (IDs)
**Description:** Attempt to use non-alphanumeric characters in document IDs.
**Path:** `/notes/$$$hack$$$`
**Expected Result:** `PERMISSION_DENIED`.

### 11. Bypassing Validation (History)
**Description:** Attempt to update `isFavorite` with a string instead of a boolean.
**Payload:** `{ "isFavorite": "yes" }`
**Expected Result:** `PERMISSION_DENIED`.

### 12. Cross-Collection Leak (History)
**Description:** Attempt to read another user's history entry.
**Operation:** `db.doc('history/victim_entry').get()`
**Expected Result:** `PERMISSION_DENIED`.
