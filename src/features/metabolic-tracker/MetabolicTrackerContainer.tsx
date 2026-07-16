import { useTrackerStore } from './store'
import { MetabolicTrackerView } from './MetabolicTrackerView'
import type { FormEvent } from 'react'

export function MetabolicTrackerContainer() {
  const {
    weight, height, age, gender, paf, caloricTarget,
    setWeight, setHeight, setAge, setGender, setPaf, calculateTarget,
  } = useTrackerStore()

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault()
    calculateTarget()
  }

  return (
    <MetabolicTrackerView
      weight={weight}
      height={height}
      age={age}
      gender={gender}
      paf={paf}
      caloricTarget={caloricTarget}
      setWeight={setWeight}
      setHeight={setHeight}
      setAge={setAge}
      setGender={setGender}
      setPaf={setPaf}
      onCalculate={handleCalculate}
    />
  )
}
