import { z } from 'zod'

export const TrafficLightColor = {
  GREEN: 'green',
  ORANGE: 'orange',
  RED: 'red',
} as const

export type TrafficLightColor = (typeof TrafficLightColor)[keyof typeof TrafficLightColor]

export const TrafficLightColorSchema = z.enum(['green', 'orange', 'red'])
