import * as v from 'valibot';

import type { Article, FaqItem, NewArticle } from '@/core/types/article';
import type { GenerationParams } from '@/core/types/generation-params';
import type { DbError } from '@/core/types/db-error';
import type { SqlRow } from '@/core/ports/sql-driver';
import { normalizeArticleMarkdown } from '@/core/utils/normalize-article-markdown';
import { err, ok, type Result } from '@/core/utils/result';

const faqItemSchema = v.object({
  question: v.pipe(v.string(), v.minLength(1)),
  answer: v.pipe(v.string(), v.minLength(1)),
});

const generationParamsSchema = v.object({
  language: v.pipe(v.string(), v.minLength(1)),
  topic: v.pipe(v.string(), v.minLength(1)),
  tone: v.pipe(v.string(), v.minLength(1)),
  audience: v.pipe(v.string(), v.minLength(1)),
  keywords: v.array(v.pipe(v.string(), v.minLength(1))),
  wordCount: v.pipe(v.number(), v.integer(), v.minValue(1)),
  sections: v.pipe(v.number(), v.integer(), v.minValue(1)),
  articleCount: v.pipe(v.number(), v.integer(), v.minValue(1)),
  prompt: v.nullable(v.string()),
});

const newArticleSchema = v.object({
  id: v.optional(v.pipe(v.string(), v.minLength(1))),
  title: v.pipe(v.string(), v.minLength(1)),
  slug: v.nullable(v.string()),
  contentMarkdown: v.pipe(v.string(), v.minLength(1)),
  seoTitle: v.nullable(v.string()),
  seoDescription: v.nullable(v.string()),
  seoKeywords: v.array(v.pipe(v.string(), v.minLength(1))),
  faq: v.array(faqItemSchema),
  coverImageUrl: v.nullable(v.string()),
  language: v.pipe(v.string(), v.minLength(1)),
  topic: v.pipe(v.string(), v.minLength(1)),
  params: generationParamsSchema,
  createdAt: v.optional(v.pipe(v.number(), v.integer())),
});

const articleRowSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  title: v.pipe(v.string(), v.minLength(1)),
  slug: v.nullable(v.string()),
  content_markdown: v.pipe(v.string(), v.minLength(1)),
  seo_title: v.nullable(v.string()),
  seo_description: v.nullable(v.string()),
  seo_keywords: v.pipe(v.string(), v.minLength(2)),
  faq: v.pipe(v.string(), v.minLength(2)),
  cover_image_url: v.nullable(v.string()),
  language: v.pipe(v.string(), v.minLength(1)),
  topic: v.pipe(v.string(), v.minLength(1)),
  params: v.pipe(v.string(), v.minLength(2)),
  created_at: v.pipe(v.number(), v.integer()),
});

function normalizeFaqItems(faq: readonly FaqItem[]): readonly FaqItem[] {
  return faq.map((item) => ({
    question: normalizeArticleMarkdown(item.question),
    answer: normalizeArticleMarkdown(item.answer),
  }));
}

function normalizeNewArticle(article: NewArticle): NewArticle {
  return {
    ...article,
    contentMarkdown: normalizeArticleMarkdown(article.contentMarkdown),
    faq: normalizeFaqItems(article.faq),
    seoTitle:
      article.seoTitle !== null ? normalizeArticleMarkdown(article.seoTitle) : null,
    seoDescription:
      article.seoDescription !== null ? normalizeArticleMarkdown(article.seoDescription) : null,
  };
}

function normalizeStoredArticle(article: Article): Article {
  return {
    ...article,
    contentMarkdown: normalizeArticleMarkdown(article.contentMarkdown),
    faq: normalizeFaqItems(article.faq),
    seoTitle:
      article.seoTitle !== null ? normalizeArticleMarkdown(article.seoTitle) : null,
    seoDescription:
      article.seoDescription !== null ? normalizeArticleMarkdown(article.seoDescription) : null,
  };
}

function parseJson<T>(
  raw: string,
  schema: v.GenericSchema<T>,
): Result<T, DbError> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return err({ kind: 'validation', message: 'invalid json column' });
  }
  const result = v.safeParse(schema, parsed);
  if (!result.success) {
    return err({ kind: 'validation', message: 'row failed schema validation' });
  }
  return ok(result.output);
}

function mapRowToArticle(row: v.InferOutput<typeof articleRowSchema>): Result<Article, DbError> {
  const seoKeywords = parseJson(row.seo_keywords, v.array(v.pipe(v.string(), v.minLength(1))));
  if (!seoKeywords.ok) {
    return seoKeywords;
  }
  const faq = parseJson(row.faq, v.array(faqItemSchema));
  if (!faq.ok) {
    return faq;
  }
  const params = parseJson(row.params, generationParamsSchema);
  if (!params.ok) {
    return params;
  }

  return ok(
    normalizeStoredArticle({
      id: row.id,
      title: row.title,
      slug: row.slug,
      contentMarkdown: row.content_markdown,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      seoKeywords: seoKeywords.value,
      faq: faq.value,
      coverImageUrl: row.cover_image_url,
      language: row.language,
      topic: row.topic,
      params: params.value,
      createdAt: row.created_at,
    }),
  );
}

export function parseNewArticle(input: NewArticle): Result<NewArticle, DbError> {
  const parsed = v.safeParse(newArticleSchema, input);
  if (!parsed.success) {
    return err({ kind: 'validation', message: 'invalid article input' });
  }
  return ok(normalizeNewArticle(parsed.output));
}

export function parseArticleRow(row: SqlRow): Result<Article, DbError> {
  const parsed = v.safeParse(articleRowSchema, row);
  if (!parsed.success) {
    return err({ kind: 'validation', message: 'invalid article row' });
  }
  return mapRowToArticle(parsed.output);
}

export function serializeGenerationParams(params: GenerationParams): string {
  return JSON.stringify(params);
}

export function serializeFaq(faq: readonly FaqItem[]): string {
  return JSON.stringify(faq);
}

export function serializeKeywords(keywords: readonly string[]): string {
  return JSON.stringify(keywords);
}
