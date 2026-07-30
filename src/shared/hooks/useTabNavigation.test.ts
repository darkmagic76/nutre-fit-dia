import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabNavigation } from './useTabNavigation';

const STORAGE_KEY = 'nutrefitdia-activeTab';

describe('useTabNavigation', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('sessionStorage persistence', () => {
    it('persists active tab to sessionStorage when setTab is called', () => {
      const { result } = renderHook(() => useTabNavigation());

      act(() => result.current.setTab('log'));

      expect(sessionStorage.getItem(STORAGE_KEY)).toBe('log');
    });

    it('hydrates tab from sessionStorage on init when stored value is valid', () => {
      sessionStorage.setItem(STORAGE_KEY, 'activity');

      const { result } = renderHook(() => useTabNavigation());

      expect(result.current.tab).toBe('activity');
    });

    it('defaults to scanner when sessionStorage is empty', () => {
      const { result } = renderHook(() => useTabNavigation());

      expect(result.current.tab).toBe('scanner');
    });

    it('defaults to scanner when sessionStorage has invalid tab value', () => {
      sessionStorage.setItem(STORAGE_KEY, 'invalid-tab');

      const { result } = renderHook(() => useTabNavigation());

      expect(result.current.tab).toBe('scanner');
    });

    it('updates sessionStorage when tab changes multiple times', () => {
      const { result } = renderHook(() => useTabNavigation());

      act(() => result.current.setTab('plan'));
      expect(sessionStorage.getItem(STORAGE_KEY)).toBe('plan');

      act(() => result.current.setTab('nudges'));
      expect(sessionStorage.getItem(STORAGE_KEY)).toBe('nudges');
    });
  });

  describe('basic setTab', () => {
    it('changes active tab', () => {
      const { result } = renderHook(() => useTabNavigation());

      act(() => result.current.setTab('metabolic'));

      expect(result.current.tab).toBe('metabolic');
    });
  });
});
