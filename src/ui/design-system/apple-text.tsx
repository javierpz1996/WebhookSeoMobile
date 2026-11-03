import type { ReactNode } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';
import type { TypographyVariant } from '@/ui/theme/tokens';
import { typographyStyle } from '@/ui/theme/typography';

type AppleTextProps = Omit<TextProps, 'style'> & {
  readonly variant?: TypographyVariant;
  readonly color?: 'primary' | 'muted' | 'disabled' | 'link' | 'cta' | 'launch' | 'inverse';
  readonly style?: TextStyle;
  readonly children: ReactNode;
};

function resolveTextColor(
  theme: ReturnType<typeof useTheme>,
  color: AppleTextProps['color'],
): string | undefined {
  switch (color) {
    case 'primary':
      return theme.colors.textPrimary;
    case 'muted':
      return theme.colors.textMuted;
    case 'disabled':
      return theme.colors.textDisabled;
    case 'link':
      return theme.colors.brand.link;
    case 'cta':
      return theme.colors.brand.cta;
    case 'launch':
      return theme.colors.accent.launch;
    case 'inverse':
      return theme.colors.onPrimary;
    case undefined:
      return theme.colors.textPrimary;
    default:
      return theme.colors.textPrimary;
  }
}

export function AppleText({
  variant = 'body17',
  color = 'primary',
  style,
  children,
  ...rest
}: AppleTextProps) {
  const theme = useTheme();
  const resolvedColor = resolveTextColor(theme, color);

  return (
    <Text
      style={[typographyStyle(theme, variant, { color: resolvedColor }), style]}
      {...rest}
    >
      {children}
    </Text>
  );
}
