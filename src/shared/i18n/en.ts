import type { Translations } from './types';

export const en: Translations = {
  'app.title': 'NutreFitDia',
  'app.subtitle': 'Comprehensive Self-Care Ecosystem for Type 2 Diabetes',
  'app.keyboardHint': 'Use ← → to navigate between tabs',
  'app.footer.tfm': 'TFM · NutreFitDia · erMedDiet + AESAN 2022',
  'app.footer.disclaimer':
    '⚕️ All recommendations must be validated by a registered dietitian-nutritionist',
  'app.footer.security': 'Security',

  'tab.scanner': 'Traffic Light',
  'tab.log': 'Today',
  'tab.metabolic': 'Profile',
  'tab.plan': 'Plan',
  'tab.activity': 'Activity',
  'tab.nudges': 'Nudges',
  'tab.sustainability': 'Eco',

  'ui.scan': 'Scan',
  'ui.classify': 'Classify',
  'ui.addToLog': 'Add to log',
  'ui.generatePlan': 'Generate plan',
  'ui.calculate': 'Calculate profile',
  'ui.remove': 'Remove',
  'ui.selectFood': 'Select food',
  'ui.noSelection': 'Select a food to classify',
  'ui.violations': '⚠️ Violations detected:',
  'ui.suggestions': '💡 Suggestions:',
  'ui.caloricRestriction': 'Caloric restriction',
  'ui.activateRestriction': 'Activate caloric restriction (max 4 cereals/day)',
  'ui.planValid': '✅ Valid plan — meets all restrictions',
  'ui.planViolations': '⚠️ Violations detected',
  'ui.day': 'Day',
  'ui.foods': 'foods',
  'ui.violationsCount': 'violations',

  'scanner.title': '🔍 Nutritional Traffic Light',
  'scanner.description': 'Dual classification (health + sustainability)',
  'scanner.emptySelection': '—',
  'scanner.noFoodSelected': 'Select a food to begin',
  'scanner.trafficGreen': 'Recommended',
  'scanner.trafficOrange': 'Moderate',
  'scanner.trafficRed': 'Avoid',

  'log.title': '📝 Daily Log',
  'log.description': 'Ration validation per AESAN 2022',
  'log.emptyProfile': 'Set up your metabolic profile to see caloric target',
  'log.emptyFoods': 'No foods registered.',
  'log.foodListLabel': 'Foods registered today',
  'log.removeAria': 'Remove {food} from log',
  'log.dailyObjective': 'Daily objective',
  'log.noRestriction': 'No restriction',

  'metabolic.title': '📊 Metabolic Profile',
  'metabolic.description': 'erMedDiet + biomarkers + phenotypic profile',
  'metabolic.bmr': 'BMR',
  'metabolic.tdee': 'TDEE',
  'metabolic.deficit': 'Deficit',
  'metabolic.target': 'Target',
  'metabolic.restrictionActive': 'Restriction active',
  'metabolic.noRestriction': 'No restriction',
  'metabolic.profileError': 'Profile error',

  'plan.title': '📅 Weekly erMedDiet Plan',
  'plan.description': '7 days with all food groups. AESAN 2022 compliant.',

  'activity.title': '🏃 Physical Activity',
  'activity.description': 'WHO 150-300 min + strength tracking',
  'activity.minutes': 'Minutes',
  'activity.strength': 'Strength',
  'activity.compliance': 'Compliance',
  'activity.streak': 'Streak',
  'activity.objectiveMet': '✅ Goal met',

  'nudges.title': '🔔 Nudges',
  'nudges.description': 'Personalized notifications and recommendations',
  'nudges.empty': 'No active nudges',
  'nudges.dismiss': 'Dismiss',
  'nudges.active': 'active nudges',
  'nudges.panelLabel': 'Nudge panel',
  'nudges.pendingLabel': 'Pending nudges',
  'nudges.history': 'Engagement history',
  'nudges.dismissed': 'dismissed',
  'nudges.acknowledged': 'acknowledged',
  'nudges.dismissAria': 'Dismiss: {title}',

  'sustainability.title': '🌍 Sustainability',
  'sustainability.description': 'Environmental impact per AESAN 2022 and SDG 2030',
  'sustainability.scoring': 'Environmental Score',
  'sustainability.scoringDesc': 'Each food receives a 0–100 score based on:',
  'sustainability.carbon': 'Carbon footprint',
  'sustainability.seasonality': 'Seasonality (in-season product)',
  'sustainability.proximity': 'Proximity (local/KM0 origin)',
  'sustainability.zeroWaste': 'Zero-Waste',
  'sustainability.zeroWasteDesc': 'Products with cosmetic defects but perfectly edible:',
  'sustainability.zeroWasteFooter': '♻️ Zero-Waste · 🥕 KM0 / Cosmetic defects',
  'sustainability.emissions': 'Comparative Emissions',
  'sustainability.emissionsDesc': 'kg CO₂eq per kg of food (EAT-Lancet)',

  'install.title': 'Install app',
  'install.dismiss': 'Dismiss',

  'legal.disclaimer':
    '⚕️ All recommendations, quantities and nutritional plans must be validated by a registered dietitian-nutritionist.',

  'error.boundary.title': 'Something went wrong',
  'error.boundary.description': 'An unexpected error occurred while rendering this section.',
  'error.boundary.retry': 'Retry',
  'error.boundary.globalReload': 'Reload application',

  'form.weight': 'Weight (kg)',
  'form.height': 'Height (cm)',
  'form.age': 'Age',
  'form.diagnosisAge': 'T2D diagnosis age',
  'form.glucose': 'Glucose (mg/dL)',
  'form.gender': 'Gender',
  'form.genderMale': 'Male',
  'form.genderFemale': 'Female',
  'form.paf': 'Physical activity factor',
  'form.pafSedentary': 'Sedentary (1.2)',
  'form.pafLight': 'Light (1.375)',
  'form.pafModerate': 'Moderate (1.55)',
  'form.pafActive': 'Active (1.725)',
  'form.pafVeryActive': 'Very active (1.9)',
  'form.glucoseContext': 'Glucose context',
  'form.glucoseFasting': 'Fasting',
  'form.glucosePostprandial': 'Postprandial',

  // Activity — extended
  'activity.goalDescription': 'WHO target: 150–300 min/week moderate activity + 2 strength days',
  'activity.formMinutes': 'Moderate minutes',
  'activity.formSessions': 'Strength sessions',
  'activity.formLabel': 'Physical activity log',
  'activity.registerButton': 'Log activity',

  'cultural.socialEating': 'Ideal for sharing',
  'cultural.preparation': 'Preparation',
  'cultural.traditionalCuisine': 'Traditional cuisine',
  'cultural.socialEatingBadge': 'Shared meal',

  'meal.breakfast': 'Breakfast',
  'meal.lunch': 'Lunch',
  'meal.dinner': 'Dinner',
  'meal.snack': 'Snack',

  'cooking.stew': 'traditional stew',
  'cooking.steam': 'steamed',
  'cooking.boiled': 'boiled',
  'cooking.grilled': 'grilled',
  'cooking.raw': 'raw',

  // Food categories
  'category.cereals': 'Cereals',
  'category.vegetables': 'Vegetables',
  'category.fruits': 'Fruits',
  'category.olive_oil': 'AOVE',
  'category.dairy': 'Dairy',
  'category.legumes': 'Legumes',
  'category.fish': 'Fish',
  'category.eggs': 'Eggs',
  'category.white_meat': 'White Meat',
  'category.red_meat': 'Red Meat',
  'category.water': 'Water',

  'alert.severityCritical': 'Critical',
  'alert.severityWarning': 'Warning',
  'alert.acknowledge': 'Acknowledge alert',
  'alert.safetyLabel': 'Clinical safety alerts',
  'alert.understood': 'Understood',

  'validation.allClear': "✅ Today's log meets all daily limits.",
  'validation.unitDay': 'day',
  'validation.unitWeek': 'week',
  'validation.message.under': '{current} servings (min {limit}/{unit})',
  'validation.message.over': '{current} servings (max {limit}/{unit})',
  'validation.crossRule.whiteMeatFish': 'White Meat: restrict if fish rations exceeded',
  'validation.safety.portionTooSmall': '{name}: {grams}g (min {min}g/ration AESAN 2022)',
  'validation.safety.portionTooLarge': '{name}: {grams}g (max {max}g/ration AESAN 2022)',
  'validation.safety.highGlycemicFruit': '{name}: high glycemic fruit — consume in moderation',
  'validation.label.errors': 'Errors detected',
  'validation.label.warnings': 'Warnings',
  'violations.vegetableNudge.before2pm':
    'Vegetable reminders activate from 2 PM. You still have time to include veggies in your meal.',
  'violations.vegetableNudge.after2pm':
    'You have a vegetable deficit. The reminder has been logged in your nudge history.',
  'caloric.dailyObjective': 'Daily objective',
  'caloric.ingested': 'Ingested',
  'metabolic.descriptionDetail':
    'erMedDiet protocol (PREDIMED-Plus): conditional 600 kcal deficit for IMC > 25. Mifflin-St Jeor formula.',
  'metabolic.formAriaLabel': 'Metabolic profile form',

  // Nudge titles
  'nudge.title.cerealsRestriction': 'Cereal limit exceeded',
  'nudge.title.cerealsDeficit': 'Insufficient cereals',
  'nudge.title.fruitsGlycemicAlert': 'High glycemic fruit',
  'nudge.title.fruitsDeficit': 'Insufficient fruit',
  'nudge.title.vegetablesDeficit': 'Have you eaten enough vegetables?',
  'nudge.title.dairyCalcium': 'High animal protein',
  'nudge.title.waterHydration': 'Hydration reminder',
  'nudge.title.hyperglycemia': 'High glucose',
  'nudge.title.adherenceGlucose': 'Log your glucose',
  'nudge.title.adherenceWeight': 'Log your weight',
  'nudge.title.aoveTagging': 'EVOO required',
  'nudge.title.legumesGlycemicBase': 'Insufficient legumes this week',
  'nudge.title.fishCodTag': 'Cod — High Protein Low Fat',
  'nudge.title.eggsRedMeatAlt': 'Eggs as alternative',
  'nudge.title.whiteMeatRestrict': 'Restrict white meat',
  'nudge.title.hcInactivityAdjust': 'Insufficient physical activity',
  'nudge.title.sustainableSubstitution': 'Smart substitution',

  // Nudge bodies
  'nudge.body.cerealsRestriction':
    'You have exceeded the 4 cereal rations allowed during caloric restriction.',
  'nudge.body.cerealsDeficit':
    'You have eaten less than 3 cereal rations today. Whole grains are the energy foundation of the Mediterranean diet.',
  'nudge.body.fruitsGlycemicAlert':
    'You logged a high-glycemic fruit. Consider alternatives such as apple or pear.',
  'nudge.body.fruitsDeficit':
    'You have eaten less than 2 fruit rations today. Fresh fruit provides essential fiber and antioxidants.',
  'nudge.body.vegetablesDeficit':
    'You have eaten less than 3 vegetable rations today. Try to include a serving at dinner.',
  'nudge.body.dairyCalcium':
    'You have consumed more than 2 animal protein rations today. Consider plant-based calcium sources (broccoli, almonds, sardines).',
  'nudge.body.waterHydration': 'Remember to drink water. Target: 4–8 glasses per day.',
  'nudge.body.hyperglycemia':
    'Your latest glucose reading is high. Consider a 15-minute walk or a fiber-rich meal.',
  'nudge.body.adherenceGlucose':
    'You have not logged your glucose in the last 4 hours. Regular tracking helps your metabolic control.',
  'nudge.body.adherenceWeight':
    'You have not logged your weight in the last 4 hours. Regular tracking allows for plan adjustments.',
  'nudge.body.aoveTagging': 'EVOO must be present in every main meal.',
  'nudge.body.legumesGlycemicBase':
    'Legumes are a base requirement for glycemic control. Target: ≥4 servings/week.',
  'nudge.body.fishCodTag': 'Cod is a high-priority protein (0.7% fat).',
  'nudge.body.eggsRedMeatAlt': 'Eggs are a preferred alternative to red meat.',
  'nudge.body.whiteMeatRestrict': 'Fish servings exceeded. Consider reducing white meat.',
  'nudge.body.hcInactivityAdjust':
    'You have not reached 150 min/week of moderate activity. Consider reducing carbohydrate intake.',
  'nudge.body.sustainableSubstitution': 'Consider more sustainable alternatives: {names}',

  // Activity — extended
  'activity.streakWeeksAria': 'Streak of {streak} weeks',
  'activity.streakUnit': 'wk',

  // Scanner — extended
  'scanner.detailsAria': 'Details for {name}',
  'scanner.macrosFormat': '{kcal} kcal | {protein}g protein | {carbs}g carbs | {fat}g fat',

  // Log — extended
  'log.animalProteinWarning': 'Animal protein: {count}/day — consider plant-based calcium source',
};
