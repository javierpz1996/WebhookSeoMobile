import { buildContextPayload } from '@/core/utils/context-payload';

describe('buildContextPayload', () => {
  it('serializa topics, keywords y defaults', () => {
    const payload = buildContextPayload([
      {
        id: '1',
        kind: 'topic',
        value: 'Finanzas',
        meta: null,
        position: 0,
        createdAt: 1,
      },
      {
        id: '2',
        kind: 'keyword',
        value: 'btc',
        meta: null,
        position: 0,
        createdAt: 2,
      },
      {
        id: '3',
        kind: 'default',
        value: 'formal',
        meta: { field: 'tone' },
        position: 0,
        createdAt: 3,
      },
    ]);
    expect(payload.topics).toEqual(['Finanzas']);
    expect(payload.keywords).toEqual(['btc']);
    expect(payload.defaults.tone).toBe('formal');
  });
});
