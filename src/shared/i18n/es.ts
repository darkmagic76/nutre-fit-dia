import type { Translations } from './types';

export const es: Translations = {
  'app.title': 'NutreFitDia',
  'app.subtitle': 'Ecosistema de Autocuidado Integral para Diabetes Tipo 2',
  'app.keyboardHint': 'Usá ← → para navegar entre pestañas',
  'app.footer.tfm': 'TFM · NutreFitDia · erMedDiet + AESAN 2022',
  'app.footer.disclaimer':
    '⚕️ Toda recomendación debe ser validada por un dietista-nutricionista colegiado',
  'app.footer.security': 'Seguridad',

  'tab.scanner': 'Semáforo',
  'tab.log': 'Hoy',
  'tab.metabolic': 'Perfil',
  'tab.plan': 'Plan',
  'tab.activity': 'Actividad',
  'tab.nudges': 'Nudges',
  'tab.sustainability': 'Eco',

  'ui.scan': 'Escanear',
  'ui.classify': 'Clasificar',
  'ui.addToLog': 'Añadir al registro',
  'ui.generatePlan': 'Generar plan',
  'ui.calculate': 'Calcular perfil',
  'ui.remove': 'Eliminar',
  'ui.selectFood': 'Seleccionar alimento',
  'ui.noSelection': 'Seleccioná un alimento para clasificar',
  'ui.violations': '⚠️ Violaciones detectadas:',
  'ui.suggestions': '💡 Sugerencias:',
  'ui.caloricRestriction': 'Restricción calórica',
  'ui.activateRestriction': 'Activar restricción calórica (máx 4 cereales/día)',
  'ui.planValid': '✅ Plan válido — cumple todas las restricciones',
  'ui.planViolations': '⚠️ Violaciones detectadas',
  'ui.day': 'Día',
  'ui.foods': 'alimentos',
  'ui.violationsCount': 'violaciones',

  'scanner.title': '🔍 Semáforo Nutricional',
  'scanner.description': 'Clasificación dual (salud + sostenibilidad)',
  'scanner.emptySelection': '—',
  'scanner.noFoodSelected': 'Seleccioná un alimento para empezar',
  'scanner.trafficGreen': 'Recomendable',
  'scanner.trafficOrange': 'Moderación',
  'scanner.trafficRed': 'Evitar',

  'log.title': '📝 Registro Diario',
  'log.description': 'Validación de raciones según AESAN 2022',
  'log.emptyProfile': 'Configurá tu perfil metabólico para ver el objetivo calórico',
  'log.emptyFoods': 'Sin alimentos registrados.',
  'log.foodListLabel': 'Alimentos registrados hoy',
  'log.removeAria': 'Eliminar {food} del registro',
  'log.dailyObjective': 'Objetivo diario',
  'log.noRestriction': 'Sin restricción',

  'metabolic.title': '📊 Perfil Metabólico',
  'metabolic.description': 'erMedDiet + biomarcadores + perfil fenotípico',
  'metabolic.bmr': 'BMR',
  'metabolic.tdee': 'TDEE',
  'metabolic.deficit': 'Déficit',
  'metabolic.target': 'Objetivo',
  'metabolic.restrictionActive': 'Restricción activa',
  'metabolic.noRestriction': 'Sin restricción',
  'metabolic.profileError': 'Error de perfil',

  'plan.title': '📅 Plan Semanal erMedDiet',
  'plan.description': '7 días con todos los grupos alimentarios. Cumple AESAN 2022.',

  'activity.title': '🏃 Actividad Física',
  'activity.description': 'Seguimiento WHO/OMS 150-300 min + fortalecimiento',
  'activity.minutes': 'Minutos',
  'activity.strength': 'Fuerza',
  'activity.compliance': 'Compliance',
  'activity.streak': 'Racha',
  'activity.objectiveMet': '✅ Objetivo',

  'nudges.title': '🔔 Nudges',
  'nudges.description': 'Notificaciones y recomendaciones personalizadas',
  'nudges.empty': 'Sin nudges activos',
  'nudges.dismiss': 'Descartar',
  'nudges.active': 'nudges activos',
  'nudges.panelLabel': 'Panel de nudges',
  'nudges.pendingLabel': 'Nudges pendientes',
  'nudges.history': 'Historial de engagement',
  'nudges.dismissed': 'descartado',
  'nudges.acknowledged': 'reconocido',
  'nudges.dismissAria': 'Descartar: {title}',

  'sustainability.title': '🌍 Sostenibilidad',
  'sustainability.description': 'Impacto ambiental según AESAN 2022 y ODS 2030',
  'sustainability.scoring': 'Puntuación Ambiental',
  'sustainability.scoringDesc': 'Cada alimento recibe una puntuación de 0–100 basada en:',
  'sustainability.carbon': 'Huella de carbono',
  'sustainability.seasonality': 'Temporalidad (producto de temporada)',
  'sustainability.proximity': 'Proximidad (origen local/KM0)',
  'sustainability.zeroWaste': 'Zero-Waste',
  'sustainability.zeroWasteDesc':
    'Productos con defectos estéticos pero perfectamente comestibles:',
  'sustainability.zeroWasteFooter': '♻️ Zero-Waste · 🥕 KM0 / Defectos estéticos',
  'sustainability.emissions': 'Emisiones Comparativas',
  'sustainability.emissionsDesc': 'kg CO₂eq por kg de alimento (EAT-Lancet)',

  'install.title': 'Instalar app',
  'install.dismiss': 'Cerrar',

  'legal.disclaimer':
    '⚕️ Toda recomendación, cantidad y plan nutricional debe ser validado por un dietista-nutricionista colegiado.',

  'error.boundary.title': 'Algo salió mal',
  'error.boundary.description': 'Ocurrió un error inesperado al renderizar esta sección.',
  'error.boundary.retry': 'Reintentar',
  'error.boundary.globalReload': 'Recargar aplicación',

  'form.weight': 'Peso (kg)',
  'form.height': 'Altura (cm)',
  'form.age': 'Edad',
  'form.diagnosisAge': 'Edad diagnóstico DT2',
  'form.glucose': 'Glucosa (mg/dL)',
  'form.gender': 'Género',
  'form.genderMale': 'Hombre',
  'form.genderFemale': 'Mujer',
  'form.paf': 'Factor de actividad física',
  'form.pafSedentary': 'Sedentario (1.2)',
  'form.pafLight': 'Ligero (1.375)',
  'form.pafModerate': 'Moderado (1.55)',
  'form.pafActive': 'Activo (1.725)',
  'form.pafVeryActive': 'Muy activo (1.9)',
  'form.glucoseContext': 'Contexto glucosa',
  'form.glucoseFasting': 'Ayunas',
  'form.glucosePostprandial': 'Postprandial',

  // Actividad — extendido
  'activity.goalDescription': 'Objetivo OMS: 150–300 min/semana actividad moderada + 2 días fuerza',
  'activity.formMinutes': 'Minutos moderados',
  'activity.formSessions': 'Sesiones fuerza',
  'activity.formLabel': 'Registro de actividad física',
  'activity.registerButton': 'Registrar actividad',

  'cultural.socialEating': 'Ideal para comer en compañía',
  'cultural.preparation': 'Preparación',
  'cultural.traditionalCuisine': 'Cocina tradicional',
  'cultural.socialEatingBadge': 'Comida en compañía',

  'meal.breakfast': 'Desayuno',
  'meal.lunch': 'Almuerzo',
  'meal.dinner': 'Cena',
  'meal.snack': 'Snack',

  'cooking.stew': 'guiso tradicional',
  'cooking.steam': 'al vapor',
  'cooking.boiled': 'hervido',
  'cooking.grilled': 'a la plancha',
  'cooking.raw': 'en crudo',

  // Food categories
  'category.cereals': 'Cereales',
  'category.vegetables': 'Hortalizas',
  'category.fruits': 'Frutas',
  'category.olive_oil': 'AOVE',
  'category.dairy': 'Lácteos',
  'category.legumes': 'Legumbres',
  'category.fish': 'Pescado',
  'category.eggs': 'Huevos',
  'category.white_meat': 'Carne blanca',
  'category.red_meat': 'Carne roja',
  'category.water': 'Agua',

  'alert.severityCritical': 'Crítico',
  'alert.severityWarning': 'Advertencia',
  'alert.acknowledge': 'Reconocer alerta',
  'alert.safetyLabel': 'Alertas de seguridad clínica',
  'alert.understood': 'Entendido',

  'validation.allClear': '✅ El registro de hoy cumple con los límites diarios.',
  'validation.unitDay': 'día',
  'validation.unitWeek': 'semana',
  'validation.message.under': '{current} raciones (mín {limit}/{unit})',
  'validation.message.over': '{current} raciones (máx {limit}/{unit})',
  'validation.crossRule.whiteMeatFish':
    'Carnes blancas: restringir si se han superado raciones de pescado',
  'validation.safety.portionTooSmall': '{name}: {grams}g (mín {min}g/ración AESAN 2022)',
  'validation.safety.portionTooLarge': '{name}: {grams}g (máx {max}g/ración AESAN 2022)',
  'validation.safety.highGlycemicFruit':
    '{name}: fruta de alta carga glucémica — consumir con moderación',
  'validation.label.errors': 'Errores detectados',
  'validation.label.warnings': 'Avisos',
  'violations.vegetableNudge.before2pm':
    'Los recordatorios de hortalizas se activan a partir de las 14:00. Aún tienes tiempo de incluir verduras en tu comida.',
  'violations.vegetableNudge.after2pm':
    'Tienes déficit de hortalizas. El recordatorio se ha registrado en tu historial de nudges.',
  'caloric.dailyObjective': 'Objetivo diario',
  'caloric.ingested': 'Ingerido',
  'metabolic.descriptionDetail':
    'Protocolo erMedDiet (PREDIMED-Plus): déficit condicional de 600 kcal si IMC > 25. Fórmula Mifflin-St Jeor.',
  'metabolic.formAriaLabel': 'Formulario de perfil metabólico',

  // Nudge titles
  'nudge.title.cerealsRestriction': 'Límite de cereales excedido',
  'nudge.title.cerealsDeficit': 'Cereales insuficientes',
  'nudge.title.fruitsGlycemicAlert': 'Fruta de alto índice glucémico',
  'nudge.title.fruitsDeficit': 'Frutas insuficientes',
  'nudge.title.vegetablesDeficit': '¿Has comido suficientes hortalizas?',
  'nudge.title.dairyCalcium': 'Proteína animal elevada',
  'nudge.title.waterHydration': 'Recordatorio de hidratación',
  'nudge.title.hyperglycemia': 'Glucosa elevada',
  'nudge.title.adherenceGlucose': 'Registra tu glucosa',
  'nudge.title.adherenceWeight': 'Registra tu peso',
  'nudge.title.aoveTagging': 'AOVE requerido',
  'nudge.title.legumesGlycemicBase': 'Legumbres insuficientes esta semana',
  'nudge.title.fishCodTag': 'Bacalao — High Protein Low Fat',
  'nudge.title.eggsRedMeatAlt': 'Huevos como alternativa',
  'nudge.title.whiteMeatRestrict': 'Restringir carnes blancas',
  'nudge.title.hcInactivityAdjust': 'Actividad física insuficiente',
  'nudge.title.sustainableSubstitution': 'Sustitución inteligente',

  // Nudge bodies
  'nudge.body.cerealsRestriction':
    'Has superado las 4 raciones de cereales permitidas durante la restricción calórica.',
  'nudge.body.cerealsDeficit':
    'Llevas menos de 3 raciones de cereales hoy. Los cereales integrales son la base energética de la dieta mediterránea.',
  'nudge.body.fruitsGlycemicAlert':
    'Has registrado una fruta con alto índice glucémico. Considera alternativas como manzana o pera.',
  'nudge.body.fruitsDeficit':
    'Llevas menos de 2 raciones de fruta hoy. La fruta fresca aporta fibra y antioxidantes esenciales.',
  'nudge.body.vegetablesDeficit':
    'Llevas menos de 3 raciones de hortalizas hoy. Intenta incluir una ración en la cena.',
  'nudge.body.dairyCalcium':
    'Has consumido más de 2 raciones de proteína animal hoy. Considera fuentes de calcio vegetal (brócoli, almendras, sardinas).',
  'nudge.body.waterHydration': 'Recuerda beber agua. Objetivo: 4-8 vasos al día.',
  'nudge.body.hyperglycemia':
    'Tu última lectura de glucosa es elevada. Considera una caminata de 15 minutos o una receta rica en fibra soluble.',
  'nudge.body.adherenceGlucose':
    'No has registrado tu glucosa en las últimas 4 horas. Mantener el registro ayuda a tu control metabólico.',
  'nudge.body.adherenceWeight':
    'No has registrado tu peso en las últimas 4 horas. El seguimiento regular permite ajustar tu plan.',
  'nudge.body.aoveTagging': 'El AOVE debe estar presente en cada comida principal.',
  'nudge.body.legumesGlycemicBase':
    'Las legumbres son requisito base para el control glucémico. Objetivo: ≥4 raciones/semana.',
  'nudge.body.fishCodTag': 'El bacalao es una proteína de alta prioridad (0.7% grasa).',
  'nudge.body.eggsRedMeatAlt': 'Los huevos son alternativa preferente a carnes rojas.',
  'nudge.body.whiteMeatRestrict':
    'Se han superado las raciones de pescado. Considera reducir carnes blancas.',
  'nudge.body.hcInactivityAdjust':
    'No has alcanzado los 150 min/semana de actividad moderada. Considera reducir carga de HC.',
  'nudge.body.sustainableSubstitution': 'Considera alternativas más sostenibles: {names}',

  // Activity — extended
  'activity.streakWeeksAria': 'Racha de {streak} semanas',
  'activity.streakUnit': 'sem',

  // Scanner — extended
  'scanner.detailsAria': 'Detalles de {name}',
  'scanner.macrosFormat': '{kcal} kcal | {protein}g prot | {carbs}g HC | {fat}g grasa',

  // Log — extended
  'log.animalProteinWarning': 'Proteína animal: {count}/día — considerar fuente de calcio vegetal',
};
