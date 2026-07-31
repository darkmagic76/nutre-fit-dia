# Delta for Infrastructure Storage

## ADDED Requirements

### Requirement: Web Crypto Key Generation

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

### Requirement: IndexedDB Key Store

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

### Requirement: Old Key Migration Error

Existing localStorage data encrypted with the old compile-time key MUST produce a clear error, not silent corruption or undefined behavior.

#### Scenario: Old format data triggers migration error

- GIVEN localStorage contains data encrypted with the old compile-time `KEY_MATERIAL`
- WHEN the app attempts decryption with the new Web Crypto key
- THEN an error SHALL be thrown
- AND the error message SHALL clearly state that old data needs migration

### Requirement: Compile-Time Key Removal

The old compile-time `KEY_MATERIAL` constant MUST be removed from the source code.

#### Scenario: No KEY_MATERIAL in source

- GIVEN the refactor is applied
- WHEN searching for `KEY_MATERIAL` across the codebase
- THEN zero occurrences SHALL be found in source files

## MODIFIED Requirements

### Requirement: R2 — encryptSensitive

`encryptSensitive(data: string)` MUST use `window.crypto.subtle` with AES-256-GCM. The key SHALL be the Web Crypto generated key loaded from IndexedDB (not a PBKDF2-derived key from a static material). Returns `{ iv: string, ciphertext: string }` as base64.

(Previously: key was derived via PBKDF2 from a static `KEY_MATERIAL` constant)

#### Scenario: Same input produces different ciphertext

- GIVEN the same plaintext is encrypted twice
- THEN the output SHALL differ (random IV per call)

### Requirement: R3 — decryptSensitive

`decryptSensitive(encrypted)` MUST reverse the encryption using the Web Crypto key from IndexedDB and return the original string. If decryption fails (old key format), it SHALL throw a descriptive error.

(Previously: decryption used PBKDF2-derived key from static material with no migration error)

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
