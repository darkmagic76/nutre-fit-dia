import { useActivityTracker } from './hooks/useActivityTracker'
import { ActivityTrackerView } from './ActivityTrackerView'
import type { FormEvent } from 'react'

export function ActivityTrackerContainer() {
  const {
    weeklyMinutes, strengthSessions, compliance, streak,
    meetsModerate, meetsStrength, weeklyGoal, addEntry,
  } = useActivityTracker()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <ActivityTrackerView
      weeklyMinutes={weeklyMinutes}
      strengthSessions={strengthSessions}
      compliance={compliance}
      streak={streak}
      meetsModerate={meetsModerate}
      meetsStrength={meetsStrength}
      weeklyGoal={weeklyGoal}
      onAddEntry={addEntry}
      onSubmit={handleSubmit}
    />
  )
}
