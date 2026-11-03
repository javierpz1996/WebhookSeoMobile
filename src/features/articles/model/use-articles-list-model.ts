import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import type { Article } from '@/core/types/article';
import type { DbError } from '@/core/types/db-error';
import { isOk } from '@/core/utils/result';
import { useAppData } from '@/composition/app-data-provider';
import { mergeArticlePage } from '@/features/articles/model/merge-article-page';

export type ArticlesListState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'empty' }
  | { readonly kind: 'error'; readonly messageKey: string }
  | {
      readonly kind: 'ready';
      readonly items: readonly Article[];
      readonly page: number;
      readonly hasMore: boolean;
      readonly loadingMore: boolean;
    };

function dbErrorMessageKey(_error: DbError): string {
  return 'articles.error.title';
}

export function useArticlesListModel() {
  const { articles } = useAppData();
  const [state, setState] = useState<ArticlesListState>({ kind: 'loading' });
  const stateRef = useRef(state);
  stateRef.current = state;

  const applyPage = useCallback((page: number) => {
    const result = articles.list(page);
    if (!isOk(result)) {
      if (page === 0) {
        setState({ kind: 'error', messageKey: dbErrorMessageKey(result.error) });
      } else if (stateRef.current.kind === 'ready') {
        setState({ ...stateRef.current, loadingMore: false });
      }
      return;
    }
    if (page === 0 && result.value.items.length === 0) {
      setState({ kind: 'empty' });
      return;
    }

    const previous =
      page === 0 || stateRef.current.kind !== 'ready'
        ? null
        : {
            items: stateRef.current.items,
            page: stateRef.current.page,
            hasMore: stateRef.current.hasMore,
          };

    const merged = mergeArticlePage(previous, result.value);

    setState({
      kind: 'ready',
      items: merged.items,
      page: merged.page,
      hasMore: merged.hasMore,
      loadingMore: false,
    });
  }, [articles]);

  const loadInitial = useCallback(() => {
    setState({ kind: 'loading' });
    applyPage(0);
  }, [applyPage]);

  const refreshOnFocus = useCallback(() => {
    if (stateRef.current.kind === 'ready' || stateRef.current.kind === 'empty') {
      applyPage(0);
    }
  }, [applyPage]);

  const loadMore = useCallback(() => {
    const current = stateRef.current;
    if (current.kind !== 'ready' || !current.hasMore || current.loadingMore) {
      return;
    }
    setState({ ...current, loadingMore: true });
    applyPage(current.page + 1);
  }, [applyPage]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useFocusEffect(
    useCallback(() => {
      refreshOnFocus();
    }, [refreshOnFocus]),
  );

  return { state, reload: loadInitial, loadMore };
}
