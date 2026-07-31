import { useT } from '@shared/i18n';
import { foods } from '@shared/data/foods';
import { SustainabilityView } from './SustainabilityView';

export function SustainabilityContainer() {
  const t = useT();
  const zeroWasteCount = foods.filter((f) => f.isZeroWaste).length;
  const totalFoods = foods.length;

  return (
    <SustainabilityView zeroWasteCount={zeroWasteCount} totalFoods={totalFoods} translate={t} />
  );
}
