import { type PersistOptions, type StateStorage, createJSONStorage } from 'zustand/middleware';
import { env } from './env';

// ── Encrypted data format (no salt — direct AES-GCM key) ──

export interface EncryptedData {
  iv: string;
  ciphertext: string;
}

interface EncryptedField extends EncryptedData {
  __encrypted: true;
}

// ── Old-format detection (PBKDF2 era — had a 'salt' field) ──

interface OldEncryptedData {
  salt: string;
  iv: string;
  ciphertext: string;
}

function isOldFormat(value: unknown): value is OldEncryptedData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'salt' in value &&
    'iv' in value &&
    'ciphertext' in value
  );
}

function isEncryptedField(value: unknown): value is EncryptedField {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__encrypted' in value &&
    (value as EncryptedField).__encrypted === true
  );
}

// ── Base64 helpers ──

function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

// ── Web Crypto key generation ──

/**
 * Generates a non-extractable AES-256-GCM key via Web Crypto.
 * The key is never exposed as raw bytes — it exists only as a CryptoKey handle.
 */
export async function generateStorageKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable
    ['encrypt', 'decrypt'],
  );
}

// ── IndexedDB key store ──

const DB_NAME = 'nutrefitdia-key-store';
const STORE_NAME = 'keys';
const KEY_ID = 'storage-encryption-key';
const DB_VERSION = 1;

let indexedDBAvailable = true;

async function openKeyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveKeyToIndexedDB(key: CryptoKey): Promise<void> {
  if (!indexedDBAvailable) return;
  try {
    const db = await openKeyDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(key, KEY_ID);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    indexedDBAvailable = false;
    console.warn(
      'IndexedDB unavailable — encryption key will not persist across sessions. ' +
        'Data encrypted in this session cannot be decrypted after tab close.',
    );
  }
}

async function loadKeyFromIndexedDB(): Promise<CryptoKey | null> {
  if (!indexedDBAvailable) return null;
  try {
    const db = await openKeyDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(KEY_ID);
      req.onsuccess = () => {
        db.close();
        resolve((req.result as CryptoKey) ?? null);
      };
      req.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    indexedDBAvailable = false;
    console.warn('IndexedDB unavailable — encryption key will not persist across sessions.');
    return null;
  }
}

// ── Key management ──

let cachedKey: CryptoKey | null = null;

/**
 * Returns the AES-GCM encryption key, loading from IndexedDB if available
 * or generating a new one. The returned key reference is cached for the
 * lifetime of the module (survives page navigation, not full reload).
 */
export async function getOrCreateKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  // Try loading from IndexedDB first
  let key = await loadKeyFromIndexedDB();

  if (key) {
    cachedKey = key;
    return key;
  }

  // Generate new key
  key = await generateStorageKey();
  cachedKey = key;

  // Persist to IndexedDB (best-effort — falls back to in-memory)
  await saveKeyToIndexedDB(key);

  return key;
}

// ── Encrypt / Decrypt ──

/**
 * Encrypts a plaintext string using AES-256-GCM with the persisted Web Crypto key.
 * Returns { iv, ciphertext } as base64 strings. No salt — the key is a direct CryptoKey,
 * not PBKDF2-derived.
 */
export async function encryptSensitive(data: string): Promise<EncryptedData> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plainBytes = new TextEncoder().encode(data);
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainBytes);

  return {
    iv: bufToBase64(iv.buffer as ArrayBuffer),
    ciphertext: bufToBase64(cipherBuf),
  };
}

/**
 * Decrypts data previously encrypted with `encryptSensitive`.
 * If the data contains a `salt` field (old PBKDF2 format), throws an error
 * instructing the user to clear site data or import a backup.
 */
export async function decryptSensitive(encrypted: EncryptedData): Promise<string> {
  // Detect old format (has 'salt' field from PBKDF2 era)
  if (isOldFormat(encrypted)) {
    throw new Error(
      'Storage migration required: data was encrypted with an old key format. ' +
        'Please clear site data or import a backup to continue.',
    );
  }

  const key = await getOrCreateKey();
  const ivBuf = base64ToBuf(encrypted.iv);
  const ctBuf = base64ToBuf(encrypted.ciphertext);
  const iv = new Uint8Array(ivBuf);
  const ciphertext = new Uint8Array(ctBuf);

  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );

  return new TextDecoder().decode(plainBuf);
}

// ── createPersistConfig ──

/**
 * Returns a Zustand PersistOptions for a store.
 *
 * Wraps localStorage with AES-GCM encryption for fields listed in
 * `opts.sensitiveFields`. The persist config uses `createJSONStorage`
 * so Zustand handles JSON serialization; the inner storage replaces
 * sensitive values with `{ __encrypted: true, iv, ciphertext }`
 * before writing and decrypts them back on read.
 *
 * Old PBKDF2-format data (with `salt` field) is detected and triggers
 * a migration error instructing the user to clear site data.
 */
export function createPersistConfig<S extends object>(
  name: string,
  opts?: { sensitiveFields?: string[] },
): PersistOptions<S, S> {
  const storageKey = `${env.VITE_STORAGE_PREFIX}-${name}`;
  const sensitive = opts?.sensitiveFields ?? [];

  const rawStorage: StateStorage = {
    async getItem(_name: string): Promise<string | null> {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;

      const data = JSON.parse(raw) as Record<string, unknown>;

      // Zustand persist wraps state in { state, version }. Decrypt fields
      // inside data.state if present, otherwise at top level.
      const target = (data.state as Record<string, unknown> | undefined) ?? data;

      for (const field of sensitive) {
        const value = target[field];
        if (isEncryptedField(value)) {
          // Check for old PBKDF2-format data (has 'salt') before decrypting
          if (isOldFormat(value)) {
            throw new Error(
              'Storage migration required: data was encrypted with an old key format. ' +
                'Please clear site data or import a backup to continue.',
            );
          }
          target[field] = JSON.parse(await decryptSensitive(value));
        }
      }

      return JSON.stringify(data);
    },

    async setItem(_name: string, value: string): Promise<void> {
      // value is already JSON-stringified by createJSONStorage
      const data = JSON.parse(value) as Record<string, unknown>;

      const target = (data.state as Record<string, unknown> | undefined) ?? data;

      for (const field of sensitive) {
        if (target[field] !== undefined) {
          const plaintext = JSON.stringify(target[field]);
          const encrypted = await encryptSensitive(plaintext);
          target[field] = {
            __encrypted: true as const,
            iv: encrypted.iv,
            ciphertext: encrypted.ciphertext,
          };
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(data));
    },

    removeItem(_name: string): void {
      localStorage.removeItem(storageKey);
    },
  };

  const storage = createJSONStorage<S>(() => rawStorage);

  return {
    name: storageKey,
    storage,
    version: 1,
    partialize: (state) => {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(state as Record<string, unknown>)) {
        if (typeof value !== 'function') {
          result[key] = value;
        }
      }
      return result as S;
    },
  };
}
