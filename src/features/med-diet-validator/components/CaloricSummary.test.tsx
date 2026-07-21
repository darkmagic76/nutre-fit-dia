import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CaloricSummary } from './CaloricSummary'
import { makeCaloricTargetOutput } from '@/test/fixtures'

describe('CaloricSummary', () => {
  it('renders target and ingested values when restriction is active', () => {
    const caloricTarget = makeCaloricTargetOutput({ target: 1680, restrictionActive: true })

    render(<CaloricSummary caloricTarget={caloricTarget} totalKcal={1200} />)

    expect(screen.getByText('Objetivo diario')).toBeInTheDocument()
    expect(screen.getByText('1680 kcal')).toBeInTheDocument()
    expect(screen.getByText('Ingerido')).toBeInTheDocument()
    expect(screen.getByText('1200 kcal')).toBeInTheDocument()
  })

  it('renders target and ingested values when restriction is inactive', () => {
    const caloricTarget = makeCaloricTargetOutput({ target: 1680, restrictionActive: false })

    render(<CaloricSummary caloricTarget={caloricTarget} totalKcal={1200} />)

    expect(screen.getByText('Objetivo diario')).toBeInTheDocument()
    expect(screen.getByText('1680 kcal')).toBeInTheDocument()
    expect(screen.getByText('Ingerido')).toBeInTheDocument()
    expect(screen.getByText('1200 kcal')).toBeInTheDocument()
  })

  it('uses danger variant when ingested exceeds target', () => {
    const caloricTarget = makeCaloricTargetOutput({ target: 1500 })

    render(<CaloricSummary caloricTarget={caloricTarget} totalKcal={1800} />)

    const dangerCard = screen.getByRole('status', { name: /Ingerido: 1800 kcal/ })
    expect(dangerCard).toBeInTheDocument()
    expect(dangerCard.dataset.variant).toBe('danger')
  })

  it('uses default variant when ingested does not exceed target', () => {
    const caloricTarget = makeCaloricTargetOutput({ target: 1500 })

    render(<CaloricSummary caloricTarget={caloricTarget} totalKcal={1200} />)

    const defaultCard = screen.getByRole('status', { name: /Ingerido: 1200 kcal/ })
    expect(defaultCard).toBeInTheDocument()
    expect(defaultCard.dataset.variant).toBe('default')
  })
})
