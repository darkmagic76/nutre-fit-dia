import { createContext } from 'react';
import type { Container } from '@application/ports/container';

export const ContainerContext = createContext<Container | null>(null);
