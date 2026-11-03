import { Text, View } from 'react-native';

import type { FaqItem } from '@/core/types/article';
import { t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

type ArticleFaqSectionProps = {
  readonly items: readonly FaqItem[];
};

export function ArticleFaqSection({ items }: ArticleFaqSectionProps) {
  const theme = useTheme();

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
      <Text
        accessibilityRole="header"
        style={{
          color: theme.colors.textPrimary,
          fontSize: theme.typography.h3.fontSize,
          fontWeight: theme.typography.h3.fontWeight,
        }}
      >
        {t('articles').detail.faqTitle}
      </Text>
      {items.map((item) => (
        <View
          key={`${item.question}-${item.answer}`}
          style={{
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            gap: theme.spacing.xs,
          }}
        >
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.typography.body.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
            }}
          >
            {item.question}
          </Text>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
            }}
          >
            {item.answer}
          </Text>
        </View>
      ))}
    </View>
  );
}
