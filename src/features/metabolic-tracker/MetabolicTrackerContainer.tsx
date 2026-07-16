import { useTrackerStore } from './store'
import { MetabolicTrackerView } from './MetabolicTrackerView'
import type { FormEvent } from 'react'

export function MetabolicTrackerContainer() {
  const {
    weight, height, age, gender, paf, caloricTarget, profileError,
    setWeight, setHeight, setAge, setGender, setPaf, calculateTarget,
  } = useTrackerStore()

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault()
    calculateTarget()
  }

  return (
    <MetabolicTrackerView
      form={{ weight, height, age, gender, paf, setWeight, setHeight, setAge, setGender, setPaf }}
      caloricTarget={caloricTarget}
      profileError={profileError}
      onCalculate={handleCalculate}
    />
  )
}
