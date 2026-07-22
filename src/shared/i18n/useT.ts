import { useContext } from 'react';
import { I18nContext } from './I18nContextValue';
import type { Translations } from './types';

export function useT(): Translations {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx.t;
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLocale must be used within I18nProvider');
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}
