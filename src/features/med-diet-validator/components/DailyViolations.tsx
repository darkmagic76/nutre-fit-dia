import { ViolationList } from '@shared/ui'
import type { ValidationResult } from '@shared/services/rationValidator'

interface DailyViolationsProps {
  validation: ValidationResult
  hasFoods: boolean
}

export function DailyViolations({ validation, hasFoods }: DailyViolationsProps) {
  return (
    <>
      {!validation.valid && (
        <ViolationList violations={validation.violations} />
      )}

      {validation.valid && hasFoods && (
        <p className="text-emerald-600 text-sm font-medium" role="status">
          ✅ El registro de hoy cumple con los límites diarios.
        </p>
      )}

      {validation.animalProteinCount > 2 && (
        <ViolationList
          type="warning"
          violations={[{
            message: `Proteína animal: ${validation.animalProteinCount}/día — considerar fuente de calcio vegetal`,
          }]}
        />
      )}
    </>
  )
}
