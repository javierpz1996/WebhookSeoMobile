import { Text, View } from 'react-native';

import type { Article } from '@/core/types/article';
import { Chip } from '@/ui/components/Chip';
import { t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

type ArticleSeoSectionProps = {
  readonly article: Article;
};

export function ArticleSeoSection({ article }: ArticleSeoSectionProps) {
  const theme = useTheme();
  const strings = t('articles').detail;

  return (
    <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
      <Text
        accessibilityRole="header"
        style={{
          color: theme.colors.textPrimary,
          fontSize: theme.typography.h3.fontSize,
          fontWeight: theme.typography.h3.fontWeight,
        }}
      >
        {strings.seoTitle}
      </Text>
      {article.seoTitle !== null ? (
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body.fontSize }}>
          {strings.seoMetaTitle}: {article.seoTitle}
        </Text>
      ) : null}
      {article.seoDescription !== null ? (
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.body.fontSize }}>
          {strings.seoMetaDescription}: {article.seoDescription}
        </Text>
      ) : null}
      {article.seoKeywords.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {article.seoKeywords.map((keyword) => (
            <Chip key={keyword} label={keyword} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
