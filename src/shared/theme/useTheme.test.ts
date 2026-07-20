import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { ThemeProvider } from './ThemeContext'
import { useTheme } from './useTheme'

const STORAGE_KEY = 'nutrefitdia-theme'

interface MatchMediaMock {
  matches: boolean
  media: string
  onchange: null
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  _fire: (event: string) => void
}

function createMatchMedia(initialMatches: boolean): MatchMediaMock {
  const listeners: Record<string, Array<(event: { matches: boolean }) => void>> = {}
  const mock: MatchMediaMock = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn((event: string, handler: (event: { matches: boolean }) => void) => {
      listeners[event] ??= []
      listeners[event]!.push(handler)
    }),
    removeEventListener: vi.fn(),
    _fire(event: string) {
      listeners[event]?.forEach((fn) => fn({ matches: mock.matches }))
    },
  }
  return mock
}

function wrapper({ children }: { children: ReactNode }) {
  return createElement(ThemeProvider, null, children)
}

/** Create an in-memory localStorage mock */
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
    key: vi.fn((_index: number) => null),
  }
}

describe('useTheme', () => {
  let matchMediaMock: ReturnType<typeof createMatchMedia>
  let localStorageMock: ReturnType<typeof createLocalStorage>

  beforeEach(() => {
    localStorageMock = createLocalStorage()
    vi.stubGlobal('localStorage', localStorageMock)

    matchMediaMock = createMatchMedia(false)
    vi.stubGlobal('matchMedia', vi.fn(() => matchMediaMock))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('defaults to system when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('system')
  })

  it('cycles light → dark → system → light via toggleTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('system')

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('system')

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
  })

  it('persists theme to localStorage on change', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => result.current.setTheme('dark'))
    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify('dark'))

    act(() => result.current.setTheme('light'))
    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify('light'))

    act(() => result.current.setTheme('system'))
    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify('system'))
  })

  it('reacts to matchMedia change events when theme is system', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('system')
    expect(result.current.resolved).toBe('light') // default mock matches: false → light

    matchMediaMock.matches = true
    act(() => {
      matchMediaMock._fire('change')
    })
    expect(result.current.resolved).toBe('dark')
  })

  it('throws descriptive error when used outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within ThemeProvider'
    )
  })
})
