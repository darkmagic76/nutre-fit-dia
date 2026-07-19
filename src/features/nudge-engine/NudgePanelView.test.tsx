import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NudgePanelView } from './NudgePanelView'
import type { SystemNotification } from '@shared/domain'

const makeNudge = (overrides: Partial<SystemNotification> = {}): SystemNotification => ({
  id: 'n1',
  type: 'behavioral_nudge' as SystemNotification['type'],
  severity: 'info' as SystemNotification['severity'],
  target: 'user',
  title: 'Recordatorio de hidratación',
  body: 'Recuerda beber agua.',
  ruleSource: 'WATER_HYDRATION',
  triggeredAt: new Date(),
  ...overrides,
})

describe('NudgePanelView', () => {
  const defaultProps = {
    pending: [] as SystemNotification[],
    history: [] as SystemNotification[],
    onDismiss: vi.fn(),
    onAcknowledge: vi.fn(),
  }

  it('shows empty state when no nudges', () => {
    render(<NudgePanelView {...defaultProps} />)
    expect(screen.getByText(/sin nudges activos/i)).toBeInTheDocument()
  })

  it('shows badge with pending count', () => {
    render(<NudgePanelView {...defaultProps} pending={[makeNudge(), makeNudge({ id: 'n2' })]} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders pending nudges with title and body', () => {
    render(<NudgePanelView {...defaultProps} pending={[makeNudge()]} />)
    expect(screen.getByText('Recordatorio de hidratación')).toBeInTheDocument()
    expect(screen.getByText('Recuerda beber agua.')).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn()
    render(<NudgePanelView {...defaultProps} pending={[makeNudge()]} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: /descartar/i }))
    expect(onDismiss).toHaveBeenCalledWith('n1')
  })

  it('shows history section with engagement count', () => {
    const historyNudge = makeNudge({ id: 'h1', dismissedAt: new Date() })
    render(<NudgePanelView {...defaultProps} history={[historyNudge]} />)
    expect(screen.getByText(/historial de engagement/i)).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows history entries when expanded', () => {
    const historyNudge = makeNudge({ id: 'h1', title: 'Glucosa elevada', dismissedAt: new Date() })
    render(<NudgePanelView {...defaultProps} history={[historyNudge]} />)
    const summary = screen.getByText(/historial de engagement/i)
    fireEvent.click(summary)
    expect(screen.getByText('Glucosa elevada')).toBeInTheDocument()
  })
})
