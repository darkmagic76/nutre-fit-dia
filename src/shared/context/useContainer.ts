import { useContext } from 'react';
import { ContainerContext, type Container } from './containerContext';

export function useContainer(): Container {
  const ctx = useContext(ContainerContext);
  if (!ctx) throw new Error('useContainer must be used within ContainerProvider');
  return ctx;
}
