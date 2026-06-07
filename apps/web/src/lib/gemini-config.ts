const PLACEHOLDER_VALUES = new Set(['', '...', 'undefined', 'null']);

export function getGeminiApiKey(): string | undefined {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GEMINI_API_KEY,
  ];

  for (const raw of candidates) {
    const value = (raw || '').trim();
    if (!value || PLACEHOLDER_VALUES.has(value)) continue;
    return value;
  }

  return undefined;
}

export function getGeminiModel(): string {
  const model =
    process.env.GEMINI_MODEL ||
    process.env.GOOGLE_MODEL ||
    'gemini-1.5-flash';

  return model.trim() || 'gemini-1.5-flash';
}
