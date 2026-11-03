import * as v from 'valibot';

import { normalizeArticleMarkdown } from '@/core/utils/normalize-article-markdown';

import {
  generatedArticleDtoSchema,
  type GeneratedArticleDto,
} from '@/data/api/generated-article-dto-schema';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

function parseFaq(value: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const items: { question: string; answer: string }[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }
    const question = entry.question;
    const answer = entry.answer;
    if (typeof question === 'string' && typeof answer === 'string' && question.length > 0 && answer.length > 0) {
      items.push({ question, answer });
    }
  }
  return items;
}

function pickString(record: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

export function unwrapArticlePayload(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const directTitle = pickString(value, ['title']);
  const directContent = pickString(value, ['content', 'contentMarkdown', 'body', 'markdown']);
  if (directTitle !== null && directContent !== null) {
    return value;
  }

  if (isRecord(value.article)) {
    return value.article;
  }

  if (Array.isArray(value.articles) && value.articles.length > 0) {
    return value.articles[0];
  }

  return value;
}

export function coerceGeneratedArticleDto(value: unknown): GeneratedArticleDto | null {
  const unwrapped = unwrapArticlePayload(value);
  if (!isRecord(unwrapped)) {
    return null;
  }

  const title = pickString(unwrapped, ['title']);
  const content = pickString(unwrapped, ['content', 'contentMarkdown', 'body', 'markdown']);
  if (title === null || content === null) {
    return null;
  }

  const seoRecord = isRecord(unwrapped.seo) ? unwrapped.seo : {};
  const seoTitleRaw = seoRecord.title;
  const seoDescriptionRaw = seoRecord.description;
  const seoTitle =
    typeof seoTitleRaw === 'string' && seoTitleRaw.trim().length > 0 ? seoTitleRaw.trim() : title;
  const seoDescription =
    typeof seoDescriptionRaw === 'string' && seoDescriptionRaw.trim().length > 0
      ? seoDescriptionRaw.trim()
      : null;
  const seoKeywords = parseKeywords(seoRecord.keywords ?? unwrapped.keywords);

  const slugRaw = unwrapped.slug;
  const slug =
    typeof slugRaw === 'string' && slugRaw.trim().length > 0 ? slugRaw.trim() : null;

  const coverRaw = unwrapped.coverImage ?? unwrapped.cover_image;
  const coverImage =
    typeof coverRaw === 'string' && coverRaw.trim().length > 0 ? coverRaw.trim() : null;

  const candidate = {
    title,
    slug,
    seo: {
      title: seoTitle,
      description: seoDescription,
      keywords: seoKeywords,
    },
    content: normalizeArticleMarkdown(content),
    faq: parseFaq(unwrapped.faq).map((item) => ({
      question: normalizeArticleMarkdown(item.question),
      answer: normalizeArticleMarkdown(item.answer),
    })),
    coverImage,
  };

  const parsed = v.safeParse(generatedArticleDtoSchema, candidate);
  if (!parsed.success) {
    return null;
  }
  return parsed.output;
}
