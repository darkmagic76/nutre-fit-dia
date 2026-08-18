import { food } from '@domain/food';
import { foodsRaw } from './foods-data';

export const foods = foodsRaw.map((f) => food(f));

export const foodsById = new Map(foods.map((f) => [f.id, f]));
