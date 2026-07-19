interface StatCardProps {
  label: string
  value: string
  sub?: string
  variant?: 'default' | 'danger' | 'success'
}

export function StatCard({ label, value, sub, variant = 'default' }: StatCardProps) {
  const bg = variant === 'danger' ? 'bg-red-50' : variant === 'success' ? 'bg-emerald-50' : 'bg-stone-50'
  const textColor = variant === 'danger' ? 'text-red-600' : variant === 'success' ? 'text-emerald-700' : 'text-emerald-700'

  return (
    <div className={`${bg} p-3 rounded-lg`} role="status" aria-label={`${label}: ${value}`}>
      <strong className="text-xs text-stone-500">{label}</strong>
      <p className={`text-lg sm:text-xl font-bold ${textColor}`}>{value}</p>
      {sub && <p className="text-xs text-stone-400">{sub}</p>}
    </div>
  )
}
