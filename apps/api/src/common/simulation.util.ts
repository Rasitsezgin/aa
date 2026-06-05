/**
 * Production ortamında simüle entegrasyonların çalışıp çalışmayacağını belirler.
 * Geliştirme/staging'de varsayılan olarak açık; production'da explicit flag gerekir.
 */
export function isSimulationAllowed(flagEnvKey: string): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  return process.env[flagEnvKey] === 'true';
}

export function assertSimulationAllowed(
  flagEnvKey: string,
  message: string,
): void {
  if (!isSimulationAllowed(flagEnvKey)) {
    throw new Error(message);
  }
}
