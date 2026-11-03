import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ContextEntry, ContextKind, NewContextEntry } from '@/core/types/context-entry';
import type { DbError } from '@/core/types/db-error';

import { useAppData } from '@/composition/app-data-provider';

export type ContextScreenState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'empty' }
  | { readonly kind: 'error'; readonly messageKey: string }
  | { readonly kind: 'ready'; readonly entries: readonly ContextEntry[] };

function dbErrorMessageKey(error: DbError): string {
  if (error.kind === 'not-found') {
    return 'context.errors.notFound';
  }
  if (error.kind === 'sqlite' || error.kind === 'unknown') {
    return 'context.errors.storage';
  }
  return 'context.errors.storage';
}

export function groupEntriesByKind(
  entries: readonly ContextEntry[],
): Record<ContextKind, readonly ContextEntry[]> {
  return {
    topic: entries.filter((entry) => entry.kind === 'topic'),
    keyword: entries.filter((entry) => entry.kind === 'keyword'),
    default: entries.filter((entry) => entry.kind === 'default'),
  };
}

export function nextPositionForKind(
  entries: readonly ContextEntry[],
  kind: ContextKind,
): number {
  const sameKind = entries.filter((entry) => entry.kind === kind);
  if (sameKind.length === 0) {
    return 0;
  }
  return Math.max(...sameKind.map((entry) => entry.position)) + 1;
}

export function useContextScreenModel() {
  const { context: repository } = useAppData();
  const [screenState, setScreenState] = useState<ContextScreenState>({ kind: 'loading' });
  const [formVisible, setFormVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ContextEntry | null>(null);
  const [initialKind, setInitialKind] = useState<ContextKind>('topic');

  const load = useCallback(() => {
    setScreenState({ kind: 'loading' });
    const result = repository.listAll();
    if (!result.ok) {
      setScreenState({ kind: 'error', messageKey: dbErrorMessageKey(result.error) });
      return;
    }
    if (result.value.length === 0) {
      setScreenState({ kind: 'empty' });
      return;
    }
    setScreenState({ kind: 'ready', entries: result.value });
  }, [repository]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    if (screenState.kind !== 'ready') {
      return groupEntriesByKind([]);
    }
    return groupEntriesByKind(screenState.entries);
  }, [screenState]);

  const openCreate = useCallback((kind: ContextKind) => {
    setEditingEntry(null);
    setInitialKind(kind);
    setFormVisible(true);
  }, []);

  const openEdit = useCallback((entry: ContextEntry) => {
    setEditingEntry(entry);
    setInitialKind(entry.kind);
    setFormVisible(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormVisible(false);
    setEditingEntry(null);
  }, []);

  const saveEntry = useCallback(
    (entry: NewContextEntry): DbError | null => {
      const result = repository.save(entry);
      if (!result.ok) {
        return result.error;
      }
      load();
      closeForm();
      return null;
    },
    [closeForm, load, repository],
  );

  const removeEntry = useCallback(
    (id: string): DbError | null => {
      const result = repository.remove(id);
      if (!result.ok) {
        return result.error;
      }
      load();
      return null;
    },
    [load, repository],
  );

  return {
    screenState,
    grouped,
    formVisible,
    editingEntry,
    initialKind,
    load,
    openCreate,
    openEdit,
    closeForm,
    saveEntry,
    removeEntry,
  };
}

export function pickEntriesForModelTest(
  state: ContextScreenState,
): readonly ContextEntry[] {
  return state.kind === 'ready' ? state.entries : [];
}
