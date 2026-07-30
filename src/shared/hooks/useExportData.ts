import { useState, useCallback } from 'react';
import { useTrackerStore } from '@shared/stores/trackerStore';
import { useLogStore } from '@shared/stores/logStore';
import { useNudgeStore } from '@shared/stores/nudgeStore';
import { useActivityStore } from '@shared/stores/activityStore';
import { usePlanStore } from '@/features/recipe-engine/planStore';
import { useBiomarkerStore } from '@shared/stores/biomarkerStore';

function stripActions<T extends object>(state: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value !== 'function') {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);

  const exportAllData = useCallback(() => {
    setIsExporting(true);

    try {
      // Aggregate all 6 stores — strip actions (functions) from each
      const tracker = stripActions(useTrackerStore.getState());
      const log = stripActions(useLogStore.getState());
      const nudge = stripActions(useNudgeStore.getState());
      const activity = stripActions(useActivityStore.getState());
      const plan = stripActions(usePlanStore.getState());
      const biomarkerHistory = stripActions(useBiomarkerStore.getState());

      const payload = {
        tracker,
        log,
        nudge,
        activity,
        plan,
        biomarkerHistory,
        exportedAt: new Date().toISOString(),
      };

      // Create Blob and trigger download (offline-first, zero server interaction)
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `nutrifit-export-${formatDate(new Date())}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportAllData, isExporting };
}
