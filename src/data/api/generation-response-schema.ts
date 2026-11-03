import * as v from 'valibot';

import {
  generationResponseSchema,
  generatedArticleDtoSchema,
  type GeneratedArticleDto,
  type GenerationResponseDto,
} from '@/data/api/generated-article-dto-schema';
import { normalizeGenerationResponseJson } from '@/data/api/normalize-generation-response-json';

export {
  generatedArticleDtoSchema,
  generationResponseSchema,
  type GeneratedArticleDto,
  type GenerationResponseDto,
};

export function parseGenerationResponse(json: unknown): v.InferOutput<typeof generationResponseSchema> | null {
  const normalized = normalizeGenerationResponseJson(json);
  const parsed = v.safeParse(generationResponseSchema, normalized);
  if (!parsed.success) {
    return null;
  }
  return parsed.output;
}
