import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/ui/components/Button';
import { useTheme } from '@/ui/theme/ThemeProvider';

type ErrorStateProps = {
  readonly title: string;
  readonly retryLabel: string;
  readonly onRetry: () => void;
  readonly testID?: string;
};

export function ErrorState({ title, retryLabel, onRetry, testID }: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View
      testID={testID}
      style={[styles.flex, styles.center, { padding: theme.spacing.xl, gap: theme.spacing.lg }]}
    >
      <Text
        accessibilityLiveRegion="polite"
        style={{
          color: theme.colors.error,
          fontSize: theme.typography.body.fontSize,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Button label={retryLabel} onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
