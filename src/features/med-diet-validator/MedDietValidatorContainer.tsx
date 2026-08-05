import { useT } from '@shared/i18n';
import { useLogStore, useTrackerStore } from '@shared/stores';
import { evaluateAndEnqueue } from '@shared/nudge';
import { MedDietValidatorView } from './MedDietValidatorView';

export function MedDietValidatorContainer() {
  const t = useT();
  const { todayLog, todayValidation, removeFoodFromLog: rawRemoveFood } = useLogStore();
  const caloricTarget = useTrackerStore((s) => s.caloricTarget);

  const totalKcal = todayLog.reduce((sum, f) => sum + f.kcalPer100g * (f.gramsPerRation / 100), 0);

  const handleRemoveFood = (index: number) => {
    rawRemoveFood(index);
    evaluateAndEnqueue();
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
