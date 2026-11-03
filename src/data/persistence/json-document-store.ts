import type { DbError } from '@/core/types/db-error';
import { ok, type Result } from '@/core/utils/result';

import {
  emptyJsonDocument,
  type JsonDocument,
} from '@/data/persistence/json-document-schema';
import { writeJsonDocument } from '@/data/persistence/json-persistence-io';

export type JsonDocumentStore = {
  get(): JsonDocument;
  replace(doc: JsonDocument): Result<void, DbError>;
  update<T>(fn: (doc: JsonDocument) => Result<{ doc: JsonDocument; value: T }, DbError>): Result<T, DbError>;
};

let documentState: JsonDocument = emptyJsonDocument();

export function resetJsonDocumentStoreForTests(): void {
  documentState = emptyJsonDocument();
}

export function initJsonDocumentStore(doc: JsonDocument): void {
  documentState = doc;
}

export function setJsonDocumentForTests(doc: JsonDocument): void {
  initJsonDocumentStore(doc);
}

export function createJsonDocumentStore(initial?: JsonDocument): JsonDocumentStore {
  if (initial !== undefined) {
    documentState = initial;
  }

  return {
    get(): JsonDocument {
      return documentState;
    },

    replace(doc: JsonDocument): Result<void, DbError> {
      documentState = doc;
      void writeJsonDocument(doc);
      return ok(undefined);
    },

    update<T>(
      fn: (doc: JsonDocument) => Result<{ doc: JsonDocument; value: T }, DbError>,
    ): Result<T, DbError> {
      const result = fn(documentState);
      if (!result.ok) {
        return result;
      }
      documentState = result.value.doc;
      void writeJsonDocument(documentState);
      return ok(result.value.value);
    },
  };
}

export function getSharedJsonDocumentStore(): JsonDocumentStore {
  return createJsonDocumentStore();
}
