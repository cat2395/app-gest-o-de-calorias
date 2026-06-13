/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodItem, UserOnboardingData } from './types';

// Banco de dados inicial de alimentos comuns do Brasil
export const DEFAULT_FOODS: FoodItem[] = [
  { id: '1', name: 'Arroz Branco Cozido', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, servingSize: 100, servingUnit: 'g' },
  { id: '2', name: 'Arroz Integral Cozido', calories: 112, protein: 2.6, carbs: 22.8, fat: 1.0, servingSize: 100, servingUnit: 'g' },
  { id: '3', name: 'Feijão Carioca Cozido', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, servingSize: 100, servingUnit: 'g' },
  { id: '4', name: 'Feijão Preto Cozido', calories: 77, protein: 4.5, carbs: 14.0, fat: 0.5, servingSize: 100, servingUnit: 'g' },
  { id: '5', name: 'Peito de Frango Grelhado', calories: 159, protein: 32.0, carbs: 0.0, fat: 2.5, servingSize: 100, servingUnit: 'g' },
  { id: '6', name: 'Alcatra grelhada / Carne Bovina', calories: 219, protein: 31.9, carbs: 0.0, fat: 9.3, servingSize: 100, servingUnit: 'g' },
  { id: '7', name: 'Patinho Moído Grelhado', calories: 194, protein: 28.0, carbs: 0.0, fat: 8.0, servingSize: 100, servingUnit: 'g' },
  { id: '8', name: 'Ovo de Galinha Cozido', calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, servingSize: 100, servingUnit: 'g' }, // 1 ovo médio tem aprox. 50g (78 kcal)
  { id: '9', name: 'Ovo Frito (com pouca gordura)', calories: 196, protein: 13.5, carbs: 1.2, fat: 15.0, servingSize: 100, servingUnit: 'g' },
  { id: '10', name: 'Pão Francês', calories: 300, protein: 8.0, carbs: 58.0, fat: 3.0, servingSize: 50, servingUnit: 'unidade (50g)' },
  { id: '11', name: 'Pão de Forma Integral', calories: 244, protein: 9.4, carbs: 43.0, fat: 3.3, servingSize: 50, servingUnit: '2 fatias (50g)' },
  { id: '12', name: 'Whey Protein Concentrado 80%', calories: 390, protein: 80.0, carbs: 6.6, fat: 6.0, servingSize: 30, servingUnit: 'dosador (30g)' },
  { id: '13', name: 'Leite Integral Bovina', calories: 61, protein: 3.2, carbs: 4.7, fat: 3.3, servingSize: 200, servingUnit: 'ml' },
  { id: '14', name: 'Leite Desnatado Bovina', calories: 35, protein: 3.3, carbs: 4.8, fat: 0.1, servingSize: 200, servingUnit: 'ml' },
  { id: '15', name: 'Tapioca Cozida / Goma de Tapioca', calories: 240, protein: 0.0, carbs: 60.0, fat: 0.0, servingSize: 100, servingUnit: 'g' },
  { id: '16', name: 'Aveia em Flocos', calories: 366, protein: 13.9, carbs: 57.0, fat: 7.2, servingSize: 30, servingUnit: 'colher (30g)' },
  { id: '17', name: 'Azeite de Oliva Extra Virgem', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, servingSize: 13, servingUnit: 'colher de sopa (13ml)' },
  { id: '18', name: 'Banana Prata', calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3, servingSize: 100, servingUnit: 'unidade (100g)' },
  { id: '19', name: 'Maçã Fuji / Gala', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, servingSize: 110, servingUnit: 'unidade média (110g)' },
  { id: '20', name: 'Abacate', calories: 160, protein: 2.0, carbs: 8.5, fat: 14.6, servingSize: 100, servingUnit: 'g' },
  { id: '21', name: 'Filé de Tilápia Grelhado', calories: 128, protein: 26.0, carbs: 0.0, fat: 2.3, servingSize: 100, servingUnit: 'g' },
  { id: '22', name: 'Salada de Folhas Verdes Mistas', calories: 15, protein: 1.2, carbs: 2.8, fat: 0.1, servingSize: 100, servingUnit: 'g' },
  { id: '23', name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, servingSize: 100, servingUnit: 'g' },
  { id: '24', name: 'Batata Inglesa Cozida', calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1, servingSize: 100, servingUnit: 'g' },
  { id: '25', name: 'Manteiga com sal', calories: 717, protein: 0.9, carbs: 0.1, fat: 81.0, servingSize: 10, servingUnit: 'g' },
  { id: '26', name: 'Queijo Muçarela', calories: 280, protein: 25.0, carbs: 2.0, fat: 20.0, servingSize: 30, servingUnit: 'fatia (30g)' },
  { id: '27', name: 'Iogurte Natural Desnatado', calories: 41, protein: 3.5, carbs: 4.8, fat: 0.0, servingSize: 170, servingUnit: 'pote (170g)' },
  { id: '28', name: 'Pasta de Amendoim Integral', calories: 588, protein: 25.0, carbs: 20.0, fat: 48.0, servingSize: 15, servingUnit: 'colher (15g)' }
];

