import type { ScannerAdapter, ScanInput, ScanResult, ModelInfo } from './types';
import { SUGAR_ALIASES } from '@shared/domain/sugarAliases';

const MOCK_DELAY_MS = 300;

/**
 * TFM-ready mock scanner. Simulates food identification from ingredient text
 * or product name matching with controlled latency per ADR-003.
 *
 * Replaced by OnnxScannerAdapter or TfLiteScannerAdapter post-TFM without
 * any UI or container code changes — the ScannerAdapter contract insulates
 * the presentation layer.
 */
export class MockScannerAdapter implements ScannerAdapter {
  private available = true;

  async scan(input: ScanInput): Promise<ScanResult> {
    await this.simulateLatency();

    const ingredientText = input.ingredientText ?? '';
    const ingredients = ingredientText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      foodId: '',
      confidence: 0,
      ingredients,
      detectedAddedSugars: this.extractAddedSugars(ingredients),
    };
  }

  isAvailable(): boolean {
    return this.available;
  }

  getModelInfo(): ModelInfo {
    return {
      name: 'MockScanner',
      version: '0.1.0',
      inputShape: [0, 0],
    };
  }

  private async simulateLatency(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  }

  private extractAddedSugars(ingredients: string[]): string[] {
    const sugarAliases = new Set(SUGAR_ALIASES);

    return ingredients.filter((i) => sugarAliases.has(i.toLowerCase()));
  }
}
