import type { EnvironmentalScore } from '@shared/sustainability';

/** ADR-003: ML pipeline abstraction — scanner adapter contract */

export interface ScanInput {
  /** Image from camera capture (future: ONNX/TFLite) */
  imageData?: ImageData;
  /** Ingredient list text (current: mock OCR simulation) */
  ingredientText?: string;
  /** Product barcode for catalog lookup */
  barcode?: string;
}

export interface ScanResult {
  /** Matched or identified food ID from the catalog */
  foodId: string;
  /** Confidence score 0..1 */
  confidence: number;
  /** Detected ingredients from the scan */
  ingredients: string[];
  /** Added sugars found in the ingredient list */
  detectedAddedSugars: string[];
  /** Environmental sustainability score (ADR-007). Optional — degrades gracefully when unavailable. */
  environmentalScore?: EnvironmentalScore;
}

export interface ModelInfo {
  /** Human-readable model identifier */
  name: string;
  /** Model version string */
  version: string;
  /** Expected input dimensions */
  inputShape: [number, number];
}

export interface ScannerAdapter {
  /** Identify a food from image, ingredient text, or barcode */
  scan(input: ScanInput): Promise<ScanResult>;
  /** Whether the scanner implementation is ready to use */
  isAvailable(): boolean;
  /** Metadata about the underlying ML model */
  getModelInfo(): ModelInfo;
}
