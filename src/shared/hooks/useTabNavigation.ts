import { useState, useCallback, useEffect } from 'react';

export type Tab =
  'scanner' | 'log' | 'metabolic' | 'plan' | 'activity' | 'nudges' | 'sustainability';

export const TAB_IDS: Tab[] = [
  'scanner',
  'log',
  'metabolic',
  'plan',
  'activity',
  'nudges',
  'sustainability',
];

const STORAGE_KEY = 'nutrefitdia-activeTab';

function isValidTab(value: string): value is Tab {
  return (TAB_IDS as string[]).includes(value);
}

function readTab(): Tab {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && isValidTab(stored)) return stored;
  } catch {
    // sessionStorage unavailable (SSR, privacy mode) — fall back to default
  }
  return 'scanner';
}

export const TAB_ICONS: Record<Tab, string> = {
  scanner: '🔍',
  log: '📝',
  metabolic: '📊',
  plan: '📅',
  activity: '🏃',
  nudges: '🔔',
  sustainability: '🌍',
};

export function useTabNavigation() {
  const [tab, setTabState] = useState<Tab>(readTab);

  const setTab = useCallback((next: Tab) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      // sessionStorage write failed — state still updates for current session
    }
    setTabState(next);
  }, []);

  const handleKeyNav = useCallback(
    (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const currentIndex = TAB_IDS.indexOf(tab);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setTab(TAB_IDS[(currentIndex + 1) % TAB_IDS.length]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setTab(TAB_IDS[(currentIndex - 1 + TAB_IDS.length) % TAB_IDS.length]);
      }
    },
    [tab, setTab],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyNav);
    return () => document.removeEventListener('keydown', handleKeyNav);
  }, [handleKeyNav]);

  return { tab, setTab };
}
