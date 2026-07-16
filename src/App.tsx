import { useState } from 'react'
import { foodsById } from '@shared/data/foods'
import { classifyFoodWithReasons } from '@features/nutritional-traffic-light/services/classificationService'
import { TrafficLightColor } from '@shared/domain'
import { useAppStore } from '@shared/store/appStore'

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

const CATEGORY_NAMES: Record<string, string> = {
  cereals: 'Cereales', vegetables: 'Hortalizas', fruits: 'Frutas',
  olive_oil: 'AOVE', dairy: 'Lácteos', legumes: 'Legumbres',
  fish: 'Pescado', eggs: 'Huevos', white_meat: 'Carne blanca', water: 'Agua',
}

export default function App() {
  const [tab, setTab] = useState<'scanner' | 'metabolic' | 'plan' | 'log'>('scanner')

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <header className="bg-emerald-800 text-white p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">NutreFitDia</h1>
        <p className="text-center text-emerald-200 text-xs sm:text-sm mt-1">
          Ecosistema de Autocuidado Integral para Diabetes Tipo 2
        </p>
        <nav className="flex justify-center gap-2 mt-4 flex-wrap">
          {(['scanner', 'log', 'metabolic', 'plan'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === t ? 'bg-white text-emerald-800' : 'bg-emerald-700 text-emerald-100 hover:bg-emerald-600'
              }`}
            >
              {t === 'scanner' && '🔍 Semáforo'}
              {t === 'log' && '📝 Hoy'}
              {t === 'metabolic' && '📊 Perfil'}
              {t === 'plan' && '📅 Plan'}
            </button>
          ))}
        </nav>
      </header>

      <section className="max-w-3xl mx-auto p-4 sm:p-6">
        {tab === 'scanner' && <ScannerTab />}
        {tab === 'log' && <DailyLogTab />}
        {tab === 'metabolic' && <MetabolicTab />}
        {tab === 'plan' && <PlanTab />}
      </section>

      <footer className="text-center text-stone-400 text-xs p-4">
        TFM · NutreFitDia · erMedDiet + AESAN 2022 · Validación profesional requerida
      </footer>
    </main>
  )
}

function ScannerTab() {
  const [selectedId, setSelectedId] = useState('')
  const [result, setResult] = useState<ReturnType<typeof classifyFoodWithReasons> | null>(null)
  const addFoodToLog = useAppStore(s => s.addFoodToLog)

  const foodIds = Array.from(foodsById.keys())
  const selected = selectedId ? foodsById.get(selectedId) : null

  const handleScan = () => {
    if (!selected) return
    setResult(classifyFoodWithReasons(selected))
  }

  const handleAddToLog = () => {
    if (!selected) return
    addFoodToLog(selected)
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-emerald-700">🔍 Semáforo Nutricional</h2>
      <p className="text-stone-500 text-sm">
        Modelo Hospital Rey Juan Carlos. Azúcares ocultos o grasas trans → ROJO automático.
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
        <div className="p-3 bg-stone-50 rounded-lg text-sm space-y-1">
          <p><strong>{selected.name}</strong> — {CATEGORY_NAMES[selected.category]}</p>
          <p>{selected.kcalPer100g} kcal | {selected.proteinPer100g}g prot | {selected.carbsPer100g}g HC | {selected.fatPer100g}g grasa</p>
          {selected.harmfulIngredients.length > 0 && (
            <p className="text-red-600">⚠️ {selected.harmfulIngredients.join(', ')}</p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={handleScan} disabled={!selectedId}
          className="flex-1 bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-emerald-800 transition">
          Clasificar
        </button>
        <button onClick={handleAddToLog} disabled={!selectedId}
          className="flex-1 bg-amber-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-amber-700 transition">
          + Añadir al día
        </button>
      </div>
      {result && (
        <div className={`p-4 rounded-lg text-white ${TRAFFIC_COLORS[result.color]}`}>
          <p className="text-xl font-bold">{TRAFFIC_LABELS[result.color]}</p>
          {result.reasons.map((r, i) => <p key={i} className="text-sm mt-1 opacity-90">{r}</p>)}
        </div>
      )}
    </div>
  )
}

function DailyLogTab() {
  const { todayLog, todayValidation, removeFoodFromLog } = useAppStore()
  const caloricTarget = useAppStore(s => s.caloricTarget)

  const totalKcal = todayLog.reduce((sum, f) => sum + f.kcalPer100g * (f.gramsPerRation / 100), 0)
  const formatKcal = (n: number) => Math.round(n)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 mb-4">📝 Registro de hoy</h2>

        {caloricTarget && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-lg text-sm">
            <span className="font-medium">Objetivo diario: {caloricTarget.target} kcal</span>
            <span className="text-stone-500 ml-2">
              | Ingerido: {formatKcal(totalKcal)} kcal
              {caloricTarget.restrictionActive && (
                <span className="text-red-500 ml-1">(déficit {caloricTarget.deficit} kcal)</span>
              )}
            </span>
          </div>
        )}

        {todayLog.length === 0 ? (
          <p className="text-stone-400 text-sm">Usá el Semáforo para añadir alimentos al registro de hoy.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {todayLog.map((food, i) => (
              <li key={i} className="flex justify-between items-center bg-stone-50 p-2 rounded text-sm">
                <span>{food.name} <span className="text-stone-400">({CATEGORY_NAMES[food.category]})</span></span>
                <button onClick={() => removeFoodFromLog(i)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
              </li>
            ))}
          </ul>
        )}

        {todayValidation && !todayValidation.valid && (
          <div className="p-3 bg-red-50 rounded-lg text-sm space-y-1">
            <p className="font-medium text-red-700">⚠️ Violaciones detectadas:</p>
            {todayValidation.violations.map((v, i) => (
              <p key={i} className="text-red-600">• {v.message}</p>
            ))}
            {todayValidation.animalProteinCount > 2 && (
              <p className="text-amber-600">💡 Proteína animal: {todayValidation.animalProteinCount}/día — considerar fuente de calcio vegetal</p>
            )}
          </div>
        )}

        {todayValidation?.valid && todayLog.length > 0 && (
          <p className="text-emerald-600 text-sm font-medium">✅ El registro de hoy cumple con los límites diarios.</p>
        )}

        {!caloricTarget && (
          <p className="text-amber-600 text-sm mt-2">💡 Configurá tu perfil metabólico para ver el objetivo calórico.</p>
        )}
      </div>
    </div>
  )
}

function MetabolicTab() {
  const { weight, height, age, gender, paf, caloricTarget, setWeight, setHeight, setAge, setGender, setPaf, calculateTarget } = useAppStore()

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-emerald-700">📊 Perfil Metabólico</h2>
      <p className="text-stone-500 text-sm">
        Protocolo erMedDiet (PREDIMED-Plus). Déficit de 600 kcal solo si IMC &gt; 25 (cap 30%).
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
        <label className="col-span-2">Factor actividad
          <select value={paf} onChange={e => setPaf(e.target.value)} className="w-full p-2 border rounded mt-1">
            <option value="1.2">Sedentario (1.2)</option>
            <option value="1.375">Ligero (1.375)</option>
            <option value="1.55">Moderado (1.55)</option>
            <option value="1.725">Activo (1.725)</option>
            <option value="1.9">Muy activo (1.9)</option>
          </select>
        </label>
      </div>
      <button onClick={calculateTarget} className="w-full bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition">
        Calcular perfil
      </button>
      {caloricTarget && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-stone-50 p-3 rounded"><strong>BMR</strong><p className="text-lg font-bold text-emerald-700">{caloricTarget.bmr} kcal</p></div>
          <div className="bg-stone-50 p-3 rounded"><strong>TDEE</strong><p className="text-lg font-bold text-emerald-700">{caloricTarget.tdee} kcal</p></div>
          <div className={`p-3 rounded ${caloricTarget.restrictionActive ? 'bg-red-50' : 'bg-stone-50'}`}>
            <strong>Déficit</strong>
            <p className="text-lg font-bold text-red-600">{caloricTarget.deficit} kcal</p>
            {caloricTarget.restrictionActive && <p className="text-xs text-red-500">IMC &gt; 25</p>}
          </div>
          <div className="bg-emerald-50 p-3 rounded"><strong>Objetivo</strong><p className="text-xl font-bold text-emerald-700">{caloricTarget.target} kcal</p></div>
        </div>
      )}
    </div>
  )
}

function PlanTab() {
  const { restrictionActive, weeklyPlan, setRestrictionActive, generatePlan } = useAppStore()

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-emerald-700">📅 Plan Semanal erMedDiet</h2>
      <p className="text-stone-500 text-sm">7 días con todos los grupos alimentarios. Cumple AESAN 2022.</p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={restrictionActive} onChange={e => setRestrictionActive(e.target.checked)} className="rounded" />
        Restricción calórica (máx 4 cereales/día)
      </label>
      <button onClick={generatePlan} className="w-full bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition">
        Generar plan
      </button>
      {weeklyPlan && (
        <div>
          <p className={`text-sm font-medium mb-3 ${weeklyPlan.valid ? 'text-emerald-600' : 'text-red-600'}`}>
            {weeklyPlan.valid ? '✅ Plan válido — cumple todas las restricciones' : '⚠️ Violaciones detectadas'}
          </p>
          {!weeklyPlan.valid && (
            <div className="mb-3 p-3 bg-red-50 rounded-lg text-sm space-y-1">
              {weeklyPlan.weeklyResult.violations.map((v, i) => (
                <p key={i} className="text-red-600">• {v.message}</p>
              ))}
              {weeklyPlan.dailyResults.map((r, d) =>
                r.violations.length > 0 ? (
                  <details key={d} className="text-red-500">
                    <summary>Día {d + 1}: {r.violations.length} violaciones</summary>
                    {r.violations.map((v, i) => <p key={i} className="ml-4">• {v.message}</p>)}
                  </details>
                ) : null,
              )}
            </div>
          )}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {weeklyPlan.days.map(day => (
              <details key={day.day} className="bg-stone-50 rounded-lg p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Día {day.day} — {day.entries.length} alimentos
                  {weeklyPlan.dailyResults[day.day - 1]?.valid === false && ' ⚠️'}
                </summary>
                <ul className="mt-2 space-y-1 text-sm">
                  {day.entries.map((e, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{e.rations}× {e.food.name}</span>
                      <span className="text-stone-400">{CATEGORY_NAMES[e.food.category]}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
