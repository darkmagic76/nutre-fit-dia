import { useLogStore } from './store'
import { useTrackerStore } from '@features/metabolic-tracker/store'
import { DailyLogView } from './DailyLogView'

export function DailyLogContainer() {
  const { todayLog, todayValidation, removeFoodFromLog } = useLogStore()
  const caloricTarget = useTrackerStore(s => s.caloricTarget)

  const totalKcal = todayLog.reduce((sum, f) => sum + f.kcalPer100g * (f.gramsPerRation / 100), 0)

  return (
    <DailyLogView
      todayLog={todayLog}
      todayValidation={todayValidation}
      caloricTarget={caloricTarget}
      totalKcal={totalKcal}
      onRemoveFood={removeFoodFromLog}
    />
  )
}
