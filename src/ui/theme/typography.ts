import type { TextStyle } from 'react-native';

import { tokens, type ThemeTokens, type TypographyVariant } from '@/ui/theme/tokens';

export function typographyStyle(
  theme: ThemeTokens,
  variant: TypographyVariant,
  options?: {
    readonly color?: string;
    readonly textAlign?: TextStyle['textAlign'];
  },
): TextStyle {
  const scale = theme.typography[variant];
  const fontFamily =
    scale.fontFamilyKey === 'display' ? theme.fontFamily.display : theme.fontFamily.text;

  return {
    fontFamily,
    fontSize: scale.fontSize,
    lineHeight: scale.lineHeight,
    fontWeight: scale.fontWeight,
    letterSpacing: scale.letterSpacing,
    color: options?.color,
    textAlign: options?.textAlign,
  };
}

export function typographyStyleFromTokens(variant: TypographyVariant): TextStyle {
  return typographyStyle(tokens, variant);
}
