// Barrel re-export — GlucoseInput moved to shared/domain per Scope Rule (ADR-001)
export { GlucoseInput } from '@shared/domain/glucoseInput';
// Note: `export { GlucoseInput }` exports both the branded TYPE and the
// constructor VALUE — TypeScript infers value + type from a single export.
