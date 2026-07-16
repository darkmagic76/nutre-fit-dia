/** ADR-007: Sustainability scoring — domain types aligned with EAT-Lancet and ODS 2030 */

import { defineEnum } from '@shared/utils'
import type { ValuesOf } from '@shared/utils'

export const Seasonality = defineEnum({
  IN_SEASON: 'in_season',
  GREENHOUSE: 'greenhouse',
  OUT_OF_SEASON: 'out_of_season',
})

export type Seasonality = ValuesOf<typeof Seasonality>

export const Proximity = defineEnum({
  LOCAL_KM0: 'km0',
  NATIONAL: 'national',
  IMPORTED: 'imported',
})

export type Proximity = ValuesOf<typeof Proximity>

export const PackagingLevel = defineEnum({
  BULK: 'bulk',
  RECYCLABLE: 'recyclable',
  SINGLE_USE: 'single_use',
})

export type PackagingLevel = ValuesOf<typeof PackagingLevel>

export interface EnvironmentalScore {
  /** kg CO2e per kg of food (AESAN 2022 reference values) */
  carbonFootprint: number
  /** Liters of water per kg of food */
  waterFootprint: number
  /** Current seasonal classification */
  seasonality: Seasonality
  /** Geographic origin relative to consumer */
  proximity: Proximity
  /** Packaging sustainability tier */
  packaging: PackagingLevel
  /** Composite 0–100 score. Higher = more sustainable. */
  score: number
}
