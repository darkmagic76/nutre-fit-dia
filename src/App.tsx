import { TabButton, LegalDisclaimer } from '@shared/ui'
import { useTabNavigation, TAB_IDS, TAB_ICONS, type Tab } from '@shared/hooks/useTabNavigation'
import { useT, useLocale } from '@shared/i18n'
import { ScannerContainer } from '@features/nutritional-traffic-light/ScannerContainer'
import { DailyLogContainer } from '@features/med-diet-validator/DailyLogContainer'
import { MetabolicTrackerContainer } from '@features/metabolic-tracker/MetabolicTrackerContainer'
import { PlanContainer } from '@features/recipe-engine/PlanContainer'
import { ActivityTrackerContainer } from '@features/activity-tracker'
import { NudgePanelContainer } from '@features/nudge-engine/NudgePanelContainer'
import { SustainabilityContainer } from '@features/sustainability/SustainabilityContainer'

const TAB_LABEL_KEYS: Record<Tab, keyof ReturnType<typeof useT>> = {
  scanner: 'tab.scanner',
  log: 'tab.log',
  metabolic: 'tab.metabolic',
  plan: 'tab.plan',
  activity: 'tab.activity',
  nudges: 'tab.nudges',
  sustainability: 'tab.sustainability',
}

export default function App() {
  const { tab, setTab } = useTabNavigation()
  const t = useT()
  const { locale, setLocale } = useLocale()

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="bg-emerald-800 text-white p-4 sm:p-6" role="banner">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">{t['app.title']}</h1>
        <p className="text-center text-emerald-200 text-xs sm:text-sm mt-1">
          {t['app.subtitle']}
        </p>
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
            className="text-xs bg-emerald-700 hover:bg-emerald-600 text-emerald-200 px-3 py-1 rounded-full transition-colors"
            aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            {locale === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
          </button>
        </div>
        <nav
          className="flex justify-center gap-1 sm:gap-2 mt-4 flex-wrap overflow-x-auto px-2"
          role="tablist"
          aria-label={t['app.title']}
        >
          {TAB_IDS.map(id => (
            <TabButton
              key={id}
              active={tab === id}
              onClick={() => setTab(id)}
              aria-controls={`panel-${id}`}
            >
              <span className="sm:hidden" aria-hidden="true">{TAB_ICONS[id]}</span>
              <span className="hidden sm:inline">{TAB_ICONS[id]} {t[TAB_LABEL_KEYS[id]]}</span>
            </TabButton>
          ))}
        </nav>
        <p className="text-center text-emerald-300 text-[10px] mt-2">
          {t['app.keyboardHint']}
        </p>
      </header>

      <main className="max-w-3xl mx-auto p-3 sm:p-6" id="main-content">
        <LegalDisclaimer text={t['legal.disclaimer']} />
        <div className="h-2" />
        <div role="tabpanel" id="panel-scanner" hidden={tab !== 'scanner'} aria-label={t['tab.scanner']}>
          {tab === 'scanner' && <ScannerContainer />}
        </div>
        <div role="tabpanel" id="panel-log" hidden={tab !== 'log'} aria-label={t['tab.log']}>
          {tab === 'log' && <DailyLogContainer />}
        </div>
        <div role="tabpanel" id="panel-metabolic" hidden={tab !== 'metabolic'} aria-label={t['tab.metabolic']}>
          {tab === 'metabolic' && <MetabolicTrackerContainer />}
        </div>
        <div role="tabpanel" id="panel-plan" hidden={tab !== 'plan'} aria-label={t['tab.plan']}>
          {tab === 'plan' && <PlanContainer />}
        </div>
        <div role="tabpanel" id="panel-activity" hidden={tab !== 'activity'} aria-label={t['tab.activity']}>
          {tab === 'activity' && <ActivityTrackerContainer />}
        </div>
        <div role="tabpanel" id="panel-nudges" hidden={tab !== 'nudges'} aria-label={t['tab.nudges']}>
          {tab === 'nudges' && <NudgePanelContainer />}
        </div>
        <div role="tabpanel" id="panel-sustainability" hidden={tab !== 'sustainability'} aria-label={t['tab.sustainability']}>
          {tab === 'sustainability' && <SustainabilityContainer />}
        </div>
      </main>

      <footer className="text-center text-stone-400 text-xs p-4 border-t border-stone-200" role="contentinfo">
        <p>{t['app.footer.tfm']}</p>
        <p className="mt-1">{t['app.footer.disclaimer']}</p>
        <p className="mt-1">
          <a href="/.well-known/security.txt" className="underline hover:text-stone-600">{t['app.footer.security']}</a>
        </p>
      </footer>
    </div>
  )
}
