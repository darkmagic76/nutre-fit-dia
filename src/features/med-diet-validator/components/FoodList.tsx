import { CATEGORY_DISPLAY_NAMES } from '@shared/domain'
import type { Food } from '@shared/domain'

interface FoodListProps {
  foods: Food[]
  onRemove: (index: number) => void
}

export function FoodList({ foods, onRemove }: FoodListProps) {
  if (foods.length === 0) {
    return <p className="text-stone-400 text-sm">Sin alimentos registrados.</p>
  }

  return (
    <ul className="space-y-2" aria-label="Alimentos registrados hoy">
      {foods.map((food, i) => (
        <li key={i} className="flex justify-between items-center bg-stone-50 p-2 rounded text-sm">
          <span>
            {food.name}
            <span className="text-stone-400 ml-1">({CATEGORY_DISPLAY_NAMES[food.category]})</span>
          </span>
          <button
            onClick={() => onRemove(i)}
            className="min-h-[44px] min-w-[44px] text-red-500 hover:text-red-700 text-xs flex items-center justify-center"
            aria-label={`Eliminar ${food.name} del registro`}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}
