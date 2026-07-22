/**
 * English food name translations for the 39-food catalog.
 *
 * Domain data lives in foods-data.ts (Spanish canonical names).
 * This mapping provides English display names without modifying the Food schema.
 * Used by useFoodName() hook to resolve locale-aware display.
 */
export const FOOD_NAMES_EN: Record<string, string> = {
  'Pan integral': 'Whole-grain bread',
  'Arroz integral': 'Brown rice',
  'Copos de avena integral': 'Whole-grain oat flakes',
  'Pasta integral': 'Whole-grain pasta',
  'Galletas integrales industriales': 'Industrial whole-grain cookies',
  Brócoli: 'Broccoli',
  'Espinaca fresca': 'Fresh spinach',
  Tomate: 'Tomato',
  Zanahoria: 'Carrot',
  'Pimiento rojo': 'Red bell pepper',
  Manzana: 'Apple',
  Pera: 'Pear',
  Naranja: 'Orange',
  Fresas: 'Strawberries',
  Uvas: 'Grapes',
  'Aceite de oliva virgen extra': 'Extra virgin olive oil',
  'Leche semidesnatada': 'Semi-skimmed milk',
  'Yogur natural': 'Natural yogurt',
  'Queso fresco': 'Fresh cheese',
  'Alubias blancas': 'White beans',
  Garbanzos: 'Chickpeas',
  Lentejas: 'Lentils',
  Merluza: 'Hake',
  Salmón: 'Salmon',
  Sardinas: 'Sardines',
  'Bacalao fresco': 'Fresh cod',
  Huevo: 'Egg',
  'Pechuga de pollo': 'Chicken breast',
  'Pechuga de pavo': 'Turkey breast',
  Conejo: 'Rabbit',
  Ternera: 'Beef',
  Cerdo: 'Pork',
  Cordero: 'Lamb',
  Chorizo: 'Chorizo',
  Agua: 'Water',
  'Refresco de cola': 'Cola soft drink',
  'Zumo de naranja industrial': 'Industrial orange juice',
  'Gazpacho industrial': 'Industrial gazpacho',
  Margarina: 'Margarine',
} as const;
