import { ConfigService } from '@nestjs/config';

const PLACEHOLDER_VALUES = new Set(['', '...', 'undefined', 'null']);

export function resolveGeminiApiKey(
  config: ConfigService,
): string | undefined {
  const candidates = [
    config.get<string>('GEMINI_API_KEY'),
    config.get<string>('GOOGLE_API_KEY'),
    config.get<string>('GOOGLE_GEMINI_API_KEY'),
  ];

  for (const raw of candidates) {
    const value = (raw || '').trim();
    if (!value || PLACEHOLDER_VALUES.has(value)) continue;
    return value;
  }

  return undefined;
}

export function resolveGeminiModel(config: ConfigService): string {
  let model =
    config.get<string>('GEMINI_MODEL') ||
    config.get<string>('GOOGLE_MODEL') ||
    'gemini-2.5-flash';

  model = model.trim();

  // Auto-upgrade deprecated 1.5 models to 2.5 to avoid 404 errors
  if (model.includes('gemini-1.5-flash')) {
    return 'gemini-2.5-flash';
  }
  if (model.includes('gemini-1.5-pro')) {
    return 'gemini-2.5-pro';
  }

  return model || 'gemini-2.5-flash';
}
