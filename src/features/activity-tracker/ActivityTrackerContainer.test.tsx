import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityTrackerContainer } from './ActivityTrackerContainer';
import { I18nProvider } from '@shared/i18n';
import { type ReactElement } from 'react';
import { useActivityStore } from '@shared/stores/activityStore';

function renderContainer(ui: ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

describe('ActivityTrackerContainer', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useActivityStore.setState({
      weeklyMinutes: 0,
      strengthSessions: 0,
      entries: [],
      streak: 0,
    });
  });

  it('renders the activity form with minutes and sessions inputs', () => {
    renderContainer(<ActivityTrackerContainer />);

    // Verify form label is present
    expect(screen.getByRole('form', { name: /registro de actividad/i })).toBeInTheDocument();

    // Verify minutes input
    const minutesInput = screen.getByLabelText(/minutos moderados/i);
    expect(minutesInput).toBeInTheDocument();

    // Verify sessions input
    const sessionsInput = screen.getByLabelText(/sesiones fuerza/i);
    expect(sessionsInput).toBeInTheDocument();

    // Verify submit button
    expect(screen.getByRole('button', { name: /registrar actividad/i })).toBeInTheDocument();
  });

  it('displays initial stats at zero', () => {
    renderContainer(<ActivityTrackerContainer />);

    // There are two stat cards with "0" (weeklyMinutes and strengthSessions)
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThanOrEqual(2);

    // Compliance shows 0%
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('adds an activity entry when submitting minutes', () => {
    renderContainer(<ActivityTrackerContainer />);

    const minutesInput = screen.getByLabelText(/minutos moderados/i);
    fireEvent.change(minutesInput, { target: { value: '60' } });

    const submitButton = screen.getByRole('button', { name: /registrar actividad/i });
    fireEvent.click(submitButton);

    // After submission, the store should have one entry
    const state = useActivityStore.getState();
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].moderateMinutes).toBe(60);
    expect(state.weeklyMinutes).toBe(60);
  });

  it('clears inputs after submission', () => {
    renderContainer(<ActivityTrackerContainer />);

    const minutesInput = screen.getByLabelText(/minutos moderados/i);
    fireEvent.change(minutesInput, { target: { value: '45' } });

    const submitButton = screen.getByRole('button', { name: /registrar actividad/i });
    fireEvent.click(submitButton);

    // Inputs should be cleared (empty string, not null for number input)
    expect(minutesInput).toHaveValue(null);
  });

  it('displays WHO goal targets in the description', () => {
    renderContainer(<ActivityTrackerContainer />);

    // The goal description mentions 150\u2013300 minutes (en-dash) and strength days
    expect(screen.getByText(/150\u2013300 min/i)).toBeInTheDocument();
    expect(screen.getByText(/2 d\u00EDas fuerza/i)).toBeInTheDocument();
  });

  it('shows streak badge when streak > 0', () => {
    useActivityStore.setState({
      weeklyMinutes: 200,
      strengthSessions: 2,
      entries: [
        { date: '2026-07-28', moderateMinutes: 100, strengthSessions: 1 },
        { date: '2026-07-30', moderateMinutes: 100, strengthSessions: 1 },
      ],
      streak: 3,
    });

    renderContainer(<ActivityTrackerContainer />);

    // Streak unit shows "sem" and fire emoji
    expect(screen.getByText(/🔥/)).toBeInTheDocument();
    expect(screen.getByText(/3 sem/)).toBeInTheDocument();
  });

  it('displays compliance 50% when only minutes target is met', () => {
    // Pre-populate store with 150 minutes (meets moderate target) but no strength
    useActivityStore.setState({
      weeklyMinutes: 180,
      strengthSessions: 0,
      entries: [{ date: '2026-07-30', moderateMinutes: 180, strengthSessions: 0 }],
      streak: 1,
    });

    renderContainer(<ActivityTrackerContainer />);

    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('shows strength training objective badge when meetsStrength is true', () => {
    useActivityStore.setState({
      weeklyMinutes: 180,
      strengthSessions: 3,
      entries: [
        { date: '2026-07-28', moderateMinutes: 100, strengthSessions: 1 },
        { date: '2026-07-30', moderateMinutes: 80, strengthSessions: 2 },
      ],
      streak: 2,
    });

    renderContainer(<ActivityTrackerContainer />);

    // When compliance is 100%, the badge shows ✅ Objetivo twice (for both minutes and strength)
    const objectiveBadges = screen.getAllByText(/✅ Objetivo/i);
    expect(objectiveBadges.length).toBe(2);
  });
});
