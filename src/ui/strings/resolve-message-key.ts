import { strings } from '@/ui/strings/es';

export function resolveMessageKey(key: string | undefined): string | null {
  if (key === undefined || key.length === 0) {
    return null;
  }
  const parts = key.split('.');
  let current: unknown = strings;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return key;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : key;
}
