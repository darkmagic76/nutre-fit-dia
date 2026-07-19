import { Card } from '@shared/ui'
import { PROTEIN_EMISSION_RATIOS, SCORING_WEIGHTS } from '@shared/sustainability'
import { useT } from '@shared/i18n'

interface SustainabilityViewProps {
  zeroWasteCount: number
  totalFoods: number
}

export function SustainabilityView({ zeroWasteCount, totalFoods }: SustainabilityViewProps) {
  const t = useT()

  return (
    <Card
      title={t['sustainability.title']}
      description={t['sustainability.description']}
    >
      <div className="space-y-4 text-sm" role="region" aria-label={t['sustainability.title']}>
        <section>
          <h3 className="font-semibold text-emerald-700 mb-1">{t['sustainability.scoring']}</h3>
          <p className="text-stone-600">{t['sustainability.scoringDesc']}</p>
          <ul className="list-disc list-inside ml-2 mt-1 text-stone-500 space-y-0.5">
            <li>{t['sustainability.carbon']} — {SCORING_WEIGHTS.carbon * 100}%</li>
            <li>{t['sustainability.seasonality']} — {SCORING_WEIGHTS.seasonality * 100}%</li>
            <li>{t['sustainability.proximity']} — {SCORING_WEIGHTS.proximity * 100}%</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-emerald-700 mb-1">{t['sustainability.zeroWaste']}</h3>
          <p className="text-stone-600">
            {t['sustainability.zeroWasteDesc']}{' '}
            <span className="font-medium text-emerald-600">{zeroWasteCount}</span> de{' '}
            <span className="font-medium">{totalFoods}</span>
          </p>
          <p className="text-stone-400 text-xs mt-1">{t['sustainability.zeroWasteFooter']}</p>
        </section>

        <section>
          <h3 className="font-semibold text-emerald-700 mb-1">{t['sustainability.emissions']}</h3>
          <p className="text-stone-600 text-xs mb-2">{t['sustainability.emissionsDesc']}</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(PROTEIN_EMISSION_RATIOS).map(([key, value]) => (
              <div key={key} className="flex justify-between bg-stone-50 px-2 py-1 rounded">
                <span className="text-stone-600">{key}</span>
                <span className="font-mono text-stone-800">{value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Card>
  )
}
