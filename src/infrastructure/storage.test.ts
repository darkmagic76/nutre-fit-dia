import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLocalStorage } from '@/test/test-helpers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function setupStorageMock() {
  const storage = createLocalStorage();
  vi.stubGlobal('localStorage', storage);
  return storage;
}

describe('encryptSensitive', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrifit');
    setupStorageMock();
  });

  it('should encrypt and decrypt a string (roundtrip)', async () => {
    const { encryptSensitive, decryptSensitive } = await import('@infrastructure/storage');
    const plaintext = 'hello world';
    const encrypted = await encryptSensitive(plaintext);

    expect(encrypted).toHaveProperty('salt');
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('ciphertext');
    expect(typeof encrypted.salt).toBe('string');
    expect(typeof encrypted.iv).toBe('string');
    expect(typeof encrypted.ciphertext).toBe('string');

    const decrypted = await decryptSensitive(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different output for the same input (random IV)', async () => {
    const { encryptSensitive } = await import('@infrastructure/storage');
    const enc1 = await encryptSensitive('same');
    const enc2 = await encryptSensitive('same');

    const different =
      enc1.salt !== enc2.salt || enc1.iv !== enc2.iv || enc1.ciphertext !== enc2.ciphertext;
    expect(different).toBe(true);
  });

  it('should throw when decrypting tampered data', async () => {
    const { encryptSensitive, decryptSensitive } = await import('@infrastructure/storage');
    const encrypted = await encryptSensitive('secret');

    const tampered = {
      ...encrypted,
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
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrifit');
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
    expect(storedKey).toBe('nutrifit-test');

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
    expect(data.state.secret).toHaveProperty('salt');
    expect(data.state.secret).toHaveProperty('iv');
    expect(data.state.secret).toHaveProperty('ciphertext');
  });

  it('should rehydrate state correctly after encryption roundtrip', async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrifit');
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
    storage.setItem('nutrifit-hydrate', JSON.stringify(stored));

    // Now re-import createPersistConfig and create the store
    vi.resetModules();
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrifit');
    storage = setupStorageMock();

    // Seed the mock so createPersistConfig can read the encrypted data
    storage.setItem('nutrifit-hydrate', JSON.stringify(stored));

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
