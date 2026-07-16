import { useState } from 'react'
import { foodsById } from '@shared/data/foods'
import { classifyFoodWithReasons } from '@features/nutritional-traffic-light/services/classificationService'
import { computeCaloricTarget } from '@features/metabolic-tracker/services/caloricTargetService'
import { generateWeeklyPlan } from '@features/recipe-engine/services/planGenerator'
import { TrafficLightColor } from '@shared/domain'

const TRAFFIC_COLORS: Record<string, string> = {
  [TrafficLightColor.GREEN]: 'bg-emerald-500',
  [TrafficLightColor.ORANGE]: 'bg-amber-500',
  [TrafficLightColor.RED]: 'bg-red-500',
}

const TRAFFIC_LABELS: Record<string, string> = {
  [TrafficLightColor.GREEN]: 'Recomendable',
  [TrafficLightColor.ORANGE]: 'Moderación',
  [TrafficLightColor.RED]: 'Evitar',
}

export default function App() {
  const [tab, setTab] = useState<'scanner' | 'metabolic' | 'plan'>('scanner')

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <header className="bg-emerald-800 text-white p-6">
        <h1 className="text-3xl font-bold text-center">NutreFitDia</h1>
        <p className="text-center text-emerald-200 text-sm mt-1">
          Ecosistema de Autocuidado Integral para Diabetes Tipo 2
        </p>
        <nav className="flex justify-center gap-4 mt-4">
          {(['scanner', 'metabolic', 'plan'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t ? 'bg-white text-emerald-800' : 'bg-emerald-700 text-emerald-100 hover:bg-emerald-600'
              }`}
            >
              {t === 'scanner' && '🔍 Semáforo'}
              {t === 'metabolic' && '📊 Perfil'}
              {t === 'plan' && '📅 Plan'}
            </button>
          ))}
        </nav>
      </header>

      <section className="max-w-3xl mx-auto p-6">
        {tab === 'scanner' && <ScannerDemo />}
        {tab === 'metabolic' && <MetabolicDemo />}
        {tab === 'plan' && <PlanDemo />}
      </section>

      <footer className="text-center text-stone-400 text-xs p-4">
        TF M — NutreFitDia · erMedDiet + AESAN 2022 · Validación profesional requerida
      </footer>
    </main>
  )
}

function ScannerDemo() {
  const [selectedId, setSelectedId] = useState<string>('')
  const [result, setResult] = useState<ReturnType<typeof classifyFoodWithReasons> | null>(null)

  const foodIds = Array.from(foodsById.keys())
  const selected = selectedId ? foodsById.get(selectedId) : null

  const handleScan = () => {
    if (!selected) return
    setResult(classifyFoodWithReasons(selected))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">🔍 Semáforo Nutricional</h2>
        <p className="text-stone-500 text-sm mb-4">
          Seleccioná un alimento del catálogo para ver su clasificación según el modelo del Hospital Rey Juan Carlos.
          Los productos con azúcares ocultos o grasas trans se clasifican automáticamente como ROJO.
        </p>

        <select
          value={selectedId}
          onChange={e => { setSelectedId(e.target.value); setResult(null) }}
          className="w-full p-3 border border-stone-300 rounded-lg text-sm bg-white"
        >
          <option value="">— Seleccionar alimento —</option>
          {foodIds.map(id => (
            <option key={id} value={id}>
              {foodsById.get(id)!.name} {foodsById.get(id)!.isProcessed ? '⚠️' : ''}
            </option>
          ))}
        </select>

        {selected && (
          <div className="mt-4 p-3 bg-stone-50 rounded-lg text-sm space-y-1">
            <p><strong>Categoría:</strong> {selected.category}</p>
            <p><strong>Ración:</strong> {selected.gramsPerRation}g</p>
            <p><strong>kcal/100g:</strong> {selected.kcalPer100g}</p>
            <p><strong>Proteína:</strong> {selected.proteinPer100g}g | <strong>HC:</strong> {selected.carbsPer100g}g | <strong>Grasa:</strong> {selected.fatPer100g}g</p>
            {selected.harmfulIngredients.length > 0 && (
              <p className="text-red-600">⚠️ Ingredientes: {selected.harmfulIngredients.join(', ')}</p>
            )}
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={!selectedId}
          className="mt-4 w-full bg-emerald-700 text-white py-3 rounded-lg font-medium disabled:opacity-40 hover:bg-emerald-800 transition"
        >
          Clasificar
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-lg text-white ${TRAFFIC_COLORS[result.color]}`}>
            <p className="text-2xl font-bold">{TRAFFIC_LABELS[result.color]}</p>
            {result.reasons.map((r, i) => (
              <p key={i} className="text-sm mt-1 opacity-90">{r}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MetabolicDemo() {
  const [weight, setWeight] = useState('80')
  const [height, setHeight] = useState('170')
  const [age, setAge] = useState('55')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [paf, setPaf] = useState('1.2')
  const [result, setResult] = useState<ReturnType<typeof computeCaloricTarget> | null>(null)

  const handleCalculate = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const imc = w / ((h / 100) ** 2)
    setResult(computeCaloricTarget({
      weight: w,
      height: h,
      age: parseInt(age),
      gender,
      physicalActivityFactor: parseFloat(paf),
      imc: Math.round(imc * 10) / 10,
    }))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">📊 Perfil Metabólico</h2>
        <p className="text-stone-500 text-sm mb-4">
          Calculá tu objetivo calórico diario según el protocolo erMedDiet (PREDIMED-Plus).
          Si tu IMC &gt; 25, se aplica un déficit de 600 kcal (cap 30%).
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label>Peso (kg)<input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-2 border rounded mt-1" /></label>
          <label>Altura (cm)<input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-2 border rounded mt-1" /></label>
          <label>Edad<input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full p-2 border rounded mt-1" /></label>
          <label>Género
            <select value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')} className="w-full p-2 border rounded mt-1">
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </label>
          <label>Factor actividad
            <select value={paf} onChange={e => setPaf(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="1.2">Sedentario (1.2)</option>
              <option value="1.375">Ligero (1.375)</option>
              <option value="1.55">Moderado (1.55)</option>
              <option value="1.725">Activo (1.725)</option>
              <option value="1.9">Muy activo (1.9)</option>
            </select>
          </label>
        </div>
        <button onClick={handleCalculate} className="mt-4 w-full bg-emerald-700 text-white py-3 rounded-lg font-medium hover:bg-emerald-800 transition">
          Calcular
        </button>
        {result && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-stone-50 p-3 rounded"><strong>BMR</strong><p className="text-xl font-bold text-emerald-700">{result.bmr} kcal</p></div>
            <div className="bg-stone-50 p-3 rounded"><strong>TDEE</strong><p className="text-xl font-bold text-emerald-700">{result.tdee} kcal</p></div>
            <div className={`p-3 rounded ${result.restrictionActive ? 'bg-red-50' : 'bg-stone-50'}`}>
              <strong>Déficit</strong>
              <p className="text-xl font-bold text-red-600">{result.deficit} kcal</p>
              {result.restrictionActive && <p className="text-xs text-red-500">Restricción activa (IMC &gt; 25)</p>}
            </div>
            <div className="bg-emerald-50 p-3 rounded"><strong>Objetivo diario</strong><p className="text-2xl font-bold text-emerald-700">{result.target} kcal</p></div>
          </div>
        )}
      </div>
    </div>
  )
}

function PlanDemo() {
  const [restriction, setRestriction] = useState(false)
  const [plan, setPlan] = useState<ReturnType<typeof generateWeeklyPlan> | null>(null)

  const handleGenerate = () => {
    setPlan(generateWeeklyPlan(restriction))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">📅 Plan Semanal erMedDiet</h2>
        <p className="text-stone-500 text-sm mb-4">
          Generá un plan de 7 días que cumple con las raciones recomendadas por AESAN 2022.
        </p>
        <label className="flex items-center gap-2 text-sm mb-4">
          <input type="checkbox" checked={restriction} onChange={e => setRestriction(e.target.checked)} className="rounded" />
          Restricción calórica activa (máx 4 cereales/día)
        </label>
        <button onClick={handleGenerate} className="w-full bg-emerald-700 text-white py-3 rounded-lg font-medium hover:bg-emerald-800 transition">
          Generar plan
        </button>
        {plan && (
          <div className="mt-4">
            <p className={`text-sm font-medium mb-3 ${plan.valid ? 'text-emerald-600' : 'text-red-600'}`}>
              {plan.valid ? '✅ Plan válido — cumple todas las restricciones' : '⚠️ El plan tiene violaciones'}
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {plan.days.map(day => (
                <details key={day.day} className="bg-stone-50 rounded-lg p-3">
                  <summary className="font-medium cursor-pointer">
                    Día {day.day} — {day.entries.length} ingestas
                  </summary>
                  <ul className="mt-2 space-y-1 text-sm">
                    {day.entries.map((e, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{e.rations}× {e.food.name}</span>
                        <span className="text-stone-400">{e.food.category}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
