import { NotificationType, NotificationSeverity, FoodCategory } from '@shared/domain'
import type { SafetyRule } from './types'

/** High-glycemic fruits that trigger a safety alert when consumed */
export const HIGH_GLYCEMIC_FRUITS: ReadonlySet<string> = new Set([
  'uva',
  'dátil',
  'higo',
  'pasa',
  'plátano maduro',
])

/** All safety rules evaluated by the nudge engine */
export const SAFETY_RULES: SafetyRule[] = [
  {
    id: 'CEREALS_RESTRICTION',
    type: NotificationType.SAFETY_ALERT,
    severity: NotificationSeverity.HARD_BLOCK,
    cooldown: 24 * 60, // 24 hours in minutes
    title: 'Límite de cereales excedido',
    body: 'Has superado las 4 raciones de cereales permitidas durante la restricción calórica.',
    condition: ctx =>
      ctx.restrictionActive && ctx.counts[FoodCategory.CEREALS] > 4,
  },
  {
    id: 'FRUITS_GLYCEMIC_ALERT',
    type: NotificationType.SAFETY_ALERT,
    severity: NotificationSeverity.SOFT_WARN,
    cooldown: 24 * 60, // 24 hours in minutes
    title: 'Fruta de alto índice glucémico',
    body: 'Has registrado una fruta con alto índice glucémico. Considera alternativas como manzana o pera.',
    condition: ctx => ctx.containsHighGlycemicFruit,
  },
  {
    id: 'VEGETABLES_DEFICIT',
    type: NotificationType.SAFETY_ALERT,
    severity: NotificationSeverity.SOFT_WARN,
    cooldown: 6 * 60, // 6 hours in minutes
    title: '¿Has comido suficientes verduras?',
    body: 'Llevas menos de 3 raciones de verduras hoy. Intenta incluir una ración en la cena.',
    condition: ctx =>
      ctx.counts[FoodCategory.VEGETABLES] < 3 && ctx.currentHour >= 20,
  },

  // ─── PR2: BehavioralNudge rules ───

  {
    id: 'DAIRY_CALCIUM_NUDGE',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: 12 * 60, // 12 hours
    title: 'Proteína animal elevada',
    body: 'Has consumido más de 2 raciones de proteína animal hoy. Considera fuentes de calcio vegetal (brócoli, almendras, sardinas).',
    condition: ctx => ctx.animalProteinCount > 2,
  },
  {
    id: 'WATER_HYDRATION',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: 3 * 60, // 3 hours
    title: 'Recordatorio de hidratación',
    body: 'Recuerda beber agua. Objetivo: 4-8 vasos al día.',
    condition: ctx => ctx.waterRations < 4,
  },
  {
    id: 'HYPERGLYCEMIA_NUDGE',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: 3 * 60, // 3 hours
    title: 'Glucosa elevada',
    body: 'Tu última lectura de glucosa es elevada. Considera una caminata de 15 minutos o una receta rica en fibra soluble.',
    condition: ctx => ctx.latestGlucose !== null && ctx.latestGlucose > 180,
  },
  {
    id: 'ADHERENCE_GLUCOSE',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: 4 * 60, // 4 hours
    title: 'Registra tu glucosa',
    body: 'No has registrado tu glucosa en las últimas 4 horas. Mantener el registro ayuda a tu control metabólico.',
    condition: ctx => {
      if (ctx.lastGlucoseTimestamp === null) return true
      return (Date.now() - ctx.lastGlucoseTimestamp) > 4 * 60 * 60 * 1000
    },
  },
  {
    id: 'ADHERENCE_WEIGHT',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: 4 * 60, // 4 hours
    title: 'Registra tu peso',
    body: 'No has registrado tu peso en las últimas 4 horas. El seguimiento regular permite ajustar tu plan.',
    condition: ctx => {
      if (ctx.lastWeightTimestamp === null) return true
      return (Date.now() - ctx.lastWeightTimestamp) > 4 * 60 * 60 * 1000
    },
  },
]
