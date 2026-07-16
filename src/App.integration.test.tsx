import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App integration', () => {
  beforeEach(() => {
    render(<App />)
  })

  const selectTab = (name: string) => {
    fireEvent.click(screen.getByRole('tab', { name: new RegExp(name, 'i') }))
  }

  it('renders all navigation tabs', () => {
    expect(screen.getByRole('tab', { name: /semáforo/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /hoy/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /plan/i })).toBeInTheDocument()
  })

  describe('Scanner', () => {
    it('classifies a food and shows result', () => {
      selectTab('Semáforo')

      const select = screen.getByLabelText('Seleccionar alimento')
      fireEvent.change(select, { target: { value: 'oil-aove' } })

      fireEvent.click(screen.getByRole('button', { name: /clasificar/i }))

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('shows food details when selecting an item', () => {
      selectTab('Semáforo')

      const select = screen.getByLabelText('Seleccionar alimento')
      fireEvent.change(select, { target: { value: 'oil-aove' } })

      expect(screen.getByText(/AOVE/)).toBeInTheDocument()
    })
  })

  describe('Metabolic Profile', () => {
    it('calculates caloric target from default values', () => {
      selectTab('Perfil')

      fireEvent.click(screen.getByRole('button', { name: /calcular perfil/i }))

      expect(screen.getByText(/BMR/)).toBeInTheDocument()
      expect(screen.getByText(/TDEE/)).toBeInTheDocument()
    })
  })
})
