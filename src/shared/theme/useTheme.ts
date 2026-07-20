import { useContext } from 'react'
import { ThemeContext } from './ThemeContextValue'
import type { ThemeContextValue } from './types'

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
