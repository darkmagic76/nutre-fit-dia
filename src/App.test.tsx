import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '@shared/i18n'
import App from './App'

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
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn(() => null),
  }
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

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorage())
    vi.stubGlobal('matchMedia', vi.fn(() => createMatchMedia(false)))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders and shows controls bar with locale toggle', () => {
    render(
      <I18nProvider>
        <App />
      </I18nProvider>
    )

    expect(screen.getByText('🇬🇧 EN')).toBeInTheDocument()
  })
})
