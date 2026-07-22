import { z } from 'zod';
import { defineEnum } from '@shared/utils';
import type { ValuesOf } from '@shared/utils';

export const TrafficLightColor = defineEnum({
  GREEN: 'green',
  ORANGE: 'orange',
  RED: 'red',
});

export type TrafficLightColor = ValuesOf<typeof TrafficLightColor>;

export const TrafficLightColorSchema = z.enum(['green', 'orange', 'red']);
