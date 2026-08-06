import { useState, useCallback } from 'react';
import { useTrackerStore } from '@infrastructure/stores/trackerStore';
import { useLogStore } from '@infrastructure/stores/logStore';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import { useActivityStore } from '@infrastructure/stores/activityStore';
import { useBiomarkerStore } from '@infrastructure/stores/biomarkerStore';
import { usePlanStore } from '@infrastructure/stores/planStore';
import { exportData as exportDataUseCase } from '@application/use-cases/exportData';

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
      // Delegate data aggregation to the use case — thin adapter wrapping Zustand stores
      const json = exportDataUseCase(
        useTrackerStore,
        useLogStore,
        useNudgeStore,
        useActivityStore,
        usePlanStore,
        useBiomarkerStore,
      );

      // Download logic stays in the hook (Web APIs are presentation-layer)
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
