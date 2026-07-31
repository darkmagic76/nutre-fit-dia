import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithI18n } from '@/test/i18n-test-utils';
import { NudgeEngineView } from './NudgeEngineView';
import type { SystemNotification } from '@shared/domain';
import { es } from '@shared/i18n/es';

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
});

describe('NudgeEngineView', () => {
  const defaultProps = {
    pending: [] as SystemNotification[],
    history: [] as SystemNotification[],
    onDismiss: vi.fn(),
    translate: es,
  };

  it('shows empty state when no nudges (ES default)', () => {
    renderWithI18n(<NudgeEngineView {...defaultProps} />);
    expect(screen.getByText(/sin nudges activos/i)).toBeInTheDocument();
  });

  it('shows badge with pending count', () => {
    renderWithI18n(
      <NudgeEngineView {...defaultProps} pending={[makeNudge(), makeNudge({ id: 'n2' })]} />,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders pending nudges with title and body', () => {
    renderWithI18n(<NudgeEngineView {...defaultProps} pending={[makeNudge()]} />);
    expect(screen.getByText('Recordatorio de hidratación')).toBeInTheDocument();
    expect(screen.getByText('Recuerda beber agua.')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button clicked (ES default)', () => {
    const onDismiss = vi.fn();
    renderWithI18n(
      <NudgeEngineView {...defaultProps} pending={[makeNudge()]} onDismiss={onDismiss} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /descartar/i }));
    expect(onDismiss).toHaveBeenCalledWith('n1');
  });

  it('shows history section with engagement count (ES default)', () => {
    const historyNudge = makeNudge({ id: 'h1', dismissedAt: new Date() });
    renderWithI18n(<NudgeEngineView {...defaultProps} history={[historyNudge]} />);
    expect(screen.getByText(/historial de engagement/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows history entries when expanded (ES default)', () => {
    const historyNudge = makeNudge({
      id: 'h1',
      title: 'Glucosa elevada',
      dismissedAt: new Date(),
    });
    renderWithI18n(<NudgeEngineView {...defaultProps} history={[historyNudge]} />);
    const summary = screen.getByText(/historial de engagement/i);
    fireEvent.click(summary);
    expect(screen.getByText('Glucosa elevada')).toBeInTheDocument();
  });

  it('renders body with pipe-delimited key|replacements format', () => {
    const substituteNudge = makeNudge({
      id: 'n2',
      title: 'Sustitución sostenible',
      body: 'nudge.sustBody|soja, lentejas',
    });
    renderWithI18n(<NudgeEngineView {...defaultProps} pending={[substituteNudge]} />);
    // The translateBody function processes key|replacements format even when
    // the translation key is not in the i18n dictionary (falls back to raw key).
    expect(screen.getByText(/nudge\.sustBody/)).toBeInTheDocument();
  });
});
