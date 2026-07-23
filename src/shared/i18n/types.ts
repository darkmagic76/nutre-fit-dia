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

  // Food categories (used in PlanView)
  'category.cereals': string;
  'category.vegetables': string;
  'category.fruits': string;
  'category.olive_oil': string;
  'category.dairy': string;
  'category.legumes': string;
  'category.fish': string;
  'category.eggs': string;
  'category.white_meat': string;
  'category.red_meat': string;
  'category.water': string;

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
  'validation.unitDay': string;
  'validation.unitWeek': string;

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

  // Activity — extended
  'activity.streakWeeksAria': string;
  'activity.streakUnit': string;

  // Scanner — extended
  'scanner.detailsAria': string;
  'scanner.macrosFormat': string;

  // Log — extended
  'log.animalProteinWarning': string;

  // Caloric summary — extended
  'caloric.ingested': string;

  // Metabolic — extended
  'metabolic.formAriaLabel': string;

  // Nudge rule titles (17 rules)
  'nudge.title.cerealsRestriction': string;
  'nudge.title.cerealsDeficit': string;
  'nudge.title.fruitsGlycemicAlert': string;
  'nudge.title.fruitsDeficit': string;
  'nudge.title.vegetablesDeficit': string;
  'nudge.title.dairyCalcium': string;
  'nudge.title.waterHydration': string;
  'nudge.title.hyperglycemia': string;
  'nudge.title.adherenceGlucose': string;
  'nudge.title.adherenceWeight': string;
  'nudge.title.aoveTagging': string;
  'nudge.title.legumesGlycemicBase': string;
  'nudge.title.fishCodTag': string;
  'nudge.title.eggsRedMeatAlt': string;
  'nudge.title.whiteMeatRestrict': string;
  'nudge.title.hcInactivityAdjust': string;
  'nudge.title.sustainableSubstitution': string;

  // Nudge rule bodies (static)
  'nudge.body.cerealsRestriction': string;
  'nudge.body.cerealsDeficit': string;
  'nudge.body.fruitsGlycemicAlert': string;
  'nudge.body.fruitsDeficit': string;
  'nudge.body.vegetablesDeficit': string;
  'nudge.body.dairyCalcium': string;
  'nudge.body.waterHydration': string;
  'nudge.body.hyperglycemia': string;
  'nudge.body.adherenceGlucose': string;
  'nudge.body.adherenceWeight': string;
  'nudge.body.aoveTagging': string;
  'nudge.body.legumesGlycemicBase': string;
  'nudge.body.fishCodTag': string;
  'nudge.body.eggsRedMeatAlt': string;
  'nudge.body.whiteMeatRestrict': string;
  'nudge.body.hcInactivityAdjust': string;

  // Nudge rule bodies (dynamic — key used as format string with {names} placeholder)
  'nudge.body.sustainableSubstitution': string;
}
