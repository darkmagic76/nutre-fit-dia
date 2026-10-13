import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * resetDemoStorage tests — crypto-implementation-agnostic (no mock-specific
 * tamper semantics), so they pass under the jsdom XOR mock AND real Web Crypto.
 */
describe('resetDemoStorage', () => {
  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    const { encryptSensitive } = await import('@infrastructure/storage');
    // Seed representative persisted state (mirrors zustand persist key shape)
    localStorage.setItem('nutrefitdia-log', JSON.stringify({ state: {}, version: 1 }));
    localStorage.setItem('nutrefitdia-plan', JSON.stringify({ state: {}, version: 1 }));
    localStorage.setItem('other-app-x', 'untouched');
    await encryptSensitive('warmup');
  });

  it('removes all prefixed keys and preserves foreign keys', async () => {
    const { resetDemoStorage } = await import('@infrastructure/storage');

    await resetDemoStorage();

    expect(localStorage.getItem('nutrefitdia-log')).toBeNull();
    expect(localStorage.getItem('nutrefitdia-plan')).toBeNull();
    expect(localStorage.getItem('other-app-x')).toBe('untouched');
  });

  it('cycles the key: encrypt → reset → encrypt → decrypt roundtrips cleanly', async () => {
    const { encryptSensitive, decryptSensitive, resetDemoStorage } =
      await import('@infrastructure/storage');

    await encryptSensitive('before-reset');
    await resetDemoStorage();
    const encrypted = await encryptSensitive('after-reset');

    await expect(decryptSensitive(encrypted)).resolves.toBe('after-reset');
  });

  it('succeeds without IndexedDB (warn + localStorage-only fallback)', async () => {
    const { resetDemoStorage } = await import('@infrastructure/storage');

    await expect(resetDemoStorage()).resolves.toBeUndefined();
    expect(localStorage.getItem('nutrefitdia-log')).toBeNull();
  });
});
