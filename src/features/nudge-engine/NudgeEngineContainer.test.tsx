import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NudgeEngineContainer } from './NudgeEngineContainer';
import { I18nProvider } from '@shared/i18n';
import { useNudgeStore } from '@infrastructure/stores/nudgeStore';
import { type ReactElement } from 'react';
import type { SystemNotification } from '@domain/notification';

// Mock useNudgeTrigger to prevent auto-enqueue on mount
vi.mock('@infrastructure/hooks/useNudgeTrigger', () => ({
  useNudgeTrigger: vi.fn(() => vi.fn()),
}));

function renderContainer(ui: ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

const makeNudge = (overrides: Partial<SystemNotification> = {}): SystemNotification => ({
  id: 'n1',
  type: 'behavioral_nudge',
  severity: 'info',
  target: 'user',
  title: 'Recordatorio de hidratación',
  body: 'Recuerda beber agua.',
  ruleSource: 'WATER_HYDRATION',
  triggeredAt: new Date(),
  ...overrides,
});

describe('NudgeEngineContainer', () => {
  beforeEach(() => {
    useNudgeStore.setState({
      pending: [],
      history: [],
      cooldowns: {},
    });
  });

  it('renders the nudge panel with empty state when no pending nudges', () => {
    renderContainer(<NudgeEngineContainer />);

    expect(screen.getByText('🔔 Nudges')).toBeInTheDocument();
    expect(screen.getByText(/sin nudges activos/i)).toBeInTheDocument();
  });

  it('displays pending nudges from the store', () => {
    useNudgeStore.setState({
      pending: [makeNudge(), makeNudge({ id: 'n2', title: 'Glucosa elevada' })],
    });

    renderContainer(<NudgeEngineContainer />);

    // Both nudge titles should be visible
    const hydrationNudges = screen.getAllByText('Recordatorio de hidratación');
    expect(hydrationNudges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Glucosa elevada')).toBeInTheDocument();
  });

  it('shows badge count matching pending nudges', () => {
    useNudgeStore.setState({
      pending: [makeNudge(), makeNudge({ id: 'n2' }), makeNudge({ id: 'n3' })],
    });

    renderContainer(<NudgeEngineContainer />);

    // The pending badge shows count "3"
    const pendingBadge = screen.getByLabelText(/nudges pendientes/i);
    expect(pendingBadge).toHaveTextContent('3');
    // Also shows "nudges activos" label
    expect(screen.getByText(/nudges activos/i)).toBeInTheDocument();
  });

  it('dismisses a nudge when dismiss button is clicked', () => {
    const nudge = makeNudge();
    useNudgeStore.setState({
      pending: [nudge],
    });

    renderContainer(<NudgeEngineContainer />);

    // Click the specific dismiss button for our nudge
    const dismissButton = screen.getByRole('button', {
      name: 'Descartar: Recordatorio de hidratación',
    });
    fireEvent.click(dismissButton);

    // After dismissal, pending should be empty
    const state = useNudgeStore.getState();
    expect(state.pending).toHaveLength(0);
    expect(state.history).toHaveLength(1);
  });

  it('shows history when there are dismissed/acknowledged nudges', () => {
    const historyNudge = makeNudge({
      id: 'h1',
      title: 'Glucosa elevada',
      dismissedAt: new Date(),
    });
    useNudgeStore.setState({
      history: [historyNudge],
    });

    renderContainer(<NudgeEngineContainer />);

    expect(screen.getByText(/historial de engagement/i)).toBeInTheDocument();
    expect(screen.getByText('Glucosa elevada')).toBeInTheDocument();
  });

  it('does not show badge or "nudges activos" when there are no pending nudges', () => {
    useNudgeStore.setState({ pending: [] });

    renderContainer(<NudgeEngineContainer />);

    // The pending badge should not render
    expect(screen.queryByLabelText(/nudges pendientes/i)).not.toBeInTheDocument();
    // Empty state message shown instead
    expect(screen.getByText(/sin nudges activos/i)).toBeInTheDocument();
  });
});
