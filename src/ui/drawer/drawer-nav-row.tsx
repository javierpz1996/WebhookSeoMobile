import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';

import { AppleText } from '@/ui/design-system/apple-text';
import { useTheme } from '@/ui/theme/ThemeProvider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type DrawerNavRowProps = {
  readonly label: string;
  readonly icon: IoniconName;
  readonly active?: boolean;
  readonly onPress: () => void;
  readonly accessibilityLabel?: string;
};

export function DrawerNavRow({
  label,
  icon,
  active = false,
  onPress,
  accessibilityLabel,
}: DrawerNavRowProps) {
  const theme = useTheme();
  const tint = theme.colors.brand.link;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        minHeight: theme.touchTarget,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.link,
        backgroundColor: active ? theme.colors.brand.linkTint : 'transparent',
        opacity: pressed ? theme.motion.opacity.pressed : 1,
      })}
    >
      <Ionicons
        name={icon}
        size={20}
        color={active ? tint : theme.colors.neutral.ink}
      />
      <AppleText
        variant="body14"
        color="primary"
        style={{
          flex: 1,
          fontWeight: theme.typography.nav17.fontWeight,
          color: active ? tint : theme.colors.neutral.ink,
        }}
      >
        {label}
      </AppleText>
    </Pressable>
  );
}

type DrawerRecentRowProps = {
  readonly label: string;
  readonly onPress: () => void;
};

export function DrawerRecentRow({ label, onPress }: DrawerRecentRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        minHeight: theme.touchTarget,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.link,
        opacity: pressed ? theme.motion.opacity.pressed : 1,
      })}
    >
      <Ionicons name="time-outline" size={20} color={theme.colors.neutral.ink} />
      <AppleText
        variant="body14"
        color="primary"
        numberOfLines={1}
        style={{ flex: 1, fontWeight: theme.typography.nav17.fontWeight }}
      >
        {label}
      </AppleText>
    </Pressable>
  );
}

export function DrawerSectionLabel({ children }: { readonly children: string }) {
  const theme = useTheme();

  return (
    <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xs }}>
      <AppleText variant="body14" color="muted">
        {children}
      </AppleText>
    </View>
  );
}
