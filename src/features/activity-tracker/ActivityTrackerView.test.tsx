import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityTrackerView } from './ActivityTrackerView';
import { es } from '@shared/i18n/es';
import type { Translations } from '@shared/i18n';

const t = es as Translations;

const baseStats = {
  weeklyMinutes: 0,
  strengthSessions: 0,
  compliance: 0,
  streak: 0,
  meetsModerate: false,
  meetsStrength: false,
};

const baseForm = {
  minutes: '',
  sessions: '',
  onMinutesChange: vi.fn(),
  onSessionsChange: vi.fn(),
};

const baseProps = {
  stats: baseStats,
  form: baseForm,
  onSubmit: vi.fn(),
  translate: t,
};

describe('ActivityTrackerView', () => {
  it('renders weekly minutes and strength sessions from props', () => {
    render(
      <ActivityTrackerView
        {...baseProps}
        stats={{ ...baseStats, weeklyMinutes: 180, strengthSessions: 2 }}
      />,
    );

    // Find the stat values in the stat cards. Two numbers: 180 and 2.
    expect(screen.getByText('180')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders compliance percentage', () => {
    render(<ActivityTrackerView {...baseProps} stats={{ ...baseStats, compliance: 75 }} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays WHO goal targets in description (150-300 min)', () => {
    render(<ActivityTrackerView {...baseProps} />);

    expect(screen.getByText(/150\u2013300 min/i)).toBeInTheDocument();
  });

  it('shows "✅ Objetivo" badge when meetsModerate is true', () => {
    render(
      <ActivityTrackerView
        {...baseProps}
        stats={{ ...baseStats, meetsModerate: true, weeklyMinutes: 180 }}
      />,
    );

    const badges = screen.getAllByText('✅ Objetivo');
    expect(badges.length).toBe(1);
  });

  it('shows "✅ Objetivo" badge for both when meetsModerate and meetsStrength', () => {
    render(
      <ActivityTrackerView
        {...baseProps}
        stats={{
          ...baseStats,
          meetsModerate: true,
          meetsStrength: true,
          weeklyMinutes: 180,
          strengthSessions: 2,
        }}
      />,
    );

    const badges = screen.getAllByText('✅ Objetivo');
    expect(badges.length).toBe(2);
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn();
    render(<ActivityTrackerView {...baseProps} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /registrar actividad/i });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders form labels for minutes and sessions', () => {
    render(<ActivityTrackerView {...baseProps} />);

    expect(screen.getByLabelText(/minutos moderados/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sesiones fuerza/i)).toBeInTheDocument();
  });

  it('shows streak when streak > 0', () => {
    render(
      <ActivityTrackerView
        {...baseProps}
        stats={{ ...baseStats, streak: 3, weeklyMinutes: 180 }}
      />,
    );

    expect(screen.getByText(/🔥/)).toBeInTheDocument();
    expect(screen.getByText(/3 sem/)).toBeInTheDocument();
  });

  it('does not show streak badge when streak is 0', () => {
    render(<ActivityTrackerView {...baseProps} stats={{ ...baseStats, streak: 0 }} />);

    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
  });
});
