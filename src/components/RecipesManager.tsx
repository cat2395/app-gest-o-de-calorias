/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FoodItem, Recipe, RecipeIngredient } from '../types';
import { DEFAULT_FOODS } from '../data';
import { BookOpen, Plus, Trash, Check, Utensils, Sparkles, Scale } from 'lucide-react';

interface RecipesManagerProps {
  customFoods: FoodItem[];
  savedRecipes: Recipe[];
  onSaveRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onAddRecipeToMeal: (recipe: Recipe, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
}

export default function RecipesManager({
  customFoods,
  savedRecipes,
  onSaveRecipe,
  onDeleteRecipe,
  onAddRecipeToMeal,
}: RecipesManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [portions, setPortions] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  // Search/selection of individual foods to add as ingredient
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [ingredientGrams, setIngredientGrams] = useState<number>(100);

  const [activeMealTargetId, setActiveMealTargetId] = useState<string | null>(null);

  // Combine database foods
  const allFoods = [...DEFAULT_FOODS, ...customFoods];

  const filteredFoods = allFoods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddIngredient = () => {
    const food = allFoods.find((f) => f.id === selectedFoodId);
    if (!food) return;

    // Check if food already in active ingredients
    const existingIndex = ingredients.findIndex((i) => i.foodItem.id === food.id);
    if (existingIndex >= 0) {
      const updated = [...ingredients];
      updated[existingIndex].amount += ingredientGrams;
      setIngredients(updated);
    } else {
      setIngredients([...ingredients, { foodItem: food, amount: ingredientGrams }]);
    }

    // Reset inputs
    setSelectedFoodId('');
    setIngredientGrams(100);
    setSearchQuery('');
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Calculations for active recipe (totals)
  const totals = ingredients.reduce(
    (acc, ing) => {
      const multiplier = ing.amount / ing.foodItem.servingSize;
      return {
        calories: acc.calories + ing.foodItem.calories * multiplier,
        protein: acc.protein + ing.foodItem.protein * multiplier,
        carbs: acc.carbs + ing.foodItem.carbs * multiplier,
        fat: acc.fat + ing.foodItem.fat * multiplier,
        weight: acc.weight + ing.amount,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, weight: 0 }
  );

  // Per portion calculations
  const perPortion = {
    calories: Math.round(totals.calories / portions) || 0,
    protein: Number((totals.protein / portions).toFixed(1)) || 0,
    carbs: Number((totals.carbs / portions).toFixed(1)) || 0,
    fat: Number((totals.fat / portions).toFixed(1)) || 0,
    weight: Math.round(totals.weight / portions) || 0,
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) return;
    if (ingredients.length === 0) return;

    onSaveRecipe({
      id: String(Date.now()),
      name: recipeName.trim(),
      ingredients,
      portions,
      isCustom: true,
    });

    // Reset
    setRecipeName('');
    setPortions(1);
    setIngredients([]);
    setIsCreating(false);
  };

  return (
    <div id="recipe-manager-card" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-teal-500" size={20} />
          Meus Preparos & Receitas
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          id="toggle-create-recipe-btn"
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            isCreating
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-teal-550 hover:bg-teal-600 text-white'
          }`}
        >
          {isCreating ? 'Cancelar' : <><Plus size={14} /> Novo Preparo</>}
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-4 font-sans">
        Crie pratos elaborados com diversos ingredientes. O aplicativo calculará automaticamente as informações nutricionais por porção para você adicioná-los rapidamente à sua dieta diária.
      </p>

      {/* CREATE FORM */}
      {isCreating && (
        <form onSubmit={handleSaveRecipe} className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-1 flex items-center gap-1.5">
            <Sparkles size={14} className="text-teal-500" />
            Novo Prato Personalizado
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label htmlFor="recipe-title" className="block text-[11px] font-medium text-slate-500 mb-1">Nome da Receita/Preparo</label>
              <input
                type="text"
                id="recipe-title"
                required
                placeholder="Ex: Crepioca Funcional de Frango, Shake Pós-Treino"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium text-slate-700"
              />
            </div>
            <div>
              <label htmlFor="recipe-shares" className="block text-[11px] font-medium text-slate-500 mb-1">Rendimento (Porções)</label>
              <input
                type="number"
                id="recipe-shares"
                min="1"
                required
                value={portions}
                onChange={(e) => setPortions(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Selector of Ingredients */}
          <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Adicionar Ingrediente</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Pesquisar alimento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none text-slate-700"
                />
                <select
                  id="recipe-ingredient-select"
                  size={4}
                  value={selectedFoodId}
                  onChange={(e) => setSelectedFoodId(e.target.value)}
                  className="w-full mt-1.5 p-1 text-xs rounded-lg border border-slate-200 focus:outline-none text-slate-700 h-28"
                >
                  <option value="" disabled>Selecione um alimento da lista...</option>
                  {filteredFoods.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.calories} kcal / {f.servingSize}{f.servingUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-between h-full">
                <div>
                  <label htmlFor="ingredient-amount" className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Gramas / Volume Utilizado
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      id="ingredient-amount"
                      value={ingredientGrams}
                      onChange={(e) => setIngredientGrams(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none text-slate-700 font-bold"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-400 font-medium">unid/g/ml</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                  Você pode fracionar o quanto do ingrediente colocou na panela inteira.
                </div>
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="button"
                  id="add-recipe-ingredient-btn"
                  disabled={!selectedFoodId}
                  onClick={handleAddIngredient}
                  className="w-full md:w-auto px-4 py-2 bg-slate-900 border border-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-800 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            </div>
          </div>

          {/* Active Ingredients List */}
          {ingredients.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-750">Ingredientes Escolhidos ({ingredients.length})</h4>
              <div id="recipe-composition-list" className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200/50 bg-white rounded-xl">
                {ingredients.map((ing, idx) => {
                  const mult = ing.amount / ing.foodItem.servingSize;
                  const cals = Math.round(ing.foodItem.calories * mult);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50/50">
                      <div>
                        <div className="font-semibold text-slate-700">{ing.foodItem.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {ing.amount}g ingeridos • Prot: {(ing.foodItem.protein * mult).toFixed(1)}g | Carb: {(ing.foodItem.carbs * mult).toFixed(1)}g | Gord: {(ing.foodItem.fat * mult).toFixed(1)}g
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800 text-xs">{cals} kcal</span>
                        <button
                          type="button"
                          id={`remove-ingredient-${idx}-btn`}
                          onClick={() => handleRemoveIngredient(idx)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active stats display */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-teal-800 flex items-center gap-1">
                <Scale size={14} />
                Calculadora do Preparo por Porção ({portions}x):
              </div>
              <div className="text-[10px] text-teal-600 font-medium mt-0.5">
                Total receita: {Math.round(totals.calories)} kcal • {Math.round(totals.weight)}g totais
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 flex-1 md:flex-initial text-center">
              <div className="bg-white rounded-xl p-2 border border-teal-100 shadow-xs">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kcal</span>
                <span id="preview-recipe-calories" className="text-sm font-bold text-teal-700">{perPortion.calories}</span>
              </div>
              <div className="bg-white rounded-xl p-2 border border-teal-100 shadow-xs">
                <span className="block text-[9px] font-bold text-red-400 uppercase tracking-widest">Prot</span>
                <span id="preview-recipe-protein" className="text-xs font-bold text-slate-700">{perPortion.protein}g</span>
              </div>
              <div className="bg-white rounded-xl p-2 border border-teal-100 shadow-xs">
                <span className="block text-[9px] font-bold text-amber-500 uppercase tracking-widest">Carb</span>
                <span id="preview-recipe-carbs" className="text-xs font-bold text-slate-700">{perPortion.carbs}g</span>
              </div>
              <div className="bg-white rounded-xl p-2 border border-teal-100 shadow-xs">
                <span className="block text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Gord</span>
                <span id="preview-recipe-fat" className="text-xs font-bold text-slate-700">{perPortion.fat}g</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              id="recipe-save-submit-btn"
              disabled={!recipeName.trim() || ingredients.length === 0}
              className="px-5 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 disabled:opacity-40 cursor-pointer shadow-sm shadow-teal-100 transition-all"
            >
              Salvar Receita
            </button>
          </div>
        </form>
      )}

      {/* SAVED RECIPES LIST */}
      {savedRecipes.length === 0 ? (
        <div id="no-recipes-alert" className="border-2 border-dashed border-slate-100 rounded-3xl p-6 text-center text-slate-400">
          <Utensils className="mx-auto text-slate-350 mb-2" size={24} />
          <p className="text-xs font-medium">Você ainda não tem receitas registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="saved-recipes-grid">
          {savedRecipes.map((r) => {
            const ingCount = r.ingredients.length;
            
            // Re-calculate stats on the fly
            const sums = r.ingredients.reduce(
              (acc, ing) => {
                const mult = ing.amount / ing.foodItem.servingSize;
                return {
                  calories: acc.calories + ing.foodItem.calories * mult,
                  protein: acc.protein + ing.foodItem.protein * mult,
                  carbs: acc.carbs + ing.foodItem.carbs * mult,
                  fat: acc.fat + ing.foodItem.fat * mult,
                };
              },
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            const portionCalories = Math.round(sums.calories / r.portions);
            const portionProtein = Number((sums.protein / r.portions).toFixed(1));
            const portionCarbs = Number((sums.carbs / r.portions).toFixed(1));
            const portionFat = Number((sums.fat / r.portions).toFixed(1));

            return (
              <div
                key={r.id}
                id={`recipe-card-${r.id}`}
                className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:border-teal-200 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">{r.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {ingCount} {ingCount === 1 ? 'rediente' : 'ingredientes'} • Rende {r.portions} {r.portions === 1 ? 'porção' : 'porções'}
                      </p>
                    </div>
                    <button
                      id={`delete-recipe-${r.id}-btn`}
                      onClick={() => onDeleteRecipe(r.id)}
                      className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5 transition-all"
                    >
                      <Trash size={12} />
                    </button>
                  </div>

                  {/* Macros info per portion */}
                  <div className="grid grid-cols-4 gap-1.5 text-center mt-3 bg-white p-1.5 rounded-xl border border-slate-200/40">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-semibold text-slate-400 uppercase">Kcal</span>
                      <span className="text-[11px] font-bold text-teal-700">{portionCalories}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-semibold text-slate-400 uppercase">Prot</span>
                      <span className="text-[11px] font-bold text-slate-650">{portionProtein}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-semibold text-slate-400 uppercase">Carb</span>
                      <span className="text-[11px] font-bold text-slate-650">{portionCarbs}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-semibold text-slate-400 uppercase">Gord</span>
                      <span className="text-[11px] font-bold text-slate-650">{portionFat}g</span>
                    </div>
                  </div>
                </div>

                {/* Add portions of recipe to meal */}
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex flex-col gap-1.5">
                  <div className="text-[10px] font-semibold text-slate-400 tracking-wider">REGISTRAR 1 PORÇÃO EM:</div>
                  <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-lg border border-slate-200/50">
                    {[
                      { id: 'breakfast', label: 'Café' },
                      { id: 'lunch', label: 'Almoço' },
                      { id: 'snack', label: 'Lanche' },
                      { id: 'dinner', label: 'Jantar' },
                    ].map((meal) => (
                      <button
                        key={meal.id}
                        id={`add-recipe-${r.id}-to-${meal.id}`}
                        onClick={() => {
                          onAddRecipeToMeal(r, meal.id as any);
                          setActiveMealTargetId(r.id + meal.id);
                          setTimeout(() => setActiveMealTargetId(null), 1000);
                        }}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md cursor-pointer text-center justify-center transition-all ${
                          activeMealTargetId === r.id + meal.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {activeMealTargetId === r.id + meal.id ? <Check size={10} className="mx-auto" /> : meal.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
