import type { CaloricTargetOutput } from './services/caloricTargetService'
import { Card, PrimaryButton, StatCard, NumberField, SelectField } from '@shared/ui'
import type { ValidationError } from '@shared/errors'
import type { UserMetricsFormState } from '@shared/domain'
import type { FormEvent } from 'react'

interface MetabolicTrackerViewProps {
  form: UserMetricsFormState
  caloricTarget: CaloricTargetOutput | null
  profileError: ValidationError | null
  onCalculate: (e: FormEvent) => void
}

export function MetabolicTrackerView({
  form: { weight, height, age, gender, paf, setWeight, setHeight, setAge, setGender, setPaf },
  caloricTarget,
  profileError,
  onCalculate,
}: MetabolicTrackerViewProps) {
  return (
    <Card
      title="📊 Perfil Metabólico"
      description="Protocolo erMedDiet (PREDIMED-Plus). Déficit de 600 kcal solo si IMC > 25 (cap 30%)."
    >
      <form
        onSubmit={onCalculate}
        className="space-y-3"
        aria-label="Formulario de perfil metabólico"
        noValidate
      >
        <div className="grid grid-cols-2 gap-3">
          <NumberField id="weight" label="Peso (kg)" value={weight} onChange={setWeight} min={30} />
          <NumberField id="height" label="Altura (cm)" value={height} onChange={setHeight} min={100} />
          <NumberField id="age" label="Edad" value={age} onChange={setAge} min={18} />
          <SelectField
            id="gender"
            label="Género"
            value={gender}
            onChange={setGender}
            options={[
              { value: 'male', label: 'Hombre' },
              { value: 'female', label: 'Mujer' },
            ]}
          />
        </div>
        <SelectField
          id="paf"
          label="Factor de actividad física"
          value={paf}
          onChange={setPaf}
          options={[
            { value: '1.2', label: 'Sedentario (1.2)' },
            { value: '1.375', label: 'Ligero (1.375)' },
            { value: '1.55', label: 'Moderado (1.55)' },
            { value: '1.725', label: 'Activo (1.725)' },
            { value: '1.9', label: 'Muy activo (1.9)' },
          ]}
        />
        <PrimaryButton type="submit">
          Calcular perfil
        </PrimaryButton>
      </form>

      {profileError && (
        <p className="text-red-600 text-sm font-medium" role="alert">
          {profileError.message}
        </p>
      )}

      {caloricTarget && (
        <div className="grid grid-cols-2 gap-3" aria-label="Resultados del perfil metabólico" aria-live="polite">
          <StatCard label="BMR" value={`${caloricTarget.bmr} kcal`} />
          <StatCard label="TDEE" value={`${caloricTarget.tdee} kcal`} />
          <StatCard
            label="Déficit"
            value={`${caloricTarget.deficit} kcal`}
            variant={caloricTarget.restrictionActive ? 'danger' : 'default'}
            sub={caloricTarget.restrictionActive ? 'IMC > 25' : 'Sin restricción'}
          />
          <StatCard label="Objetivo diario" value={`${caloricTarget.target} kcal`} variant="success" />
        </div>
      )}
    </Card>
  )
}
