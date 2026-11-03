import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ContextEntry, ContextKind, NewContextEntry } from '@/core/types/context-entry';
import type { DefaultableGenerationField } from '@/core/types/generation-params';
import { createId } from '@/core/utils/create-id';
import type { DbError } from '@/core/types/db-error';
import {
  contextEntryFormSchema,
  entryToFormValues,
  formOutputToNewContextEntry,
  type ContextEntryFormInput,
} from '@/features/context/model/context-entry-form-schema';
import {
  nextPositionForKind,
  pickEntriesForModelTest,
  type ContextScreenState,
} from '@/features/context/model/use-context-screen-model';
import { AppModal } from '@/ui/components/AppModal';
import { Button } from '@/ui/components/Button';
import { Chip } from '@/ui/components/Chip';
import { TextField } from '@/ui/components/TextField';
import { text, t } from '@/ui/strings/es';
import { resolveMessageKey } from '@/ui/strings/resolve-message-key';
import { useTheme } from '@/ui/theme/ThemeProvider';

const DEFAULT_FIELDS: readonly DefaultableGenerationField[] = [
  'language',
  'tone',
  'audience',
  'wordCount',
  'sections',
  'articleCount',
];

type ContextEntryFormModalProps = {
  readonly visible: boolean;
  readonly initialKind: ContextKind;
  readonly editingEntry: ContextEntry | null;
  readonly screenState: ContextScreenState;
  readonly onClose: () => void;
  readonly onSave: (entry: NewContextEntry) => DbError | null;
};

export function ContextEntryFormModal({
  visible,
  initialKind,
  editingEntry,
  screenState,
  onClose,
  onSave,
}: ContextEntryFormModalProps) {
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<ContextEntryFormInput>({
    resolver: valibotResolver(contextEntryFormSchema),
    mode: 'onTouched',
    defaultValues: {
      kind: initialKind,
      value: '',
      defaultField: undefined,
    },
  });

  const kind = watch('kind');

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (editingEntry !== null) {
      reset(entryToFormValues(editingEntry));
      return;
    }
    reset({
      kind: initialKind,
      value: '',
      defaultField: undefined,
    });
  }, [editingEntry, initialKind, reset, visible]);

  const submit = handleSubmit((values) => {
    const entries = pickEntriesForModelTest(screenState);
    const id = editingEntry?.id ?? createId();
    const createdAt = editingEntry?.createdAt ?? Date.now();
    const position =
      editingEntry?.position ??
      nextPositionForKind(entries, values.kind as ContextKind);

    const payload = formOutputToNewContextEntry(values, { id, createdAt, position });
    onSave(payload);
  });

  const modalTitle = editingEntry === null ? t('context').add[initialKind] : text('context', 'edit');

  return (
    <AppModal
      visible={visible}
      title={modalTitle}
      onClose={onClose}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: theme.spacing.md }}>
        <Controller
          control={control}
          name="value"
          render={({ field, fieldState }) => (
            <TextField
              label={t('context').form.valueLabel}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessageKey={fieldState.error?.message}
            />
          )}
        />

        {kind === 'default' ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.bodySm.fontSize }}>
              {t('context').form.defaultFieldLabel}
            </Text>
            <Controller
              control={control}
              name="defaultField"
              render={({ field, fieldState }) => (
                <View style={styles.chips}>
                  {DEFAULT_FIELDS.map((fieldName) => (
                    <Chip
                      key={fieldName}
                      label={t('context').defaultFields[fieldName]}
                      selected={field.value === fieldName}
                      onPress={() => {
                        field.onChange(fieldName);
                      }}
                    />
                  ))}
                  {fieldState.error?.message !== undefined ? (
                    <Text
                      accessibilityLiveRegion="polite"
                      style={{ color: theme.colors.error, fontSize: theme.typography.caption.fontSize }}
                    >
                      {resolveMessageKey(fieldState.error.message)}
                    </Text>
                  ) : null}
                </View>
              )}
            />
          </View>
        ) : null}

        <View style={[styles.actions, { gap: theme.spacing.sm }]}>
          <Button variant="ghost" label={t('context').form.cancel} onPress={onClose} />
          <Button
            label={t('context').form.save}
            loading={isSubmitting}
            onPress={() => {
              void submit();
            }}
          />
        </View>
      </ScrollView>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
