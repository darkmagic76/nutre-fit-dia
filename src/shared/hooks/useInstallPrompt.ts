import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const COOLDOWN_KEY = 'nutrefitdia-install-dismissed';
const COOLDOWN_MS = 7 * 86400000;

interface UseInstallPromptReturn {
  isInstallable: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const bEvent = event as BeforeInstallPromptEvent;
      bEvent.preventDefault();

      try {
        const dismissed = localStorage.getItem(COOLDOWN_KEY);
        if (dismissed && Date.now() - parseInt(dismissed) < COOLDOWN_MS) {
          return; // suppressed — cooldown still active
        }
      } catch {
        /* localStorage unavailable — proceed without cooldown check */
      }

      setDeferredPrompt(bEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
    setIsInstallable(false);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    } catch {
      /* localStorage unavailable */
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  }, []);

  return { isInstallable, install, dismiss };
}