export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 30; // default backup
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Retorna o Fator de Atividade Física (FA) baseado em frequência e intensidade
export function getActivityFactor(frequency: number, intensity: 'low' | 'medium' | 'high'): number {
  if (frequency === 0) {
    return 1.2; // Sedentário
  }

  if (frequency <= 2) {
    if (intensity === 'low') return 1.25;
    if (intensity === 'medium') return 1.325;
    return 1.375; // Levemente ativo
  }

  if (frequency <= 4) {
    if (intensity === 'low') return 1.375;
    if (intensity === 'medium') return 1.45;
    return 1.55; // Moderadamente ativo
  }

  if (frequency <= 6) {
    if (intensity === 'low') return 1.55;
    if (intensity === 'medium') return 1.65;
    return 1.725; // Muito ativo
  }

  // frequency >= 7
  if (intensity === 'low') return 1.725;
  if (intensity === 'medium') return 1.825;
  return 1.9; // Extremamente ativo
}

// Calcula Taxa Metabólica Basal (TMB) usando Mifflin-St Jeor
export function calculateTMB(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calcula Gasto Energético Total (GET)
export function calculateGET(data: UserOnboardingData): number {
  const age = calculateAge(data.birthDate);
  const tmb = calculateTMB(data.weight, data.height, age, data.gender);
  const physicalFactor = getActivityFactor(data.activityFrequency, data.activityIntensity);
  return Math.round(tmb * physicalFactor);
}

// Sugere calorias metas e macro-nutrientes ideais basados no objetivo
export function calculateTargetAndMacros(
  data: UserOnboardingData
): { caloriesTarget: number; proteinGrams: number; carbGrams: number; fatGrams: number; tmb: number; get: number } {
  const tmb = Math.round(calculateTMB(data.weight, data.height, calculateAge(data.birthDate), data.gender));
  const get = Math.round(calculateGET(data));

  let caloriesTarget = get;
  if (data.objective === 'lose') {
    caloriesTarget = Math.max(tmb - 100, Math.round(get - 500)); // cria déficit porém respeita o limite próximo à TMB para evitar cansaço crônico
    if (data.gender === 'female' && caloriesTarget < 1200) caloriesTarget = 1200;
    if (data.gender === 'male' && caloriesTarget < 1500) caloriesTarget = 1500;
  } else if (data.objective === 'gain') {
    caloriesTarget = Math.round(get + 400); // superávit saudável
  }

  // Distribuição de macronutrientes:
  // Proteína: baseado em massa e objetivo
  let pPerKg = 2.0; // Padrão
  if (data.objective === 'lose') pPerKg = 2.2; // Preserva massa magra no déficit
  if (data.objective === 'gain') pPerKg = 2.0; // Ideal para hipertrofia com superávit

  const proteinGrams = Math.round(data.weight * pPerKg);
  const proteinCalories = proteinGrams * 4;

  // Gorduras: Gordura saudável padrão de 0.9g/kg
  let fPerKg = 0.9;
  if (data.objective === 'lose') fPerKg = 0.8; // diminui um pouco para economizar calorias
  const fatGrams = Math.round(data.weight * fPerKg);
  const fatCalories = fatGrams * 9;

  // Carboidratos: O restante das calorias vai para Carboidratos
  let remainingCalories = caloriesTarget - proteinCalories - fatCalories;
  if (remainingCalories < caloriesTarget * 0.2) {
    // Se o restante for muito baixo, reduzimos levemente gordura/proteína para manter carbos razoáveis
    remainingCalories = caloriesTarget * 0.3; // Garante 30% carboidratos
  }
  const carbGrams = Math.max(50, Math.round(remainingCalories / 4));

  return {
    caloriesTarget,
    proteinGrams,
    carbGrams,
    fatGrams,
    tmb,
    get
  };
}
