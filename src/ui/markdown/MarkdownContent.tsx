import { isValidElement, memo, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';
import { useMarkdown } from 'react-native-marked';

import { normalizeArticleMarkdown } from '@/core/utils/normalize-article-markdown';
import { createArticleMarkdownRenderer } from '@/ui/markdown/article-markdown-renderer';
import { createArticleMarkdownStyles } from '@/ui/markdown/article-markdown-styles';
import { useTheme } from '@/ui/theme/ThemeProvider';

type MarkdownContentProps = {
  readonly content: string;
};

function MarkdownContentInner({ content }: MarkdownContentProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const styles = useMemo(() => createArticleMarkdownStyles(theme), [theme]);
  const renderer = useMemo(() => createArticleMarkdownRenderer(theme), [theme]);
  const readingTheme = useMemo(
    () =>
      ({
        colors: {
          text: theme.colors.textPrimary,
          link: theme.colors.primary,
          code: theme.colors.neutral[100],
          border: theme.colors.border,
          background: theme.colors.background,
        },
      }) as const,
    [theme],
  );

  const normalizedContent = useMemo(() => normalizeArticleMarkdown(content), [content]);

  const elements = useMarkdown(normalizedContent, {
    styles,
    theme: readingTheme,
    renderer,
    colorScheme: colorScheme ?? undefined,
  });

  const blocks = useMemo(
    () =>
      elements.filter(
        (element): element is ReactNode => element !== null && element !== false,
      ),
    [elements],
  );

  return (
    <View style={{ width: '100%', marginTop: theme.spacing.md }}>
      {blocks.map((element, index) => {
        const blockKey =
          isValidElement(element) && element.key !== null && element.key !== ''
            ? String(element.key)
            : `article-md-block-${String(index)}`;
        return (
          <View
            key={blockKey}
            style={{ width: '100%', alignSelf: 'stretch' }}
          >
            {element}
          </View>
        );
      })}
    </View>
  );
}

export const MarkdownContent = memo(MarkdownContentInner);
