import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/ui/theme/ThemeProvider';

type PlaceholderScreenProps = {
  readonly title: string;
  readonly body: string;
};

export function PlaceholderScreen({ title, body }: PlaceholderScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <View style={[styles.container, { padding: theme.spacing.xl }]}>
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.h1.fontSize,
              lineHeight: theme.typography.h1.lineHeight,
              fontWeight: theme.typography.h1.fontWeight,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.body,
            {
              color: theme.colors.textMuted,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
              marginTop: theme.spacing.md,
            },
          ]}
        >
          {body}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  title: {},
  body: {},
});
