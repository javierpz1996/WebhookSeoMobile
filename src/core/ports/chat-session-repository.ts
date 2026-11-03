import type { ChatSession, NewChatSession } from '@/core/types/chat-session';
import type { DbError } from '@/core/types/db-error';
import type { Result } from '@/core/utils/result';

export type ChatSessionRepository = {
  save(session: NewChatSession): Result<ChatSession, DbError>;
  listRecent(limit: number): Result<readonly ChatSession[], DbError>;
  getById(id: string): Result<ChatSession, DbError>;
};
