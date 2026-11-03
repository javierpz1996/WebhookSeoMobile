import { isOk } from '@/core/utils/result';
import {
  contextEntryFormSchema,
  formOutputToNewContextEntry,
  parseContextEntryForm,
} from '@/features/context/model/context-entry-form-schema';
import * as v from 'valibot';

describe('contextEntryFormSchema', () => {
  it('rechaza default sin campo meta', () => {
    const parsed = v.safeParse(contextEntryFormSchema, {
      kind: 'default',
      value: 'formal',
    });
    expect(parsed.success).toBe(false);
  });

  it('acepta topic con valor', () => {
    const parsed = parseContextEntryForm({
      kind: 'topic',
      value: 'Finanzas',
    });
    expect(isOk(parsed)).toBe(true);
  });

  it('mapea default a NewContextEntry', () => {
    const parsed = parseContextEntryForm({
      kind: 'default',
      value: 'es',
      defaultField: 'language',
    });
    expect(isOk(parsed)).toBe(true);
    if (!isOk(parsed)) {
      return;
    }
    const entry = formOutputToNewContextEntry(parsed.value, {
      id: 'id-1',
      createdAt: 100,
      position: 0,
    });
    expect(entry.meta).toEqual({ field: 'language' });
    expect(entry.value).toBe('es');
  });
});
