import type { ReactNode } from 'react'

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
