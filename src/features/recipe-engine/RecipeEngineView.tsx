import type { Translations } from '@shared/i18n';
import type { Food } from '@domain/food';
import { Card, PrimaryButton, ViolationList } from '@shared/ui';
import { formatViolation } from '@shared/ui/formatters/formatViolation';
import { MealType, type MealEntry, type WeeklyPlan } from '@domain/plan';
import type { CaloricTargetOutput } from '../../domain/caloricTargetService';
import { CulturalBadges } from './components/CulturalBadges';
import { ZeroWasteBadges } from './components/ZeroWasteBadges';

function computeMealKcal(entries: MealEntry[]): number {
  return entries.reduce((sum, e) => {
    return sum + ((e.food.kcalPer100g * e.food.gramsPerRation) / 100) * e.rations;
  }, 0);
}

const MEAL_ORDER: MealType[] = [
  MealType.BREAKFAST,
  MealType.LUNCH,
  MealType.DINNER,
  MealType.SNACK,
];

const MEAL_I18N: Record<MealType, 'meal.breakfast' | 'meal.lunch' | 'meal.dinner' | 'meal.snack'> =
  {
    [MealType.BREAKFAST]: 'meal.breakfast',
    [MealType.LUNCH]: 'meal.lunch',
    [MealType.DINNER]: 'meal.dinner',
    [MealType.SNACK]: 'meal.snack',
  };

interface RecipeEngineViewProps {
  caloricRestrictionActive: boolean;
  caloricTarget: CaloricTargetOutput | null;
  weeklyPlan: WeeklyPlan | null;
  onToggleRestriction: (active: boolean) => void;
  onGeneratePlan: () => void;
  translate: Translations;
  getFoodName: (food: Pick<Food, 'name'>) => string;
}

export function RecipeEngineView({
  caloricRestrictionActive,
  caloricTarget,
  weeklyPlan,
  onToggleRestriction,
  onGeneratePlan,
  translate: t,
  getFoodName,
}: RecipeEngineViewProps) {
  return (
    <Card title={t['plan.title']} description={t['plan.description']}>
      <label className="flex items-center gap-2 text-sm cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={caloricRestrictionActive}
          onChange={(e) => onToggleRestriction(e.target.checked)}
          className="rounded w-5 h-5 text-emerald-700 focus:ring-emerald-500"
          aria-label={t['ui.activateRestriction']}
        />
        <span>{t['ui.activateRestriction']}</span>
      </label>

      <PrimaryButton onClick={onGeneratePlan}>{t['ui.generatePlan']}</PrimaryButton>

      {weeklyPlan && (
        <div aria-live="polite">
          <p
            className={`text-sm font-medium mb-3 ${weeklyPlan.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
            role="status"
          >
            {weeklyPlan.valid ? t['ui.planValid'] : t['ui.planViolations']}
          </p>

          {!weeklyPlan.valid && (
            <ViolationList
              violations={weeklyPlan.weeklyResult.violations.map((v) => ({
                message: formatViolation(t, v),
              }))}
              errorLabel={t['validation.label.errors']}
              warningLabel={t['validation.label.warnings']}
            />
          )}

          {weeklyPlan.dailyResults.some((r) => r.violations.length > 0) && (
            <div className="space-y-1 mt-2">
              {weeklyPlan.dailyResults.map((r, d) =>
                r.violations.length > 0 ? (
                  <details
                    key={d}
                    className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded"
                  >
                    <summary className="cursor-pointer font-medium">
                      {t['ui.day']} {d + 1}: {r.violations.length} {t['ui.violationsCount']}
                    </summary>
                    <ul className="list-disc list-inside mt-1 ml-2">
                      {r.violations.map((v, i) => (
                        <li key={i}>{formatViolation(t, v)}</li>
                      ))}
                    </ul>
                  </details>
                ) : null,
              )}
            </div>
          )}

          <div
            className="space-y-2 max-h-96 overflow-y-auto mt-3"
            role="list"
            aria-label={t['plan.title']}
          >
            {weeklyPlan.days.map((day) => {
              const dayValid = weeklyPlan.dailyResults[day.day - 1]?.valid !== false;
              const groups = new Map<MealType, MealEntry[]>();
              for (const meal of MEAL_ORDER) groups.set(meal, []);
              for (const entry of day.entries) {
                const meal = entry.mealType ?? MealType.BREAKFAST;
                const list = groups.get(meal);
                if (list) list.push(entry);
              }

              return (
                <details key={day.day} className="bg-stone-50 dark:bg-zinc-700/60 rounded-lg">
                  <summary className="font-medium cursor-pointer text-sm p-2 min-h-[44px] flex items-center">
                    <span>
                      {t['ui.day']} {day.day} — {day.entries.length} {t['ui.foods']}
                    </span>
                    {!dayValid && (
                      <span className="ml-2" aria-label={t['ui.planViolations']}>
                        ⚠️
                      </span>
                    )}
                  </summary>
                  <div className="px-3 pb-2 space-y-3 text-sm">
                    {MEAL_ORDER.map((meal) => {
                      const entries = groups.get(meal) ?? [];
                      if (entries.length === 0) return null;
                      const mealKcal = computeMealKcal(entries);
                      const kcalText =
                        caloricTarget && caloricTarget.target > 0
                          ? `${Math.round(mealKcal)} kcal / ${Math.round((mealKcal / caloricTarget.target) * 100)}%`
                          : '—';
                      return (
                        <div key={meal}>
                          <h3 className="font-semibold text-stone-700 dark:text-zinc-200 mb-1">
                            {t[MEAL_I18N[meal]]} ({kcalText})
                          </h3>
                          <ul className="space-y-1">
                            {entries.map((e, i) => (
                              <li
                                key={i}
                                className="flex justify-between py-1 border-t border-stone-200 dark:border-zinc-700"
                              >
                                <span>
                                  {e.rations}× {getFoodName(e.food)}
                                  {e.food.culturalMetadata && (
                                    <CulturalBadges meta={e.food.culturalMetadata} translate={t} />
                                  )}
                                  <ZeroWasteBadges food={e.food} />
                                </span>
                                <span className="text-stone-400 dark:text-zinc-500">
                                  {t[`category.${e.food.category}` as keyof typeof t]}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
