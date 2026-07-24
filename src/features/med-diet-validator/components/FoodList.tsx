import { useT } from '@shared/i18n';
import { useFoodName } from '@shared/hooks/useFoodName';
import type { Food } from '@shared/domain';

interface FoodListProps {
  foods: Food[];
  onRemove: (index: number) => void;
}

export function FoodList({ foods, onRemove }: FoodListProps) {
  const t = useT();
  const getFoodName = useFoodName;

  if (foods.length === 0) {
    return <p className="text-stone-400 dark:text-zinc-500 text-sm">{t['log.emptyFoods']}</p>;
  }

  return (
    <ul className="space-y-2" aria-label={t['log.foodListLabel']}>
      {foods.map((food, i) => (
        <li
          key={i}
          className="flex justify-between items-center bg-stone-50 dark:bg-zinc-700/60 p-2 rounded text-sm"
        >
          <span>
            {getFoodName(food)}
            <span className="text-stone-400 dark:text-zinc-500 ml-1">
              ({t[`category.${food.category}` as keyof typeof t]})
            </span>
          </span>
          <button
            onClick={() => onRemove(i)}
            className="min-h-[44px] min-w-[44px] text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs flex items-center justify-center"
            aria-label={t['log.removeAria'].replace('{food}', food.name)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
