import { useT } from '@shared/i18n';
import { Card, NumberField, PrimaryButton } from '@shared/ui';
import type { FormEvent } from 'react';

interface ActivityStats {
  weeklyMinutes: number;
  strengthSessions: number;
  compliance: number;
  streak: number;
  meetsModerate: boolean;
  meetsStrength: boolean;
}

interface ActivityForm {
  minutes: string;
  sessions: string;
  onMinutesChange: (v: string) => void;
  onSessionsChange: (v: string) => void;
}

interface ActivityTrackerViewProps {
  stats: ActivityStats;
  form: ActivityForm;
  onSubmit: (e: FormEvent) => void;
}

export function ActivityTrackerView({ stats, form, onSubmit }: ActivityTrackerViewProps) {
  const t = useT();
  const complianceColor =
    stats.compliance === 100
      ? 'text-emerald-600'
      : stats.compliance === 50
        ? 'text-amber-600'
        : 'text-red-600';

  return (
    <Card title={t['activity.title']} description={t['activity.goalDescription']}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-stone-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.weeklyMinutes}</p>
          <p className="text-xs text-stone-500">{t['activity.minutes']}</p>
          {stats.meetsModerate && (
            <p className="text-emerald-600 text-xs mt-1">{t['activity.objectiveMet']}</p>
          )}
        </div>
        <div className="bg-stone-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.strengthSessions}</p>
          <p className="text-xs text-stone-500">{t['activity.strength']}</p>
          {stats.meetsStrength && (
            <p className="text-emerald-600 text-xs mt-1">{t['activity.objectiveMet']}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 items-center mb-3">
        <span className={`text-lg font-bold ${complianceColor}`}>{stats.compliance}%</span>
        <span className="text-sm text-stone-500">{t['activity.compliance']}</span>
        {stats.streak > 0 && (
          <span
            className="text-sm text-amber-600 ml-auto"
            aria-label={`Racha de ${stats.streak} semanas`}
          >
            <span aria-hidden="true">🔥</span> {stats.streak} sem
          </span>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-3"
        aria-label={t['activity.formLabel']}
        noValidate
      >
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="minutes"
            label={t['activity.formMinutes']}
            value={form.minutes}
            onChange={form.onMinutesChange}
            min={0}
          />
          <NumberField
            id="sessions"
            label={t['activity.formSessions']}
            value={form.sessions}
            onChange={form.onSessionsChange}
            min={0}
          />
        </div>
        <PrimaryButton type="submit">{t['activity.registerButton']}</PrimaryButton>
      </form>
    </Card>
  );
}
