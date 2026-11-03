import { PAGE_SIZE } from '@/core/constants';
import type { Article, ArticlePage, NewArticle } from '@/core/types/article';
import type { DbError } from '@/core/types/db-error';
import type { ArticleRepository } from '@/core/ports/article-repository';
import type { SqlDriver, SqlRow } from '@/core/ports/sql-driver';
import { createId } from '@/core/utils/create-id';
import { err, ok, type Result } from '@/core/utils/result';

import {
  parseArticleRow,
  parseNewArticle,
  serializeFaq,
  serializeGenerationParams,
  serializeKeywords,
} from '@/data/repositories/article-schemas';

export function createArticleRepository(driver: SqlDriver): ArticleRepository {
  return {
    save(input: NewArticle): Result<Article, DbError> {
      const parsed = parseNewArticle(input);
      if (!parsed.ok) {
        return parsed;
      }
      const articleInput = parsed.value;
      const id = articleInput.id ?? createId();
      const createdAt = articleInput.createdAt ?? Date.now();

      const insert = driver.run(
        `INSERT INTO articles (
          id, title, slug, content_markdown, seo_title, seo_description, seo_keywords,
          faq, cover_image_url, language, topic, params, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          articleInput.title,
          articleInput.slug,
          articleInput.contentMarkdown,
          articleInput.seoTitle,
          articleInput.seoDescription,
          serializeKeywords(articleInput.seoKeywords),
          serializeFaq(articleInput.faq),
          articleInput.coverImageUrl,
          articleInput.language,
          articleInput.topic,
          serializeGenerationParams(articleInput.params),
          createdAt,
        ],
      );
      if (!insert.ok) {
        return insert;
      }

      return {
        ok: true,
        value: {
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
        },
      };
    },

    list(page: number): Result<ArticlePage, DbError> {
      if (!Number.isInteger(page) || page < 0) {
        return err({ kind: 'validation', message: 'invalid page' });
      }

      const offset = page * PAGE_SIZE;
      const rowsResult = driver.getAll<SqlRow>(
        `SELECT id, title, slug, content_markdown, seo_title, seo_description, seo_keywords,
                faq, cover_image_url, language, topic, params, created_at
         FROM articles
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [PAGE_SIZE + 1, offset],
      );
      if (!rowsResult.ok) {
        return rowsResult;
      }

      const rows = rowsResult.value;
      const hasMore = rows.length > PAGE_SIZE;
      const slice = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

      const items: Article[] = [];
      for (const row of slice) {
        const parsedRow = parseArticleRow(row);
        if (!parsedRow.ok) {
          continue;
        }
        items.push(parsedRow.value);
      }

      return ok({ items, page, hasMore });
    },

    remove(id: string): Result<void, DbError> {
      const existing = driver.getFirst<{ id: string }>(
        'SELECT id FROM articles WHERE id = ?',
        [id],
      );
      if (!existing.ok) {
        return existing;
      }
      if (existing.value === null) {
        return err({ kind: 'not-found' });
      }
      return driver.run('DELETE FROM articles WHERE id = ?', [id]);
    },

    getById(id: string): Result<Article, DbError> {
      const row = driver.getFirst<SqlRow>(
        `SELECT id, title, slug, content_markdown, seo_title, seo_description, seo_keywords,
                faq, cover_image_url, language, topic, params, created_at
         FROM articles WHERE id = ?`,
        [id],
      );
      if (!row.ok) {
        return row;
      }
      if (row.value === null) {
        return err({ kind: 'not-found' });
      }
      const parsed = parseArticleRow(row.value);
      if (!parsed.ok) {
        return parsed;
      }
      return parsed;
    },
  };
}
