import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockScannerAdapter } from './MockScannerAdapter';

describe('MockScannerAdapter', () => {
  let adapter: MockScannerAdapter;

  beforeEach(() => {
    vi.useFakeTimers();
    adapter = new MockScannerAdapter();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isAvailable', () => {
    it('returns true by default', () => {
      expect(adapter.isAvailable()).toBe(true);
    });
  });

  describe('getModelInfo', () => {
    it('returns MockScanner model metadata', () => {
      const info = adapter.getModelInfo();
      expect(info.name).toBe('MockScanner');
      expect(info.version).toBe('0.1.0');
      expect(info.inputShape).toEqual([0, 0]);
    });
  });

  describe('scan', () => {
    it('returns empty foodId and zero confidence for any input', async () => {
      const promise = adapter.scan({ ingredientText: 'test' });
      vi.advanceTimersByTime(300);
      const result = await promise;

      expect(result.foodId).toBe('');
      expect(result.confidence).toBe(0);
    });

    it('parses comma-separated ingredients', async () => {
      const promise = adapter.scan({ ingredientText: 'agua, azúcar, conservantes' });
      vi.advanceTimersByTime(300);
      const result = await promise;

      expect(result.ingredients).toEqual(['agua', 'azúcar', 'conservantes']);
    });

    it('detects added sugars from ingredient list using shared SUGAR_ALIASES', async () => {
      const promise = adapter.scan({ ingredientText: 'agua, jarabe, sacarosa' });
      vi.advanceTimersByTime(300);
      const result = await promise;

      expect(result.detectedAddedSugars).toContain('jarabe');
      expect(result.detectedAddedSugars).toContain('sacarosa');
    });

    it('handles empty ingredient text gracefully', async () => {
      const promise = adapter.scan({});
      vi.advanceTimersByTime(300);
      const result = await promise;

      expect(result.ingredients).toEqual([]);
      expect(result.detectedAddedSugars).toEqual([]);
    });

    it('simulates 300ms latency per ADR-003', async () => {
      const promise = adapter.scan({ ingredientText: 'test' });
      // Before timer advances, promise should be pending
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });
      await vi.advanceTimersByTimeAsync(100);
      expect(resolved).toBe(false);
      await vi.advanceTimersByTimeAsync(200);
      expect(resolved).toBe(true);
    });
  });
});
