/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, Check, Plus, AlertCircle, Edit2 } from 'lucide-react';
import { MealLogItem } from '../types';

interface AISearchInputProps {
  onLogCalculatedItem: (item: Omit<MealLogItem, 'id' | 'date'>, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
}

export default function AISearchInput({ onLogCalculatedItem }: AISearchInputProps) {
  const [queryString, setQueryString] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Parsed AI suggestion
  const [aiResult, setAiResult] = useState<{
    name: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  // Editable fields in case the user wants to tweak the AI's estimation
  const [editName, setEditName] = useState('');
  const [editSize, setEditSize] = useState(100);
  const [editUnit, setEditUnit] = useState('g');
  const [editCals, setEditCals] = useState(0);
  const [editProt, setEditProt] = useState(0);
  const [editCarbs, setEditCarbs] = useState(0);
  const [editFat, setEditFat] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [successMessage, setSuccessMessage] = useState(false);

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryString.trim()) return;

    setIsLoading(true);
    setError('');
    setAiResult(null);
    setSuccessMessage(false);

    try {
      const response = await fetch('/api/nutrition-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: queryString }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro inesperado do servidor.');
      }

      setAiResult(data);
      // Initialize editable state
      setEditName(data.name || '');
      setEditSize(data.servingSize || 100);
      setEditUnit(data.servingUnit || 'g');
      setEditCals(data.calories || 0);
      setEditProt(data.protein || 0);
      setEditCarbs(data.carbs || 0);
      setEditFat(data.fat || 0);
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Falha na comunicação com o assistente inteligente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToMeal = () => {
    onLogCalculatedItem({
      name: editName,
      servingSize: editSize,
      servingUnit: editUnit,
      calories: editCals,
      protein: editProt,
      carbs: editCarbs,
      fat: editFat,
      mealType: selectedMealType,
    }, selectedMealType);

    setSuccessMessage(true);
    setAiResult(null);
    setQueryString('');
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  const promptSuggestions = [
    '1 fatia média de melancia',
    '3 colheres de arroz integral, meia concha de feijão carioca e 130g filé de frango',
    'Crepioca com 1 colher de requeijão light',
    'Copo duplo de suco de uva integral (300ml)'
  ];

  return (
    <div id="ai-search-card" className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-emerald-500/10 p-1.5 rounded-xl border border-emerald-500/25">
          <Sparkles className="text-emerald-400" size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wider uppercase text-emerald-400 font-mono">Calcular com Inteligência Artificial</h2>
          <p className="text-slate-400 text-xs mt-0.5">Fale o que você comeu naturalmente para sabermos as calorias e macros correspondentes!</p>
        </div>
      </div>

      <form onSubmit={handleAISearch} className="space-y-4">
        <div className="relative">
          <textarea
            id="ai-prompt-input"
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            disabled={isLoading}
            placeholder="Ex: Comi 1 bife de contrafilé grelhado, uma porção grande de batata frita caseira e 1 lata de refrigerante zero..."
            rows={2}
            className="w-full bg-slate-850 border border-slate-700 rounded-2xl p-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans resize-none transition-all focus:ring-1 focus:ring-emerald-500/30"
          />
          <button
            type="submit"
            disabled={isLoading || !queryString.trim()}
            id="ai-submit-btn"
            className="absolute right-3.5 bottom-3.5 p-2 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 disabled:opacity-40 transition-all cursor-pointer shadow-sm shadow-emerald-500/20"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>

        {/* Suggestion tags */}
        {!isLoading && !aiResult && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Ideias de Pesquisa:</span>
            <div className="flex flex-wrap gap-1.5">
              {promptSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`ai-suggestion-tag-${idx}`}
                  onClick={() => setQueryString(s)}
                  className="bg-slate-850 border border-slate-850 hover:border-slate-700 text-[10px] text-slate-350 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-sans"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Loading feedback */}
      {isLoading && (
        <div id="ai-loading-indicator" className="mt-6 flex flex-col items-center justify-center py-6 text-center text-slate-400">
          <Loader2 className="animate-spin text-emerald-400 mb-3" size={28} />
          <p className="text-xs font-semibold text-slate-200">Consultando NutriCoach AI...</p>
          <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-relaxed">Cruzando dados com tabelas nutricionais para estimar proteínas, carboidratos, lipídios e calorias exatas.</p>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div id="ai-error-alert" className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs rounded-2xl flex items-start gap-2">
          <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Success feedback */}
      {successMessage && (
        <div id="ai-success-toast" className="mt-4 p-3 bg-emerald-500/10 border border-emerald-550/20 text-emerald-200 text-xs rounded-2xl flex items-center gap-2">
          <Check size={16} className="text-emerald-400" />
          <p>Alimento registrado no seu Diário de Consumo!</p>
        </div>
      )}

      {/* AI PARSED CARD OR EDIT PANEL */}
      {aiResult && !isLoading && (
        <div id="ai-result-panel" className="mt-6 bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 animate-fadeIn space-y-4 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase font-mono">Estimativa Inteligente</span>
              {isEditing ? (
                <input
                  type="text"
                  id="edit-ai-food-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full bg-slate-800 border border-slate-700 rounded-lg py-1 px-2 text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                />
              ) : (
                <h4 className="text-sm font-bold text-slate-100">{editName}</h4>
              )}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              id="edit-ai-result-toggle"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800"
            >
              <Edit2 size={10} />
              {isEditing ? 'Pronto' : 'Editar'}
            </button>
          </div>

          {/* Size and Unit */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase">Tamanho da Porção</span>
              {isEditing ? (
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={editSize}
                    onChange={(e) => setEditSize(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-center text-xs"
                  />
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-12 bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-center text-xs"
                  />
                </div>
              ) : (
                <div className="bg-slate-855 px-3 py-1.5 rounded-xl border border-slate-800 font-bold text-[11px] text-slate-350">
                  {editSize} {editUnit}
                </div>
              )}
            </div>

            <div>
              <span className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase font-sans">Adicionar ao</span>
              <select
                id="ai-target-meal-select"
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value as any)}
                className="w-full bg-slate-800 text-slate-350 border border-slate-750 rounded-xl px-3 py-1.5 text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="breakfast">Café da Manhã</option>
                <option value="lunch">Almoço</option>
                <option value="snack">Lanches / Café da tarde</option>
                <option value="dinner">Jantar</option>
              </select>
            </div>
          </div>

          {/* Nutrients Specs Grid */}
          <div className="grid grid-cols-4 gap-2 text-center pt-1">
            <div className={`rounded-xl p-2.5 border ${isEditing ? 'bg-slate-800 border-slate-700' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
              <span className="block text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Kcal</span>
              {isEditing ? (
                <input
                  type="number"
                  value={editCals}
                  onChange={(e) => setEditCals(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-bold text-xs mt-1 border-b border-slate-650"
                />
              ) : (
                <span className="text-sm font-bold block mt-1 text-emerald-300 font-mono">{editCals}</span>
              )}
            </div>

            <div className="rounded-xl p-2.5 border border-slate-800 bg-slate-855">
              <span className="block text-[9px] text-red-400 font-bold uppercase tracking-wider font-mono">Proteínas</span>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={editProt}
                  onChange={(e) => setEditProt(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-bold text-xs mt-1 border-b border-slate-650"
                />
              ) : (
                <span className="text-xs font-bold block mt-1 text-slate-200">{editProt}g</span>
              )}
            </div>

            <div className="rounded-xl p-2.5 border border-slate-800 bg-slate-855">
              <span className="block text-[9px] text-amber-400 font-bold uppercase tracking-wider font-mono">Carbo</span>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={editCarbs}
                  onChange={(e) => setEditCarbs(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-bold text-xs mt-1 border-b border-slate-650"
                />
              ) : (
                <span className="text-xs font-bold block mt-1 text-slate-200">{editCarbs}g</span>
              )}
            </div>

            <div className="rounded-xl p-2.5 border border-slate-800 bg-slate-855">
              <span className="block text-[9px] text-teal-400 font-bold uppercase tracking-wider font-mono">Gorduras</span>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={editFat}
                  onChange={(e) => setEditFat(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-bold text-xs mt-1 border-b border-slate-650"
                />
              ) : (
                <span className="text-xs font-bold block mt-1 text-slate-200">{editFat}g</span>
              )}
            </div>
          </div>

          {/* Confirm adding */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 font-sans italic">Ajuste os valores como preferir.</span>

            <button
              onClick={handleSaveToMeal}
              id="confirm-ai-save-btn"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-sm transition-all shadow-emerald-500/10"
            >
              <Plus size={14} className="stroke-[3]" /> Logar no Diário
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
