import type { Food } from '@domain/food';

export function ZeroWasteBadges({ food }: { food: Food }) {
  return (
    <span className="inline-flex gap-1 ml-1">
      {food.isZeroWaste && (
        <span title="Zero Waste" aria-label="Zero Waste">
          <span aria-hidden="true">♻️</span>
        </span>
      )}
      {food.isUglyProduce && (
        <span title="KM0 / Defectos estéticos" aria-label="KM0">
          <span aria-hidden="true">🥕</span>
        </span>
      )}
    </span>
  );
}
