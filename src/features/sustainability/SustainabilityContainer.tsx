import { useT } from '@shared/i18n';
import { foods } from '@shared/data/foods';
import { PROTEIN_EMISSION_RATIOS, SCORING_WEIGHTS } from '@domain/sustainability';
import { SustainabilityView } from './SustainabilityView';

export function SustainabilityContainer() {
  const t = useT();
  const zeroWasteCount = foods.filter((f) => f.isZeroWaste).length;
  const totalFoods = foods.length;

  return (
    <SustainabilityView
      zeroWasteCount={zeroWasteCount}
      totalFoods={totalFoods}
      translate={t}
      scoringWeights={SCORING_WEIGHTS}
      emissionRatios={PROTEIN_EMISSION_RATIOS}
    />
  );
}
