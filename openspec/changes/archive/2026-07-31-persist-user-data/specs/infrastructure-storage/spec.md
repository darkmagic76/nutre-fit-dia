# Infrastructure Storage Specification

## Purpose

`createPersistConfig()`, `encryptSensitive()`, `decryptSensitive()` — zero-dependency Web Crypto API for store-level encryption at rest. All data stays on-device.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | `createPersistConfig(name, opts)` MUST return a valid Zustand persist config with encrypted storage layer | MUST |
| R2 | `encryptSensitive(data)` MUST encrypt with AES-GCM, key derived via PBKDF2 | MUST |
| R3 | `decryptSensitive(data)` MUST decrypt and return the original plaintext | MUST |
| R4 | Encrypted values MUST be distinguishable from plaintext in localStorage | MUST |
| R5 | Offline-first: zero network dependencies | MUST |

### R1: createPersistConfig

`createPersistConfig(name, { sensitiveFields, partialize })` MUST wrap `createJSONStorage(() => localStorage)` with an encryption layer. On write: `partialize` → `JSON.stringify` → encrypt sensitive fields → write. On read: read → decrypt → `JSON.parse` → hydrate.

#### Scenario: Plaintext fields stay plaintext

- GIVEN `sensitiveFields = ['weight', 'glucose']`
- WHEN state `{ weight: '80', gender: 'male' }` is persisted
- THEN `gender` SHALL be stored as plaintext in localStorage
- AND `weight` SHALL be stored as encrypted ciphertext

#### Scenario: Store rehydrates correctly

- GIVEN encrypted data in localStorage under `nutrifit-tracker`
- WHEN the store initializes via `persist`
- THEN state SHALL match what was originally persisted

### R2: encryptSensitive

`encryptSensitive(data: string)` MUST use `window.crypto.subtle` with AES-256-GCM. Key derived via PBKDF2 from `crypto.getRandomValues` salt. Returns `{ salt: string, iv: string, ciphertext: string }` as base64.

#### Scenario: Same input produces different ciphertext

- GIVEN the same plaintext is encrypted twice
- THEN the output SHALL differ (random IV per call)

### R3: decryptSensitive

`decryptSensitive(encrypted)` MUST reverse the encryption and return the original string.

#### Scenario: Roundtrip

- GIVEN `encryptSensitive("hello")` produces `enc`
- WHEN `decryptSensitive(enc)` is called
- THEN result SHALL be `"hello"`

#### Scenario: Tampered data fails

- GIVEN corrupted ciphertext
- WHEN `decryptSensitive` is called
- THEN it SHALL throw an error

### R4: Non-Encrypted Detection

Locally, non-sensitive fields in localStorage SHALL appear as plain JSON. Encrypted fields SHALL appear as base64 blobs.

### R5: Offline-First

All crypto operations use browser-native `window.crypto.subtle`. No network fetch for keys or entropy.
