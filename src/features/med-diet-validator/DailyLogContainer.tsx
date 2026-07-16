import { useLogStore } from './store'
import { useTrackerStore } from '@features/metabolic-tracker/store'
import { DailyLogView } from './DailyLogView'

export function DailyLogContainer() {
  const { todayLog, todayValidation, removeFoodFromLog } = useLogStore()
  const caloricTarget = useTrackerStore(s => s.caloricTarget)

  const totalKcal = todayLog.reduce((sum, f) => sum + f.kcalPer100g * (f.gramsPerRation / 100), 0)

  const caloricDisplay = caloricTarget
    ? {
        target: caloricTarget.target,
        deficit: caloricTarget.deficit,
        restrictionActive: caloricTarget.restrictionActive,
      }
    : null

  return (
    <DailyLogView
      todayLog={todayLog}
      todayValidation={todayValidation}
      caloricTarget={caloricDisplay}
      totalKcal={totalKcal}
      onRemoveFood={removeFoodFromLog}
    />
  )
}
