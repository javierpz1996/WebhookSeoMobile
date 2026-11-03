import { StyleSheet, Text, View } from 'react-native';

import { text } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

export function MemoryDatabaseBanner() {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.warning,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
        },
      ]}
    >
      <Text
        style={{
          color: theme.colors.onPrimary,
          fontSize: theme.typography.bodySm.fontSize,
          lineHeight: theme.typography.bodySm.lineHeight,
        }}
      >
        {text('db', 'memoryFallback')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {},
});
