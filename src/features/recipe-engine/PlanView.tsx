import { CATEGORY_DISPLAY_NAMES } from '@shared/domain'
import { Card, PrimaryButton, ViolationList } from '@shared/ui/primitives'
import type { WeeklyPlan } from './services/planGenerator'

interface PlanViewProps {
  restrictionActive: boolean
  weeklyPlan: WeeklyPlan | null
  onToggleRestriction: (active: boolean) => void
  onGeneratePlan: () => void
}

export function PlanView({
  restrictionActive,
  weeklyPlan,
  onToggleRestriction,
  onGeneratePlan,
}: PlanViewProps) {
  return (
    <Card
      title="📅 Plan Semanal erMedDiet"
      description="7 días con todos los grupos alimentarios. Cumple AESAN 2022."
    >
      <label className="flex items-center gap-2 text-sm cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={restrictionActive}
          onChange={e => onToggleRestriction(e.target.checked)}
          className="rounded w-5 h-5 text-emerald-700 focus:ring-emerald-500"
          aria-label="Activar restricción calórica"
        />
        <span>Restricción calórica (máx 4 cereales/día)</span>
      </label>

      <PrimaryButton onClick={onGeneratePlan}>
        Generar plan
      </PrimaryButton>

      {weeklyPlan && (
        <div aria-live="polite">
          <p className={`text-sm font-medium mb-3 ${weeklyPlan.valid ? 'text-emerald-600' : 'text-red-600'}`} role="status">
            {weeklyPlan.valid
              ? '✅ Plan válido — cumple todas las restricciones'
              : '⚠️ Violaciones detectadas'}
          </p>

          {!weeklyPlan.valid && (
            <ViolationList violations={weeklyPlan.weeklyResult.violations} />
          )}

          {weeklyPlan.dailyResults.some(r => r.violations.length > 0) && (
            <div className="space-y-1 mt-2">
              {weeklyPlan.dailyResults.map((r, d) =>
                r.violations.length > 0 ? (
                  <details key={d} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <summary className="cursor-pointer font-medium">
                      Día {d + 1}: {r.violations.length} violaciones
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

          <div className="space-y-2 max-h-96 overflow-y-auto mt-3" role="list" aria-label="Plan semanal">
            {weeklyPlan.days.map(day => {
              const dayValid = weeklyPlan.dailyResults[day.day - 1]?.valid !== false
              return (
                <details key={day.day} className="bg-stone-50 rounded-lg">
                  <summary className="font-medium cursor-pointer text-sm p-2 min-h-[44px] flex items-center">
                    <span>Día {day.day} — {day.entries.length} alimentos</span>
                    {!dayValid && <span className="ml-2" aria-label="Violaciones detectadas">⚠️</span>}
                  </summary>
                  <ul className="px-3 pb-2 space-y-1 text-sm">
                    {day.entries.map((e, i) => (
                      <li key={i} className="flex justify-between py-1 border-t border-stone-200">
                        <span>{e.rations}× {e.food.name}</span>
                        <span className="text-stone-400">{CATEGORY_DISPLAY_NAMES[e.food.category]}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
