import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { I18nProvider, useLocale } from '@shared/i18n';
import { useFoodName } from './useFoodName';

const STORAGE_KEY = 'nutrefitdia-locale';

function wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

describe('useFoodName', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('returns a stable mapping function, not a name for a single food', () => {
    const { result } = renderHook(() => useFoodName(), { wrapper });

    // The hook must return a pure function (called once at the top of a component),
    // NOT compute a name from a food argument. Calling a hook per-food inside a
    // loop violates the Rules of Hooks and crashes when the list size changes.
    expect(typeof result.current).toBe('function');
  });

  it('maps a food to its Spanish canonical name by default', () => {
    const { result } = renderHook(() => useFoodName(), { wrapper });

    expect(result.current({ name: 'Pan integral' })).toBe('Pan integral');
  });

  it('maps a food to its English name when locale is en', () => {
    const { result } = renderHook(
      () => {
        const getFoodName = useFoodName();
        const { setLocale } = useLocale();
        return { getFoodName, setLocale };
      },
      { wrapper },
    );

    act(() => result.current.setLocale('en'));

    expect(result.current.getFoodName({ name: 'Pan integral' })).toBe('Whole-grain bread');
  });

  it('falls back to the canonical name when no English mapping exists', () => {
    const { result } = renderHook(
      () => {
        const getFoodName = useFoodName();
        const { setLocale } = useLocale();
        return { getFoodName, setLocale };
      },
      { wrapper },
    );

    act(() => result.current.setLocale('en'));

    expect(result.current.getFoodName({ name: 'Alimento inexistente' })).toBe(
      'Alimento inexistente',
    );
  });

  it('maps many foods with a single hook call (safe inside loops)', () => {
    const { result } = renderHook(() => useFoodName(), { wrapper });

    const foods = [{ name: 'Pan integral' }, { name: 'Arroz integral' }, { name: 'Brócoli' }];
    const names = foods.map((food) => result.current(food));

    expect(names).toEqual(['Pan integral', 'Arroz integral', 'Brócoli']);
  });
});
