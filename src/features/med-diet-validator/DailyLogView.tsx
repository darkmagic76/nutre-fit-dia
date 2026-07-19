import { Card } from '@shared/ui'
import type { Food } from '@shared/domain'
import type { CaloricTargetOutput } from '@features/metabolic-tracker/services/caloricTargetService'
import type { ValidationResult } from '@shared/services/rationValidator'
import { CaloricSummary } from './components/CaloricSummary'
import { FoodList } from './components/FoodList'
import { DailyViolations } from './components/DailyViolations'
import { useT } from '@shared/i18n'

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
  const t = useT()

  return (
    <Card
      title={t['log.title']}
      description={caloricTarget
        ? `${t['log.dailyObjective']}: ${caloricTarget.target} kcal | ${Math.round(totalKcal)} kcal${caloricTarget.restrictionActive ? ` | ${t['metabolic.deficit']}: ${caloricTarget.deficit} kcal` : ''}`
        : t['log.description']}
    >
      {caloricTarget && <CaloricSummary caloricTarget={caloricTarget} totalKcal={totalKcal} />}

      {!caloricTarget && (
        <p className="text-amber-600 text-sm" role="status">
          <span aria-hidden="true">💡</span> {t['log.emptyProfile']}
        </p>
      )}

      <FoodList foods={todayLog} onRemove={onRemoveFood} />

      {todayValidation && <DailyViolations validation={todayValidation} hasFoods={todayLog.length > 0} />}
    </Card>
  )
}
