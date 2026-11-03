import type { Article } from '@/core/types/article';
import type { GenerationParams } from '@/core/types/generation-params';
import type { GenerationError } from '@/core/types/generation-error';
import type { Result } from '@/core/utils/result';

export type GenerationRequest = {
  readonly params: GenerationParams;
  readonly contextJson: string;
};

export type GenerationClient = {
  generate(request: GenerationRequest): Promise<Result<readonly Article[], GenerationError>>;
};
