import { useState } from 'react';
import type { FormEvent } from 'react';
import { useActivityTracker } from './hooks/useActivityTracker';
import { evaluateAndEnqueue } from '@shared/nudge';
import { ActivityTrackerView } from './ActivityTrackerView';

export function ActivityTrackerContainer() {
  const {
    weeklyMinutes,
    strengthSessions,
    compliance,
    streak,
    meetsModerate,
    meetsStrength,
    addEntry,
  } = useActivityTracker();

  const [minutes, setMinutes] = useState('');
  const [sessions, setSessions] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const mm = Number(minutes) || 0;
    const ss = Number(sessions) || 0;
    if (mm > 0 || ss > 0) {
      addEntry({ moderateMinutes: mm, strengthSessions: ss });
      setMinutes('');
      setSessions('');
      // FR-4.3: re-evaluate nudges after logging activity (HC_INACTIVITY_ADJUST)
      evaluateAndEnqueue();
    }
  };

  return (
    <ActivityTrackerView
      stats={{ weeklyMinutes, strengthSessions, compliance, streak, meetsModerate, meetsStrength }}
      form={{ minutes, sessions, onMinutesChange: setMinutes, onSessionsChange: setSessions }}
      onSubmit={handleSubmit}
    />
  );
}
