import type { Food } from '@domain/food';
import { TrafficLightColor } from '@domain/trafficLight';
import { computeEnvironmentalScore } from '@domain/sustainability';
import { classifyFood, detectOccultFromFood } from '@domain/classification';
import type { ClassificationResult } from '@domain/classification';

/**
 * Presentation mapper over the domain classification core.
 * Adds Spanish reason strings for the traffic-light UI — the pure
 * detection/color rules live in `@domain/classification` (no duplicated logic).
 */
export function classifyFoodWithReasons(food: Food): ClassificationResult {
  const detection = detectOccultFromFood(food.harmfulIngredients);
  const reasons: string[] = [];

  if (detection.hasOccultSugars) {
    reasons.push(`Azúcares ocultos detectados: ${detection.detectedSugars.join(', ')}`);
    return { color: TrafficLightColor.RED, reasons };
  }

  if (detection.hasTransFats || food.hasTransFats) {
    reasons.push('Contiene grasas trans');
    return { color: TrafficLightColor.RED, reasons };
  }

  if (food.isProcessed && food.harmfulIngredients.length > 0) {
    reasons.push('Producto procesado con ingredientes no recomendados');
  }

  const color = classifyFood(food);
  const environmentalScore = computeEnvironmentalScore(food);
  return { color, reasons, environmentalScore };
}
