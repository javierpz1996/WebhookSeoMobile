import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { typographyStyle } from '@/ui/theme/typography';
import { useTheme } from '@/ui/theme/ThemeProvider';

type ChipVariant = 'default' | 'suggestion';

type ChipProps = {
  readonly label: string;
  readonly variant?: ChipVariant;
  readonly selected?: boolean;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
};

export function Chip({
  label,
  variant = 'default',
  selected = false,
  onPress,
  accessibilityLabel,
}: ChipProps) {
  const theme = useTheme();

  const isSuggestion = variant === 'suggestion';
  const backgroundColor = isSuggestion
    ? theme.colors.neutral.ink
    : selected
      ? theme.colors.textPrimary
      : theme.colors.surfaceElevated;
  const borderColor = isSuggestion
    ? theme.colors.neutral.ink
    : selected
      ? theme.colors.textPrimary
      : theme.colors.border;
  const labelColor = isSuggestion
    ? theme.colors.onPrimary
    : selected
      ? theme.colors.onPrimary
      : theme.colors.textPrimary;

  const labelVariant = 'body14';
  const labelScale = theme.typography[labelVariant];
  const suggestionHeight = theme.spacing.xl + theme.spacing.md;

  const content = (
    <Text
      style={[
        typographyStyle(theme, labelVariant, {
          color: labelColor,
          textAlign: 'center',
        }),
        isSuggestion
          ? {
              lineHeight: labelScale.fontSize,
            }
          : null,
        Platform.OS === 'android'
          ? { includeFontPadding: false, textAlignVertical: 'center' as const }
          : null,
      ]}
    >
      {label}
    </Text>
  );

  const chipStyle = [
    styles.chip,
    isSuggestion ? styles.chipSuggestion : null,
    {
      minHeight: onPress === undefined || isSuggestion ? undefined : theme.touchTarget,
      height: isSuggestion && onPress !== undefined ? suggestionHeight : undefined,
      paddingHorizontal: isSuggestion ? theme.spacing.lg : theme.spacing.md,
      paddingVertical: isSuggestion ? 0 : theme.spacing.xs,
      borderRadius: theme.radius.pill,
      backgroundColor,
      borderColor,
      borderWidth: isSuggestion ? 0 : 1,
    },
  ] as const;

  if (onPress === undefined) {
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel ?? label}
        style={chipStyle}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={
        isSuggestion
          ? {
              top: theme.spacing.sm,
              bottom: theme.spacing.sm,
              left: theme.spacing.xs,
              right: theme.spacing.xs,
            }
          : undefined
      }
      style={({ pressed }) => [...chipStyle, { opacity: pressed ? 0.85 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
  },
  chipSuggestion: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
