import { useState } from 'react'
import { foodsById } from '@shared/data/foods'
import { classifyFoodWithReasons } from './services/classificationService'
import { useLogStore } from '@features/med-diet-validator/store'
import { ScannerView } from './ScannerView'

export function ScannerContainer() {
  const [selectedId, setSelectedId] = useState('')
  const [result, setResult] = useState<ReturnType<typeof classifyFoodWithReasons> | null>(null)
  const addFoodToLog = useLogStore(s => s.addFoodToLog)

  const foodIds = Array.from(foodsById.keys())
  const options = foodIds.map(id => ({
    value: id,
    label: `${foodsById.get(id)!.name} ${foodsById.get(id)!.isProcessed ? '⚠️' : ''}`,
  }))

  const selected = selectedId ? foodsById.get(selectedId) : null

  const handleClassify = () => {
    if (!selected) return
    setResult(classifyFoodWithReasons(selected))
  }

  const handleAddToLog = () => {
    if (!selected) return
    addFoodToLog(selected)
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setResult(null)
  }

  return (
    <ScannerView
      selectedId={selectedId}
      options={options}
      selected={selected ?? null}
      result={result}
      onSelect={handleSelect}
      onClassify={handleClassify}
      onAddToLog={handleAddToLog}
    />
  )
}
