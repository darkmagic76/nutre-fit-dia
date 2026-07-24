import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInstallPrompt } from './useInstallPrompt';

const COOLDOWN_KEY = 'nutrefitdia-install-dismissed';

function createLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn(() => null),
  };
}

describe('useInstallPrompt', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let localStorageMock: ReturnType<typeof createLocalStorage>;

  beforeEach(() => {
    localStorageMock = createLocalStorage();
    vi.stubGlobal('localStorage', localStorageMock);
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('captures beforeinstallprompt event and sets isInstallable=true', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isInstallable).toBe(false);

    const promptFn = vi.fn();
    const event = new Event('beforeinstallprompt');
    (event as any).prompt = promptFn;

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it('install() calls deferredPrompt.prompt() and sets isInstallable=false', async () => {
    const { result } = renderHook(() => useInstallPrompt());

    const promptFn = vi.fn().mockResolvedValue(undefined);
    const event = new Event('beforeinstallprompt');
    (event as any).prompt = promptFn;

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    await act(async () => {
      await result.current.install();
    });

    expect(promptFn).toHaveBeenCalledTimes(1);
    expect(result.current.isInstallable).toBe(false);
  });

  it('dismiss() sets localStorage cooldown key with timestamp', () => {
    const { result } = renderHook(() => useInstallPrompt());

    const promptFn = vi.fn();
    const event = new Event('beforeinstallprompt');
    (event as any).prompt = promptFn;

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(COOLDOWN_KEY, expect.any(String));
    expect(result.current.isInstallable).toBe(false);
  });

  it('cooldown suppresses re-prompt while within 7-day window', () => {
    const { result } = renderHook(() => useInstallPrompt());

    // Capture event and dismiss (sets cooldown to now)
    const promptFn = vi.fn();
    const event = new Event('beforeinstallprompt');
    (event as any).prompt = promptFn;
    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.isInstallable).toBe(true);

    act(() => {
      result.current.dismiss();
    });
    expect(result.current.isInstallable).toBe(false);

    // Dispatch a second beforeinstallprompt — cooldown still active
    const promptFn2 = vi.fn();
    const event2 = new Event('beforeinstallprompt');
    (event2 as any).prompt = promptFn2;
    act(() => {
      window.dispatchEvent(event2);
    });

    // isInstallable MUST remain false because cooldown hasn't expired
    expect(result.current.isInstallable).toBe(false);
  });

  it('cooldown expires after 7 days and allows re-prompt', () => {
    const { result } = renderHook(() => useInstallPrompt());

    // Set cooldown timestamp to 8 days ago
    const eightDaysAgo = Date.now() - 8 * 86400000;
    localStorageMock.setItem(COOLDOWN_KEY, String(eightDaysAgo));

    // Dispatch beforeinstallprompt — cooldown expired, should capture
    const promptFn = vi.fn();
    const event = new Event('beforeinstallprompt');
    (event as any).prompt = promptFn;

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => useInstallPrompt());

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    const handler = addEventListenerSpy.mock.calls[0][1];

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', handler);
  });

  it('install() returns early without error when deferredPrompt is null (no event)', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isInstallable).toBe(false);

    // Call install() without dispatching beforeinstallprompt — deferredPrompt is null
    await act(async () => {
      await result.current.install();
    });

    // Should not throw; isInstallable remains false
    expect(result.current.isInstallable).toBe(false);
  });
});
