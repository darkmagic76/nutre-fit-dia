# Container/Presentational Pattern

## Regla

- **Containers**: manejan lógica de negocio, estado y datos. NO renderizan UI directamente.
- **Presentational**: componentes puros de UI que reciben props. NO acceden a stores ni servicios.
- El Container principal DEBE tener el mismo nombre que la feature.

## Estructura

```
features/<feature-name>/
├── <FeatureName>Container.tsx    # Lógica + estado + handlers
├── <FeatureName>View.tsx         # UI puro: recibe props
├── components/                   # Sub-componentes específicos
├── services/                     # Servicios locales (1 feature)
├── hooks/                        # Hooks locales (1 feature)
├── store/                        # Zustand store (si aplica)
└── types.ts                      # Tipos locales
```

## Ejemplo

```typescript
// ScannerContainer.tsx — lógica
export function ScannerContainer() {
  const [selectedId, setSelectedId] = useState('')
  const result = useClassification(selectedId)
  return <ScannerView selectedId={selectedId} result={result} onSelect={setSelectedId} />
}

// ScannerView.tsx — UI puro
interface ScannerViewProps {
  selectedId: string
  result: ClassificationResult | null
  onSelect: (id: string) => void
}
export function ScannerView({ selectedId, result, onSelect }: ScannerViewProps) {
  // solo JSX, sin lógica de negocio, sin stores
}
```
