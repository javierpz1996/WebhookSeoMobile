import { Pressable, type PressableProps } from 'react-native';

import { AppleText } from '@/ui/design-system/apple-text';
import { useTheme } from '@/ui/theme/ThemeProvider';

type LinkTextProps = Omit<PressableProps, 'children'> & {
  readonly label: string;
  readonly accessibilityLabel?: string;
};

/** Enlaces inline / sección — Apple Blue #0066CC, sin pill. */
export function LinkText({ label, accessibilityLabel, ...rest }: LinkTextProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      {...rest}
    >
      {({ pressed }) => (
        <AppleText
          variant="body17"
          color="link"
          style={{
            opacity: pressed ? theme.motion.opacity.pressed : 1,
            textDecorationLine: 'underline',
          }}
        >
          {label}
        </AppleText>
      )}
    </Pressable>
  );
}
