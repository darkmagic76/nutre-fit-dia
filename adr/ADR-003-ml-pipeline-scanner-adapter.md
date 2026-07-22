# ADR-003: ML Pipeline Abstraction — ScannerAdapter

**Status:** Accepted  
**Date:** 2026-07-12  
**Deciders:** darkmagic76, gentle-orchestrator

## Context

The app requires food identification from images (camera scan) or ingredient lists. A real ONNX model is planned but not ready for the TFM phase. The architecture must support both mock (TFM) and real (post-TFM) implementations without UI changes.

## Decision

Define a **`ScannerAdapter`** interface in `src/infrastructure/ml/types.ts` that abstracts all scanner implementations:

```typescript
interface ScannerAdapter {
  scan(input: ScanInput): Promise<ScanResult>;
  isAvailable(): boolean;
  getModelInfo(): ModelInfo;
}
```

- **`MockScannerAdapter`**: TFM-ready, simulates food identification from ingredient text or product name matching. 300ms simulated latency.
- **`OnnxScannerAdapter`** (future): Will use ONNX Runtime Web in a Web Worker. Drops in without changing any UI code.
- **`TfLiteScannerAdapter`** (future): Alternative for mobile-optimized models.

## Consequences

- ✅ UI code never changes when the ML model is swapped
- ✅ Mock enables full integration testing during TFM
- ✅ Clear contract for model training: produce a `{ foodId, confidence, ingredients, detectedAddedSugars }` output
- ❌ Slight indirection cost for the interface
