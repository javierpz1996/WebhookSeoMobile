import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  FLAT_LIST_INITIAL_NUM_TO_RENDER,
  FLAT_LIST_MAX_TO_RENDER_PER_BATCH,
  FLAT_LIST_WINDOW_SIZE,
} from '@/core/constants';
import { ArticleListRow } from '@/features/articles/components/article-list-row';
import { useArticlesListModel } from '@/features/articles/model/use-articles-list-model';
import { EmptyState } from '@/ui/components/EmptyState';
import { ErrorState } from '@/ui/components/ErrorState';
import { ArticleListSkeleton } from '@/ui/components/Skeleton';
import { t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

export function ArticlesListScreen() {
  const theme = useTheme();
  const { state, reload, loadMore } = useArticlesListModel();

  let body = null;
  if (state.kind === 'loading') {
    body = <ArticleListSkeleton />;
  } else if (state.kind === 'error') {
    body = (
      <ErrorState
        testID="articles.state.error"
        title={t('articles').error.title}
        retryLabel={t('articles').error.retry}
        onRetry={reload}
      />
    );
  } else if (state.kind === 'empty') {
    body = (
      <EmptyState
        testID="articles.state.empty"
        title={t('articles').empty.title}
        actionLabel={t('articles').empty.action}
        onAction={() => {
          router.navigate('/');
        }}
      />
    );
  } else {
    body = (
      <FlatList
        testID="articles.state.ready"
        data={state.items}
        keyExtractor={(item) => item.id}
        initialNumToRender={FLAT_LIST_INITIAL_NUM_TO_RENDER}
        maxToRenderPerBatch={FLAT_LIST_MAX_TO_RENDER_PER_BATCH}
        windowSize={FLAT_LIST_WINDOW_SIZE}
        removeClippedSubviews
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
        renderItem={({ item }) => <ArticleListRow article={item} />}
        onEndReached={() => {
          loadMore();
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          state.loadingMore ? (
            <View style={{ paddingVertical: theme.spacing.lg }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : undefined
        }
      />
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
