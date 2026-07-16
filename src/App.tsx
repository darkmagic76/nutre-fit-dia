function App() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 p-8">
      <header className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-emerald-800 mb-2">
          NutreFitDia
        </h1>
        <p className="text-lg text-stone-600">
          Ecosistema de Autocuidado Integral para Diabetes Tipo 2 y Salud Sostenible
        </p>
      </header>
      <section className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-emerald-700 mb-3">
            Semáforo Nutricional
          </h2>
          <p className="text-stone-500">Escaneo de alimentos y clasificación metabólica.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-emerald-700 mb-3">
            Motor Metabólico
          </h2>
          <p className="text-stone-500">Cálculo de objetivo calórico personalizado (erMedDiet).</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-emerald-700 mb-3">
            Planificador de Recetas
          </h2>
          <p className="text-stone-500">Generación de planes semanales con puntuación de sostenibilidad.</p>
        </div>
      </section>
    </main>
  )
}

export default App
