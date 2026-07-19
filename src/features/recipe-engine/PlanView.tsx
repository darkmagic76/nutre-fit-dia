import { CATEGORY_DISPLAY_NAMES } from '@shared/domain'
import type { CulturalMetadata, Food } from '@shared/domain'
import { Card, PrimaryButton, ViolationList, LegalDisclaimer } from '@shared/ui'
import { MealType, type MealEntry, type WeeklyPlan } from './services/planGenerator'
import { useTrackerStore } from '@features/metabolic-tracker/store'
import { useT } from '@shared/i18n'

function computeMealKcal(entries: MealEntry[]): number {
  return entries.reduce((sum, e) => {
    return sum + (e.food.kcalPer100g * e.food.gramsPerRation / 100) * e.rations
  }, 0)
}

const MEAL_ORDER: MealType[] = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK]

const MEAL_LABELS: Record<MealType, string> = {
  [MealType.BREAKFAST]: 'Desayuno',
  [MealType.LUNCH]: 'Almuerzo',
  [MealType.DINNER]: 'Cena',
  [MealType.SNACK]: 'Snack',
}

const COOKING_LABELS: Record<string, string> = {
  stew: 'guiso tradicional',
  steam: 'al vapor',
  boiled: 'hervido',
  grilled: 'a la plancha',
  raw: 'en crudo',
}

function CulturalBadges({ meta }: { meta: CulturalMetadata }) {
  return (
    <>
      <span className="inline-flex gap-1 ml-1" aria-label="Metadata cultural UNESCO">
        {meta.traditionalCuisine && <span title="Cocina tradicional" aria-label="Cocina tradicional"><span aria-hidden="true">🏺</span></span>}
        {meta.socialEating && <span title="Comida en compañía" aria-label="Comida en compañía"><span aria-hidden="true">👥</span></span>}
        {meta.erMedDiet && <span title="erMedDiet" aria-label="erMedDiet"><span aria-hidden="true">🌿</span></span>}
      </span>
      {meta.socialEating && <span className="text-xs text-emerald-700 ml-1">Ideal para comer en compañía</span>}
      {meta.cookingTechnique && COOKING_LABELS[meta.cookingTechnique] && (
        <span className="text-xs text-stone-500 ml-1">Preparación: {COOKING_LABELS[meta.cookingTechnique]}</span>
      )}
    </>
  )
}

interface PlanViewProps {
  restrictionActive: boolean
  weeklyPlan: WeeklyPlan | null
  onToggleRestriction: (active: boolean) => void
  onGeneratePlan: () => void
}

function ZeroWasteBadges({ food }: { food: Food }) {
  return (
    <span className="inline-flex gap-1 ml-1">
      {food.isZeroWaste && <span title="Zero Waste" aria-label="Zero Waste"><span aria-hidden="true">♻️</span></span>}
      {food.isUglyProduce && <span title="KM0 / Defectos estéticos" aria-label="KM0"><span aria-hidden="true">🥕</span></span>}
    </span>
  )
}

export function PlanView({
  restrictionActive,
  weeklyPlan,
  onToggleRestriction,
  onGeneratePlan,
}: PlanViewProps) {
  const t = useT()

  return (
    <Card
      title={t['plan.title']}
      description={t['plan.description']}
    >
      <LegalDisclaimer text={t['legal.disclaimer']} />
      <div className="h-2" />
      <label className="flex items-center gap-2 text-sm cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={restrictionActive}
          onChange={e => onToggleRestriction(e.target.checked)}
          className="rounded w-5 h-5 text-emerald-700 focus:ring-emerald-500"
          aria-label={t['ui.activateRestriction']}
        />
        <span>{t['ui.activateRestriction']}</span>
      </label>

      <PrimaryButton onClick={onGeneratePlan}>
        {t['ui.generatePlan']}
      </PrimaryButton>

      {weeklyPlan && (
        <div aria-live="polite">
          <p className={`text-sm font-medium mb-3 ${weeklyPlan.valid ? 'text-emerald-600' : 'text-red-600'}`} role="status">
            {weeklyPlan.valid
              ? t['ui.planValid']
              : t['ui.planViolations']}
          </p>

          {!weeklyPlan.valid && (
            <ViolationList
              violations={weeklyPlan.weeklyResult.violations}
              errorLabel={t['ui.violations']}
            />
          )}

          {weeklyPlan.dailyResults.some(r => r.violations.length > 0) && (
            <div className="space-y-1 mt-2">
              {weeklyPlan.dailyResults.map((r, d) =>
                r.violations.length > 0 ? (
                  <details key={d} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <summary className="cursor-pointer font-medium">
                      {t['ui.day']} {d + 1}: {r.violations.length} {t['ui.violationsCount']}
                    </summary>
                    <ul className="list-disc list-inside mt-1 ml-2">
                      {r.violations.map((v, i) => (
                        <li key={i}>{v.message}</li>
                      ))}
                    </ul>
                  </details>
                ) : null,
              )}
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto mt-3" role="list" aria-label={t['plan.title']}>
            {weeklyPlan.days.map(day => {
              const dayValid = weeklyPlan.dailyResults[day.day - 1]?.valid !== false
              const groups = new Map<MealType, MealEntry[]>()
              for (const meal of MEAL_ORDER) groups.set(meal, [])
              for (const entry of day.entries) {
                const meal = entry.mealType ?? MealType.BREAKFAST
                const list = groups.get(meal)
                if (list) list.push(entry)
              }

              const caloricTarget = useTrackerStore.getState().caloricTarget

              return (
                <details key={day.day} className="bg-stone-50 rounded-lg">
                  <summary className="font-medium cursor-pointer text-sm p-2 min-h-[44px] flex items-center">
                    <span>{t['ui.day']} {day.day} — {day.entries.length} {t['ui.foods']}</span>
                    {!dayValid && <span className="ml-2" aria-label={t['ui.planViolations']}>⚠️</span>}
                  </summary>
                  <div className="px-3 pb-2 space-y-3 text-sm">
                    {MEAL_ORDER.map(meal => {
                      const entries = groups.get(meal) ?? []
                      if (entries.length === 0) return null
                      const mealKcal = computeMealKcal(entries)
                      const kcalText = caloricTarget && caloricTarget.target > 0
                        ? `${Math.round(mealKcal)} kcal / ${Math.round((mealKcal / caloricTarget.target) * 100)}%`
                        : '—'
                      return (
                        <div key={meal}>
                          <h3 className="font-semibold text-stone-700 mb-1">{MEAL_LABELS[meal]} ({kcalText})</h3>
                          <ul className="space-y-1">
                            {entries.map((e, i) => (
                              <li key={i} className="flex justify-between py-1 border-t border-stone-200">
                                <span>
                                  {e.rations}× {e.food.name}
                                  {e.food.culturalMetadata && <CulturalBadges meta={e.food.culturalMetadata} />}
                                  <ZeroWasteBadges food={e.food} />
                                </span>
                                <span className="text-stone-400">{CATEGORY_DISPLAY_NAMES[e.food.category]}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                </details>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
