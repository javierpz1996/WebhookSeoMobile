import * as v from 'valibot';

import type { ContextEntry, ContextKind, NewContextEntry } from '@/core/types/context-entry';
import type { DbError } from '@/core/types/db-error';
import type { SqlRow } from '@/core/ports/sql-driver';
import { err, ok, type Result } from '@/core/utils/result';

const defaultMetaSchema = v.object({
  field: v.picklist([
    'language',
    'tone',
    'audience',
    'wordCount',
    'sections',
    'articleCount',
  ]),
});

const newContextEntrySchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  kind: v.picklist(['topic', 'keyword', 'default']),
  value: v.pipe(v.string(), v.minLength(1)),
  meta: v.nullable(defaultMetaSchema),
  position: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  createdAt: v.pipe(v.number(), v.integer()),
});

const contextRowSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  kind: v.picklist(['topic', 'keyword', 'default']),
  value: v.pipe(v.string(), v.minLength(1)),
  meta: v.nullable(v.string()),
  position: v.pipe(v.number(), v.integer()),
  created_at: v.pipe(v.number(), v.integer()),
});

export function parseNewContextEntry(
  input: NewContextEntry,
): Result<NewContextEntry, DbError> {
  const parsed = v.safeParse(newContextEntrySchema, input);
  if (!parsed.success) {
    return err({ kind: 'validation', message: 'invalid context entry input' });
  }
  return ok(parsed.output);
}

function parseMeta(raw: string | null): Result<ContextEntry['meta'], DbError> {
  if (raw === null) {
    return ok(null);
  }
  let json: unknown;
  try {
    json = JSON.parse(raw) as unknown;
  } catch {
    return err({ kind: 'validation', message: 'invalid context meta json' });
  }
  const parsed = v.safeParse(defaultMetaSchema, json);
  if (!parsed.success) {
    return err({ kind: 'validation', message: 'invalid context meta schema' });
  }
  return ok(parsed.output);
}

export function parseContextRow(row: SqlRow): Result<ContextEntry, DbError> {
  const parsed = v.safeParse(contextRowSchema, row);
  if (!parsed.success) {
    return err({ kind: 'validation', message: 'invalid context row' });
  }
  const meta = parseMeta(parsed.output.meta);
  if (!meta.ok) {
    return meta;
  }
  return ok({
    id: parsed.output.id,
    kind: parsed.output.kind as ContextKind,
    value: parsed.output.value,
    meta: meta.value,
    position: parsed.output.position,
    createdAt: parsed.output.created_at,
  });
}

export function serializeContextMeta(meta: NewContextEntry['meta']): string | null {
  if (meta === null) {
    return null;
  }
  return JSON.stringify(meta);
}
