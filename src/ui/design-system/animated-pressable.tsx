import type { ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

type AnimatedPressableProps = Omit<PressableProps, 'style' | 'children'> & {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  readonly scaleTo?: number;
};

export function AnimatedPressable({
  children,
  style,
  scaleTo,
  disabled,
  ...rest
}: AnimatedPressableProps) {
  const theme = useTheme();
  const targetScale = scaleTo ?? theme.motion.scale.press;

  return (
    <Pressable
      disabled={disabled}
      style={(state) => {
        const baseStyle = typeof style === 'function' ? style(state) : style;
        const scale = state.pressed && !disabled ? targetScale : 1;
        return [baseStyle, { transform: [{ scale }] }];
      }}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
