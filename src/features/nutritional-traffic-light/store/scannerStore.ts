import { create } from 'zustand'

interface ScannerState {
  scanHistory: Array<{ foodId: string; color: string; timestamp: number }>
  addScan: (foodId: string, color: string) => void
}

export const useScannerStore = create<ScannerState>(set => ({
  scanHistory: [],

  addScan: (foodId, color) =>
    set(state => ({
      scanHistory: [
        ...state.scanHistory,
        { foodId, color, timestamp: Date.now() },
      ],
    })),
}))
