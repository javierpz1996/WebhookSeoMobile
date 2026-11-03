import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

type HairlineDividerProps = ViewProps & {
  readonly inset?: boolean;
};

export function HairlineDivider({ inset = false, style, ...rest }: HairlineDividerProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="none"
      style={[
        {
          height: 1,
          backgroundColor: theme.colors.border,
          marginHorizontal: inset ? theme.spacing.lg : 0,
        },
        style,
      ]}
      {...rest}
    />
  );
}
