import * as v from 'valibot';

import type { Article } from '@/core/types/article';
import type { ChatSession } from '@/core/types/chat-session';
import type { ContextEntry } from '@/core/types/context-entry';
import type { DbError } from '@/core/types/db-error';
import { err, ok, type Result } from '@/core/utils/result';

import { chatSessionJsonSchema } from '@/data/repositories/chat-session-schemas';

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

export const articleJsonSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
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
  createdAt: v.pipe(v.number(), v.integer()),
});

const defaultContextMetaSchema = v.object({
  field: v.picklist(['language', 'tone', 'audience', 'wordCount', 'sections', 'articleCount']),
});

export const contextEntryJsonSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  kind: v.picklist(['topic', 'keyword', 'default']),
  value: v.pipe(v.string(), v.minLength(1)),
  meta: v.nullable(defaultContextMetaSchema),
  position: v.pipe(v.number(), v.integer()),
  createdAt: v.pipe(v.number(), v.integer()),
});

export type JsonDocument = {
  readonly version: 2;
  readonly articles: readonly Article[];
  readonly contextEntries: readonly ContextEntry[];
  readonly chatSessions: readonly ChatSession[];
};

const jsonDocumentV1Schema = v.object({
  version: v.literal(1),
  articles: v.array(articleJsonSchema),
  contextEntries: v.array(contextEntryJsonSchema),
});

export const jsonDocumentSchema = v.object({
  version: v.literal(2),
  articles: v.array(articleJsonSchema),
  contextEntries: v.array(contextEntryJsonSchema),
  chatSessions: v.array(chatSessionJsonSchema),
});

function normalizeArticles(
  articles: v.InferOutput<typeof articleJsonSchema>[],
): readonly Article[] {
  return articles.map((article) => ({
    ...article,
    seoKeywords: [...article.seoKeywords],
    faq: [...article.faq],
    params: { ...article.params, keywords: [...article.params.keywords] },
  }));
}

function normalizeContextEntries(
  entries: v.InferOutput<typeof contextEntryJsonSchema>[],
): readonly ContextEntry[] {
  return entries.map((entry) => ({ ...entry, meta: entry.meta }));
}

function normalizeChatSessions(
  sessions: v.InferOutput<typeof chatSessionJsonSchema>[],
): readonly ChatSession[] {
  return sessions.map((session) => ({
    ...session,
    messages: session.messages.map((message) => ({ ...message })),
  }));
}

export function emptyJsonDocument(): JsonDocument {
  return { version: 2, articles: [], contextEntries: [], chatSessions: [] };
}

export function parseStoredJsonDocument(raw: string): Result<JsonDocument, DbError> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return err({ kind: 'validation', message: 'invalid json document' });
  }

  const v2 = v.safeParse(jsonDocumentSchema, parsed);
  if (v2.success) {
    const output = v2.output;
    return ok({
      version: 2,
      articles: normalizeArticles(output.articles),
      contextEntries: normalizeContextEntries(output.contextEntries),
      chatSessions: normalizeChatSessions(output.chatSessions),
    });
  }

  const v1 = v.safeParse(jsonDocumentV1Schema, parsed);
  if (v1.success) {
    const output = v1.output;
    return ok({
      version: 2,
      articles: normalizeArticles(output.articles),
      contextEntries: normalizeContextEntries(output.contextEntries),
      chatSessions: [],
    });
  }

  return err({ kind: 'validation', message: 'json document failed schema' });
}
