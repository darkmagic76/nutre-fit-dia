import { create } from 'zustand';
import type { SystemNotification } from '@shared/domain';

interface NudgeState {
  pending: SystemNotification[];
  history: SystemNotification[];

  enqueue: (notification: SystemNotification) => void;
  acknowledge: (id: string) => void;
  dismiss: (id: string) => void;
  clearPending: () => void;
}

export const useNudgeStore = create<NudgeState>((set) => ({
  pending: [],
  history: [],

  enqueue: (notification) =>
    set((state) => ({
      pending: [...state.pending, notification],
    })),

  acknowledge: (id) =>
    set((state) => ({
      pending: state.pending.filter((n) => n.id !== id),
      history: [
        ...state.history,
        ...state.pending
          .filter((n) => n.id === id)
          .map((n) => ({ ...n, acknowledgedAt: new Date() })),
      ],
    })),

  dismiss: (id) =>
    set((state) => ({
      pending: state.pending.filter((n) => n.id !== id),
      history: [
        ...state.history,
        ...state.pending.filter((n) => n.id === id).map((n) => ({ ...n, dismissedAt: new Date() })),
      ],
    })),

  clearPending: () => set({ pending: [] }),
}));
