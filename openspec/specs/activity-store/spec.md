# Activity Store Specification

## Purpose

Manages activity tracking state — weekly minutes, strength sessions, activity entries, and compliance streak. Uses `zustand/persist` middleware with encryption on sensitive health fields.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | Store MUST expose `weeklyMinutes`, `strengthSessions`, `entries`, `streak` with actions | MUST |
| R2 | Store MUST use `zustand/persist` middleware via `createPersistConfig` | MUST |
| R3 | `weeklyMinutes` and `strengthSessions` SHALL be encrypted before localStorage write | MUST |
| R4 | `entries` and `streak` SHALL remain plaintext | SHALL |
| R5 | `addEntry` MUST increment weeklyMinutes and strengthSessions from entry data | MUST |
| R6 | `resetWeek` MUST zero all counters | MUST |
| R7 | Offline-first: no network access | MUST |

### R1: Activity State

The store SHALL expose `weeklyMinutes: number`, `strengthSessions: number`, `entries: ActivityEntry[]`, `streak: number`, and actions `addEntry`, `resetWeek`, `incrementStreak`, `resetStreak`.

#### Scenario: Default values on init

- GIVEN the store is created fresh
- THEN `weeklyMinutes` SHALL be `0`, `strengthSessions` SHALL be `0`, `entries` SHALL be `[]`, `streak` SHALL be `0`

### R2: Persist Middleware

The store MUST survive page refresh via `zustand/persist` with `localStorage`.

#### Scenario: Activity data survives refresh

- GIVEN `addEntry(entry)` set `weeklyMinutes=150` and `strengthSessions=2`
- WHEN the page is refreshed
- THEN `weeklyMinutes` SHALL be `150`, `strengthSessions` SHALL be `2`

### R3: Encrypted Health Fields

`weeklyMinutes` and `strengthSessions` SHALL be encrypted via `createPersistConfig` with `sensitiveFields` option.

#### Scenario: Health data encrypted

- GIVEN `weeklyMinutes=180` has been persisted
- WHEN DevTools inspects localStorage
- THEN `weeklyMinutes` SHALL NOT appear as plaintext `180`

### R4: Plaintext Fields

`entries` and `streak` SHALL be stored as plaintext JSON.

### R5: addEntry Action

`addEntry(entry)` MUST append to `entries`, increment `weeklyMinutes` by `entry.moderateMinutes`, increment `strengthSessions` by `entry.strengthSessions`.

#### Scenario: Entry increments all counters

- GIVEN `weeklyMinutes=0`, `strengthSessions=0`
- WHEN `addEntry({ moderateMinutes: 30, strengthSessions: 1 })`
- THEN `weeklyMinutes=30`, `strengthSessions=1`, `entries.length=1`

### R6: resetWeek Action

`resetWeek()` MUST set all counters to zero.

### R7: Offline-First

All reads and writes use localStorage only. No network calls.
