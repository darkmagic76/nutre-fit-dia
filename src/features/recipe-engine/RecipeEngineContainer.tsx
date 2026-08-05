import { useT } from '@shared/i18n';
import { useFoodName } from '@shared/hooks/useFoodName';
import { usePlanStore } from './store/planStore';
import { useTrackerStore } from '@shared/stores';
import { RecipeEngineView } from './RecipeEngineView';

export function RecipeEngineContainer() {
  const t = useT();
  const getFoodName = useFoodName;
  const { weeklyPlan, generatePlan } = usePlanStore();
  const { caloricRestrictionActive, setRestrictionActive, caloricTarget } = useTrackerStore();

  return (
    <RecipeEngineView
      caloricRestrictionActive={caloricRestrictionActive}
      caloricTarget={caloricTarget}
      weeklyPlan={weeklyPlan}
      onToggleRestriction={setRestrictionActive}
      onGeneratePlan={generatePlan}
      translate={t}
      getFoodName={getFoodName}
    />
  );
}
