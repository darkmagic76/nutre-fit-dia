import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SustainabilityContainer } from './SustainabilityContainer'
import { I18nProvider } from '@shared/i18n'
import { type ReactElement } from 'react'

function renderWithI18n(ui: ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe('SustainabilityContainer', () => {
  it('renders the sustainability card with title', () => {
    renderWithI18n(<SustainabilityContainer />)
    expect(screen.getByText('🌍 Sostenibilidad')).toBeDefined()
  })

  it('displays zero-waste food count', () => {
    renderWithI18n(<SustainabilityContainer />)
    const heading = screen.getByRole('heading', { name: /Zero-Waste/i })
    expect(heading).toBeDefined()
  })

  it('displays emission comparison grid', () => {
    renderWithI18n(<SustainabilityContainer />)
    expect(screen.getByText(/Emisiones Comparativas/i)).toBeDefined()
  })

  it('displays scoring weights', () => {
    renderWithI18n(<SustainabilityContainer />)
    expect(screen.getByText(/huella de carbono/i)).toBeDefined()
    expect(screen.getByText(/temporalidad/i)).toBeDefined()
    expect(screen.getByText(/proximidad/i)).toBeDefined()
  })
})
