import { useLocale } from '@shared/i18n';
import { FOOD_NAMES_EN } from '@shared/data/foodNamesEn';
import type { Food } from '@domain/food';

/**
 * Returns a pure mapping function that resolves a food's localized display name.
 *
 * Call this hook ONCE at the top of a component; it reads the locale a single
 * time and returns a stable `(food) => string` mapper. The returned function is
 * NOT a hook, so it is safe to call inside loops, conditionals, and JSX lists.
 *
 * This shape exists precisely to avoid the Rules of Hooks violation of invoking
 * a hook per-food inside a `.map()` (which changes the hook count between
 * renders when the list size changes).
 *
 * Spanish is the canonical language (food.name in foods-data.ts).
 * English names come from FOOD_NAMES_EN mapping in shared/data/.
 */
export function useFoodName(): (food: Pick<Food, 'name'>) => string {
  const { locale } = useLocale();
  return (food) => {
    if (locale === 'en') {
      return FOOD_NAMES_EN[food.name] ?? food.name;
    }
    return food.name;
  };
}
