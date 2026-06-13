/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Rota para cálculo e estimativa de calorias por inteligência artificial (Gemini)
  app.post('/api/nutrition-estimate', async (req: express.Request, res: express.Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'A chave de API do Gemini (GEMINI_API_KEY) não está configurada nos segredos do AI Studio.'
        });
      }

      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'Insira um termo de alimento ou refeição válido.' });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Prompt instrutivo em português brasileiro para calibragem perfeita
      const instructions = `Você é um nutricionista virtual experiente do Brasil. Analise o termo inserido pelo usuário (que pode ser um ingrediente específico, uma porção informal ou uma refeição inteira com múltiplos itens) e estime com a maior precisão científica possível os valores de carboidratos, proteínas, gorduras e calorias.
Siga fidedignamente as referências brasileiras (como a tabela TACO/UNICAMP).
Termo do usuário: "${prompt}"

Retorne EXCLUSIVAMENTE um objeto JSON estruturado contendo as seguintes propriedades:
- name: o nome higienizado, formatado e corrigido do alimento em português (ex: "1 Copo de Leite Integral", "Frango com Batata Doce")
- servingSize: valor numérico que representa o peso ou volume estimado consumido em gramas ou mililitros (ex: 150)
- servingUnit: a abreviação da unidade física de medida (ex: "g", "ml", "unidade", "colher", "fatia")
- calories: valor calórico total estimado como número inteiro (kcal)
- protein: total de proteína em gramas (tipo float/número decimal)
- carbs: total de carboidratos em gramas (tipo float/número decimal)
- fat: total de gorduras ou lipídios em gramas (tipo float/número decimal)

Sua resposta não pode conter introduções, explicações ou markdown fora do JSON propriamente dito.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: instructions,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              servingSize: { type: Type.INTEGER },
              servingUnit: { type: Type.STRING },
              calories: { type: Type.INTEGER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER }
            },
            required: ["name", "servingSize", "servingUnit", "calories", "protein", "carbs", "fat"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Nenhum resultado obtido do serviço de Inteligência Artificial.');
      }

      const parsedResult = JSON.parse(responseText.trim());
      return res.json(parsedResult);
    } catch (err: any) {
      console.error('Erro na estimativa de nutriente:', err);
      return res.status(500).json({
        error: 'Erro técnico ao processar estimativa por Inteligência Artificial.',
        details: err?.message || 'Erro de processamento'
      });
    }
  });

  // Rota de Assistente/Mentor Nutricional para dar assessoria baseado nas metas diárias
  app.post('/api/nutrition-coach', async (req: express.Request, res: express.Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'A chave de API do Gemini (GEMINI_API_KEY) não está configurada nos segredos do AI Studio.'
        });
      }

      const { logData, onboardingData, question } = req.body;

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemContext = `Você é o NutriCoach, um nutricionista virtual inteligente integrado a um software de controle calórico diário.
Aqui estão os parâmetros corporais e objetivos do usuário:
- Data de Nascimento: ${onboardingData?.birthDate} (Gênero: ${onboardingData?.gender === 'male' ? 'Masculino' : 'Feminino'})
- Altura: ${onboardingData?.height} cm | Peso: ${onboardingData?.weight} kg
- Frequência de Exercício: ${onboardingData?.activityFrequency} dias/semana (Intensidade: ${onboardingData?.activityIntensity})
- Objetivo Principal: ${onboardingData?.objective === 'lose' ? 'Emagrecer (Déficit Calórico)' : onboardingData?.objective === 'gain' ? 'Ganhar Massa Magra (Superávit)' : 'Manter Peso Saudável'}

Resumos de logs alimentares consolidados obtidos no dia de hoje:
- Calorias totais registradas: ${logData?.totalCalories} kcal (Meta: ${logData?.caloriesTarget} kcal)
- Proteínas: ${logData?.totalProtein}g de ${logData?.proteinGrams}g meta
- Carboidratos: ${logData?.totalCarbs}g de ${logData?.carbGrams}g meta
- Gorduras: ${logData?.totalFat}g de ${logData?.fatGrams}g meta
- Hidratação: ${logData?.waterMl || 0}ml de água ingerida.

Pergunta ou dúvida imediata do usuário: "${question || 'Como posso melhorar as minhas refeições de hoje?'}"

Responda em formato de conversa direta, amigável, clara e de extremo valor prático. Seja breve, limitando-se a no máximo 3 parágrafos focados em resultados práticos. Use marcações em negrito estrategicamente.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemContext,
      });

      return res.json({ advice: response.text });
    } catch (err: any) {
      console.error('Erro no NutriCoach:', err);
      return res.status(500).json({
        error: 'Incapaz de acessar o assistente nutricional no momento.',
        details: err?.message
      });
    }
  });

  // Configuração do middleware do Vite para o ambiente de desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Full-stack operacional iniciado na porta ${PORT}`);
  });
}

startServer();
