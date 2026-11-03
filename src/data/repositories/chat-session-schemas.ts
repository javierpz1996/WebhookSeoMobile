import * as v from 'valibot';

import type { ChatSession, NewChatSession, StoredChatMessage } from '@/core/types/chat-session';
import type { DbError } from '@/core/types/db-error';
import { err, ok, type Result } from '@/core/utils/result';

const chatStepIdSchema = v.picklist([
  'language',
  'topic',
  'tone',
  'audience',
  'keywords',
  'wordCount',
  'sections',
  'articleCount',
  'prompt',
]);

const storedChatMessageSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  role: v.picklist(['assistant', 'user', 'system']),
  stepId: v.optional(chatStepIdSchema),
  text: v.pipe(v.string(), v.minLength(1)),
});

export const chatSessionJsonSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  articleId: v.pipe(v.string(), v.minLength(1)),
  topic: v.pipe(v.string(), v.minLength(1)),
  messages: v.array(storedChatMessageSchema),
  createdAt: v.pipe(v.number(), v.integer()),
});

export function parseNewChatSession(input: NewChatSession): Result<NewChatSession, DbError> {
  const result = v.safeParse(
    v.object({
      articleId: v.pipe(v.string(), v.minLength(1)),
      topic: v.pipe(v.string(), v.minLength(1)),
      messages: v.pipe(v.array(storedChatMessageSchema), v.minLength(1)),
    }),
    input,
  );
  if (!result.success) {
    return err({ kind: 'validation', message: 'invalid chat session' });
  }
  return ok(result.output);
}

export function parseStoredMessagesJson(raw: string): Result<readonly StoredChatMessage[], DbError> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return err({ kind: 'validation', message: 'invalid chat messages json' });
  }
  const result = v.safeParse(v.array(storedChatMessageSchema), parsed);
  if (!result.success) {
    return err({ kind: 'validation', message: 'chat messages failed schema' });
  }
  return ok(result.output.map((message) => ({ ...message })));
}

export function serializeStoredMessages(messages: readonly StoredChatMessage[]): string {
  return JSON.stringify(messages);
}

export function toChatSession(row: {
  readonly id: string;
  readonly articleId: string;
  readonly topic: string;
  readonly messages: readonly StoredChatMessage[];
  readonly createdAt: number;
}): ChatSession {
  return {
    id: row.id,
    articleId: row.articleId,
    topic: row.topic,
    messages: row.messages.map((message) => ({ ...message })),
    createdAt: row.createdAt,
  };
}
