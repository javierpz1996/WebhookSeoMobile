import * as v from 'valibot';

import type { ContextKind, NewContextEntry } from '@/core/types/context-entry';
import type { DefaultableGenerationField } from '@/core/types/generation-params';
import type { DbError } from '@/core/types/db-error';
import { err, ok, type Result } from '@/core/utils/result';

const defaultFieldSchema = v.picklist([
  'language',
  'tone',
  'audience',
  'wordCount',
  'sections',
  'articleCount',
]);

export const contextEntryFormSchema = v.pipe(
  v.object({
    kind: v.picklist(['topic', 'keyword', 'default']),
    value: v.pipe(v.string(), v.minLength(1, 'context.errors.valueRequired')),
    defaultField: v.optional(defaultFieldSchema),
  }),
  v.check(
    (input) => input.kind !== 'default' || input.defaultField !== undefined,
    'context.errors.fieldRequired',
  ),
);

export type ContextEntryFormInput = v.InferInput<typeof contextEntryFormSchema>;
export type ContextEntryFormOutput = v.InferOutput<typeof contextEntryFormSchema>;

export function formOutputToNewContextEntry(
  output: ContextEntryFormOutput,
  options: { readonly id: string; readonly createdAt: number; readonly position: number },
): NewContextEntry {
  const meta =
    output.kind === 'default' && output.defaultField !== undefined
      ? { field: output.defaultField as DefaultableGenerationField }
      : null;

  return {
    id: options.id,
    kind: output.kind as ContextKind,
    value: output.value.trim(),
    meta,
    position: options.position,
    createdAt: options.createdAt,
  };
}

export function entryToFormValues(entry: {
  readonly kind: ContextKind;
  readonly value: string;
  readonly meta: { readonly field: DefaultableGenerationField } | null;
}): ContextEntryFormInput {
  return {
    kind: entry.kind,
    value: entry.value,
    defaultField: entry.meta?.field,
  };
}

export function parseContextEntryForm(
  input: ContextEntryFormInput,
): Result<ContextEntryFormOutput, DbError> {
  const parsed = v.safeParse(contextEntryFormSchema, input);
  if (!parsed.success) {
    return err({ kind: 'validation', message: 'invalid context form' });
  }
  return ok(parsed.output);
}
