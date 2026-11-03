import { useCallback, useEffect, useState } from 'react';

import type { Article } from '@/core/types/article';
import type { DbError } from '@/core/types/db-error';
import { isOk } from '@/core/utils/result';
import type { ArticleRepository } from '@/core/ports/article-repository';
import { useAppData } from '@/composition/app-data-provider';

export type ArticleDetailState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'error'; readonly messageKey: string }
  | { readonly kind: 'ready'; readonly article: Article };

function dbErrorMessageKey(_error: DbError): string {
  return 'articles.error.title';
}

function resolveArticleDetailState(
  articleId: string | undefined,
  articles: ArticleRepository,
): ArticleDetailState {
  if (articleId === undefined || articleId.length === 0) {
    return { kind: 'not-found' };
  }
  const result = articles.getById(articleId);
  if (!isOk(result)) {
    if (result.error.kind === 'not-found') {
      return { kind: 'not-found' };
    }
    return { kind: 'error', messageKey: dbErrorMessageKey(result.error) };
  }
  return { kind: 'ready', article: result.value };
}

export function useArticleDetailModel(articleId: string | undefined) {
  const { articles } = useAppData();
  const [state, setState] = useState<ArticleDetailState>(() =>
    resolveArticleDetailState(articleId, articles),
  );

  const load = useCallback(() => {
    setState(resolveArticleDetailState(articleId, articles));
  }, [articleId, articles]);

  useEffect(() => {
    load();
  }, [load]);

  return { state, reload: load };
}
