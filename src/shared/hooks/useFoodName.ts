import { useLocale } from '@shared/i18n';
import { FOOD_NAMES_EN } from '@shared/data/foodNamesEn';
import type { Food } from '@shared/domain';

/**
 * Returns the localized display name for a food item.
 *
 * Spanish is the canonical language (food.name in foods-data.ts).
 * English names come from FOOD_NAMES_EN mapping in shared/data/.
 */
export function useFoodName(food: Pick<Food, 'name'>): string {
  const { locale } = useLocale();
  if (locale === 'en') {
    return FOOD_NAMES_EN[food.name] ?? food.name;
  }
  return food.name;
}
