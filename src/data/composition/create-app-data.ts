import type { ArticleRepository } from '@/core/ports/article-repository';
import type { ChatSessionRepository } from '@/core/ports/chat-session-repository';
import type { ContextRepository } from '@/core/ports/context-repository';
import type { GenerationClient } from '@/core/ports/generation-client';
import type { SqlDriver } from '@/core/ports/sql-driver';

import { createGenerationClient } from '@/data/api/create-generation-client';
import { readWebhookConfig } from '@/data/api/read-webhook-config';
import { createNoOpSqlDriver } from '@/data/db/no-op-sql-driver';
import type { DatabaseOutcome } from '@/data/db/open-device-database';
import { openDeviceDatabase } from '@/data/db/open-device-database';
import { getSharedJsonDocumentStore } from '@/data/persistence/json-document-store';
import { readStorageConfig } from '@/data/persistence/read-storage-config';
import { createJsonArticleRepository } from '@/data/repositories/json-article-repository';
import { createJsonChatSessionRepository } from '@/data/repositories/json-chat-session-repository';
import { createJsonContextRepository } from '@/data/repositories/json-context-repository';
import { createArticleRepository } from '@/data/repositories/sqlite-article-repository';
import { createChatSessionRepository } from '@/data/repositories/sqlite-chat-session-repository';
import { createContextRepository } from '@/data/repositories/sqlite-context-repository';

export type AppData = {
  readonly articles: ArticleRepository;
  readonly chatSessions: ChatSessionRepository;
  readonly context: ContextRepository;
  readonly generation: GenerationClient;
  readonly generationUsesStub: boolean;
  readonly driver: SqlDriver;
  readonly database: DatabaseOutcome;
};

function buildJsonAppData(): AppData {
  const webhook = readWebhookConfig();
  const store = getSharedJsonDocumentStore();
  return {
    articles: createJsonArticleRepository(store),
    chatSessions: createJsonChatSessionRepository(store),
    context: createJsonContextRepository(store),
    generation: createGenerationClient(),
    generationUsesStub: webhook.useStub,
    driver: createNoOpSqlDriver(),
    database: { kind: 'json', schemaVersion: 2 },
  };
}

function buildSqliteAppData(): AppData {
  const opened = openDeviceDatabase();
  const webhook = readWebhookConfig();
  return {
    articles: createArticleRepository(opened.driver),
    chatSessions: createChatSessionRepository(opened.driver),
    context: createContextRepository(opened.driver),
    generation: createGenerationClient(),
    generationUsesStub: webhook.useStub,
    driver: opened.driver,
    database: opened.outcome,
  };
}

export function createAppData(): AppData {
  if (readStorageConfig().useJson) {
    return buildJsonAppData();
  }
  return buildSqliteAppData();
}

export function createAppDataFromDriver(
  driver: SqlDriver,
  database: DatabaseOutcome,
  generation: GenerationClient,
  options?: { readonly generationUsesStub?: boolean },
): AppData {
  const generationUsesStub = options?.generationUsesStub ?? readWebhookConfig().useStub;
  return {
    articles: createArticleRepository(driver),
    chatSessions: createChatSessionRepository(driver),
    context: createContextRepository(driver),
    generation,
    generationUsesStub,
    driver,
    database,
  };
}
