import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

type ArticleCoverImageProps = {
  readonly url: string | null;
};

export function ArticleCoverImage({ url }: ArticleCoverImageProps) {
  const theme = useTheme();

  if (url === null || url.trim().length === 0) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { marginBottom: theme.spacing.lg, borderRadius: theme.radius.md }]}>
      <Image
        accessibilityLabel={t('articles').detail.coverAccessibility}
        source={{ uri: url }}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={{
          width: '100%',
          height: theme.articleMedia.coverHeight,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.neutral[200],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    width: '100%',
  },
});
