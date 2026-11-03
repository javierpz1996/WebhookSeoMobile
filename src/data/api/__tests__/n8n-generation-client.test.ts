import { createN8nGenerationClient } from '@/data/api/n8n-generation-client';
import { sampleGenerationParams } from '@/data/repositories/test-helpers/sample-generation-params';
import { isOk } from '@/core/utils/result';

describe('n8n generation client', () => {
  it('mapea timeout cuando fetch aborta', async () => {
    const fetchImpl = jest.fn((_url: string, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (signal !== undefined && signal !== null) {
          signal.addEventListener('abort', () => {
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
          });
        }
      });
    });

    const client = createN8nGenerationClient({
      url: 'https://example.test/webhook',
      token: null,
      timeoutMs: 5,
      fetchImpl: fetchImpl as typeof fetch,
    });

    const result = await client.generate({
      params: sampleGenerationParams(),
      contextJson: '{}',
    });

    expect(isOk(result)).toBe(false);
    if (!isOk(result)) {
      expect(result.error.kind).toBe('timeout');
    }
  });

  it('mapea http-error', async () => {
    const client = createN8nGenerationClient({
      url: 'https://example.test/webhook',
      token: null,
      fetchImpl: (async () =>
        new Response('fail', { status: 500 })) as typeof fetch,
    });

    const result = await client.generate({
      params: sampleGenerationParams(),
      contextJson: '{}',
    });

    expect(isOk(result)).toBe(false);
    if (!isOk(result)) {
      expect(result.error).toEqual({ kind: 'http-error', status: 500 });
    }
  });
});
