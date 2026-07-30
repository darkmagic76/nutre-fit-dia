import '@testing-library/jest-dom';

// JSDOM v29+ does not polyfill localStorage — provide a minimal one
const lsStore: Record<string, string> = {};

if (
  typeof globalThis.localStorage === 'undefined' ||
  typeof (globalThis.localStorage as Record<string, unknown>).getItem !== 'function'
) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem(key: string): string | null {
        return Object.prototype.hasOwnProperty.call(lsStore, key) ? lsStore[key] : null;
      },
      setItem(key: string, value: string): void {
        lsStore[key] = value;
      },
      removeItem(key: string): void {
        delete lsStore[key];
      },
      clear(): void {
        Object.keys(lsStore).forEach((k) => delete lsStore[k]);
      },
      get length(): number {
        return Object.keys(lsStore).length;
      },
      key(index: number): string | null {
        return Object.keys(lsStore)[index] ?? null;
      },
    },
    configurable: true,
  });
}

// Mock Web Crypto for fast unit tests (PBKDF2 with 100k iterations is too slow for JSDOM).
// Uses XOR + checksum so data round-trips with a real transformation and tamper detection.
const FAKE_KEY = {} as CryptoKey;
const FAKE_KEY_DATA = new Uint8Array(32).map((_, i) => ((i + 1) * 7) & 0xff);

function xorTransform(data: ArrayBuffer): ArrayBuffer {
  const src = new Uint8Array(data);
  const result = new Uint8Array(src.length);
  for (let i = 0; i < src.length; i++) {
    result[i] = src[i] ^ FAKE_KEY_DATA[i % FAKE_KEY_DATA.length];
  }
  return result.buffer as ArrayBuffer;
}

// Simple checksum (Fletcher-16 style) for tamper detection
function checksum16(data: Uint8Array): number {
  let s1 = 0,
    s2 = 0;
  for (let i = 0; i < data.length; i++) {
    s1 = (s1 + data[i]) % 255;
    s2 = (s2 + s1) % 255;
  }
  return (s2 << 8) | s1;
}

if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });
}

const originalSubtle = (globalThis.crypto as Record<string, unknown>).subtle;

if (originalSubtle) {
  const stubSubtle = {
    ...(originalSubtle as object),
    importKey: () => Promise.resolve(FAKE_KEY),
    deriveKey: () => Promise.resolve(FAKE_KEY),
    encrypt: (_algo: Record<string, unknown>, _key: CryptoKey, data: BufferSource) => {
      const src = new Uint8Array(data as ArrayBuffer);
      const cs = checksum16(src);
      // Prepend 2-byte checksum, then XOR the whole thing
      const withCs = new Uint8Array(src.length + 2);
      withCs[0] = (cs >> 8) & 0xff;
      withCs[1] = cs & 0xff;
      withCs.set(src, 2);
      return Promise.resolve(xorTransform(withCs.buffer));
    },
    decrypt: (_algo: Record<string, unknown>, _key: CryptoKey, data: BufferSource) => {
      const transformed = new Uint8Array(xorTransform(data as ArrayBuffer));
      if (transformed.length < 2) {
        return Promise.reject(new Error('Invalid ciphertext'));
      }
      const expectedCs = (transformed[0] << 8) | transformed[1];
      const payload = transformed.slice(2);
      const actualCs = checksum16(payload);
      if (expectedCs !== actualCs) {
        return Promise.reject(new Error('Authentication failed — data may be tampered'));
      }
      return Promise.resolve(payload.buffer as ArrayBuffer);
    },
    getRandomValues: <T extends ArrayBufferView>(array: T): T => {
      const view = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < view.length; i++) {
        view[i] = (i + 1) & 0xff;
      }
      return array;
    },
  };

  Object.defineProperty(globalThis.crypto, 'subtle', {
    value: stubSubtle,
    configurable: true,
  });
}
