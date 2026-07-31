import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { I18nProvider } from './I18nContext';
import { useT, useLocale } from './useT';
import { createElement, type ReactNode } from 'react';

const STORAGE_KEY = 'nutrefitdia-locale';

function wrapper({ children }: { children: ReactNode }) {
  return createElement(I18nProvider, null, children);
}

describe('I18nContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides Spanish translations by default', () => {
    const { result } = renderHook(() => useT(), { wrapper });
    expect(result.current['app.title']).toBe('NutreFitDia');
    expect(result.current['tab.scanner']).toBe('Semáforo');
  });

  it('switches to English when setLocale is called', () => {
    const { result } = renderHook(
      () => {
        const t = useT();
        const { setLocale } = useLocale();
        return { t, setLocale };
      },
      { wrapper },
    );

    act(() => result.current.setLocale('en'));
    expect(result.current.t['app.title']).toBe('NutreFitDia');
    expect(result.current.t['tab.scanner']).toBe('Traffic Light');
  });

  it('throws when useT is used outside provider', () => {
    expect(() => renderHook(() => useT())).toThrow('useT must be used within I18nProvider');
  });

  it('throws when useLocale is used outside provider', () => {
    expect(() => renderHook(() => useLocale())).toThrow(
      'useLocale must be used within I18nProvider',
    );
  });

  it('has all keys matching between en and es', () => {
    const { result } = renderHook(() => ({ t: useT(), ...useLocale() }), { wrapper });
    const esKeys = Object.keys(result.current.t).sort();

    act(() => result.current.setLocale('en'));

    const enKeys = Object.keys(result.current.t).sort();
    expect(esKeys).toEqual(enKeys);
    expect(esKeys.length).toBeGreaterThan(50);
  });

  // --- Locale persistence via localStorage ---

  it('persists locale to localStorage when changed', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => result.current.setLocale('en'));

    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
  });

  it('hydrates locale from localStorage on mount', () => {
    // Pre-seed localStorage with English
    localStorage.setItem(STORAGE_KEY, 'en');

    // New provider mount — should read from localStorage
    const { result } = renderHook(() => useT(), { wrapper });

    expect(result.current['tab.scanner']).toBe('Traffic Light');
  });

  it('defaults to Spanish when localStorage is empty', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });
    expect(result.current.locale).toBe('es');
  });
});
