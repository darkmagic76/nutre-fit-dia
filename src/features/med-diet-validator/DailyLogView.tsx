import { CATEGORY_DISPLAY_NAMES } from '@shared/domain'
import type { Food } from '@shared/domain'
import type { CaloricTargetOutput } from '@features/metabolic-tracker/services/caloricTargetService'
import { Card, ViolationList, StatCard } from '@shared/ui'
import type { ValidationResult } from '@shared/services/rationValidator'

interface DailyLogViewProps {
  todayLog: Food[]
  todayValidation: ValidationResult | null
  caloricTarget: CaloricTargetOutput | null
  totalKcal: number
  onRemoveFood: (index: number) => void
}

export function DailyLogView({
  todayLog,
  todayValidation,
  caloricTarget,
  totalKcal,
  onRemoveFood,
}: DailyLogViewProps) {
  return (
    <Card
      title="📝 Registro de hoy"
      description={caloricTarget
        ? `Objetivo: ${caloricTarget.target} kcal | Ingerido: ${Math.round(totalKcal)} kcal${caloricTarget.restrictionActive ? ` | Déficit: ${caloricTarget.deficit} kcal` : ''}`
        : 'Usá el Semáforo para añadir alimentos al registro de hoy.'}
    >
      {caloricTarget && (
        <div className="grid grid-cols-2 gap-2 mb-2" aria-label="Resumen calórico">
          <StatCard label="Objetivo diario" value={`${caloricTarget.target} kcal`} variant="success" />
          <StatCard
            label="Ingerido"
            value={`${Math.round(totalKcal)} kcal`}
            variant={totalKcal > caloricTarget.target ? 'danger' : 'default'}
          />
        </div>
      )}

      {!caloricTarget && (
        <p className="text-amber-600 text-sm" role="status">
          💡 Configurá tu perfil metabólico para ver el objetivo calórico.
        </p>
      )}

      {todayLog.length === 0 ? (
        <p className="text-stone-400 text-sm">Sin alimentos registrados.</p>
      ) : (
        <ul className="space-y-2" aria-label="Alimentos registrados hoy">
          {todayLog.map((food, i) => (
            <li key={i} className="flex justify-between items-center bg-stone-50 p-2 rounded text-sm">
              <span>
                {food.name}
                <span className="text-stone-400 ml-1">({CATEGORY_DISPLAY_NAMES[food.category]})</span>
              </span>
              <button
                onClick={() => onRemoveFood(i)}
                className="min-h-[44px] min-w-[44px] text-red-500 hover:text-red-700 text-xs flex items-center justify-center"
                aria-label={`Eliminar ${food.name} del registro`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {todayValidation && !todayValidation.valid && (
        <ViolationList violations={todayValidation.violations} />
      )}

      {todayValidation?.valid && todayLog.length > 0 && (
        <p className="text-emerald-600 text-sm font-medium" role="status">
          ✅ El registro de hoy cumple con los límites diarios.
        </p>
      )}

      {todayValidation && todayValidation.animalProteinCount > 2 && (
        <ViolationList
          type="warning"
          violations={[{
            message: `Proteína animal: ${todayValidation.animalProteinCount}/día — considerar fuente de calcio vegetal`,
          }]}
        />
      )}
    </Card>
  )
}
