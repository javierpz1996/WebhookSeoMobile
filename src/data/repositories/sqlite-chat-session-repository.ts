import type { ChatSession, NewChatSession } from '@/core/types/chat-session';
import type { DbError } from '@/core/types/db-error';
import type { ChatSessionRepository } from '@/core/ports/chat-session-repository';
import type { SqlDriver, SqlRow } from '@/core/ports/sql-driver';
import { createId } from '@/core/utils/create-id';
import { err, ok, type Result } from '@/core/utils/result';

import {
  parseNewChatSession,
  parseStoredMessagesJson,
  serializeStoredMessages,
  toChatSession,
} from '@/data/repositories/chat-session-schemas';

function parseChatSessionRow(row: SqlRow): Result<ChatSession, DbError> {
  const id = row['id'];
  const articleId = row['article_id'];
  const topic = row['topic'];
  const messagesRaw = row['messages'];
  const createdAt = row['created_at'];

  if (typeof id !== 'string' || typeof articleId !== 'string' || typeof topic !== 'string') {
    return err({ kind: 'validation', message: 'invalid chat session row' });
  }
  if (typeof messagesRaw !== 'string') {
    return err({ kind: 'validation', message: 'invalid chat session messages' });
  }
  const createdAtNumber = typeof createdAt === 'number' ? createdAt : Number(createdAt);
  if (!Number.isInteger(createdAtNumber)) {
    return err({ kind: 'validation', message: 'invalid chat session created_at' });
  }

  const messagesResult = parseStoredMessagesJson(messagesRaw);
  if (!messagesResult.ok) {
    return messagesResult;
  }

  return ok(
    toChatSession({
      id,
      articleId,
      topic,
      messages: messagesResult.value,
      createdAt: createdAtNumber,
    }),
  );
}

export function createChatSessionRepository(driver: SqlDriver): ChatSessionRepository {
  return {
    save(input: NewChatSession): Result<ChatSession, DbError> {
      const parsed = parseNewChatSession(input);
      if (!parsed.ok) {
        return parsed;
      }
      const sessionInput = parsed.value;
      const id = createId();
      const createdAt = Date.now();
      const messagesJson = serializeStoredMessages(sessionInput.messages);

      const insert = driver.run(
        `INSERT INTO chat_sessions (id, article_id, topic, messages, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, sessionInput.articleId, sessionInput.topic, messagesJson, createdAt],
      );
      if (!insert.ok) {
        return insert;
      }

      return ok(
        toChatSession({
          id,
          articleId: sessionInput.articleId,
          topic: sessionInput.topic,
          messages: sessionInput.messages,
          createdAt,
        }),
      );
    },

    listRecent(limit: number): Result<readonly ChatSession[], DbError> {
      if (!Number.isInteger(limit) || limit < 1) {
        return err({ kind: 'validation', message: 'invalid limit' });
      }

      const rowsResult = driver.getAll<SqlRow>(
        `SELECT id, article_id, topic, messages, created_at
         FROM chat_sessions
         ORDER BY created_at DESC
         LIMIT ?`,
        [limit],
      );
      if (!rowsResult.ok) {
        return rowsResult;
      }

      const sessions: ChatSession[] = [];
      for (const row of rowsResult.value) {
        const parsed = parseChatSessionRow(row);
        if (!parsed.ok) {
          return parsed;
        }
        sessions.push(parsed.value);
      }
      return ok(sessions);
    },

    getById(id: string): Result<ChatSession, DbError> {
      const rowResult = driver.getFirst<SqlRow>(
        `SELECT id, article_id, topic, messages, created_at
         FROM chat_sessions
         WHERE id = ?`,
        [id],
      );
      if (!rowResult.ok) {
        return rowResult;
      }
      if (rowResult.value === null) {
        return err({ kind: 'not-found' });
      }
      return parseChatSessionRow(rowResult.value);
    },
  };
}
