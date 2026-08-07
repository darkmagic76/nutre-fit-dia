import { useState, useCallback } from 'react';
import { useContainer } from '@shared/context/ContainerContext';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const { exportData } = useContainer();

  const exportAllData = useCallback(() => {
    setIsExporting(true);

    try {
      const json = exportData();

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
  }, [exportData]);

  return { exportAllData, isExporting };
}
