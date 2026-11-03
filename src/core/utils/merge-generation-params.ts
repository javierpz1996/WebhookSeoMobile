import type { ContextEntry } from '@/core/types/context-entry';
import type {
  DefaultableGenerationField,
  GenerationParams,
  PartialGenerationParams,
} from '@/core/types/generation-params';
import type { DbError } from '@/core/types/db-error';
import { err, ok, type Result } from '@/core/utils/result';

function parseDefaultValue(
  field: DefaultableGenerationField,
  raw: string,
): Result<string | number, DbError> {
  if (field === 'wordCount' || field === 'sections' || field === 'articleCount') {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return err({ kind: 'validation', message: `invalid default for ${field}` });
    }
    return ok(parsed);
  }
  if (raw.trim().length === 0) {
    return err({ kind: 'validation', message: `empty default for ${field}` });
  }
  return ok(raw.trim());
}

function applyDefaults(
  base: PartialGenerationParams,
  entries: readonly ContextEntry[],
): Result<PartialGenerationParams, DbError> {
  let next: PartialGenerationParams = { ...base };

  for (const entry of entries) {
    if (entry.kind !== 'default' || entry.meta === null) {
      continue;
    }
    const field = entry.meta.field;
    if (next[field] !== undefined) {
      continue;
    }
    const parsed = parseDefaultValue(field, entry.value);
    if (!parsed.ok) {
      return parsed;
    }
    next = { ...next, [field]: parsed.value };
  }

  return ok(next);
}

function missingField(field: string): DbError {
  return { kind: 'validation', message: `missing field: ${field}` };
}

export function mergeGenerationParams(
  partial: PartialGenerationParams,
  contextEntries: readonly ContextEntry[],
): Result<GenerationParams, DbError> {
  const withDefaults = applyDefaults(partial, contextEntries);
  if (!withDefaults.ok) {
    return withDefaults;
  }

  const merged = withDefaults.value;
  const keywords =
    merged.keywords ??
    contextEntries
      .filter((entry) => entry.kind === 'keyword')
      .sort((a, b) => a.position - b.position)
      .map((entry) => entry.value);

  const topic =
    merged.topic ??
    contextEntries.find((entry) => entry.kind === 'topic')?.value ??
    undefined;

  if (merged.language === undefined) {
    return err(missingField('language'));
  }
  if (topic === undefined || topic.trim().length === 0) {
    return err(missingField('topic'));
  }
  if (merged.tone === undefined) {
    return err(missingField('tone'));
  }
  if (merged.audience === undefined) {
    return err(missingField('audience'));
  }
  if (merged.wordCount === undefined) {
    return err(missingField('wordCount'));
  }
  if (merged.sections === undefined) {
    return err(missingField('sections'));
  }
  if (merged.articleCount === undefined) {
    return err(missingField('articleCount'));
  }

  return ok({
    language: merged.language,
    topic: topic.trim(),
    tone: merged.tone,
    audience: merged.audience,
    keywords,
    wordCount: merged.wordCount,
    sections: merged.sections,
    articleCount: merged.articleCount,
    prompt: merged.prompt ?? null,
  });
}
