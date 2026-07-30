import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('env', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('should parse valid environment variables', async () => {
    vi.stubEnv('VITE_STORAGE_PREFIX', 'nutrifit');
    vi.stubEnv('VITE_BASE_URL', '/');
    vi.stubEnv('VITE_LOG_LEVEL', 'info');

    const { env } = await import('@infrastructure/env');
    expect(env.VITE_STORAGE_PREFIX).toBe('nutrifit');
    expect(env.VITE_BASE_URL).toBe('/');
    expect(env.VITE_LOG_LEVEL).toBe('info');
  });

  it('should apply defaults when optional vars are missing', async () => {
    vi.stubEnv('VITE_STORAGE_PREFIX', 'test');

    const { env } = await import('@infrastructure/env');
    expect(env.VITE_STORAGE_PREFIX).toBe('test');
    expect(env.VITE_BASE_URL).toBe('/');
    expect(env.VITE_LOG_LEVEL).toBe('info');
  });

  it('should throw when VITE_STORAGE_PREFIX is missing', async () => {
    await expect(import('@infrastructure/env')).rejects.toThrow(/VITE_STORAGE_PREFIX/);
  });

  it('should throw when VITE_LOG_LEVEL is invalid', async () => {
    vi.stubEnv('VITE_STORAGE_PREFIX', 'test');
    vi.stubEnv('VITE_LOG_LEVEL', 'invalid');

    await expect(import('@infrastructure/env')).rejects.toThrow();
  });

  it('should accept all valid log levels', async () => {
    vi.stubEnv('VITE_STORAGE_PREFIX', 'app');
    for (const level of ['debug', 'info', 'warn', 'error'] as const) {
      vi.stubEnv('VITE_LOG_LEVEL', level);
      vi.resetModules();
      const { env } = await import('@infrastructure/env');
      expect(env.VITE_LOG_LEVEL).toBe(level);
    }
  });

  it('should accept custom VITE_BASE_URL', async () => {
    vi.stubEnv('VITE_STORAGE_PREFIX', 'app');
    vi.stubEnv('VITE_BASE_URL', '/custom-path/');

    const { env } = await import('@infrastructure/env');
    expect(env.VITE_BASE_URL).toBe('/custom-path/');
  });
});
