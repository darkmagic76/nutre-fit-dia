import { type PersistOptions, type StateStorage, createJSONStorage } from 'zustand/middleware';
import { env } from './env';

const KEY_MATERIAL = new TextEncoder().encode('nutre-fit-dia-storage-encryption-v1');

export interface EncryptedData {
  salt: string;
  iv: string;
  ciphertext: string;
}

interface EncryptedField extends EncryptedData {
  __encrypted: true;
}

function isEncryptedField(value: unknown): value is EncryptedField {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__encrypted' in value &&
    (value as EncryptedField).__encrypted === true
  );
}

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

async function deriveAesKey(salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey('raw', KEY_MATERIAL, 'PBKDF2', false, [
    'deriveKey',
  ]);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptSensitive(data: string): Promise<EncryptedData> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveAesKey(salt);
  const plainBytes = new TextEncoder().encode(data);
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainBytes);

  return {
    salt: bufToBase64(salt.buffer as ArrayBuffer),
    iv: bufToBase64(iv.buffer as ArrayBuffer),
    ciphertext: bufToBase64(cipherBuf),
  };
}

export async function decryptSensitive(encrypted: EncryptedData): Promise<string> {
  const saltBuf = base64ToBuf(encrypted.salt);
  const ivBuf = base64ToBuf(encrypted.iv);
  const ctBuf = base64ToBuf(encrypted.ciphertext);

  const salt = new Uint8Array(saltBuf);
  const iv = new Uint8Array(ivBuf);
  const ciphertext = new Uint8Array(ctBuf);

  const key = await deriveAesKey(salt);
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );

  return new TextDecoder().decode(plainBuf);
}

/**
 * Returns a Zustand PersistOptions for a store.
 *
 * Wraps localStorage with AES-GCM encryption for fields listed in
 * `opts.sensitiveFields`. The persist config uses `createJSONStorage`
 * so Zustand handles JSON serialization; the inner storage replaces
 * sensitive values with `{ __encrypted: true, salt, iv, ciphertext }`
 * before writing and decrypts them back on read.
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
            salt: encrypted.salt,
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
