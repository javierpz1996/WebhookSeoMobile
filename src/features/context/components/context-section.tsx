import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ContextEntry, ContextKind } from '@/core/types/context-entry';
import { Chip } from '@/ui/components/Chip';
import { Button } from '@/ui/components/Button';
import { t, text } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

type ContextSectionProps = {
  readonly kind: ContextKind;
  readonly entries: readonly ContextEntry[];
  readonly onAdd: (kind: ContextKind) => void;
  readonly onEdit: (entry: ContextEntry) => void;
  readonly onDelete: (id: string) => void;
};

export function ContextSection({ kind, entries, onAdd, onEdit, onDelete }: ContextSectionProps) {
  const theme = useTheme();
  const sectionTitle = t('context').sections[kind];
  const addLabel = t('context').add[kind];

  return (
    <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
      <View style={[styles.header, { gap: theme.spacing.sm }]}>
        <Text
          accessibilityRole="header"
          style={{
            flex: 1,
            color: theme.colors.textPrimary,
            fontSize: theme.typography.h3.fontSize,
            fontWeight: theme.typography.h3.fontWeight,
          }}
        >
          {sectionTitle}
        </Text>
        <Button label={addLabel} variant="ghost" onPress={() => onAdd(kind)} />
      </View>

      {entries.length === 0 ? (
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.bodySm.fontSize }}>
          —
        </Text>
      ) : null}

      {kind === 'keyword' ? (
        <View style={[styles.chips, { gap: theme.spacing.sm }]}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.chipRow}>
              <Chip
                label={entry.value}
                onPress={() => onEdit(entry)}
                accessibilityLabel={`${text('a11y', 'editContextEntry')}: ${entry.value}`}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={text('context', 'delete')}
                onPress={() => onDelete(entry.id)}
                style={{
                  minWidth: theme.touchTarget,
                  minHeight: theme.touchTarget,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ gap: theme.spacing.sm }}>
          {entries.map((entry) => (
            <View
              key={entry.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.sm,
                padding: theme.spacing.md,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${text('a11y', 'editContextEntry')}: ${
                  entry.kind === 'default' && entry.meta !== null
                    ? `${t('context').defaultFields[entry.meta.field]}: ${entry.value}`
                    : entry.value
                }`}
                onPress={() => onEdit(entry)}
                style={{ flex: 1, minHeight: theme.touchTarget, justifyContent: 'center' }}
              >
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body.fontSize }}>
                  {entry.kind === 'default' && entry.meta !== null
                    ? `${t('context').defaultFields[entry.meta.field]}: ${entry.value}`
                    : entry.value}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={text('context', 'delete')}
                onPress={() => onDelete(entry.id)}
                style={{
                  minWidth: theme.touchTarget,
                  minHeight: theme.touchTarget,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
