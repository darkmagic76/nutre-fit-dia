import { useT } from '@shared/i18n';
import type { SystemNotification } from '@shared/domain';

interface NudgePanelViewProps {
  pending: SystemNotification[];
  history: SystemNotification[];
  onDismiss: (id: string) => void;
}

/**
 * Resolve an i18n key to its translated string.
 * If the key contains '|', the part before '|' is the key and after is
 * a comma-separated replacement for {names} (used by SUSTAINABLE_SUBSTITUTION).
 */
function translateBody(t: Record<string, string>, raw: string): string {
  const pipeIdx = raw.indexOf('|');
  if (pipeIdx === -1) {
    return (t as unknown as Record<string, string>)[raw] ?? raw;
  }
  const key = raw.slice(0, pipeIdx);
  const replacements = raw.slice(pipeIdx + 1);
  return ((t as unknown as Record<string, string>)[key] ?? key).replace('{names}', replacements);
}

export function NudgePanelView({ pending, history, onDismiss }: NudgePanelViewProps) {
  const t = useT();

  return (
    <div className="space-y-3" aria-label={t['nudges.panelLabel']}>
      {/* Badge counter */}
      {pending.length > 0 && (
        <div className="flex items-center gap-2">
          <span
            className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
            aria-label={t['nudges.pendingLabel']}
          >
            {pending.length}
          </span>
          <span className="text-sm text-stone-600 dark:text-zinc-400">{t['nudges.active']}</span>
        </div>
      )}

      {/* Empty state */}
      {pending.length === 0 && (
        <p className="text-sm text-stone-400 dark:text-zinc-500 italic">{t['nudges.empty']}</p>
      )}

      {/* Pending nudges list */}
      {pending.map((nudge) => (
        <div
          key={nudge.id}
          className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex justify-between items-start gap-2"
          role="status"
        >
          <div className="min-w-0">
            <p className="font-medium text-sm text-stone-800 dark:text-zinc-200">
              {(t as unknown as Record<string, string>)[nudge.title] ?? nudge.title}
            </p>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              {translateBody(t as unknown as Record<string, string>, nudge.body)}
            </p>
          </div>
          <button
            onClick={() => onDismiss(nudge.id)}
            className="text-xs text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 underline shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={t['nudges.dismissAria'].replace(
              '{title}',
              (t as unknown as Record<string, string>)[nudge.title] ?? nudge.title,
            )}
          >
            ✕
          </button>
        </div>
      ))}

      {/* Engagement history */}
      {history.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 min-h-[44px] flex items-center">
            {t['nudges.history']}
            <span className="ml-2 bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300 text-xs px-1.5 rounded-full">
              {history.length}
            </span>
          </summary>
          <ul className="mt-2 space-y-1 ml-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="text-xs text-stone-400 dark:text-zinc-500 border-l-2 border-stone-200 dark:border-zinc-700 pl-2"
              >
                <span className="text-stone-500 dark:text-zinc-400">
                  {(t as unknown as Record<string, string>)[entry.title] ?? entry.title}
                </span>
                <span className="ml-1">
                  {entry.dismissedAt
                    ? `— ${t['nudges.dismissed']}`
                    : `— ${t['nudges.acknowledged']}`}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
