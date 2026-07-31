import { useT } from '@shared/i18n';
import { useLogStore, useTrackerStore } from '@shared/stores';
import { MedDietValidatorView } from './MedDietValidatorView';

export function MedDietValidatorContainer() {
  const t = useT();
  const { todayLog, todayValidation, removeFoodFromLog } = useLogStore();
  const caloricTarget = useTrackerStore((s) => s.caloricTarget);

  const totalKcal = todayLog.reduce((sum, f) => sum + f.kcalPer100g * (f.gramsPerRation / 100), 0);

  return (
    <MedDietValidatorView
      todayLog={todayLog}
      todayValidation={todayValidation}
      caloricTarget={caloricTarget}
      totalKcal={totalKcal}
      onRemoveFood={removeFoodFromLog}
      translate={t}
    />
  );
}
