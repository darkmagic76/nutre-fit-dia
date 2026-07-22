/** i18n type-safe translation keys. Add new keys here — TypeScript enforces both en/es. */
export interface Translations {
  // App shell
  'app.title': string;
  'app.subtitle': string;
  'app.keyboardHint': string;
  'app.footer.tfm': string;
  'app.footer.disclaimer': string;
  'app.footer.security': string;

  // Tabs
  'tab.scanner': string;
  'tab.log': string;
  'tab.metabolic': string;
  'tab.plan': string;
  'tab.activity': string;
  'tab.nudges': string;
  'tab.sustainability': string;

  // Shared UI
  'ui.scan': string;
  'ui.classify': string;
  'ui.addToLog': string;
  'ui.generatePlan': string;
  'ui.calculate': string;
  'ui.remove': string;
  'ui.selectFood': string;
  'ui.noSelection': string;
  'ui.violations': string;
  'ui.suggestions': string;
  'ui.caloricRestriction': string;
  'ui.activateRestriction': string;
  'ui.planValid': string;
  'ui.planViolations': string;
  'ui.day': string;
  'ui.foods': string;
  'ui.violationsCount': string;

  // Scanner
  'scanner.title': string;
  'scanner.description': string;
  'scanner.emptySelection': string;
  'scanner.noFoodSelected': string;
  'scanner.trafficGreen': string;
  'scanner.trafficOrange': string;
  'scanner.trafficRed': string;

  // DailyLog
  'log.title': string;
  'log.description': string;
  'log.emptyProfile': string;
  'log.emptyFoods': string;
  'log.foodListLabel': string;
  'log.removeAria': string;
  'log.dailyObjective': string;
  'log.noRestriction': string;

  // Metabolic
  'metabolic.title': string;
  'metabolic.description': string;
  'metabolic.descriptionDetail': string;
  'metabolic.bmr': string;
  'metabolic.tdee': string;
  'metabolic.deficit': string;
  'metabolic.target': string;
  'metabolic.restrictionActive': string;
  'metabolic.noRestriction': string;
  'metabolic.profileError': string;

  // Plan
  'plan.title': string;
  'plan.description': string;

  // Meal labels
  'meal.breakfast': string;
  'meal.lunch': string;
  'meal.dinner': string;
  'meal.snack': string;

  // Cooking techniques
  'cooking.stew': string;
  'cooking.steam': string;
  'cooking.boiled': string;
  'cooking.grilled': string;
  'cooking.raw': string;

  // Activity
  'activity.title': string;
  'activity.description': string;
  'activity.goalDescription': string;
  'activity.minutes': string;
  'activity.strength': string;
  'activity.compliance': string;
  'activity.streak': string;
  'activity.objectiveMet': string;
  'activity.formMinutes': string;
  'activity.formSessions': string;
  'activity.formLabel': string;
  'activity.registerButton': string;

  // Nudges
  'nudges.title': string;
  'nudges.description': string;
  'nudges.empty': string;
  'nudges.dismiss': string;
  'nudges.active': string;
  'nudges.panelLabel': string;
  'nudges.pendingLabel': string;
  'nudges.history': string;
  'nudges.dismissed': string;
  'nudges.acknowledged': string;
  'nudges.dismissAria': string;

  // Sustainability
  'sustainability.title': string;
  'sustainability.description': string;
  'sustainability.scoring': string;
  'sustainability.scoringDesc': string;
  'sustainability.carbon': string;
  'sustainability.seasonality': string;
  'sustainability.proximity': string;
  'sustainability.zeroWaste': string;
  'sustainability.zeroWasteDesc': string;
  'sustainability.zeroWasteFooter': string;
  'sustainability.emissions': string;
  'sustainability.emissionsDesc': string;

  // Cultural / UNESCO
  'cultural.socialEating': string;
  'cultural.preparation': string;
  'cultural.traditionalCuisine': string;
  'cultural.socialEatingBadge': string;

  // Alerts / Safety
  'alert.severityCritical': string;
  'alert.severityWarning': string;
  'alert.acknowledge': string;
  'alert.safetyLabel': string;
  'alert.understood': string;

  // Validation
  'validation.allClear': string;

  // Caloric summary
  'caloric.dailyObjective': string;

  // Error boundary
  'error.boundary.title': string;
  'error.boundary.description': string;
  'error.boundary.retry': string;
  'error.boundary.globalReload': string;

  // Legal
  'legal.disclaimer': string;

  // PWA Install
  'install.title': string;
  'install.dismiss': string;

  // Form labels
  'form.weight': string;
  'form.height': string;
  'form.age': string;
  'form.diagnosisAge': string;
  'form.glucose': string;
  'form.gender': string;
  'form.genderMale': string;
  'form.genderFemale': string;
  'form.paf': string;
  'form.pafSedentary': string;
  'form.pafLight': string;
  'form.pafModerate': string;
  'form.pafActive': string;
  'form.pafVeryActive': string;
  'form.glucoseContext': string;
  'form.glucoseFasting': string;
  'form.glucosePostprandial': string;
}
