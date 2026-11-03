export const V0001_BASELINE_SQL = `
CREATE TABLE articles (
  id                TEXT PRIMARY KEY NOT NULL,
  title             TEXT NOT NULL,
  slug              TEXT,
  content_markdown  TEXT NOT NULL,
  seo_title         TEXT,
  seo_description   TEXT,
  seo_keywords      TEXT NOT NULL DEFAULT '[]',
  faq               TEXT NOT NULL DEFAULT '[]',
  cover_image_url   TEXT,
  language          TEXT NOT NULL,
  topic             TEXT NOT NULL,
  params            TEXT NOT NULL,
  created_at        INTEGER NOT NULL
) STRICT;

CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

CREATE TABLE context_entries (
  id         TEXT PRIMARY KEY NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('topic','keyword','default')),
  value      TEXT NOT NULL,
  meta       TEXT,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
) STRICT;

CREATE INDEX idx_context_kind_position ON context_entries(kind, position);
`.trim();

export const MIGRATION_V0001_BASELINE = {
  version: 1,
  id: 'v0001-baseline',
  sql: V0001_BASELINE_SQL,
} as const;
