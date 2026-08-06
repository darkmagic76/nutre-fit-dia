# Delta for Infrastructure Storage

## MODIFIED Requirements

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

### R2-R9: Unchanged Behavioral Requirements

The following requirements are unmodified — encryption, decryption, key generation, IndexedDB storage, and offline-first behavior remain identical:

- R2: `encryptSensitive(data)` with AES-256-GCM
- R3: `decryptSensitive(data)` with migration error for old keys
- R4: Encrypted vs plaintext distinguishable in localStorage
- R5: Offline-first, zero network dependencies
- R6: `crypto.subtle.generateKey` (AES-GCM 256, non-extractable)
- R7: CryptoKey persisted in IndexedDB
- R8: Old-format data produces clear error
- R9: `KEY_MATERIAL` compile-time constant removed

#### Scenario: Encrypt/decrypt roundtrip (unchanged)

- GIVEN `encryptSensitive("hello")` produces encrypted output
- WHEN `decryptSensitive(enc)` is called
- THEN result SHALL be `"hello"`

#### Scenario: Old key data fails with clear message (unchanged)

- GIVEN ciphertext encrypted with the old compile-time `KEY_MATERIAL`
- WHEN `decryptSensitive` is attempted
- THEN an error SHALL be thrown with a message indicating data migration/format mismatch
