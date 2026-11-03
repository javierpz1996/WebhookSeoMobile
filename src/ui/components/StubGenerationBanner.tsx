import { StyleSheet, Text, View } from 'react-native';

import { text } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

export function StubGenerationBanner() {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="text"
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.info,
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
        {text('demo', 'stubBanner')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {},
});
