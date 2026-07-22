interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: 'default' | 'danger' | 'success';
}

export function StatCard({ label, value, sub, variant = 'default' }: StatCardProps) {
  const bg =
    variant === 'danger'
      ? 'bg-red-50 dark:bg-red-950'
      : variant === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-950'
        : 'bg-stone-50 dark:bg-zinc-700/60';
  const textColor =
    variant === 'danger'
      ? 'text-red-600 dark:text-red-400'
      : variant === 'success'
        ? 'text-emerald-700 dark:text-emerald-400'
        : 'text-emerald-700 dark:text-emerald-400';

  return (
    <div
      className={`${bg} p-3 rounded-lg`}
      role="status"
      aria-label={`${label}: ${value}`}
      data-variant={variant}
    >
      <strong className="text-xs text-stone-500 dark:text-zinc-400">{label}</strong>
      <p className={`text-lg sm:text-xl font-bold ${textColor}`}>{value}</p>
      {sub && <p className="text-xs text-stone-400 dark:text-zinc-500">{sub}</p>}
    </div>
  );
}
