import type { SystemNotification } from '@shared/domain'

interface NudgePanelViewProps {
  pending: SystemNotification[]
  history: SystemNotification[]
  onDismiss: (id: string) => void
  onAcknowledge: (id: string) => void
}

export function NudgePanelView({
  pending,
  history,
  onDismiss,
}: NudgePanelViewProps) {
  return (
    <div className="space-y-3" aria-label="Panel de nudges">
      {/* Badge counter */}
      {pending.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" aria-label="Nudges pendientes">
            {pending.length}
          </span>
          <span className="text-sm text-stone-600">nudges activos</span>
        </div>
      )}

      {/* Empty state */}
      {pending.length === 0 && (
        <p className="text-sm text-stone-400 italic">Sin nudges activos</p>
      )}

      {/* Pending nudges list */}
      {pending.map(nudge => (
        <div
          key={nudge.id}
          className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex justify-between items-start gap-2"
          role="status"
        >
          <div className="min-w-0">
            <p className="font-medium text-sm text-stone-800">{nudge.title}</p>
            <p className="text-xs text-stone-500 mt-0.5">{nudge.body}</p>
          </div>
          <button
            onClick={() => onDismiss(nudge.id)}
            className="text-xs text-stone-400 hover:text-stone-600 underline shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Descartar: ${nudge.title}`}
          >
            ✕
          </button>
        </div>
      ))}

      {/* Engagement history */}
      {history.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-stone-500 hover:text-stone-700 min-h-[44px] flex items-center">
            Historial de engagement
            <span className="ml-2 bg-stone-200 text-stone-600 text-xs px-1.5 rounded-full">
              {history.length}
            </span>
          </summary>
          <ul className="mt-2 space-y-1 ml-2">
            {history.map(entry => (
              <li key={entry.id} className="text-xs text-stone-400 border-l-2 border-stone-200 pl-2">
                <span className="text-stone-500">{entry.title}</span>
                <span className="ml-1">
                  {entry.dismissedAt ? '— descartado' : '— reconocido'}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
