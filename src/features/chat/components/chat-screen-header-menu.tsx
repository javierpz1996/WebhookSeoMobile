import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from 'expo-router/react-navigation';
import { useNavigation } from 'expo-router';
import { Pressable } from 'react-native';

import { text } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

export function ChatScreenHeaderMenu() {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text('a11y', 'openNavigationMenu')}
      onPress={() => {
        navigation.dispatch(DrawerActions.openDrawer());
      }}
      style={({ pressed }) => ({
        width: theme.touchTarget,
        height: theme.touchTarget,
        borderRadius: theme.touchTarget / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.neutral.studioMist,
        opacity: pressed ? theme.motion.opacity.pressed : 1,
      })}
    >
      <Ionicons name="menu" size={22} color={theme.colors.textPrimary} />
    </Pressable>
  );
}
