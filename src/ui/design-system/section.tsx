import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

type SectionProps = ViewProps & {
  readonly children: ReactNode;
  readonly gap?: 'default' | 'section';
};

export function Section({ children, gap = 'default', style, ...rest }: SectionProps) {
  const theme = useTheme();
  const marginBottom = gap === 'section' ? theme.spacing.sectionGap : theme.spacing.elementGap;

  return (
    <View style={[{ marginBottom, gap: theme.spacing.elementGap }, style]} {...rest}>
      {children}
    </View>
  );
}
