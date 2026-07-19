import { createContext } from 'react'
import type { Translations } from './types'
import type { Locale } from './I18nContext'

interface I18nContextValue {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)
