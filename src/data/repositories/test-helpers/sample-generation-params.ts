import type { GenerationParams } from '@/core/types/generation-params';

export function sampleGenerationParams(
  overrides: Partial<GenerationParams> = {},
): GenerationParams {
  return {
    language: 'es',
    topic: 'inversión',
    tone: 'formal',
    audience: 'principiantes',
    keywords: ['bitcoin'],
    wordCount: 1200,
    sections: 5,
    articleCount: 1,
    prompt: null,
    ...overrides,
  };
}
