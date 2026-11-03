import type { NewArticle } from '@/core/types/article';
import type { GenerationParams } from '@/core/types/generation-params';

import type { EnrichedArticleMedia } from '@/data/api/enrich-article-media';
import type { GeneratedArticleDto } from '@/data/api/generation-response-schema';

export function mapGeneratedArticleDto(
  dto: GeneratedArticleDto,
  params: GenerationParams,
  createdAt: number,
  media?: EnrichedArticleMedia,
): NewArticle {
  const resolvedMedia =
    media ??
    ({
      content: dto.content,
      coverImageUrl: dto.coverImage ?? null,
    } satisfies EnrichedArticleMedia);

  return {
    title: dto.title,
    slug: dto.slug ?? null,
    contentMarkdown: resolvedMedia.content,
    seoTitle: dto.seo.title,
    seoDescription: dto.seo.description,
    seoKeywords: dto.seo.keywords,
    faq: dto.faq,
    coverImageUrl: resolvedMedia.coverImageUrl,
    language: params.language,
    topic: params.topic,
    params,
    createdAt,
  };
}
