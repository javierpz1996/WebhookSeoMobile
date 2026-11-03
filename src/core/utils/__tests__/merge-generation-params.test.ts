import type { ContextEntry } from '@/core/types/context-entry';
import { isOk } from '@/core/utils/result';
import { mergeGenerationParams } from '@/core/utils/merge-generation-params';

describe('mergeGenerationParams', () => {
  const contextEntries: readonly ContextEntry[] = [
    {
      id: 'd1',
      kind: 'default',
      value: 'es',
      meta: { field: 'language' },
      position: 0,
      createdAt: 1,
    },
    {
      id: 'd2',
      kind: 'default',
      value: '1200',
      meta: { field: 'wordCount' },
      position: 1,
      createdAt: 2,
    },
    {
      id: 'k1',
      kind: 'keyword',
      value: 'bitcoin',
      meta: null,
      position: 0,
      createdAt: 3,
    },
  ];

  it('completa defaults cuando faltan campos', () => {
    const result = mergeGenerationParams(
      {
        topic: 'inversión',
        tone: 'formal',
        audience: 'principiantes',
        sections: 5,
        articleCount: 2,
      },
      contextEntries,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.language).toBe('es');
      expect(result.value.wordCount).toBe(1200);
      expect(result.value.keywords).toEqual(['bitcoin']);
    }
  });

  it('no pisa valores explícitos', () => {
    const result = mergeGenerationParams(
      {
        language: 'en',
        topic: 'crypto',
        tone: 'formal',
        audience: 'pro',
        wordCount: 800,
        sections: 4,
        articleCount: 1,
        keywords: ['eth'],
      },
      contextEntries,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.language).toBe('en');
      expect(result.value.wordCount).toBe(800);
      expect(result.value.keywords).toEqual(['eth']);
    }
  });
});
