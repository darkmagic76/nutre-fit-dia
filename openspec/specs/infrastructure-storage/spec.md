# Infrastructure Storage Specification

## Purpose

`createPersistConfig()`, `encryptSensitive()`, `decryptSensitive()` — zero-dependency Web Crypto API for store-level encryption at rest. All data stays on-device.

## Requirements

| # | Requirement | Keyword |
|---|-------------|---------|
| R1 | `createPersistConfig(name, { sensitiveFields, partialize })` MUST wrap `createJSONStorage(() => localStorage)` with an encryption layer; store consumers import from `@infrastructure/stores/` | MUST |
| R2 | `encryptSensitive(data)` MUST encrypt with AES-256-GCM using the Web Crypto generated key from IndexedDB | MUST |
| R3 | `decryptSensitive(data)` MUST decrypt with the Web Crypto key; old-format data SHALL produce a clear migration error | MUST |
| R4 | Encrypted values MUST be distinguishable from plaintext in localStorage | MUST |
| R5 | Offline-first: zero network dependencies | MUST |
| R6 | The encryption key MUST be generated via `crypto.subtle.generateKey` (AES-GCM 256, non-extractable) | MUST |
| R7 | The generated CryptoKey MUST be persisted in IndexedDB (not localStorage) | MUST |
| R8 | Old-format data MUST produce a clear error, not silent corruption | MUST |
| R9 | The compile-time `KEY_MATERIAL` constant MUST be removed from source | MUST |

### R1: createPersistConfig

`createPersistConfig(name, { sensitiveFields, partialize })` MUST wrap `createJSONStorage(() => localStorage)` with an encryption layer. Import paths for store consumers SHALL update from `@shared/stores/` to `@infrastructure/stores/`. No behavioral change.

(Previously: `createPersistConfig(name, opts)` MUST return a valid Zustand persist config with encrypted storage layer.)

#### Scenario: Plaintext fields stay plaintext (unchanged)

- GIVEN `sensitiveFields = ['weight', 'glucose']`
- WHEN state `{ weight: '80', gender: 'male' }` is persisted
- THEN `gender` SHALL be stored as plaintext in localStorage
- AND `weight` SHALL be stored as encrypted ciphertext

#### Scenario: Store rehydrates correctly (unchanged)

- GIVEN encrypted data in localStorage under `nutrifit-tracker`
- WHEN the store initializes via `persist`
- THEN state SHALL match what was originally persisted

### R2: encryptSensitive

`encryptSensitive(data: string)` MUST use `window.crypto.subtle` with AES-256-GCM. The key SHALL be the Web Crypto generated key loaded from IndexedDB (not a PBKDF2-derived key from a static material). Returns `{ iv: string, ciphertext: string }` as base64.

#### Scenario: Same input produces different ciphertext

- GIVEN the same plaintext is encrypted twice
- THEN the output SHALL differ (random IV per call)

### R3: decryptSensitive

`decryptSensitive(encrypted)` MUST reverse the encryption using the Web Crypto key from IndexedDB and return the original string. If decryption fails (old key format), it SHALL throw a descriptive error.

#### Scenario: Roundtrip

- GIVEN `encryptSensitive("hello")` produces `enc` with the Web Crypto key
- WHEN `decryptSensitive(enc)` is called
- THEN result SHALL be `"hello"`

#### Scenario: Tampered data fails

- GIVEN corrupted ciphertext
- WHEN `decryptSensitive` is called
- THEN it SHALL throw an error

#### Scenario: Old key data fails with clear message

- GIVEN ciphertext encrypted with the old compile-time `KEY_MATERIAL`
- WHEN `decryptSensitive` is attempted
- THEN an error SHALL be thrown with a message indicating data migration/format mismatch

### R4: Non-Encrypted Detection

Locally, non-sensitive fields in localStorage SHALL appear as plain JSON. Encrypted fields SHALL appear as base64 blobs.

### R5: Offline-First

All crypto operations use browser-native `window.crypto.subtle`. No network fetch for keys or entropy.

### R6: Web Crypto Key Generation

The encryption key MUST be generated via `crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])`. The key MUST be non-extractable (`extractable: false`).

#### Scenario: First launch generates a new key

- GIVEN no encryption key exists in IndexedDB
- WHEN the app initializes
- THEN a new AES-256-GCM CryptoKey SHALL be generated
- AND the key SHALL be non-extractable (`extractable: false`)
- AND the raw key material SHALL remain in the CryptoKey handle only (never serialized)

#### Scenario: Key persisted in IndexedDB

- GIVEN a CryptoKey is generated
- WHEN the app stores the key
- THEN the key SHALL be persisted in IndexedDB
- AND the key SHALL survive page refresh and browser restart

### R7: IndexedDB Key Store

The generated CryptoKey MUST be stored in IndexedDB (not localStorage) for persistence across sessions.

#### Scenario: Key restored from IndexedDB

- GIVEN a key exists in IndexedDB from a previous session
- WHEN the app rehydrates
- THEN the stored CryptoKey SHALL be loaded from IndexedDB
- AND all subsequent encrypt/decrypt operations SHALL use the restored key

#### Scenario: IndexedDB unavailable

- GIVEN IndexedDB is not available (private browsing, older browser)
- WHEN key storage is attempted
- THEN a clear error SHALL be thrown with guidance for the user

### R8: Old Key Migration Error

Existing localStorage data encrypted with the old compile-time key MUST produce a clear error, not silent corruption or undefined behavior.

#### Scenario: Old format data triggers migration error

- GIVEN localStorage contains data encrypted with the old compile-time `KEY_MATERIAL`
- WHEN the app attempts decryption with the new Web Crypto key
- THEN an error SHALL be thrown
- AND the error message SHALL clearly state that old data needs migration

### R9: Compile-Time Key Removal

The old compile-time `KEY_MATERIAL` constant MUST be removed from the source code.

#### Scenario: No KEY_MATERIAL in source

- GIVEN the refactor is applied
- WHEN searching for `KEY_MATERIAL` across the codebase
- THEN zero occurrences SHALL be found in source files

### Requirement: Import Path Update for Store Consumers

Stores calling `createPersistConfig()` SHALL import it from `@infrastructure/storage`. Store files themselves SHALL live at `@infrastructure/stores/`. The encryption logic in `storage.ts` remains unchanged.

#### Scenario: trackerStore imports storage from infrastructure

- GIVEN `trackerStore.ts` at `src/infrastructure/stores/`
- WHEN inspecting imports
- THEN `createPersistConfig` SHALL be imported from `@infrastructure/storage`
- AND the import path SHALL NOT reference `@shared/stores`

#### Scenario: All 5 stores import from @infrastructure/storage

- GIVEN trackerStore, logStore, nudgeStore, activityStore, biomarkerStore
- WHEN all are relocated to `@infrastructure/stores/`
- THEN each SHALL import `createPersistConfig` from `@infrastructure/storage`
- AND the encryption behavior SHALL be identical to pre-refactor
