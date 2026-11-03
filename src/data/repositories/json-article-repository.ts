import { PAGE_SIZE } from '@/core/constants';
import type { Article, ArticlePage, NewArticle } from '@/core/types/article';
import type { DbError } from '@/core/types/db-error';
import type { ArticleRepository } from '@/core/ports/article-repository';
import { createId } from '@/core/utils/create-id';
import { err, ok, type Result } from '@/core/utils/result';

import type { JsonDocumentStore } from '@/data/persistence/json-document-store';
import { parseNewArticle } from '@/data/repositories/article-schemas';

export function createJsonArticleRepository(store: JsonDocumentStore): ArticleRepository {
  return {
    save(input: NewArticle): Result<Article, DbError> {
      const parsed = parseNewArticle(input);
      if (!parsed.ok) {
        return parsed;
      }
      const articleInput = parsed.value;
      const id = articleInput.id ?? createId();
      const createdAt = articleInput.createdAt ?? Date.now();
      const article: Article = {
        id,
        title: articleInput.title,
        slug: articleInput.slug,
        contentMarkdown: articleInput.contentMarkdown,
        seoTitle: articleInput.seoTitle,
        seoDescription: articleInput.seoDescription,
        seoKeywords: articleInput.seoKeywords,
        faq: articleInput.faq,
        coverImageUrl: articleInput.coverImageUrl,
        language: articleInput.language,
        topic: articleInput.topic,
        params: articleInput.params,
        createdAt,
      };

      return store.update((doc) => {
        const withoutDuplicate = doc.articles.filter((item) => item.id !== id);
        const articles = [...withoutDuplicate, article].sort((a, b) => b.createdAt - a.createdAt);
        return ok({ doc: { ...doc, articles }, value: article });
      });
    },

    list(page: number): Result<ArticlePage, DbError> {
      if (!Number.isInteger(page) || page < 0) {
        return err({ kind: 'validation', message: 'invalid page' });
      }
      const sorted = [...store.get().articles].sort((a, b) => b.createdAt - a.createdAt);
      const offset = page * PAGE_SIZE;
      const slice = sorted.slice(offset, offset + PAGE_SIZE + 1);
      const hasMore = slice.length > PAGE_SIZE;
      const items = hasMore ? slice.slice(0, PAGE_SIZE) : slice;
      return ok({ items, page, hasMore });
    },

    remove(id: string): Result<void, DbError> {
      const exists = store.get().articles.some((item) => item.id === id);
      if (!exists) {
        return err({ kind: 'not-found' });
      }
      return store.update((doc) =>
        ok({
          doc: { ...doc, articles: doc.articles.filter((item) => item.id !== id) },
          value: undefined,
        }),
      );
    },

    getById(id: string): Result<Article, DbError> {
      const article = store.get().articles.find((item) => item.id === id);
      if (article === undefined) {
        return err({ kind: 'not-found' });
      }
      return ok(article);
    },
  };
}
