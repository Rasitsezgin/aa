import 'server-only';

import { getGeminiApiKey, getGeminiModel } from './gemini-config';

const MODEL_FALLBACKS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

export interface GeminiChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

function buildContents(history: GeminiChatMessage[], userMessage: string) {
  const mapped = history
    .filter((item) => item.content?.trim())
    .map((item) => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }],
    }));

  mapped.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  return mapped;
}

export async function generateGeminiChatResponse(
  systemPrompt: string,
  userMessage: string,
  history: GeminiChatMessage[] = [],
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const preferred = getGeminiModel();
  const models = [...new Set([preferred, ...MODEL_FALLBACKS])];
  const contents = buildContents(history, userMessage);

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        },
      );

      if (!response.ok) continue;

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch {
      // Sonraki modeli dene
    }
  }

  return null;
}

export async function generateGeminiJsonResponse<T>(
  prompt: string,
): Promise<T | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const preferred = getGeminiModel();
  const models = [...new Set([preferred, ...MODEL_FALLBACKS])];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) continue;

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) continue;

      const jsonMatch =
        text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      return JSON.parse(jsonText) as T;
    } catch {
      // Sonraki modeli dene
    }
  }

  return null;
}
