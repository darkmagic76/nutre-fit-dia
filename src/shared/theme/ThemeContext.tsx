import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { ThemeContext } from './ThemeContextValue'
import type { Theme, ResolvedTheme } from './types'

const STORAGE_KEY = 'nutrefitdia-theme'

const NEXT: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Theme
      if (parsed === 'light' || parsed === 'dark' || parsed === 'system') return parsed
    }
  } catch {
    /* localStorage unavailable — fall through to default */
  }
  return 'system'
}

function getSystemPrefersDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [systemDark, setSystemDark] = useState<boolean>(getSystemPrefersDark())

  const resolved: ResolvedTheme =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  /* Apply/remove .dark class on <html> whenever resolved changes */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  /* Subscribe to matchMedia change events only when theme === 'system' */
  const isSystem = theme === 'system'

  useEffect(() => {
    if (!isSystem) return

    let mql: MediaQueryList | null = null
    try {
      mql = window.matchMedia('(prefers-color-scheme: dark)')
    } catch {
      return
    }

    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mql.addEventListener('change', handler)
    return () => mql?.removeEventListener('change', handler)
  }, [isSystem])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* localStorage unavailable — state still updates */
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(NEXT[theme])
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
