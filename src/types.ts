/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserOnboardingData {
  birthDate: string; // YYYY-MM-DD
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  activityFrequency: number; // 0 to 7 days a week
  activityIntensity: 'low' | 'medium' | 'high'; // baixa, média, alta
  objective: 'lose' | 'maintain' | 'gain'; // perder, manter, ganhar
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  servingSize: number; // typical portion size (g)
  servingUnit: string; // e.g., "g", "unidade", "fatia", "colher"
  isCustom?: boolean;
}

export interface RecipeIngredient {
  foodItem: FoodItem;
  amount: number; // weight or multiplier in grams/units
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  portions: number; // number of portions it yields
  isCustom?: boolean;
}

export interface MealLogItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number; // amount consumed
  servingUnit: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // YYYY-MM-DD
  recipeId?: string; // optional reference if added via a saved Recipe
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealLogItem[];
  waterMl: number;
}
