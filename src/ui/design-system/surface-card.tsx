import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';
import { shadowStyle } from '@/ui/theme/shadows';

type SurfaceCardProps = ViewProps & {
  readonly children: ReactNode;
  readonly muted?: boolean;
  readonly padded?: boolean;
  readonly elevated?: boolean;
};

/** Tarjeta editorial Apple: radio 28px, sin sombra por defecto. */
export function SurfaceCard({
  children,
  muted = false,
  padded = true,
  elevated = false,
  style,
  ...rest
}: SurfaceCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: muted ? theme.colors.backgroundMuted : theme.colors.surface,
          borderRadius: theme.radius.card,
          padding: padded ? theme.spacing.cardPadding : 0,
          overflow: 'hidden',
        },
        elevated ? shadowStyle(theme, 'level1') : theme.shadow.none,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
