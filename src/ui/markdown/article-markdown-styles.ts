import type { ThemeTokens } from '@/ui/theme/tokens';
import type { MarkedStyles } from 'react-native-marked';
import type { ImageStyle, ViewStyle } from 'react-native';

const readingText = (theme: ThemeTokens) => ({
  color: theme.colors.textPrimary,
  fontSize: theme.typography.body.fontSize,
  lineHeight: theme.typography.body.lineHeight,
});

export function createArticleMarkdownStyles(theme: ThemeTokens): MarkedStyles {
  const bodyText = readingText(theme);

  return {
    h1: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.h2.fontSize,
      lineHeight: theme.typography.h2.lineHeight,
      fontWeight: theme.typography.h2.fontWeight,
      marginBottom: theme.spacing.md,
    },
    h2: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.h3.fontSize,
      lineHeight: theme.typography.h3.lineHeight,
      fontWeight: theme.typography.h3.fontWeight,
      marginBottom: theme.spacing.sm,
    },
    h3: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.body.fontSize,
      lineHeight: theme.typography.body.lineHeight,
      fontWeight: theme.typography.h3.fontWeight,
      marginBottom: theme.spacing.sm,
    },
    text: bodyText,
    em: bodyText,
    strong: { ...bodyText, fontWeight: '700' as const },
    li: bodyText,
    paragraph: {
      width: '100%',
      alignSelf: 'stretch',
      marginBottom: theme.spacing.md,
    } as ViewStyle,
    blockquote: {
      width: '100%',
      alignSelf: 'stretch',
    } as ViewStyle,
    link: {
      color: theme.colors.primary,
      fontSize: theme.typography.body.fontSize,
    },
    code: {
      backgroundColor: theme.colors.neutral[100],
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
    } as ViewStyle,
    codespan: {
      backgroundColor: theme.colors.neutral[100],
      color: theme.colors.textPrimary,
      fontSize: theme.typography.bodySm.fontSize,
    },
    list: {
      marginBottom: theme.spacing.md,
    } as ViewStyle,
    image: {
      width: '100%',
      height: theme.articleMedia.inlineHeight,
      borderRadius: theme.radius.image,
      backgroundColor: theme.colors.neutral.controlGray,
    } as ImageStyle,
  };
}
