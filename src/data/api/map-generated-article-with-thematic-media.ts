import type { NewArticle } from '@/core/types/article';
import type { GenerationParams } from '@/core/types/generation-params';

import {
  enrichArticleMediaAsync,
  type EnrichedArticleMedia,
} from '@/data/api/enrich-article-media';
import type { GeneratedArticleDto } from '@/data/api/generation-response-schema';
import { mapGeneratedArticleDto } from '@/data/api/map-generation-response';

export async function mapGeneratedArticleWithThematicMedia(
  dto: GeneratedArticleDto,
  params: GenerationParams,
  createdAt: number,
  options?: { readonly fetchImpl?: typeof fetch },
): Promise<NewArticle> {
  const media: EnrichedArticleMedia = await enrichArticleMediaAsync(
    { title: dto.title, content: dto.content, coverImage: dto.coverImage },
    {
      topic: params.topic,
      sections: params.sections,
      keywords: params.keywords,
      language: params.language,
    },
    options,
  );

  return mapGeneratedArticleDto(dto, params, createdAt, media);
}
