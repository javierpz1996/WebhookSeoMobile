import type { GenerationError } from '@/core/types/generation-error';

export function generationErrorMessageKey(error: GenerationError): string {
  switch (error.kind) {
    case 'network-offline':
      return 'api.errors.networkOffline';
    case 'timeout':
      return 'api.errors.timeout';
    case 'invalid-response':
      return 'api.errors.invalidResponse';
    case 'http-error':
      return error.status === 429 ? 'api.errors.rateLimit' : 'api.errors.httpError';
    case 'unknown':
      return 'api.errors.unknown';
  }
}
