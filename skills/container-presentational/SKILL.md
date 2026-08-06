# Container/Presentational Pattern

## Rule

- **Containers**: handle business logic, state and data. They do NOT render UI directly.
- **Presentational**: pure UI components that receive props. They do NOT access stores or services.
- The main Container MUST have the same name as the feature.

## Structure

```
features/<feature-name>/
├── <FeatureName>Container.tsx    # Logic + state + handlers
├── <FeatureName>View.tsx         # Pure UI: receives props
├── components/                   # Feature-specific sub-components
├── services/                     # Local services (1 feature)
├── hooks/                        # Local hooks (1 feature)
├── store/                        # Zustand store (if applicable)
└── types.ts                      # Local types
```

## Example

```typescript
// ScannerContainer.tsx — logic
export function ScannerContainer() {
  const [selectedId, setSelectedId] = useState('')
  const result = useClassification(selectedId)
  return <ScannerView selectedId={selectedId} result={result} onSelect={setSelectedId} />
}

// ScannerView.tsx — pure UI
interface ScannerViewProps {
  selectedId: string
  result: ClassificationResult | null
  onSelect: (id: string) => void
}
export function ScannerView({ selectedId, result, onSelect }: ScannerViewProps) {
  // only JSX, no business logic, no stores
}
```
