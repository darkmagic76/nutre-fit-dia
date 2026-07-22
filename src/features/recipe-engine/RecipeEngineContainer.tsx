import { usePlanStore } from './planStore';
import { useTrackerStore } from '@shared/stores';
import { PlanView } from './PlanView';

export function RecipeEngineContainer() {
  const { weeklyPlan, generatePlan } = usePlanStore();
  const { restrictionActive, setRestrictionActive, caloricTarget } = useTrackerStore();

  return (
    <PlanView
      restrictionActive={restrictionActive}
      caloricTarget={caloricTarget}
      weeklyPlan={weeklyPlan}
      onToggleRestriction={setRestrictionActive}
      onGeneratePlan={generatePlan}
    />
  );
}
