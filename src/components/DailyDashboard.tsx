/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserOnboardingData, MealLogItem, FoodItem } from '../types';
import { DEFAULT_FOODS, calculateTargetAndMacros } from '../data';
import {
  Calendar,
  Activity,
  Plus,
  Trash,
  Droplet,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Sparkles,
  UtensilsCrossed,
  X,
  PlusCircle,
  HelpCircle,
  Info,
  Loader2
} from 'lucide-react';

interface DailyDashboardProps {
  onboarding: UserOnboardingData;
  logList: MealLogItem[];
  waterLog: Record<string, number>;
  customFoods: FoodItem[];
  onLogItemAdded: (item: MealLogItem) => void;
  onLogItemRemoved: (id: string) => void;
  onUpdateWater: (date: string, amount: number) => void;
  onResetOnboarding: () => void;
  onAddCustomFood: (food: FoodItem) => void;
}

export default function DailyDashboard({
  onboarding,
  logList,
  waterLog,
  customFoods,
  onLogItemAdded,
  onLogItemRemoved,
  onUpdateWater,
  onResetOnboarding,
  onAddCustomFood,
}: DailyDashboardProps) {
  // Current date being viewed
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Target values calculated based on Mifflin-St Jeor and chosen goal
  const { caloriesTarget, proteinGrams, carbGrams, fatGrams, tmb, get } =
    calculateTargetAndMacros(onboarding);

  // Scientific water ideal (35 ml per kg of body mass)
  const waterTargetMl = Math.round(onboarding.weight * 35);

  // Filters items logged for active date
  const activeLogs = logList.filter((log) => log.date === selectedDate);
  const currentWater = waterLog[selectedDate] || 0;

  // Meal sums
  const totalsInfo = activeLogs.reduce(
    (acc, item) => {
      return {
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriesRemaining = caloriesTarget - totalsInfo.calories;

  // Local state for modals and food additions
  const [isFoodBrowserOpen, setIsFoodBrowserOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  
  // Custom Food Form
  const [isCreatingFood, setIsCreatingFood] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCals, setNewFoodCals] = useState('');
  const [newFoodProt, setNewFoodProt] = useState('');
  const [newFoodCarb, setNewFoodCarb] = useState('');
  const [newFoodFat, setNewFoodFat] = useState('');
  const [newFoodServingSize, setNewFoodServingSize] = useState('100');
  const [newFoodServingUnit, setNewFoodServingUnit] = useState('g');

  // Interactive selected Catalog Food state to scale grams
  const [selectedCatalogFood, setSelectedCatalogFood] = useState<FoodItem | null>(null);
  const [catalogFoodGrams, setCatalogFoodGrams] = useState<number>(100);

  // AI Coach Chat panel
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachMessages, setCoachMessages] = useState<{ sender: 'user' | 'coach'; text: string }[]>([
    { sender: 'coach', text: 'Olá! Sou o seu NutriCoach. Analiso o seu desempenho de hoje com inteligência artificial para te dar as melhores dicas alimentares. Como posso te apoiar agora?' }
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // Quick Chat questions helper
  const handleQuickQuestion = async (q: string) => {
    setCoachInput('');
    const userMsg = q;
    setCoachMessages((p) => [...p, { sender: 'user', text: userMsg }]);
    setIsCoachLoading(true);

    try {
      // consolidate today's stats
      const logData = {
        totalCalories: totalsInfo.calories,
        caloriesTarget,
        totalProtein: totalsInfo.protein,
        proteinGrams,
        totalCarbs: totalsInfo.carbs,
        carbGrams,
        totalFat: totalsInfo.fat,
        fatGrams,
        waterMl: currentWater
      };

      const res = await fetch('/api/nutrition-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logData,
          onboardingData: onboarding,
          question: userMsg
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no servidor.');
      setCoachMessages((p) => [...p, { sender: 'coach', text: data.advice || 'Desculpe, não consegui obter conselhos agora.' }]);
    } catch (err: any) {
      console.error(err);
      setCoachMessages((p) => [...p, { sender: 'coach', text: 'Não foi possível acessar a IA no momento. Por favor, certifique-se de que a chave GEMINI_API_KEY está configurada.' }]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  const submitCoachChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim() || isCoachLoading) return;
    const msg = coachInput.trim();
    setCoachInput('');
    await handleQuickQuestion(msg);
  };

  // Calendar utility navigation
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const getFriendlyDateString = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hoje';
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';

    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  // Log food handler
  const handleLogCatalogFood = () => {
    if (!selectedCatalogFood) return;
    const ratio = catalogFoodGrams / selectedCatalogFood.servingSize;

    onLogItemAdded({
      id: String(Date.now()),
      name: selectedCatalogFood.name,
      calories: Math.round(selectedCatalogFood.calories * ratio),
      protein: Number((selectedCatalogFood.protein * ratio).toFixed(1)),
      carbs: Number((selectedCatalogFood.carbs * ratio).toFixed(1)),
      fat: Number((selectedCatalogFood.fat * ratio).toFixed(1)),
      servingSize: catalogFoodGrams,
      servingUnit: 'g',
      mealType: activeMealType,
      date: selectedDate,
    });

    // Reset states
    setSelectedCatalogFood(null);
    setCatalogFoodGrams(100);
    setFoodSearchQuery('');
    setIsFoodBrowserOpen(false);
  };

  // Custom food creator
  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;

    const food: FoodItem = {
      id: 'custom-' + Date.now(),
      name: newFoodName.trim(),
      calories: Number(newFoodCals) || 0,
      protein: Number(newFoodProt) || 0,
      carbs: Number(newFoodCarb) || 0,
      fat: Number(newFoodFat) || 0,
      servingSize: Number(newFoodServingSize) || 100,
      servingUnit: newFoodServingUnit || 'g',
      isCustom: true,
    };

    onAddCustomFood(food);

    // Auto-select for logging
    setSelectedCatalogFood(food);
    setCatalogFoodGrams(Number(newFoodServingSize) || 100);

    // Reset form
    setNewFoodName('');
    setNewFoodCals('');
    setNewFoodProt('');
    setNewFoodCarb('');
    setNewFoodFat('');
    setNewFoodServingSize('100');
    setNewFoodServingUnit('g');
    setIsCreatingFood(false);
  };

  // Meal type names
  const mealNames = {
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    snack: 'Lanche / Café da Tarde',
    dinner: 'Jantar',
  };

  // Water logs
  const addWater = (amount: number) => {
    onUpdateWater(selectedDate, Math.max(0, currentWater + amount));
  };

  return (
    <div className="space-y-6" id="dashboard-main-container">
      {/* Calendar navigation */}
      <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm" id="calendar-bar">
        <button
          onClick={() => shiftDate(-1)}
          className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
          id="prev-date-btn"
        >
          <ChevronLeft size={16} className="text-slate-600" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="text-emerald-500" size={18} />
          <span className="text-sm font-bold text-slate-800 capitalize font-sans">
            {getFriendlyDateString(selectedDate)}
          </span>
          <span className="text-xs font-mono text-slate-400 font-medium">({selectedDate})</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="w-5 h-5 bg-transparent opacity-0 absolute cursor-pointer"
            title="Escolher Data específica"
          />
        </div>

        <button
          onClick={() => shiftDate(1)}
          className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
          id="next-date-btn"
        >
          <ChevronRight size={16} className="text-slate-600" />
        </button>
      </div>

      {/* DASHBOARD STATS CARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active energy Ring chart Card (Calories) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between" id="calories-ring-card">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Meta Calórica</h3>
            
            <div className="flex items-center justify-center py-2 relative">
              {/* Interactive SVG Progress Ring */}
              <svg className="w-36 h-36" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-emerald-500 transition-all duration-500"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={Math.max(
                    0,
                    264 - (264 * Math.min(totalsInfo.calories, caloriesTarget)) / caloriesTarget
                  )}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>

              <div className="absolute text-center">
                <div id="calories-consumed-stat" className="text-2xl font-black text-slate-800 tracking-tight">{totalsInfo.calories}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">de {caloriesTarget} kcal</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Saldo Calórico Restante:</span>
            {caloriesRemaining >= 0 ? (
              <span id="calories-remaining-stat" className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {caloriesRemaining} kcal faltantes
              </span>
            ) : (
              <span id="calories-surplus-stat" className="font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                {Math.abs(caloriesRemaining)} kcal acima
              </span>
            )}
          </div>
        </div>

        {/* Nutritional Macronutrient levels Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between" id="macros-meter-card">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Macronutrientes Escolhidos</h3>
            
            <div className="space-y-4">
              {/* Protein bar */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-600 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Proteínas (Construção)
                  </span>
                  <span className="font-bold text-slate-700">
                    {totalsInfo.protein.toFixed(1)}g / <span className="text-slate-400">{proteinGrams}g</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalsInfo.protein / proteinGrams) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Carbohydrates bar */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-600 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Carboidratos (Energia)
                  </span>
                  <span className="font-bold text-slate-700">
                    {totalsInfo.carbs.toFixed(1)}g / <span className="text-slate-400">{carbGrams}g</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalsInfo.carbs / carbGrams) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fats bar */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-600 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    Gorduras (Hormonal)
                  </span>
                  <span className="font-bold text-slate-700">
                    {totalsInfo.fat.toFixed(1)}g / <span className="text-slate-400">{fatGrams}g</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalsInfo.fat / fatGrams) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-4 leading-relaxed font-sans">
            A meta nutricional recomendada é baseada no seu sexo biológico ({onboarding.gender === 'male' ? 'Masculino' : 'Feminino'}), peso diário ({onboarding.weight}kg) e o objetivo indicado.
          </div>
        </div>

        {/* Scientifically Calculated Water Tracker and Hydration log */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between" id="water-log-card">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registro de Hidratação</h3>
              <Droplet className="text-blue-500 animate-pulse" size={18} />
            </div>

            <div className="text-center py-3 bg-blue-50/50 rounded-2xl border border-blue-50/70">
              <span id="water-consumed-stat" className="block text-2xl font-black text-blue-700 tracking-tight font-sans">
                {currentWater} ml
              </span>
              <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wide">Meta Ideal: {waterTargetMl} ml</span>
            </div>

            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentWater / waterTargetMl) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => addWater(250)}
              id="add-water-250-btn"
              className="flex-1 py-2 text-xs font-bold border border-blue-200 text-blue-700 hover:bg-blue-50/70 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 bg-white"
            >
              + 250ml
            </button>
            <button
              onClick={() => addWater(500)}
              id="add-water-500-btn"
              className="flex-1 py-2 text-xs font-bold border border-blue-200 text-blue-700 hover:bg-blue-50/70 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 bg-white"
            >
              + 500ml
            </button>
            <button
              onClick={() => addWater(-250)}
              disabled={currentWater === 0}
              id="sub-water-250-btn"
              className="px-2.5 py-2 text-xs font-medium border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer bg-white disabled:opacity-40"
              title="Remover 250ml"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* DIARY LOG MEAL ENTRIES */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm" id="diario-refeicoes-secao">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <UtensilsCrossed size={18} className="text-emerald-500" />
          Diário de Consorção Alimentar ({activeLogs.length} itens hoje)
        </h3>

        <div className="space-y-6" id="meals-group-container">
          {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((mealKey) => {
            const mealItems = activeLogs.filter((log) => log.mealType === mealKey);
            const mealCalories = mealItems.reduce((sum, item) => sum + item.calories, 0);

            return (
              <div
                key={mealKey}
                id={`meal-block-${mealKey}`}
                className="border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-all"
              >
                {/* Meal header block */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{mealNames[mealKey]}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Controle de porções e refeições</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {mealCalories > 0 && (
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">
                        {mealCalories} kcal
                      </span>
                    )}
                    <button
                      id={`add-food-${mealKey}-btn`}
                      onClick={() => {
                        setActiveMealType(mealKey);
                        setIsFoodBrowserOpen(true);
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle size={14} /> Adicionar
                    </button>
                  </div>
                </div>

                {/* Logged Item list */}
                {mealItems.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-medium italic py-2">
                    Nenhum alimento registrado para esta refeição.
                  </p>
                ) : (
                  <div className="space-y-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50" id={`meal-logs-list-${mealKey}`}>
                    {mealItems.map((item) => (
                      <div
                        key={item.id}
                        id={`logged-item-${item.id}`}
                        className="flex items-center justify-between bg-white border border-slate-200/50 p-2.5 rounded-xl hover:border-slate-350 transition-all text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-750">{item.name}</div>
                          <div className="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">
                            Porção: {item.servingSize}{item.servingUnit} • P: {item.protein}g | C: {item.carbs}g | G: {item.fat}g
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-800">{item.calories} kcal</span>
                          <button
                            id={`delete-logged-item-${item.id}`}
                            onClick={() => onLogItemRemoved(item.id)}
                            className="text-slate-300 hover:text-red-500 cursor-pointer transition-all"
                            title="Remover do Diário"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* METABOLIC BASAL INFORMATIVE FOOTER */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4" id="metabolic-info-cards">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600 shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Metabolismo Basal (TMB)</h4>
            <p className="text-sm font-black text-slate-800 mt-1">{tmb} kcal</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">Gasto calórico mínimo necessário para manter seu corpo funcionando em completo repouso.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600 shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gasto Diário (GET)</h4>
            <p className="text-sm font-black text-slate-800 mt-1">{get} kcal</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">Gasto calórico real estimado considerando seu nível completo de exercícios semanais.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 justify-between md:border-l md:border-slate-200 md:pl-6">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Metas corporais</h4>
            <p className="text-xs font-bold text-slate-500 mt-1">Gênero: {onboarding.gender === 'female' ? 'Feminino' : 'Masculino'}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase font-sans mt-0.5">Nascimento: {onboarding.birthDate}</p>
          </div>
          <button
            onClick={onResetOnboarding}
            id="reset-onboarding-btn"
            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer bg-white border border-rose-200 hover:border-rose-400 px-2 py-1 rounded-lg transition-all"
          >
            Refazer Perfil
          </button>
        </div>
      </div>

      {/* FLOAT NUTRICIONAL AI COACH WIDGET */}
      <div className="fixed bottom-6 right-6 z-40">
        {isCoachOpen ? (
          <div id="ai-coach-drawer" className="bg-white border border-slate-200 rounded-3xl w-80 md:w-96 shadow-2xl overflow-hidden flex flex-col h-[420px] transition-all animate-scaleUp">
            <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-400 shrink-0" size={16} />
                <div>
                  <h4 className="text-xs font-bold text-slate-100 font-sans">NutriCoach Atendimento</h4>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Conselhos Nutricionais por IA</p>
                </div>
              </div>
              <button
                onClick={() => setIsCoachOpen(false)}
                id="close-coach-btn"
                className="text-slate-400 hover:text-white cursor-pointer transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat list entries */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50" id="coach-chat-history">
              {coachMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isCoachLoading && (
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <Loader2 className="animate-spin text-emerald-500" size={12} />
                  <span>Digitando avaliação nutricional...</span>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="px-3 py-1.5 border-t border-slate-105 bg-slate-50 flex gap-1 overflow-x-auto">
              <button
                onClick={() => handleQuickQuestion('Que tal meu consumo de proteínas de hoje?')}
                className="text-[9px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1 whitespace-nowrap hover:bg-slate-50 transition-all cursor-pointer"
              >
                Analise minhas Proteínas
              </button>
              <button
                onClick={() => handleQuickQuestion('Bebi água suficiente? Como melhorar?')}
                className="text-[9px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1 whitespace-nowrap hover:bg-slate-50 transition-all cursor-pointer"
              >
                Avalie minha Hidratação
              </button>
            </div>

            {/* Message input */}
            <form onSubmit={submitCoachChat} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="Pergunte ao nutri... (Ex: Comer banana à noite engorda?)"
                className="flex-1 bg-slate-55 text-xs text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-slate-800"
              />
              <button
                type="submit"
                id="submit-coach-btn"
                className="px-3 py-2 bg-slate-900 border border-slate-950 text-white text-xs font-bold rounded-xl hover:bg-slate-850 cursor-pointer"
              >
                Enviar
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsCoachOpen(true)}
            id="open-coach-btn"
            className="bg-slate-950 border border-slate-800 text-emerald-400 p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
            title="Conselho Geral com IA"
          >
            <MessageSquare size={20} className="stroke-[2]" />
            <span className="text-xs font-bold text-white font-sans pr-1">NutriCoach AI</span>
          </button>
        )}
      </div>

      {/* FOOD BROWSER MODAL (POPUP FOR CHOSEN MEAL ADDITION) */}
      {isFoodBrowserOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" id="food-browser-modal">
            
            {/* Modal header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest font-mono">Pesquisa Nutricional</span>
                <h3 className="text-lg font-black text-slate-800 font-sans mt-0.5">Adicionar ao {mealNames[activeMealType]}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedCatalogFood(null);
                  setIsFoodBrowserOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                id="close-food-browser-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal search bar */}
            <div className="p-6 pb-2 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="modal-food-search"
                    placeholder="Filtrar base de alimentos..."
                    value={foodSearchQuery}
                    onChange={(e) => setFoodSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <Search className="absolute left-3 top-3.5 text-slate-400" size={14} />
                </div>
                <button
                  onClick={() => setIsCreatingFood(!isCreatingFood)}
                  id="toggle-custom-food-btn"
                  className="px-3 py-2 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[11px] font-bold text-slate-600 hover:text-emerald-700 rounded-xl transition-all cursor-pointer flex items-center gap-1 bg-white"
                >
                  {isCreatingFood ? 'Voltar Busca' : 'Criar Alimento'}
                </button>
              </div>

              {/* CREATE CUSTOM FOOD FORM BLOCK */}
              {isCreatingFood && (
                <form onSubmit={handleSaveCustomFood} className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-3 animate-fadeIn" id="custom-food-form">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Novo Alimento Personalizado</h4>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <label htmlFor="custom-food-title" className="block text-[10px] font-semibold text-slate-500 mb-1">Nome do Alimento</label>
                      <input
                        type="text"
                        id="custom-food-title"
                        required
                        placeholder="Ex: Iogurte Grego Frutas Vermelhas"
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="custom-food-portion" className="block text-[10px] font-semibold text-slate-500 mb-1">Porção Base</label>
                      <input
                        type="number"
                        id="custom-food-portion"
                        required
                        placeholder="Ex: 100"
                        value={newFoodServingSize}
                        onChange={(e) => setNewFoodServingSize(e.target.value)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="custom-food-unit" className="block text-[10px] font-semibold text-slate-500 mb-1">Unidade (g, ml, colher)</label>
                      <input
                        type="text"
                        id="custom-food-unit"
                        required
                        placeholder="Ex: g"
                        value={newFoodServingUnit}
                        onChange={(e) => setNewFoodServingUnit(e.target.value)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="custom-food-cals" className="block text-[10px] font-semibold text-slate-500 mb-1">Calorias (kcal)</label>
                      <input
                        type="number"
                        id="custom-food-cals"
                        required
                        placeholder="Ex: 110"
                        value={newFoodCals}
                        onChange={(e) => setNewFoodCals(e.target.value)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="custom-food-protein" className="block text-[10px] font-semibold text-slate-500 mb-1">Proteínas (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        id="custom-food-protein"
                        placeholder="Ex: 8.5"
                        value={newFoodProt}
                        onChange={(e) => setNewFoodProt(e.target.value)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="custom-food-carb" className="block text-[10px] font-semibold text-slate-500 mb-1">Carboidratos (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        id="custom-food-carb"
                        placeholder="Ex: 12"
                        value={newFoodCarb}
                        onChange={(e) => setNewFoodCarb(e.target.value)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="custom-food-fat" className="block text-[10px] font-semibold text-slate-500 mb-1">Gorduras (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        id="custom-food-fat"
                        placeholder="Ex: 2.1"
                        value={newFoodFat}
                        onChange={(e) => setNewFoodFat(e.target.value)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      id="save-custom-food-btn"
                      className="px-4 py-2 bg-slate-900 border border-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Cadastrar & Selecionar
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* List results body */}
            <div className="flex-1 overflow-y-auto px-6 py-2 min-h-[140px]" id="food-selection-panel">
              {!isCreatingFood && (
                <div className="divide-y divide-slate-150">
                  {[...DEFAULT_FOODS, ...customFoods]
                    .filter((f) => f.name.toLowerCase().includes(foodSearchQuery.toLowerCase()))
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedCatalogFood(item)}
                        className={`py-3 flex items-center justify-between cursor-pointer group hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-all ${
                          selectedCatalogFood?.id === item.id ? 'bg-emerald-50 border-emerald-500' : ''
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-755 group-hover:text-emerald-700 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                            Porção padrão: {item.servingSize}{item.servingUnit} • P: {item.protein}g | C: {item.carbs}g | G: {item.fat}g
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-slate-800">{item.calories} kcal</span>
                          <span className="block text-[8px] text-emerald-600 font-mono font-bold tracking-widest mt-0.5">SELECIONAR</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Selected feedback footer with live metrics scaling */}
            {selectedCatalogFood && (
              <div className="p-6 bg-slate-50 border-t border-slate-200/60 rounded-b-3xl space-y-4" id="scaling-footer">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-600 font-mono tracking-wider">Ajuste de Quantidade Ingerida</span>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{selectedCatalogFood.name}</h4>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
                    <input
                      type="number"
                      id="custom-serving-grams"
                      min="1"
                      value={catalogFoodGrams}
                      onChange={(e) => setCatalogFoodGrams(Math.max(1, Number(e.target.value)))}
                      className="w-16 text-center text-xs font-bold text-slate-800 focus:outline-none"
                    />
                    <span className="text-[11px] font-bold text-slate-400 pl-1 pr-1 bg-slate-50 rounded-md">gramas</span>
                  </div>
                </div>

                {/* Show Live calculated values based on scaled grams factor */}
                {(() => {
                  const scale = catalogFoodGrams / selectedCatalogFood.servingSize;
                  const scCals = Math.round(selectedCatalogFood.calories * scale);
                  const scProt = Number((selectedCatalogFood.protein * scale).toFixed(1));
                  const scCarb = Number((selectedCatalogFood.carbs * scale).toFixed(1));
                  const scFat = Number((selectedCatalogFood.fat * scale).toFixed(1));

                  return (
                    <div className="grid grid-cols-4 gap-2 text-center bg-white p-3 rounded-2xl border border-slate-200/50">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Kcal</span>
                        <span className="text-xs font-black text-emerald-700 block mt-0.5">{scCals}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Prot</span>
                        <span className="text-xs font-bold text-slate-700 block mt-0.5">{scProt}g</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Carb</span>
                        <span className="text-xs font-bold text-slate-700 block mt-0.5">{scCarb}g</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Gord</span>
                        <span className="text-xs font-bold text-slate-700 block mt-0.5">{scFat}g</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Action submit */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleLogCatalogFood}
                    id="submit-log-catalog-food-btn"
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-sm shadow-emerald-200"
                  >
                    Confirmar e Logar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
