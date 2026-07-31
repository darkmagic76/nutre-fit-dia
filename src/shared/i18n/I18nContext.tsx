import { useState, useCallback, type ReactNode } from 'react';
import type { Translations } from './types';
import { es } from './es';
import { en } from './en';
import { I18nContext } from './I18nContextValue';

export type Locale = 'es' | 'en';

const translations: Record<Locale, Translations> = { es, en };
const STORAGE_KEY = 'nutrefitdia-locale';

function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en') return 'en';
  } catch {
    // localStorage unavailable (SSR, privacy mode) — fall back to default
  }
  return 'es';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readLocale);

  const handleSetLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage write failed — state still updates for current session
    }
    setLocale(next);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale: handleSetLocale }}>
      {children}
    </I18nContext.Provider>
  );
}
