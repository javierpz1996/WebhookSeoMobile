import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

type SkeletonProps = {
  readonly height: number;
  readonly width?: `${number}%` | number;
};

export function Skeleton({ height, width = '100%' }: SkeletonProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        height,
        width,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.neutral[200],
      }}
    />
  );
}

type ArticleListSkeletonProps = {
  readonly rows?: number;
};

export function ArticleListSkeleton({ rows = 6 }: ArticleListSkeletonProps) {
  const theme = useTheme();
  return (
    <View style={[styles.list, { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      {Array.from({ length: rows }, (_, index) => (
        <View key={String(index)} style={{ gap: theme.spacing.sm }}>
          <Skeleton height={18} width="70%" />
          <Skeleton height={14} width="40%" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
});
