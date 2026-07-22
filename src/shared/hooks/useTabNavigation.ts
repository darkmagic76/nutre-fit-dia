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
  const [tab, setTab] = useState<Tab>('scanner');

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
    [tab],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyNav);
    return () => document.removeEventListener('keydown', handleKeyNav);
  }, [handleKeyNav]);

  return { tab, setTab };
}
