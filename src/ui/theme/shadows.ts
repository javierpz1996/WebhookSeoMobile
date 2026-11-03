import type { ViewStyle } from 'react-native';

import type { ShadowVariant, ThemeTokens } from '@/ui/theme/tokens';

export function shadowStyle(theme: ThemeTokens, variant: ShadowVariant): ViewStyle {
  return theme.shadow[variant];
}
