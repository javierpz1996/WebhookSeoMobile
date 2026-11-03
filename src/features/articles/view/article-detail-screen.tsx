import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { ArticleCoverImage } from '@/features/articles/components/article-cover-image';
import { ArticleFaqSection } from '@/features/articles/components/article-faq-section';
import { ArticleSeoSection } from '@/features/articles/components/article-seo-section';
import { formatArticleDate } from '@/features/articles/model/format-article-date';
import { useArticleDetailModel } from '@/features/articles/model/use-article-detail-model';
import { ErrorState } from '@/ui/components/ErrorState';
import { ArticleListSkeleton } from '@/ui/components/Skeleton';
import { MarkdownContent } from '@/ui/markdown/MarkdownContent';
import { t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

export function ArticleDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const rawId = params.id;
  const articleId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { state, reload } = useArticleDetailModel(articleId);

  let body = null;
  if (state.kind === 'loading') {
    body = <ArticleListSkeleton rows={4} />;
  } else if (state.kind === 'not-found') {
    body = (
      <ErrorState
        testID="articles.detail.notFound"
        title={t('articles').detail.notFound}
        retryLabel={t('articles').error.retry}
        onRetry={reload}
      />
    );
  } else if (state.kind === 'error') {
    body = (
      <ErrorState
        testID="articles.detail.error"
        title={t('articles').error.title}
        retryLabel={t('articles').error.retry}
        onRetry={reload}
      />
    );
  } else {
    const { article } = state;
    body = (
      <ScrollView
        testID="articles.detail.ready"
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing['3xl'],
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: theme.articleMedia.readingMaxWidth,
            alignSelf: 'center',
          }}
        >
          <ArticleCoverImage url={article.coverImageUrl} />
          <Text
            accessibilityRole="header"
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.typography.display.fontSize,
              lineHeight: theme.typography.display.lineHeight,
              fontWeight: theme.typography.display.fontWeight,
              marginBottom: theme.spacing.sm,
            }}
          >
            {article.title}
          </Text>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.bodySm.fontSize,
              marginBottom: theme.spacing.lg,
            }}
          >
            {formatArticleDate(article.createdAt)} · {article.topic}
          </Text>
          <ArticleSeoSection article={article} />
          <MarkdownContent content={article.contentMarkdown} />
          <ArticleFaqSection items={article.faq} />
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <View style={styles.flex}>{body}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
