export const V0002_CHAT_SESSIONS_SQL = `
CREATE TABLE chat_sessions (
  id          TEXT PRIMARY KEY NOT NULL,
  article_id  TEXT NOT NULL,
  topic       TEXT NOT NULL,
  messages    TEXT NOT NULL,
  created_at  INTEGER NOT NULL
) STRICT;

CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
`.trim();

export const MIGRATION_V0002_CHAT_SESSIONS = {
  version: 2,
  id: 'v0002-chat-sessions',
  sql: V0002_CHAT_SESSIONS_SQL,
} as const;
