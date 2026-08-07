import { createContext } from 'react';
import type { createContainer } from '@infrastructure/compositionRoot';

export type Container = ReturnType<typeof createContainer>;

export const ContainerContext = createContext<Container | null>(null);
