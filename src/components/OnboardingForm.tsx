/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserOnboardingData } from '../types';
import { User, Activity, Flame, TrendingUp, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingFormProps {
  onComplete: (data: UserOnboardingData) => void;
  initialData?: UserOnboardingData | null;
}

export default function OnboardingForm({ onComplete, initialData }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [gender, setGender] = useState<'male' | 'female'>(initialData?.gender || 'male');
  const [height, setHeight] = useState<string>(initialData?.height ? String(initialData?.height) : '');
  const [weight, setWeight] = useState<string>(initialData?.weight ? String(initialData?.weight) : '');
  const [activityFrequency, setActivityFrequency] = useState<number>(initialData?.activityFrequency ?? 3);
  const [activityIntensity, setActivityIntensity] = useState<'low' | 'medium' | 'high'>(initialData?.activityIntensity || 'medium');
  const [objective, setObjective] = useState<'lose' | 'maintain' | 'gain'>(initialData?.objective || 'maintain');

  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!birthDate) {
        setError('Por favor, informe a sua data de nascimento.');
        return;
      }
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime()) || birth.getFullYear() < 1920 || birth > new Date()) {
        setError('Insira uma data de nascimento válida.');
        return;
      }
    }
    if (step === 2) {
      const hNum = Number(height);
      const wNum = Number(weight);
      if (!height || isNaN(hNum) || hNum < 100 || hNum > 250) {
        setError('Por favor, insira uma altura válida entre 100cm e 250cm.');
        return;
      }
      if (!weight || isNaN(wNum) || wNum < 30 || wNum > 300) {
        setError('Por favor, insira um peso válido entre 30kg e 300kg.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hNum = Number(height);
    const wNum = Number(weight);

    if (!birthDate || isNaN(hNum) || isNaN(wNum)) {
      setError('Por favor, valide as informações inseridas.');
      return;
    }

    onComplete({
      birthDate,
      gender,
      height: hNum,
      weight: wNum,
      activityFrequency,
      activityIntensity,
      objective,
    });
  };

  return (
    <div id="onboarding-form-container" className="max-w-md mx-auto bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden my-6 transition-all duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white relative">
        <h2 className="text-2xl font-bold tracking-tight">Seja Bem-vindo(a)</h2>
        <p className="text-emerald-50 text-sm mt-1">
          Precisamos de alguns dados pessoais para formular o seu planejamento de calorias e treinos ideal.
        </p>
        <div className="absolute right-6 top-8 opacity-10">
          <Flame size={72} />
        </div>

        {/* ProgressBar */}
        <div className="flex items-center space-x-1 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'flex-1 bg-white'
                  : s < step
                  ? 'w-4 bg-emerald-200'
                  : 'w-4 bg-emerald-700/50'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {error && (
          <div id="onboarding-error-alert" className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {error}
          </div>
        )}

        {/* STEP 1: Gênero e Nascimento */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <User className="text-emerald-500" size={18} />
              Identificação & Nascimento
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Sexo Biológico (para cálculos metabólicos)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="gender-female-btn"
                  onClick={() => setGender('female')}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                    gender === 'female'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">♀</span>
                  <span>Feminino</span>
                </button>
                <button
                  type="button"
                  id="gender-male-btn"
                  onClick={() => setGender('male')}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                    gender === 'male'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">♂</span>
                  <span>Masculino</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="birthdate-input" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Data de Nascimento
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="birthdate-input"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm text-slate-700"
                />
                <Calendar className="absolute left-3 top-3.5 text-slate-400" size={16} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Altura e Peso */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={18} />
              Suas Medidas Atuais
            </h3>

            <div>
              <label htmlFor="height-input" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Altura (em centímetros)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="height-input"
                  placeholder="Ex: 172"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm text-slate-700"
                />
                <span className="absolute right-3 top-3 text-slate-400 text-sm font-medium">cm</span>
              </div>
            </div>

            <div>
              <label htmlFor="weight-input" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Peso Corporal (em quilogramas)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  id="weight-input"
                  placeholder="Ex: 74.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm text-slate-700"
                />
                <span className="absolute right-3 top-3 text-slate-400 text-sm font-medium">kg</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Frequência e Intensidade Física */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="text-emerald-500" size={18} />
              Atividade Física Diária
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Frequência Semanal (Treinos/Exercícios)
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl">
                  <span>Quantidade de dias:</span>
                  <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                    {activityFrequency === 0 ? 'Nenhum dia (Sedentário)' : `${activityFrequency}x por semana`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  id="activity-frequency-range"
                  value={activityFrequency}
                  onChange={(e) => setActivityFrequency(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 px-1 font-medium">
                  <span>0 dias</span>
                  <span>1 - 2</span>
                  <span>3 - 4</span>
                  <span>5 - 6</span>
                  <span>7 dias</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Intensidade Média dos Exercícios
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((level) => {
                  const titles = { low: 'Leve', medium: 'Moderada', high: 'Intensa' };
                  const desc = { low: 'Caminhadas', medium: 'Musculação', high: 'Crossfit/Corrida' };
                  return (
                    <button
                      key={level}
                      type="button"
                      id={`intensity-${level}-btn`}
                      onClick={() => setActivityIntensity(level)}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                        activityIntensity === level
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">{titles[level]}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{desc[level]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Objetivo */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={18} />
              Qual o seu Objetivo?
            </h3>

            <div className="space-y-3">
              {[
                { id: 'lose', title: 'Perder Peso / Emagrecimento', desc: 'Gerar déficit calórico controlado preservando massa magra' },
                { id: 'maintain', title: 'Manter Peso Saudável', desc: 'Equilibrar perfeitamente o consumo com os gastos calóricos' },
                { id: 'gain', title: 'Ganhar Peso / Hipertrofia', desc: 'Promover superávit calórico limpo para aumento de massa muscular' },
              ].map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  id={`objective-${obj.id}-btn`}
                  onClick={() => setObjective(obj.id as any)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                    objective === obj.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-1">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${objective === obj.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                      {objective === obj.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold font-sans">{obj.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{obj.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          {step > 1 && (
            <button
              type="button"
              id="onboarding-back-btn"
              onClick={prevStep}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <ArrowLeft size={14} />
              Voltar
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              id="onboarding-next-btn"
              onClick={nextStep}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer ml-auto"
            >
              Continuar
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              id="onboarding-submit-btn"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm shadow-emerald-200 cursor-pointer ml-auto"
            >
              Calcular Minha Meta!
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
