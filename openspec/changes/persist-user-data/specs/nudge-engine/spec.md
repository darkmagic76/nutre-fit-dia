# Delta for Nudge Engine

## ADDED Requirements

### Requirement: Nudge Store Persist Middleware

The nudgeStore MUST use `zustand/persist` middleware. `pending` and `history` notification arrays SHALL persist across refresh. Notification IDs and metadata are non-sensitive — plaintext storage.

#### Scenario: Notification history survives refresh

- GIVEN 3 notifications have been acknowledged and moved to `history`
- WHEN the page is refreshed
- THEN `history` SHALL contain all 3 notifications
- AND `pending` SHALL be empty

#### Scenario: Pending notifications survive refresh

- GIVEN 2 notifications are in `pending`
- WHEN the page is refreshed
- THEN `pending` SHALL contain both notifications

#### Scenario: Actions excluded from persist

- GIVEN the store is persisted
- WHEN serialized state is inspected
- THEN `enqueue`, `acknowledge`, `dismiss`, `clearPending` SHALL NOT be present

### Requirement: Cooldown State Migrated to nudgeStore

Cooldown `Map<string, number>` SHALL move from in-memory `CooldownTracker` class into persisted nudgeStore state as `cooldowns: Record<string, number>`. Cooldowns SHALL persist across refresh. CooldownTracker class MAY be kept as a thin wrapper reading/writing via `useNudgeStore.getState()`.

#### Scenario: Cooldown persists across refresh

- GIVEN rule "R1" registered at timestamp 1000, cooldownMinutes=1440 (24h)
- WHEN the page is refreshed
- THEN `isOnCooldown("R1", 1440)` at timestamp 1001 SHALL return true
- AND at timestamp 1000 + 24h + 1ms SHALL return false

#### Scenario: Unknown rule not on cooldown

- GIVEN `cooldowns` has no entry for "R99"
- WHEN `isOnCooldown("R99", 60)` is called
- THEN SHALL return false

## MODIFIED Requirements

### REQ-NUDGE-COOLDOWN: CooldownTracker

Cooldown state (`cooldowns: Record<string, number>`) MUST live in persisted `nudgeStore` state instead of an in-memory `Map` class field. The `CooldownTracker` class SHALL read/write via `useNudgeStore.getState().cooldowns`. Methods `register(id)`, `isOnCooldown(id, cooldownMinutes)`, `reset(id?)` MUST preserve identical semantics.
(Previously: Cooldown was in-memory `Map<string, number>` class field in `CooldownTracker` — lost on page refresh.)

#### Scenario: Cooldown blocks and expires

- GIVEN tracker with `now = () => 0`, rule cooldown=60
- WHEN `register("R1")` then `isOnCooldown("R1", 60)` at t=0 → true; at t=61 → false
- THEN cooldown blocks within window, allows after expiry

#### Scenario: Unknown rule and reset

- GIVEN empty tracker
- THEN `isOnCooldown("unknown", 60)` returns false
- AND `reset()` clears all entries; `reset("R1")` clears single
