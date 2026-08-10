import { useContext } from 'react';
import { ContainerContext } from './containerContext';
import type { Container } from '@application/ports/container';

export function useContainer(): Container {
  const ctx = useContext(ContainerContext);
  if (!ctx) throw new Error('useContainer must be used within ContainerProvider');
  return ctx;
}
