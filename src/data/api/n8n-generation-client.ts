import type { Article } from '@/core/types/article';
import {
  GENERATION_TIMEOUT_MS,
  N8N_EMPTY_RESPONSE_MAX_ATTEMPTS,
  N8N_EMPTY_RESPONSE_RETRY_MS,
} from '@/core/constants';
import type { GenerationError } from '@/core/types/generation-error';
import type {
  GenerationClient,
  GenerationRequest,
} from '@/core/ports/generation-client';
import { createId } from '@/core/utils/create-id';
import { err, isOk, ok, type Result } from '@/core/utils/result';

import { buildGenerationFormData } from '@/data/api/build-generation-form-data';
import { parseGenerationResponse } from '@/data/api/generation-response-schema';
import type { GenerationResponseDto } from '@/data/api/generation-response-schema';
import { mapGeneratedArticleWithThematicMedia } from '@/data/api/map-generated-article-with-thematic-media';

export type N8nGenerationClientOptions = {
  readonly url: string;
  readonly token: string | null;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
};

function mapHttpError(status: number): GenerationError {
  return { kind: 'http-error', status };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function readGenerationResponse(
  response: Response,
): Promise<Result<unknown, GenerationError>> {
  try {
    return ok((await response.json()) as unknown);
  } catch {
    return err({ kind: 'invalid-response' });
  }
}

export function createN8nGenerationClient(
  options: N8nGenerationClientOptions,
): GenerationClient {
  const timeoutMs = options.timeoutMs ?? GENERATION_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async generate(request: GenerationRequest): Promise<Result<readonly Article[], GenerationError>> {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      try {
        const headers: Record<string, string> = {};
        if (options.token !== null) {
          headers['x-api-key'] = options.token;
        }

        const body = buildGenerationFormData(request.params, request.contextJson);
        let parsed: GenerationResponseDto | null = null;

        for (let attempt = 0; attempt < N8N_EMPTY_RESPONSE_MAX_ATTEMPTS; attempt += 1) {
          const response = await fetchImpl(options.url, {
            method: 'POST',
            headers,
            body,
            signal: controller.signal,
          });

          if (!response.ok) {
            return err(mapHttpError(response.status));
          }

          const jsonResult = await readGenerationResponse(response);
          if (!isOk(jsonResult)) {
            return jsonResult;
          }

          parsed = parseGenerationResponse(jsonResult.value);
          if (parsed !== null) {
            break;
          }

          if (attempt + 1 < N8N_EMPTY_RESPONSE_MAX_ATTEMPTS) {
            await delay(N8N_EMPTY_RESPONSE_RETRY_MS);
          }
        }

        if (parsed === null) {
          return err({ kind: 'invalid-response' });
        }

        const now = Date.now();
        const articles: Article[] = await Promise.all(
          parsed.articles.map(async (dto, index) => {
            const createdAt = now + index;
            const mapped = await mapGeneratedArticleWithThematicMedia(
              dto,
              request.params,
              createdAt,
              { fetchImpl },
            );
            return {
              ...mapped,
              id: createId(),
              createdAt,
            };
          }),
        );

        return ok(articles);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return err({ kind: 'timeout' });
        }
        const message = error instanceof Error ? error.message : 'unknown failure';
        return err({ kind: 'unknown', message });
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
