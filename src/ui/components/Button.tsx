import type { PressableProps } from 'react-native';
import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AnimatedPressable } from '@/ui/design-system/animated-pressable';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { typographyStyle } from '@/ui/theme/typography';

type ButtonVariant = 'primary' | 'ghost' | 'link' | 'inverse';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  readonly label: string;
  readonly variant?: ButtonVariant;
  readonly loading?: boolean;
  readonly trailingArrow?: boolean;
  readonly accessibilityLabel?: string;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  trailingArrow = false,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled === true || loading;

  const isCta = variant === 'primary';
  const isInverse = variant === 'inverse';
  const isLink = variant === 'link';

  const backgroundColor = (() => {
    if (isLink || variant === 'ghost') {
      return 'transparent';
    }
    if (isDisabled) {
      return theme.colors.neutral.controlGray;
    }
    if (isInverse) {
      return theme.colors.neutral.ink;
    }
    return theme.colors.cta;
  })();

  const textColor = (() => {
    if ((isCta || isInverse) && !isDisabled) {
      return isInverse ? theme.colors.onPrimary : theme.colors.onCta;
    }
    if (isLink || variant === 'ghost') {
      return theme.colors.brand.link;
    }
    return theme.colors.textMuted;
  })();

  const borderRadius = isCta || isInverse ? theme.radius.pill : theme.radius.link;
  const labelVariant = isCta ? 'buttonLabel' : 'body17';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      scaleTo={isLink ? theme.motion.scale.pressSubtle : theme.motion.scale.press}
      style={({ pressed }: { pressed: boolean }) => [
        {
          minHeight: theme.touchTarget,
          paddingHorizontal: isCta ? theme.spacing.xl : theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius,
          backgroundColor:
            pressed && (isCta || isInverse) && !isDisabled
              ? isInverse
                ? theme.colors.neutral.slate
                : theme.colors.ctaPressed
              : backgroundColor,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: theme.colors.border,
          opacity: isDisabled ? 0.7 : 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm,
          }}
        >
          <Text style={typographyStyle(theme, labelVariant, { color: textColor, textAlign: 'center' })}>
            {label}
          </Text>
          {trailingArrow && isInverse && !isDisabled ? (
            <Ionicons name="arrow-forward" size={18} color={textColor} />
          ) : null}
        </View>
      )}
    </AnimatedPressable>
  );
}
