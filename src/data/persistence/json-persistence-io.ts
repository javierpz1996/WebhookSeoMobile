import { Platform } from 'react-native';

import type { DbError } from '@/core/types/db-error';
import { err, ok, type Result } from '@/core/utils/result';

import {
  emptyJsonDocument,
  parseStoredJsonDocument,
  type JsonDocument,
} from '@/data/persistence/json-document-schema';

export const JSON_STORAGE_KEY = 'article-studio.json.v1';

export function readJsonDocumentSync(): JsonDocument {
  if (Platform.OS !== 'web') {
    return emptyJsonDocument();
  }
  if (typeof globalThis.localStorage === 'undefined') {
    return emptyJsonDocument();
  }
  const raw = globalThis.localStorage.getItem(JSON_STORAGE_KEY);
  if (raw === null || raw.length === 0) {
    return emptyJsonDocument();
  }
  const parsed = parseStoredJsonDocument(raw);
  if (!parsed.ok) {
    return emptyJsonDocument();
  }
  return parsed.value;
}

export async function readJsonDocumentAsync(): Promise<JsonDocument> {
  if (Platform.OS === 'web') {
    return readJsonDocumentSync();
  }
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  const raw = await AsyncStorage.getItem(JSON_STORAGE_KEY);
  if (raw === null || raw.length === 0) {
    return emptyJsonDocument();
  }
  const parsed = parseStoredJsonDocument(raw);
  if (!parsed.ok) {
    return emptyJsonDocument();
  }
  return parsed.value;
}

export async function writeJsonDocument(doc: JsonDocument): Promise<Result<void, DbError>> {
  const serialized = JSON.stringify(doc);
  try {
    if (Platform.OS === 'web') {
      if (typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.setItem(JSON_STORAGE_KEY, serialized);
      }
      return ok(undefined);
    }
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem(JSON_STORAGE_KEY, serialized);
    return ok(undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'failed to persist json';
    return err({ kind: 'unknown', message });
  }
}

export async function loadJsonDocumentFromDisk(): Promise<JsonDocument> {
  return readJsonDocumentAsync();
}
