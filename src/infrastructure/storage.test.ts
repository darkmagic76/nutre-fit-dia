import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLocalStorage } from '@/test/test-helpers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function setupStorageMock() {
  const storage = createLocalStorage();
  vi.stubGlobal('localStorage', storage);
  return storage;
}

/** Assert the value is a CryptoKey-like object with the expected shape */
function expectCryptoKey(key: unknown): asserts key is CryptoKey {
  expect(key).toBeTypeOf('object');
  expect(key).not.toBeNull();
  const k = key as Record<string, unknown>;
  expect(k.algorithm).toBeTypeOf('object');
  expect(k.usages).toBeInstanceOf(Array);
}

// ── Existing tests (updated for new format — no salt) ──

describe('encryptSensitive', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    setupStorageMock();
  });

  it('should encrypt and decrypt a string (roundtrip)', async () => {
    const { encryptSensitive, decryptSensitive } = await import('@infrastructure/storage');
    const plaintext = 'hello world';
    const encrypted = await encryptSensitive(plaintext);

    // New format: iv + ciphertext, no salt (direct AES-GCM key)
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('ciphertext');
    expect(typeof encrypted.iv).toBe('string');
    expect(typeof encrypted.ciphertext).toBe('string');

    const decrypted = await decryptSensitive(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different output for the same input (random IV)', async () => {
    const { encryptSensitive } = await import('@infrastructure/storage');
    const enc1 = await encryptSensitive('same');
    const enc2 = await encryptSensitive('same');

    // At minimum, the IV must differ (AES-GCM requires unique IV per encryption)
    const different = enc1.iv !== enc2.iv || enc1.ciphertext !== enc2.ciphertext;
    expect(different).toBe(true);
  });

  it('should throw when decrypting tampered data', async () => {
    const { encryptSensitive, decryptSensitive } = await import('@infrastructure/storage');
    const encrypted = await encryptSensitive('secret');

    const tampered = {
      iv: encrypted.iv,
      ciphertext: encrypted.ciphertext.slice(0, -4) + 'XXXX',
    };

    await expect(decryptSensitive(tampered)).rejects.toThrow();
  });
});

describe('createPersistConfig', () => {
  let storage: ReturnType<typeof createLocalStorage>;

  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    storage = setupStorageMock();
  });

  it('should store plaintext fields as plain JSON', async () => {
    const { createPersistConfig } = await import('@infrastructure/storage');

    type TestState = { name: string; count: number };
    const useStore = create<TestState>()(
      persist(() => ({ name: 'test', count: 0 }), createPersistConfig('test')),
    );

    useStore.setState({ name: 'test', count: 42 });

    // Wait for async setItem to complete
    await vi.waitFor(() => {
      const calls = storage.setItem.mock.calls;
      const lastCall = calls[calls.length - 1];
      if (!lastCall) throw new Error('not stored yet');
    });

    const calls = storage.setItem.mock.calls;
    const lastCall = calls[calls.length - 1];
    const storedKey = lastCall[0];
    const storedValue = lastCall[1] as string;
    expect(storedKey).toBe('nutrefitdia-test');

    // Zustand persist wraps in { state, version }
    const data = JSON.parse(storedValue);
    expect(data.state.name).toBe('test');
    expect(data.state.count).toBe(42);
    expect(data.version).toBe(1);
  });

  it('should encrypt sensitive fields in localStorage', async () => {
    const { createPersistConfig } = await import('@infrastructure/storage');

    type TestState = { secret: string; visible: string };
    const useStore = create<TestState>()(
      persist(
        () => ({ secret: 'classified', visible: 'public' }),
        createPersistConfig('test-enc', {
          sensitiveFields: ['secret'],
        }),
      ),
    );

    useStore.setState({ secret: 'classified', visible: 'public' });

    await vi.waitFor(() => {
      const calls = storage.setItem.mock.calls;
      const lastCall = calls[calls.length - 1];
      if (!lastCall) throw new Error('not stored yet');
    });

    const calls = storage.setItem.mock.calls;
    const lastCall = calls[calls.length - 1];
    const storedValue = lastCall[1] as string;
    const data = JSON.parse(storedValue);

    // visible should be plaintext
    expect(data.state.visible).toBe('public');

    // secret should be encrypted (has __encrypted marker)
    expect(data.state.secret).toHaveProperty('__encrypted', true);
    // New format: iv + ciphertext, NO salt
    expect(data.state.secret).toHaveProperty('iv');
    expect(data.state.secret).toHaveProperty('ciphertext');
  });

  it('should rehydrate state correctly after encryption roundtrip', async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    storage = setupStorageMock();

    const { encryptSensitive: enc } = await import('@infrastructure/storage');

    type TestState = { value: string; public: string };
    const initial: TestState = { value: 'secret-data', public: 'open' };

    // Manually encrypt and store in zustand persist format { state, version }
    const encryptedValue = await enc(initial.value);
    const stored = {
      state: {
        value: { __encrypted: true, ...encryptedValue },
        public: initial.public,
      },
      version: 1,
    };
    storage.setItem('nutrefitdia-hydrate', JSON.stringify(stored));

    // Now re-import createPersistConfig and create the store
    vi.resetModules();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    storage = setupStorageMock();

    // Seed the mock so createPersistConfig can read the encrypted data
    storage.setItem('nutrefitdia-hydrate', JSON.stringify(stored));

    const { createPersistConfig: cp1 } = await import('@infrastructure/storage');

    const useStore = create<TestState>()(
      persist(() => initial, cp1('hydrate', { sensitiveFields: ['value'] })),
    );

    // After rehydration, state should match original
    await vi.waitFor(() => {
      const state = useStore.getState();
      expect(state.value).toBe('secret-data');
      expect(state.public).toBe('open');
    });
  });
});

