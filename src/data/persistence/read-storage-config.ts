import Constants from 'expo-constants';

export type StorageConfig = {
  readonly useJson: boolean;
};

function readExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra;
  if (extra === undefined || typeof extra !== 'object') {
    return undefined;
  }
  const value = (extra as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

export function readStorageConfig(): StorageConfig {
  const raw = readExtra('useJsonStorage');
  if (raw === 'false') {
    return { useJson: false };
  }
  if (raw === 'true') {
    return { useJson: true };
  }
  if (process.env.NODE_ENV === 'test') {
    return { useJson: false };
  }
  // Prototipo: JSON por defecto hasta validar sqlite en todos los entornos.
  return { useJson: true };
}
