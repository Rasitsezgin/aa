const PLACEHOLDER_VALUES = new Set(['', '...', 'undefined', 'null']);

export function getGeminiApiKey(): string | undefined {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GEMINI_API_KEY,
    'AIzaSyCXMwcd-J3Ri9H72M56ZINCyyJDp-3dhpo',
  ];

  for (const raw of candidates) {
    const value = (raw || '').trim();
    if (!value || PLACEHOLDER_VALUES.has(value)) continue;
    return value;
  }

  return undefined;
}

export function getGeminiModel(): string {
  let model =
    process.env.GEMINI_MODEL ||
    process.env.GOOGLE_MODEL ||
    'gemini-2.5-flash';

  model = model.trim() || 'gemini-2.5-flash';
  
  if (model === 'gemini-1.5-flash') {
    model = 'gemini-2.5-flash';
  }

  return model;
}
