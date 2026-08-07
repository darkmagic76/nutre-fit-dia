import { createContext, useContext } from 'react';
import type { createContainer } from '@infrastructure/compositionRoot';

type Container = ReturnType<typeof createContainer>;

const ContainerContext = createContext<Container | null>(null);

export const ContainerProvider = ContainerContext.Provider;

export function useContainer(): Container {
  const ctx = useContext(ContainerContext);
  if (!ctx) throw new Error('useContainer must be used within ContainerProvider');
  return ctx;
}
