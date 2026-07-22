interface ViolationListProps {
  violations: Array<{ message: string }>;
  type?: 'error' | 'warning';
  errorLabel?: string;
  warningLabel?: string;
}

export function ViolationList({
  violations,
  type = 'error',
  errorLabel = '⚠️ Violaciones detectadas:',
  warningLabel = '💡 Sugerencias:',
}: ViolationListProps) {
  if (violations.length === 0) return null;

  const styles =
    type === 'error'
      ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';

  return (
    <div
      className={`p-3 rounded-lg text-sm space-y-1 border ${styles}`}
      role="alert"
      aria-live="polite"
    >
      <p className="font-medium">{type === 'error' ? errorLabel : warningLabel}</p>
      <ul className="list-disc list-inside">
        {violations.map((v, i) => (
          <li key={i}>{v.message}</li>
        ))}
      </ul>
    </div>
  );
}
