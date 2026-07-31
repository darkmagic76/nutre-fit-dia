import { useT } from '@shared/i18n';
import { usePlanStore } from '@shared/stores/planStore';
import { useTrackerStore } from '@shared/stores';
import { RecipeEngineView } from './RecipeEngineView';

export function RecipeEngineContainer() {
  const t = useT();
  const { weeklyPlan, generatePlan } = usePlanStore();
  const { restrictionActive, setRestrictionActive, caloricTarget } = useTrackerStore();

  return (
    <RecipeEngineView
      restrictionActive={restrictionActive}
      caloricTarget={caloricTarget}
      weeklyPlan={weeklyPlan}
      onToggleRestriction={setRestrictionActive}
      onGeneratePlan={generatePlan}
      translate={t}
    />
  );
}
