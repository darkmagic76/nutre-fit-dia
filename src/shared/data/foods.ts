import { food } from '@shared/domain';
import { foodsRaw } from './foods-data';

export const foods = foodsRaw.map((f) => food(f));

export const foodsById = new Map(foods.map((f) => [f.id, f]));