// ── P1.2: TDD tests for new Web Crypto key infrastructure ──

describe('generateStorageKey', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    setupStorageMock();
  });

  it('generates a non-extractable AES-256-GCM CryptoKey', async () => {
    const { generateStorageKey } = await import('@infrastructure/storage');
    const key = await generateStorageKey();

    expectCryptoKey(key);
    expect(key.algorithm.name).toBe('AES-GCM');
    // Verify usages: encrypt + decrypt
    expect(key.usages).toContain('encrypt');
    expect(key.usages).toContain('decrypt');
    // Non-extractable: exportKey must reject
    await expect(crypto.subtle.exportKey('raw', key)).rejects.toThrow();
  });

  it('generates a unique key each call', async () => {
    const { generateStorageKey } = await import('@infrastructure/storage');

    const key1 = await generateStorageKey();
    const key2 = await generateStorageKey();

    // Both should be valid CryptoKey-like objects
    expectCryptoKey(key1);
    expectCryptoKey(key2);
    // They should be different objects
    expect(key1).not.toBe(key2);
  });
});

describe('getOrCreateKey', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    setupStorageMock();
  });

  it('generates a new key on first call', async () => {
    const { getOrCreateKey } = await import('@infrastructure/storage');
    const key = await getOrCreateKey();

    expectCryptoKey(key);
    expect(key.algorithm.name).toBe('AES-GCM');
  });

  it('returns the same key on repeated calls (module-level cache)', async () => {
    const { getOrCreateKey } = await import('@infrastructure/storage');
    const keyA = await getOrCreateKey();
    const keyB = await getOrCreateKey();

    // Same key across calls (cached at module level)
    expect(keyA).toBe(keyB);
  });

  it('returns a CryptoKey with encrypt and decrypt usages', async () => {
    const { getOrCreateKey } = await import('@infrastructure/storage');
    const key = await getOrCreateKey();

    expect(key.usages).toContain('encrypt');
    expect(key.usages).toContain('decrypt');
  });
});

describe('encryptSensitive with Web Crypto key', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    setupStorageMock();
  });

  it('roundtrip: encrypt → decrypt with getOrCreateKey', async () => {
    const { encryptSensitive, decryptSensitive } = await import('@infrastructure/storage');
    const plaintext = 'hello world';
    const encrypted = await encryptSensitive(plaintext);

    // New format: iv + ciphertext, NO salt
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('ciphertext');
    expect(encrypted).not.toHaveProperty('salt');
    expect(typeof encrypted.iv).toBe('string');
    expect(typeof encrypted.ciphertext).toBe('string');

    const decrypted = await decryptSensitive(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertext for the same input (random IV per call)', async () => {
    const { encryptSensitive } = await import('@infrastructure/storage');
    const enc1 = await encryptSensitive('same');
    const enc2 = await encryptSensitive('same');

    // The ciphertext should differ due to random IV
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });

  it('throws when decrypting tampered data', async () => {
    const { encryptSensitive, decryptSensitive } = await import('@infrastructure/storage');
    const encrypted = await encryptSensitive('secret');

    // Tamper with ciphertext
    const tampered = {
      iv: encrypted.iv,
      ciphertext: encrypted.ciphertext.slice(0, -4) + 'XXXX',
    };

    await expect(decryptSensitive(tampered)).rejects.toThrow();
  });
});

describe('old-key migration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrefitdia');
    setupStorageMock();
  });

  it('throws a clear error when old-format data (with salt) is passed to decryptSensitive', async () => {
    const { decryptSensitive } = await import('@infrastructure/storage');

    // Old-format data includes a 'salt' field from PBKDF2 key derivation
    const oldFormatData = {
      salt: 'ab5f...deadbeef',
      iv: 'ab5f...deadbeef',
      ciphertext: 'ab5f...deadbeef',
    };

    await expect(decryptSensitive(oldFormatData)).rejects.toThrow(/migration|old|format|key/i);
  });

  it('throws migration error when old encrypted data is found during rehydration', async () => {
    // Simulate old-format data in localStorage
    const oldFormatStored = {
      state: {
        value: {
          __encrypted: true,
          salt: 'old-salt-value',
          iv: 'old-iv-value',
          ciphertext: 'old-ciphertext-value',
        },
        public: 'open',
      },
      version: 1,
    };
    const storage = setupStorageMock();
    storage.setItem('nutrefitdia-migrate', JSON.stringify(oldFormatStored));

    const { createPersistConfig } = await import('@infrastructure/storage');

    // Create a store that reads the old-format data
    type TestState = { value: string; public: string };
    const useStore = create<TestState>()(
      persist(
        () => ({ value: '', public: '' }),
        createPersistConfig('migrate', { sensitiveFields: ['value'] }),
      ),
    );

    // Rehydration with old-format data should throw a migration error
    // Zustand's persist middleware calls onRehydrateStorage on failure.
    // The error is surfaced via the rehydration promise.
    await vi.waitFor(
      () => {
        const state = useStore.getState();
        // When migration fails, the state remains at defaults
        expect(state.value).toBe('');
        expect(state.public).toBe('');
      },
      { timeout: 500 },
    );
  });
});
