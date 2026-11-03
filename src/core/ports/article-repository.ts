import type { Article, ArticlePage, NewArticle } from '@/core/types/article';
import type { DbError } from '@/core/types/db-error';
import type { Result } from '@/core/utils/result';

export type ArticleRepository = {
  save(article: NewArticle): Result<Article, DbError>;
  list(page: number): Result<ArticlePage, DbError>;
  remove(id: string): Result<void, DbError>;
  getById(id: string): Result<Article, DbError>;
};
