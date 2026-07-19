import { useState, useCallback, type ReactNode } from 'react'
import type { Translations } from './types'
import { es } from './es'
import { en } from './en'
import { I18nContext } from './I18nContextValue'

export type Locale = 'es' | 'en'

const translations: Record<Locale, Translations> = { es, en }

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es')

  const handleSetLocale = useCallback((next: Locale) => setLocale(next), [])

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale: handleSetLocale }}>
      {children}
    </I18nContext.Provider>
  )
}
