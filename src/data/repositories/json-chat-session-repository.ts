import type { ChatSession, NewChatSession } from '@/core/types/chat-session';
import type { DbError } from '@/core/types/db-error';
import type { ChatSessionRepository } from '@/core/ports/chat-session-repository';
import { createId } from '@/core/utils/create-id';
import { err, ok, type Result } from '@/core/utils/result';

import type { JsonDocumentStore } from '@/data/persistence/json-document-store';
import { parseNewChatSession } from '@/data/repositories/chat-session-schemas';

export function createJsonChatSessionRepository(store: JsonDocumentStore): ChatSessionRepository {
  return {
    save(input: NewChatSession): Result<ChatSession, DbError> {
      const parsed = parseNewChatSession(input);
      if (!parsed.ok) {
        return parsed;
      }
      const sessionInput = parsed.value;
      const id = createId();
      const createdAt = Date.now();
      const session: ChatSession = {
        id,
        articleId: sessionInput.articleId,
        topic: sessionInput.topic,
        messages: sessionInput.messages.map((message) => ({ ...message })),
        createdAt,
      };

      return store.update((doc) => {
        const chatSessions = [session, ...doc.chatSessions].sort((a, b) => b.createdAt - a.createdAt);
        return ok({ doc: { ...doc, chatSessions }, value: session });
      });
    },

    listRecent(limit: number): Result<readonly ChatSession[], DbError> {
      if (!Number.isInteger(limit) || limit < 1) {
        return err({ kind: 'validation', message: 'invalid limit' });
      }
      const sorted = [...store.get().chatSessions].sort((a, b) => b.createdAt - a.createdAt);
      return ok(sorted.slice(0, limit));
    },

    getById(id: string): Result<ChatSession, DbError> {
      const session = store.get().chatSessions.find((item) => item.id === id);
      if (session === undefined) {
        return err({ kind: 'not-found' });
      }
      return ok({
        ...session,
        messages: session.messages.map((message) => ({ ...message })),
      });
    },
  };
}
