import { useT } from '@shared/i18n';
import { useFoodName } from '@shared/hooks/useFoodName';
import { useRecipeEngineState } from './hooks/useRecipeEngineState';
import { RecipeEngineView } from './RecipeEngineView';

export function RecipeEngineContainer() {
  const t = useT();
  const getFoodName = useFoodName;
  const {
    weeklyPlan,
    generatePlan,
    caloricRestrictionActive,
    setRestrictionActive,
    caloricTarget,
  } = useRecipeEngineState();

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
