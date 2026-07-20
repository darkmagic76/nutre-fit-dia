import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'
import type { Translations } from '@shared/i18n/types'
import type { Theme } from '@shared/theme/types'

const baseT: Translations = {
  'app.title': '',
  'app.subtitle': '',
  'app.keyboardHint': '',
  'app.footer.tfm': '',
  'app.footer.disclaimer': '',
  'app.footer.security': '',
  'tab.scanner': '',
  'tab.log': '',
  'tab.metabolic': '',
  'tab.plan': '',
  'tab.activity': '',
  'tab.nudges': '',
  'tab.sustainability': '',
  'ui.scan': '',
  'ui.classify': '',
  'ui.addToLog': '',
  'ui.generatePlan': '',
  'ui.calculate': '',
  'ui.remove': '',
  'ui.selectFood': '',
  'ui.noSelection': '',
  'ui.violations': '',
  'ui.suggestions': '',
  'ui.caloricRestriction': '',
  'ui.activateRestriction': '',
  'ui.planValid': '',
  'ui.planViolations': '',
  'ui.day': '',
  'ui.foods': '',
  'ui.violationsCount': '',
  'scanner.title': '',
  'scanner.description': '',
  'scanner.emptySelection': '',
  'scanner.noFoodSelected': '',
  'log.title': '',
  'log.description': '',
  'log.emptyProfile': '',
  'log.dailyObjective': '',
  'log.noRestriction': '',
  'metabolic.title': '',
  'metabolic.description': '',
  'metabolic.bmr': '',
  'metabolic.tdee': '',
  'metabolic.deficit': '',
  'metabolic.target': '',
  'metabolic.restrictionActive': '',
  'metabolic.noRestriction': '',
  'metabolic.profileError': '',
  'plan.title': '',
  'plan.description': '',
  'activity.title': '',
  'activity.description': '',
  'activity.minutes': '',
  'activity.strength': '',
  'activity.compliance': '',
  'activity.streak': '',
  'activity.objectiveMet': '',
  'nudges.title': '',
  'nudges.description': '',
  'nudges.empty': '',
  'nudges.dismiss': '',
  'sustainability.title': '',
  'sustainability.description': '',
  'sustainability.scoring': '',
  'sustainability.scoringDesc': '',
  'sustainability.carbon': '',
  'sustainability.seasonality': '',
  'sustainability.proximity': '',
  'sustainability.zeroWaste': '',
  'sustainability.zeroWasteDesc': '',
  'sustainability.zeroWasteFooter': '',
  'sustainability.emissions': '',
  'sustainability.emissionsDesc': '',
  'theme.system': 'System',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.toggle': 'Toggle theme',
  'install.title': 'Install app',
  'install.dismiss': 'Dismiss',
  'legal.disclaimer': '',
  'form.weight': '',
  'form.height': '',
  'form.age': '',
  'form.diagnosisAge': '',
  'form.glucose': '',
  'form.gender': '',
  'form.genderMale': '',
  'form.genderFemale': '',
  'form.paf': '',
  'form.pafSedentary': '',
  'form.pafLight': '',
  'form.pafModerate': '',
  'form.pafActive': '',
  'form.pafVeryActive': '',
  'form.glucoseContext': '',
  'form.glucoseFasting': '',
  'form.glucosePostprandial': '',
}

describe('ThemeToggle', () => {
  it('renders correct icon for each theme (☀️ for light, 🌑 for dark, 🌙 for system)', () => {
    const themes: Array<{ theme: Theme; expectedIcon: string }> = [
      { theme: 'light', expectedIcon: '☀️' },
      { theme: 'dark', expectedIcon: '🌑' },
      { theme: 'system', expectedIcon: '🌙' },
    ]

    for (const { theme, expectedIcon } of themes) {
      const { unmount } = render(
        <ThemeToggle theme={theme} onToggle={() => {}} t={baseT} />
      )
      expect(screen.getByTestId('theme-toggle')).toHaveTextContent(expectedIcon)
      unmount()
    }
  })

  it('fires onToggle callback on click', () => {
    const onToggle = vi.fn()
    render(<ThemeToggle theme="light" onToggle={onToggle} t={baseT} />)

    fireEvent.click(screen.getByTestId('theme-toggle'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('aria-label reflects current theme via t prop', () => {
    render(<ThemeToggle theme="system" onToggle={() => {}} t={baseT} />)
    const button = screen.getByTestId('theme-toggle')
    expect(button).toHaveAttribute('aria-label', 'System')
  })
})
