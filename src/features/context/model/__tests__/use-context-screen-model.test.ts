import type { ContextEntry } from '@/core/types/context-entry';
import {
  groupEntriesByKind,
  nextPositionForKind,
} from '@/features/context/model/use-context-screen-model';

describe('useContextScreenModel helpers', () => {
  const entries: readonly ContextEntry[] = [
    {
      id: '1',
      kind: 'topic',
      value: 'A',
      meta: null,
      position: 0,
      createdAt: 1,
    },
    {
      id: '2',
      kind: 'keyword',
      value: 'k1',
      meta: null,
      position: 1,
      createdAt: 2,
    },
    {
      id: '3',
      kind: 'keyword',
      value: 'k2',
      meta: null,
      position: 4,
      createdAt: 3,
    },
  ];

  it('agrupa por kind', () => {
    const grouped = groupEntriesByKind(entries);
    expect(grouped.topic).toHaveLength(1);
    expect(grouped.keyword).toHaveLength(2);
    expect(grouped.default).toHaveLength(0);
  });

  it('calcula la siguiente posición', () => {
    expect(nextPositionForKind(entries, 'keyword')).toBe(5);
    expect(nextPositionForKind(entries, 'default')).toBe(0);
  });
});
