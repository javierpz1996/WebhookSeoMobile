import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

const SHOW_DELAY_MS = 300;

type LoadingStateProps = {
  readonly message?: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY_MS);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!visible) {
    return <View style={styles.flex} />;
  }

  return (
    <View style={[styles.flex, styles.center, { padding: theme.spacing.xl }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message !== undefined ? (
        <Text
          style={{
            marginTop: theme.spacing.md,
            color: theme.colors.textMuted,
            fontSize: theme.typography.body.fontSize,
          }}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
