import type { ContextEntry } from '@/core/types/context-entry';
import type { DefaultableGenerationField } from '@/core/types/generation-params';

export type ContextPayload = {
  readonly topics: readonly string[];
  readonly keywords: readonly string[];
  readonly defaults: Partial<Record<DefaultableGenerationField, string | number>>;
};

export function buildContextPayload(entries: readonly ContextEntry[]): ContextPayload {
  const topics = entries
    .filter((entry) => entry.kind === 'topic')
    .sort((a, b) => a.position - b.position)
    .map((entry) => entry.value);

  const keywords = entries
    .filter((entry) => entry.kind === 'keyword')
    .sort((a, b) => a.position - b.position)
    .map((entry) => entry.value);

  const defaults: Partial<Record<DefaultableGenerationField, string | number>> = {};
  for (const entry of entries) {
    if (entry.kind !== 'default' || entry.meta === null) {
      continue;
    }
    const field = entry.meta.field;
    if (field === 'wordCount' || field === 'sections' || field === 'articleCount') {
      const parsed = Number(entry.value);
      if (Number.isFinite(parsed)) {
        defaults[field] = parsed;
      }
    } else {
      defaults[field] = entry.value;
    }
  }

  return { topics, keywords, defaults };
}

export function serializeContextPayload(entries: readonly ContextEntry[]): string {
  return JSON.stringify(buildContextPayload(entries));
}
