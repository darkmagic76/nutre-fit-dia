import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from './ThemeContext'
import { useTheme } from './useTheme'

const STORAGE_KEY = 'nutrefitdia-theme'

function Consumer() {
  const { theme } = useTheme()
  return <div data-testid="theme-consumer">{theme}</div>
}

function DarkModeIndicator() {
  const { resolved } = useTheme()
  return <div data-testid="dark-indicator">{resolved}</div>
}

function createMatchMedia(matches: boolean) {
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
}

function createLocalStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k])
    }),
    key: vi.fn(() => null),
    get length() {
      return Object.keys(store).length
    },
  }
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorage())
    document.documentElement.classList.remove('dark')
    vi.stubGlobal('matchMedia', vi.fn(() => createMatchMedia(false)))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders children', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )
    expect(getByTestId('theme-consumer')).toBeInTheDocument()
  })

  it('applies .dark class on document.documentElement when theme is dark', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify('dark'))

    render(
      <ThemeProvider>
        <DarkModeIndicator />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('falls back to system when localStorage throws (private browsing)', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('QuotaExceeded')
      }),
      setItem: vi.fn(() => {
        throw new Error('QuotaExceeded')
      }),
    })

    const { getByTestId } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )

    expect(getByTestId('theme-consumer').textContent).toBe('system')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
