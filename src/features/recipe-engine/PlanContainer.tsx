import { usePlanStore, useTrackerStore } from '@shared/stores'
import { PlanView } from './PlanView'

export function PlanContainer() {
  const { weeklyPlan, generatePlan } = usePlanStore()
  const { restrictionActive, setRestrictionActive, caloricTarget } = useTrackerStore()

  return (
    <PlanView
      restrictionActive={restrictionActive}
      caloricTarget={caloricTarget}
      weeklyPlan={weeklyPlan}
      onToggleRestriction={setRestrictionActive}
      onGeneratePlan={generatePlan}
    />
  )
}
