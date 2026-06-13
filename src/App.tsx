/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserOnboardingData, MealLogItem, FoodItem, Recipe } from './types';
import OnboardingForm from './components/OnboardingForm';
import RecipesManager from './components/RecipesManager';
import AISearchInput from './components/AISearchInput';
import DailyDashboard from './components/DailyDashboard';
import { Flame, Brain, BookOpen, Sparkles, Activity, CheckCircle, Database } from 'lucide-react';

export default function App() {
  // Load initial state from LocalStorage to support persistent session
  const [onboarding, setOnboarding] = useState<UserOnboardingData | null>(() => {
    try {
      const saved = localStorage.getItem('nutri_onboarding');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('nutri_recipes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [customFoods, setCustomFoods] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem('nutri_custom_foods');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [logList, setLogList] = useState<MealLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('nutri_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [waterLog, setWaterLog] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('nutri_water_logs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // State synchronization updates
  const handleOnboardingComplete = (data: UserOnboardingData) => {
    setOnboarding(data);
    localStorage.setItem('nutri_onboarding', JSON.stringify(data));
  };

  const handleResetOnboarding = () => {
    if (window.confirm('Deseja realmente redefinir o seu perfil? Isto recalculará suas metas diárias.')) {
      setOnboarding(null);
      localStorage.removeItem('nutri_onboarding');
    }
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    const updated = [recipe, ...savedRecipes];
    setSavedRecipes(updated);
    localStorage.setItem('nutri_recipes', JSON.stringify(updated));
  };

  const handleDeleteRecipe = (id: string) => {
    if (window.confirm('Excluir esta receita?')) {
      const updated = savedRecipes.filter((r) => r.id !== id);
      setSavedRecipes(updated);
      localStorage.setItem('nutri_recipes', JSON.stringify(updated));
    }
  };

  const handleAddCustomFood = (food: FoodItem) => {
    const updated = [food, ...customFoods];
    setCustomFoods(updated);
    localStorage.setItem('nutri_custom_foods', JSON.stringify(updated));
  };

  const handleLogItemAdded = (item: MealLogItem) => {
    const updated = [item, ...logList];
    setLogList(updated);
    localStorage.setItem('nutri_logs', JSON.stringify(updated));
  };

  const handleLogItemRemoved = (id: string) => {
    const updated = logList.filter((log) => log.id !== id);
    setLogList(updated);
    localStorage.setItem('nutri_logs', JSON.stringify(updated));
  };

  const handleUpdateWater = (date: string, amount: number) => {
    const updated = { ...waterLog, [date]: amount };
    setWaterLog(updated);
    localStorage.setItem('nutri_water_logs', JSON.stringify(updated));
  };

  // Log calculated AI item helper
  const handleLogCalculatedItem = (
    item: Omit<MealLogItem, 'id' | 'date'>,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => {
    const dateToday = new Date().toISOString().split('T')[0];
    const logItem: MealLogItem = {
      ...item,
      id: String(Date.now()),
      date: dateToday,
      mealType,
    };
    handleLogItemAdded(logItem);
  };

  // Add Recipe portion helper directly to today's log
  const handleAddRecipeToMeal = (recipe: Recipe, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const sums = recipe.ingredients.reduce(
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

    const totalWeight = Math.round(recipe.ingredients.reduce((acc, ing) => acc + ing.amount, 0) / recipe.portions);

    const logItem: MealLogItem = {
      id: String(Date.now()),
      name: `1 Porção de: ${recipe.name}`,
      calories: Math.round(sums.calories / recipe.portions),
      protein: Number((sums.protein / recipe.portions).toFixed(1)),
      carbs: Number((sums.carbs / recipe.portions).toFixed(1)),
      fat: Number((sums.fat / recipe.portions).toFixed(1)),
      servingSize: totalWeight || 150,
      servingUnit: 'g',
      mealType,
      date: new Date().toISOString().split('T')[0],
      recipeId: recipe.id,
    };

    handleLogItemAdded(logItem);
  };

  // App tabs navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recipes' | 'ai-calc'>('dashboard');

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans" id="root-app-div">
      
      {/* Top beautiful header navigation */}
      <header className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-30 shadow-md border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Flame size={20} className="fill-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-1.5 leading-none">
              NutriFlow <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded-md">V1.5</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Gestão Inteligente de Consumo e Metabolismo</p>
          </div>
        </div>

        {onboarding && (
          <nav className="flex items-center gap-1 bg-slate-950/65 p-1 rounded-xl border border-slate-800" id="tabs-navigation">
            <button
              onClick={() => setActiveTab('dashboard')}
              id="tab-btn-dashboard"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity size={14} />
              <span className="hidden sm:inline">Diário</span>
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              id="tab-btn-recipes"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'recipes'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Meus Preparos</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-calc')}
              id="tab-btn-aicalc"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ai-calc'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Alimento IA</span>
            </button>
          </nav>
        )}
      </header>

      {/* Main app viewport frame */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 pb-24">
        
        {!onboarding ? (
          <div className="py-8 animate-fadeIn" id="onboarding-viewport">
            <div className="text-center max-w-sm mx-auto mb-6">
              <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                <Flame size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Configure seu Perfil de Macros</h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Deixe as equações científicas de Mifflin-St Jeor fazerem o trabalho duro calculando o seu gasto energético diário.
              </p>
            </div>
            
            <OnboardingForm onComplete={handleOnboardingComplete} />
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn" id="app-workspace">
            {/* Context/status ticker info */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-800">
              <span className="flex items-center gap-1.5 font-medium">
                <Database className="text-emerald-500 animate-pulse" size={14} />
                Armazenamento Offline Persistente Ativo • Seus dados estão salvos com segurança.
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                Objetivo: {onboarding.objective === 'lose' ? 'Emagrecer' : onboarding.objective === 'gain' ? 'Ganhar Peso' : 'Manter Peso'}
              </span>
            </div>

            {/* View dispatcher based on tab */}
            {activeTab === 'dashboard' && (
              <DailyDashboard
                onboarding={onboarding}
                logList={logList}
                waterLog={waterLog}
                customFoods={customFoods}
                onLogItemAdded={handleLogItemAdded}
                onLogItemRemoved={handleLogItemRemoved}
                onUpdateWater={handleUpdateWater}
                onResetOnboarding={handleResetOnboarding}
                onAddCustomFood={handleAddCustomFood}
              />
            )}

            {activeTab === 'recipes' && (
              <div className="space-y-6">
                <RecipesManager
                  customFoods={customFoods}
                  savedRecipes={savedRecipes}
                  onSaveRecipe={handleSaveRecipe}
                  onDeleteRecipe={handleDeleteRecipe}
                  onAddRecipeToMeal={handleAddRecipeToMeal}
                />
              </div>
            )}

            {activeTab === 'ai-calc' && (
              <div className="space-y-6">
                <AISearchInput onLogCalculatedItem={handleLogCalculatedItem} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Decorative footer status bar */}
      <footer className="py-4 border-t border-slate-200/60 text-center text-[10px] text-slate-400 bg-white font-mono mt-auto">
        <p>© 2026 NutriFlow Tracker. Desenvolvido em conformidade com as diretivas dietéticas científicas.</p>
      </footer>
    </div>
  );
}
