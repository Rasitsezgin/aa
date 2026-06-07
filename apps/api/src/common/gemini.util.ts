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
  const model =
    config.get<string>('GEMINI_MODEL') ||
    config.get<string>('GOOGLE_MODEL') ||
    'gemini-1.5-flash';

  return model.trim() || 'gemini-1.5-flash';
}
