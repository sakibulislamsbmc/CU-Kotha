# Security Specification: Crush and Confessions CU

## 1. Data Invariants
- **Identity Invariant**: Only authenticated users can write documents. The document author/user ID must strictly match `request.auth.uid`.
- **Match Queue Invariant**: A user can only enqueue, update, or cancel their own match queue entry (`/matchQueue/{userId}`).
- **Chat Room Invariant**: A user can only access and send messages to `/chats/{chatId}` if their UID is an authorized participant (`request.auth.uid in resource.data.participants` or incoming participants).
- **Subcollection Message Invariant**: Only chat participants can post messages to `/chats/{chatId}/messages/{messageId}`, and `senderId` must strictly equal `request.auth.uid`.
- **Confession Invariant**: Confessions are publicly readable by signed-in users, but can only be authored with `authorId == request.auth.uid`.
- **Mutual Connection Invariant**: Connection records `/connections/{connectionId}` can only be read or written if `request.auth.uid in resource.data.users` and mutual consent was verified.
- **Timestamp Integrity**: `createdAt` must strictly match server time `request.time`.

## 2. The "Dirty Dozen" Payloads (Must be blocked)
1. **Payload 1 - Identity Spoof in Profile**: User B writes to `/users/userA` with `id: "userA"`. (Expected: Denied).
2. **Payload 2 - Impersonate Sender in Chat Message**: User B sends message to `/chats/chat1/messages/m1` with `senderId: "userA"`. (Expected: Denied).
3. **Payload 3 - Non-Participant Message Injection**: User C posts message into `/chats/chat1/messages/m2` where participants are `[userA, userB]`. (Expected: Denied).
4. **Payload 4 - Eavesdrop Chat Room**: User C attempts to read `/chats/chat1` where participants are `[userA, userB]`. (Expected: Denied).
5. **Payload 5 - Overwrite Chat Participant State**: User A attempts to update `userB` participant ID or modify immutable `createdAt`. (Expected: Denied).
6. **Payload 6 - Denial-of-Wallet Payload**: User A posts a message with text size > 10,000 characters or junk IDs. (Expected: Denied).
7. **Payload 7 - Unauthenticated Confession Post**: Unauthenticated user tries to add confession. (Expected: Denied).
8. **Payload 8 - Confession Author Spoofing**: User A attempts to submit a confession with `authorId: "userB"`. (Expected: Denied).
9. **Payload 9 - Queue Hijacking**: User A tries to delete or alter User B's `/matchQueue/userB`. (Expected: Denied).
10. **Payload 10 - Premature Connection Insertion**: User A unilaterally creates `/connections/conn1` with User C without User C being in the chat. (Expected: Denied).
11. **Payload 11 - State Shortcutting**: A user attempts to transition an already `ended` chat back to `active`. (Expected: Denied).
12. **Payload 12 - Ghost Field Injection in Profile**: User A attempts to add arbitrary unverified administrative fields into user profile. (Expected: Denied).

## 3. Test Runner Definition
Rules will enforce ABAC, path verification, and strict schema validation guards across all collections.
