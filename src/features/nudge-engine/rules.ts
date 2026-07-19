import { NotificationType, NotificationSeverity, FoodCategory } from '@shared/domain'
import {
  COOLDOWN_24H,
  COOLDOWN_12H,
  COOLDOWN_6H,
  COOLDOWN_4H,
  COOLDOWN_3H,
  COOLDOWN_7D,
  COOLDOWN_NONE,
} from './cooldownDurations'
import type { SafetyRule } from './types'

/** High-glycemic fruits that trigger a safety alert when consumed */
export const HIGH_GLYCEMIC_FRUITS: ReadonlySet<string> = new Set([
  'uva',
  'dátil',
  'higo',
  'pasa',
  'plátano maduro',
])

/** All nudge rules evaluated by the engine */
export const NUDGE_RULES: SafetyRule[] = [
  {
    id: 'CEREALS_RESTRICTION',
    type: NotificationType.SAFETY_ALERT,
    severity: NotificationSeverity.HARD_BLOCK,
    cooldown: COOLDOWN_24H,
    title: 'Límite de cereales excedido',
    body: 'Has superado las 4 raciones de cereales permitidas durante la restricción calórica.',
    condition: ctx =>
      ctx.restrictionActive && ctx.counts[FoodCategory.CEREALS] > 4,
  },
  {
    id: 'FRUITS_GLYCEMIC_ALERT',
    type: NotificationType.SAFETY_ALERT,
    severity: NotificationSeverity.SOFT_WARN,
    cooldown: COOLDOWN_24H,
    title: 'Fruta de alto índice glucémico',
    body: 'Has registrado una fruta con alto índice glucémico. Considera alternativas como manzana o pera.',
    condition: ctx => ctx.containsHighGlycemicFruit,
  },
  {
    id: 'VEGETABLES_DEFICIT',
    type: NotificationType.SAFETY_ALERT,
    severity: NotificationSeverity.SOFT_WARN,
    cooldown: COOLDOWN_6H,
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
    cooldown: COOLDOWN_12H,
    title: 'Proteína animal elevada',
    body: 'Has consumido más de 2 raciones de proteína animal hoy. Considera fuentes de calcio vegetal (brócoli, almendras, sardinas).',
    condition: ctx => ctx.animalProteinCount > 2,
  },
  {
    id: 'WATER_HYDRATION',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_3H,
    title: 'Recordatorio de hidratación',
    body: 'Recuerda beber agua. Objetivo: 4-8 vasos al día.',
    condition: ctx => ctx.waterRations < 4,
  },
  {
    id: 'HYPERGLYCEMIA_NUDGE',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_3H,
    title: 'Glucosa elevada',
    body: 'Tu última lectura de glucosa es elevada. Considera una caminata de 15 minutos o una receta rica en fibra soluble.',
    condition: ctx => ctx.latestGlucose !== null && ctx.latestGlucose > 180,
  },
  {
    id: 'ADHERENCE_GLUCOSE',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_4H,
    title: 'Registra tu glucosa',
    body: 'No has registrado tu glucosa en las últimas 4 horas. Mantener el registro ayuda a tu control metabólico.',
    condition: ctx => {
      if (ctx.lastGlucoseTimestamp === null) return true
      return (Date.now() - ctx.lastGlucoseTimestamp) > COOLDOWN_4H * 60 * 1000
    },
  },
  {
    id: 'ADHERENCE_WEIGHT',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_4H,
    title: 'Registra tu peso',
    body: 'No has registrado tu peso en las últimas 4 horas. El seguimiento regular permite ajustar tu plan.',
    condition: ctx => {
      if (ctx.lastWeightTimestamp === null) return true
      return (Date.now() - ctx.lastWeightTimestamp) > COOLDOWN_4H * 60 * 1000
    },
  },

  // ─── PR3: SystemAction rules ───

  {
    id: 'AOVE_TAGGING',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_24H,
    title: 'AOVE requerido',
    body: 'El AOVE debe estar presente en cada comida principal.',
    condition: ctx => ctx.counts[FoodCategory.OLIVE_OIL] === 0,
  },
  {
    id: 'LEGUMES_GLYCEMIC_BASE',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_24H,
    title: 'Legumbres insuficientes esta semana',
    body: 'Las legumbres son requisito base para el control glucémico. Objetivo: ≥4 raciones/semana.',
    condition: ctx => ctx.dayOfWeek >= 4 && ctx.counts[FoodCategory.LEGUMES] < 1,
  },
  {
    id: 'FISH_COD_TAG',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_NONE,
    title: 'Bacalao — High Protein Low Fat',
    body: 'El bacalao es una proteína de alta prioridad (0.7% grasa).',
    condition: ctx => ctx.hasBacalao,
  },
  {
    id: 'EGGS_RED_MEAT_ALT',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_NONE,
    title: 'Huevos como alternativa',
    body: 'Los huevos son alternativa preferente a carnes rojas.',
    condition: ctx =>
      ctx.counts[FoodCategory.WHITE_MEAT] > 0 && !ctx.hasEggs,
  },
  {
    id: 'WHITE_MEAT_RESTRICT',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_7D,
    title: 'Restringir carnes blancas',
    body: 'Se han superado las raciones de pescado. Considera reducir carnes blancas.',
    condition: ctx =>
      ctx.counts[FoodCategory.FISH] > 7 && ctx.counts[FoodCategory.WHITE_MEAT] > 0,
  },
  {
    id: 'HC_INACTIVITY_ADJUST',
    type: NotificationType.SYSTEM_ACTION,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_24H,
    title: 'Actividad física insuficiente',
    body: 'No has alcanzado los 150 min/semana de actividad moderada. Considera reducir carga de HC.',
    condition: ctx => ctx.weeklyActivityMinutes < 150,
  },

  // ─── M2: smart substitution ───

  {
    id: 'SUSTAINABLE_SUBSTITUTION',
    type: NotificationType.BEHAVIORAL_NUDGE,
    severity: NotificationSeverity.INFO,
    cooldown: COOLDOWN_4H,
    title: 'Sustitución inteligente',
    body: ctx => {
      const names = ctx.alternatives?.slice(0, 3).join(', ') ?? ''
      return `Considera alternativas más sostenibles: ${names}`
    },
    condition: ctx =>
      ctx.environmentalScore !== null &&
      ctx.environmentalScore < 30 &&
      ctx.alternatives !== null &&
      ctx.alternatives.length > 0,
  },
]
