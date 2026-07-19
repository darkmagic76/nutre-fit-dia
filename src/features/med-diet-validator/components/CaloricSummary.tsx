import { StatCard } from '@shared/ui'
import type { CaloricTargetOutput } from '@features/metabolic-tracker/services/caloricTargetService'

interface CaloricSummaryProps {
  caloricTarget: CaloricTargetOutput
  totalKcal: number
}

export function CaloricSummary({ caloricTarget, totalKcal }: CaloricSummaryProps) {
  const ingested = Math.round(totalKcal)
  return (
    <div className="grid grid-cols-2 gap-2 mb-2" aria-label="Resumen calórico">
      <StatCard label="Objetivo diario" value={`${caloricTarget.target} kcal`} variant="success" />
      <StatCard
        label="Ingerido"
        value={`${ingested} kcal`}
        variant={ingested > caloricTarget.target ? 'danger' : 'default'}
      />
    </div>
  )
}
