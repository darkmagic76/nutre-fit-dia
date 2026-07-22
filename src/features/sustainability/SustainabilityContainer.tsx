import { foods } from '@shared/data/foods';
import { SustainabilityView } from './SustainabilityView';

export function SustainabilityContainer() {
  const zeroWasteCount = foods.filter((f) => f.isZeroWaste).length;
  const totalFoods = foods.length;

  return <SustainabilityView zeroWasteCount={zeroWasteCount} totalFoods={totalFoods} />;
}
