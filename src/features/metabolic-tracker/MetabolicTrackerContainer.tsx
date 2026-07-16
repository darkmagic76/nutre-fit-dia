import { useAppStore } from '@shared/store/appStore'
import { Card, PrimaryButton, StatCard, NumberField, SelectField } from '@shared/ui/primitives'

export function MetabolicTrackerContainer() {
  const {
    weight, height, age, gender, paf, caloricTarget,
    setWeight, setHeight, setAge, setGender, setPaf, calculateTarget,
  } = useAppStore()

  return (
    <Card
      title="📊 Perfil Metabólico"
      description="Protocolo erMedDiet (PREDIMED-Plus). Déficit de 600 kcal solo si IMC > 25 (cap 30%)."
    >
      <form
        onSubmit={e => { e.preventDefault(); calculateTarget() }}
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
            onChange={v => setGender(v as 'male' | 'female')}
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
