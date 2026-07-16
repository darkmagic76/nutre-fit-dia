import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean
  children: ReactNode
}

export function TabButton({ active, children, ...props }: TabButtonProps) {
  return (
    <button
      {...props}
      role="tab"
      aria-selected={active}
      className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        active
          ? 'bg-white text-emerald-800 shadow-sm'
          : 'bg-emerald-700 text-emerald-100 hover:bg-emerald-600'
      }`}
    >
      {children}
    </button>
  )
}

interface CardProps {
  children: ReactNode
  title: string
  description?: string
}

export function Card({ children, title, description }: CardProps) {
  return (
    <section
      className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4"
      aria-labelledby={`card-title-${title.replace(/\s+/g, '-')}`}
    >
      <header>
        <h2
          id={`card-title-${title.replace(/\s+/g, '-')}`}
          className="text-lg sm:text-xl font-semibold text-emerald-700"
        >
          {title}
        </h2>
        {description && (
          <p className="text-stone-500 text-sm mt-1">{description}</p>
        )}
      </header>
      {children}
    </section>
  )
}

interface ViolationListProps {
  violations: Array<{ message: string; direction?: 'under' | 'over' }>
  type?: 'error' | 'warning'
}

export function ViolationList({ violations, type = 'error' }: ViolationListProps) {
  if (violations.length === 0) return null

  const styles = type === 'error'
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div
      className={`p-3 rounded-lg text-sm space-y-1 border ${styles}`}
      role="alert"
      aria-live="polite"
    >
      <p className="font-medium">
        {type === 'error' ? '⚠️ Violaciones detectadas:' : '💡 Sugerencias:'}
      </p>
      <ul className="list-disc list-inside">
        {violations.map((v, i) => (
          <li key={i}>{v.message}</li>
        ))}
      </ul>
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  id: string
}

export function SelectField({ label, value, onChange, options, placeholder, id }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full min-h-[44px] p-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
        aria-label={label}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

interface NumberFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  id: string
  min?: number
  step?: string
}

export function NumberField({ label, value, onChange, id, min, step }: NumberFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        step={step}
        className="w-full min-h-[44px] p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
        aria-label={label}
        inputMode="decimal"
      />
    </div>
  )
}

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function PrimaryButton({ children, disabled, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className="w-full min-h-[44px] bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition"
    >
      {children}
    </button>
  )
}

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
