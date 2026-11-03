import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/ui/components/Button';
import { useTheme } from '@/ui/theme/ThemeProvider';

type EmptyStateProps = {
  readonly title: string;
  readonly actionLabel: string;
  readonly onAction: () => void;
  readonly testID?: string;
};

export function EmptyState({ title, actionLabel, onAction, testID }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      testID={testID}
      style={[styles.flex, styles.center, { padding: theme.spacing.xl, gap: theme.spacing.lg }]}
    >
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.typography.body.fontSize,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Button label={actionLabel} onPress={onAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
