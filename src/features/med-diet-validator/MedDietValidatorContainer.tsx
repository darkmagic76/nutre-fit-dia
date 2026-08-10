import { useT } from '@shared/i18n';
import { useLogStore, useTrackerStore } from '@infrastructure/stores';
import { useNudgeTrigger } from '@infrastructure/hooks/useNudgeTrigger';
import { MedDietValidatorView } from './MedDietValidatorView';

export function MedDietValidatorContainer() {
  const t = useT();
  const { todayLog, todayValidation, removeFoodFromLog: rawRemoveFood } = useLogStore();
  const caloricTarget = useTrackerStore((s) => s.caloricTarget);
  const caloricRestrictionActive = useTrackerStore((s) => s.caloricRestrictionActive);
  const trigger = useNudgeTrigger();

  const totalKcal = todayLog.reduce((sum, f) => sum + f.kcalPer100g * (f.gramsPerRation / 100), 0);

  const handleRemoveFood = (index: number) => {
    rawRemoveFood(index, caloricRestrictionActive);
    trigger();
  };

  return (
    <MedDietValidatorView
      todayLog={todayLog}
      todayValidation={todayValidation}
      caloricTarget={caloricTarget}
      totalKcal={totalKcal}
      onRemoveFood={handleRemoveFood}
      translate={t}
    />
  );
}
