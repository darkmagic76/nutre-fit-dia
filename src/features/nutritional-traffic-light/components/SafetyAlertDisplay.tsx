import type { SafetyAlert } from '@shared/services/rationValidator'

interface SafetyAlertDisplayProps {
  alerts: SafetyAlert[]
  onAcknowledge?: (index: number) => void
}

const SEVERITY_STYLES = {
  critical: 'bg-red-50 border-red-400 text-red-900',
  warning: 'bg-amber-50 border-amber-400 text-amber-900',
} as const

const SEVERITY_LABELS = {
  critical: 'Crítico',
  warning: 'Advertencia',
} as const

export function SafetyAlertDisplay({ alerts, onAcknowledge }: SafetyAlertDisplayProps) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2" role="alert" aria-label="Alertas de seguridad clínica">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-start justify-between gap-2 p-3 rounded-lg border text-sm ${SEVERITY_STYLES[alert.severity]}`}
        >
          <div>
            <span className="font-semibold">{SEVERITY_LABELS[alert.severity]}:</span>{' '}
            {alert.message}
          </div>
          {alert.acknowledgeRequired && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(i)}
              className="shrink-0 px-2 py-1 text-xs rounded bg-white/50 hover:bg-white/80 transition min-h-[32px] min-w-[32px]"
              aria-label={`Reconocer alerta: ${alert.message}`}
            >
              Entendido
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
