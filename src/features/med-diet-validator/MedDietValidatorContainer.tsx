import { useT } from '@shared/i18n';
import { useMedDietValidatorState } from './hooks/useMedDietValidatorState';
import { useNudgeTrigger } from '@infrastructure/hooks/useNudgeTrigger';
import { MedDietValidatorView } from './MedDietValidatorView';

export function MedDietValidatorContainer() {
  const t = useT();
  const {
    todayLog,
    todayValidation,
    removeFoodFromLog: rawRemoveFood,
    caloricTarget,
    caloricRestrictionActive,
  } = useMedDietValidatorState();
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
