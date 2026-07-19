import { usePlanStore } from './store'
import { useTrackerStore } from '@features/metabolic-tracker/store'
import { PlanView } from './PlanView'

export function PlanContainer() {
  const { weeklyPlan, generatePlan } = usePlanStore()
  const { restrictionActive, setRestrictionActive } = useTrackerStore()

  return (
    <PlanView
      restrictionActive={restrictionActive}
      weeklyPlan={weeklyPlan}
      onToggleRestriction={setRestrictionActive}
      onGeneratePlan={generatePlan}
    />
  )
}
