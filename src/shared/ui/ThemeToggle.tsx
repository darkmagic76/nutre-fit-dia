import type { Theme } from '@shared/theme/types'
import type { Translations } from '@shared/i18n/types'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
  t: Translations
}

const THEME_ICONS: Record<Theme, string> = {
  light: '☀️',
  dark: '🌑',
  system: '🌙',
}

export function ThemeToggle({ theme, onToggle, t }: ThemeToggleProps) {
  const label = t[`theme.${theme}` as keyof Translations] as string

  return (
    <button
      data-testid="theme-toggle"
      onClick={onToggle}
      aria-label={label}
      className="text-xs bg-emerald-700 hover:bg-emerald-600 text-emerald-200 px-3 py-1 rounded-full transition-colors"
    >
      {THEME_ICONS[theme]}
    </button>
  )
}
