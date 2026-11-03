import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { AppleText } from '@/ui/design-system/apple-text';
import { useTheme } from '@/ui/theme/ThemeProvider';

type ChatNewGenerationButtonProps = {
  readonly label: string;
  readonly onPress: () => void;
  readonly accessibilityLabel?: string;
};

export function ChatNewGenerationButton({
  label,
  onPress,
  accessibilityLabel,
}: ChatNewGenerationButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        minHeight: theme.touchTarget,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surface,
        opacity: pressed ? theme.motion.opacity.pressed : 1,
      })}
    >
      <Ionicons name="refresh" size={20} color={theme.colors.textPrimary} />
      <AppleText variant="body17" color="primary">
        {label}
      </AppleText>
    </Pressable>
  );
}
