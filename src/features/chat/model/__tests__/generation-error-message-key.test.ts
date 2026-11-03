import { generationErrorMessageKey } from '@/features/chat/model/generation-error-message-key';

describe('generationErrorMessageKey', () => {
  it('mapea los cinco errores de api.md', () => {
    expect(generationErrorMessageKey({ kind: 'network-offline' })).toBe(
      'api.errors.networkOffline',
    );
    expect(generationErrorMessageKey({ kind: 'timeout' })).toBe('api.errors.timeout');
    expect(generationErrorMessageKey({ kind: 'http-error', status: 500 })).toBe(
      'api.errors.httpError',
    );
    expect(generationErrorMessageKey({ kind: 'http-error', status: 429 })).toBe(
      'api.errors.rateLimit',
    );
    expect(generationErrorMessageKey({ kind: 'invalid-response' })).toBe(
      'api.errors.invalidResponse',
    );
    expect(generationErrorMessageKey({ kind: 'unknown', message: 'x' })).toBe(
      'api.errors.unknown',
    );
  });
});
