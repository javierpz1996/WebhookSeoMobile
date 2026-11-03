import type { Article, ArticlePage } from '@/core/types/article';

export type PaginatedArticles = {
  readonly items: readonly Article[];
  readonly page: number;
  readonly hasMore: boolean;
};

export function mergeArticlePage(
  current: PaginatedArticles | null,
  pageResult: ArticlePage,
): PaginatedArticles {
  if (pageResult.page === 0) {
    return {
      items: pageResult.items,
      page: 0,
      hasMore: pageResult.hasMore,
    };
  }
  const previous = current?.items ?? [];
  return {
    items: [...previous, ...pageResult.items],
    page: pageResult.page,
    hasMore: pageResult.hasMore,
  };
}
