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
