/** i18n type-safe translation keys. Add new keys here — TypeScript enforces both en/es. */
export interface Translations {
  // App shell
  'app.title': string
  'app.subtitle': string
  'app.keyboardHint': string
  'app.footer.tfm': string
  'app.footer.disclaimer': string
  'app.footer.security': string

  // Tabs
  'tab.scanner': string
  'tab.log': string
  'tab.metabolic': string
  'tab.plan': string
  'tab.activity': string
  'tab.nudges': string
  'tab.sustainability': string

  // Shared UI
  'ui.scan': string
  'ui.classify': string
  'ui.addToLog': string
  'ui.generatePlan': string
  'ui.calculate': string
  'ui.remove': string
  'ui.selectFood': string
  'ui.noSelection': string
  'ui.violations': string
  'ui.suggestions': string
  'ui.caloricRestriction': string
  'ui.activateRestriction': string
  'ui.planValid': string
  'ui.planViolations': string
  'ui.day': string
  'ui.foods': string
  'ui.violationsCount': string

  // Scanner
  'scanner.title': string
  'scanner.description': string
  'scanner.emptySelection': string
  'scanner.noFoodSelected': string

  // DailyLog
  'log.title': string
  'log.description': string
  'log.emptyProfile': string
  'log.dailyObjective': string
  'log.noRestriction': string

  // Metabolic
  'metabolic.title': string
  'metabolic.description': string
  'metabolic.bmr': string
  'metabolic.tdee': string
  'metabolic.deficit': string
  'metabolic.target': string
  'metabolic.restrictionActive': string
  'metabolic.noRestriction': string
  'metabolic.profileError': string

  // Plan
  'plan.title': string
  'plan.description': string

  // Activity
  'activity.title': string
  'activity.description': string
  'activity.minutes': string
  'activity.strength': string
  'activity.compliance': string
  'activity.streak': string
  'activity.objectiveMet': string

  // Nudges
  'nudges.title': string
  'nudges.description': string
  'nudges.empty': string
  'nudges.dismiss': string

  // Sustainability
  'sustainability.title': string
  'sustainability.description': string
  'sustainability.scoring': string
  'sustainability.scoringDesc': string
  'sustainability.carbon': string
  'sustainability.seasonality': string
  'sustainability.proximity': string
  'sustainability.zeroWaste': string
  'sustainability.zeroWasteDesc': string
  'sustainability.zeroWasteFooter': string
  'sustainability.emissions': string
  'sustainability.emissionsDesc': string

  // Legal
  'legal.disclaimer': string

  // Form labels
  'form.weight': string
  'form.height': string
  'form.age': string
  'form.diagnosisAge': string
  'form.glucose': string
  'form.gender': string
  'form.genderMale': string
  'form.genderFemale': string
  'form.paf': string
  'form.pafSedentary': string
  'form.pafLight': string
  'form.pafModerate': string
  'form.pafActive': string
  'form.pafVeryActive': string
  'form.glucoseContext': string
  'form.glucoseFasting': string
  'form.glucosePostprandial': string
}
