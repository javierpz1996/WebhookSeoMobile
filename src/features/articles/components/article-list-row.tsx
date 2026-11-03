import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import type { Article } from '@/core/types/article';
import { formatArticleDate } from '@/features/articles/model/format-article-date';
import { useTheme } from '@/ui/theme/ThemeProvider';

type ArticleListRowProps = {
  readonly article: Article;
};

export const ArticleListRow = memo(function ArticleListRow({ article }: ArticleListRowProps) {
  const theme = useTheme();

  return (
    <Link href={`/articles/${article.id}`} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={article.title}
        style={{
          flexDirection: 'row',
          gap: theme.spacing.md,
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          minHeight: theme.touchTarget,
          alignItems: 'center',
        }}
      >
        {article.coverImageUrl !== null && article.coverImageUrl.trim().length > 0 ? (
          <Image
            accessibilityIgnoresInvertColors
            source={{ uri: article.coverImageUrl }}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={{
              width: theme.articleMedia.listThumbnailSize,
              height: theme.articleMedia.listThumbnailSize,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.neutral[200],
            }}
          />
        ) : null}
        <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.typography.body.fontSize,
            fontWeight: theme.typography.h3.fontWeight,
          }}
        >
          {article.title}
        </Text>
        <View style={{ marginTop: theme.spacing.xs, gap: theme.spacing.xs }}>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.bodySm.fontSize,
            }}
          >
            {article.topic}
          </Text>
          <Text
            style={{
              color: theme.colors.textDisabled,
              fontSize: theme.typography.caption.fontSize,
            }}
          >
            {formatArticleDate(article.createdAt)}
          </Text>
        </View>
        </View>
      </Pressable>
    </Link>
  );
});
