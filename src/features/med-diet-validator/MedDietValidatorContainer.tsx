import { useT } from '@shared/i18n';
import { useLogStore, useTrackerStore } from '@shared/stores';
import { useNudgeTrigger } from '@shared/hooks/useNudgeTrigger';
import { MedDietValidatorView } from './MedDietValidatorView';

export function MedDietValidatorContainer() {
  const t = useT();
  const { todayLog, todayValidation, removeFoodFromLog: rawRemoveFood } = useLogStore();
  const caloricTarget = useTrackerStore((s) => s.caloricTarget);
  const trigger = useNudgeTrigger();

  const totalKcal = todayLog.reduce((sum, f) => sum + f.kcalPer100g * (f.gramsPerRation / 100), 0);

  const handleRemoveFood = (index: number) => {
    rawRemoveFood(index);
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
