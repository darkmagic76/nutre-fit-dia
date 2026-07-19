import type { CaloricTargetOutput } from './services/caloricTargetService'
import { Card } from '@shared/ui'
import type { ValidationError } from '@shared/errors'
import type { UserMetricsFormState } from '@shared/domain'
import type { FormEvent } from 'react'
import { ProfileForm } from './components/ProfileForm'
import { ProfileError } from './components/ProfileError'
import { ProfileResults } from './components/ProfileResults'

interface MetabolicTrackerViewProps {
  form: UserMetricsFormState
  caloricTarget: CaloricTargetOutput | null
  profileError: ValidationError | null
  onCalculate: (e: FormEvent) => void
}

export function MetabolicTrackerView({
  form,
  caloricTarget,
  profileError,
  onCalculate,
}: MetabolicTrackerViewProps) {
  return (
    <Card
      title="📊 Perfil Metabólico"
      description="Protocolo erMedDiet (PREDIMED-Plus). Déficit de 600 kcal solo si IMC > 25 (cap 30%)."
    >
      <ProfileForm form={form} onSubmit={onCalculate} />
      <ProfileError error={profileError} />
      {caloricTarget && <ProfileResults caloricTarget={caloricTarget} />}
    </Card>
  )
}
