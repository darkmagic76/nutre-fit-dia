import { useT } from '@shared/i18n';
import { formatSafetyAlert } from '@shared/ui/formatters/formatViolation';
import type { SafetyAlert } from '@shared/services/rationValidator';

interface SafetyAlertDisplayProps {
  alerts: SafetyAlert[];
  onAcknowledge?: (index: number) => void;
}

const SEVERITY_STYLES = {
  critical: 'bg-red-50 border-red-400 text-red-900',
  warning: 'bg-amber-50 border-amber-400 text-amber-900',
} as const;

export function SafetyAlertDisplay({ alerts, onAcknowledge }: SafetyAlertDisplayProps) {
  const t = useT();

  if (alerts.length === 0) return null;

  const labels: Record<string, string> = {
    critical: t['alert.severityCritical'],
    warning: t['alert.severityWarning'],
  };

  return (
    <div className="space-y-2" role="alert" aria-label={t['alert.safetyLabel']}>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-start justify-between gap-2 p-3 rounded-lg border text-sm ${SEVERITY_STYLES[alert.severity]}`}
        >
          <div>
            <span className="font-semibold">{labels[alert.severity]}:</span>{' '}
            {formatSafetyAlert(t, alert)}
          </div>
          {alert.acknowledgeRequired && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(i)}
              className="shrink-0 px-2 py-1 text-xs rounded bg-white/50 dark:bg-zinc-700/50 hover:bg-white/80 dark:hover:bg-zinc-600/80 transition min-h-[32px] min-w-[32px]"
              aria-label={`${t['alert.acknowledge']}: ${alert.message}`}
            >
              {t['alert.understood']}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
