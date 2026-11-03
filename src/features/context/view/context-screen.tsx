import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContextEntryFormModal } from '@/features/context/components/context-entry-form-modal';
import { ContextSection } from '@/features/context/components/context-section';
import { useContextScreenModel } from '@/features/context/model/use-context-screen-model';
import { EmptyState } from '@/ui/components/EmptyState';
import { ErrorState } from '@/ui/components/ErrorState';
import { LoadingState } from '@/ui/components/LoadingState';
import { resolveMessageKey } from '@/ui/strings/resolve-message-key';
import { text, t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

const CONTEXT_KINDS = ['topic', 'keyword', 'default'] as const;

export function ContextScreen() {
  const theme = useTheme();
  const model = useContextScreenModel();

  let body = null;

  if (model.screenState.kind === 'loading') {
    body = <LoadingState message={text('context', 'loading')} />;
  } else if (model.screenState.kind === 'error') {
    body = (
      <ErrorState
        testID="context.state.error"
        title={resolveMessageKey(model.screenState.messageKey) ?? t('context').error.title}
        retryLabel={t('context').error.retry}
        onRetry={model.load}
      />
    );
  } else if (model.screenState.kind === 'empty') {
    body = (
      <EmptyState
        testID="context.state.empty"
        title={t('context').empty.title}
        actionLabel={t('context').empty.action}
        onAction={() => model.openCreate('topic')}
      />
    );
  } else {
    body = (
      <ScrollView
        testID="context.state.ready"
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing['3xl'],
        }}
        keyboardShouldPersistTaps="handled"
      >
        {CONTEXT_KINDS.map((kind) => (
          <ContextSection
            key={kind}
            kind={kind}
            entries={model.grouped[kind]}
            onAdd={model.openCreate}
            onEdit={model.openEdit}
            onDelete={(id) => {
              model.removeEntry(id);
            }}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <View style={styles.flex}>{body}</View>
      <ContextEntryFormModal
        visible={model.formVisible}
        initialKind={model.initialKind}
        editingEntry={model.editingEntry}
        screenState={model.screenState}
        onClose={model.closeForm}
        onSave={(entry) => model.saveEntry(entry)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
