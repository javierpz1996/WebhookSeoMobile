import { Ionicons } from '@expo/vector-icons';
import type { DrawerContentComponentProps } from 'expo-router/drawer';
import { router } from 'expo-router';
import { DrawerActions } from 'expo-router/react-navigation';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ChatSessionRepository } from '@/core/ports/chat-session-repository';
import { isOk } from '@/core/utils/result';
import { AppleText } from '@/ui/design-system/apple-text';
import {
  DrawerNavRow,
  DrawerRecentRow,
  DrawerSectionLabel,
} from '@/ui/drawer/drawer-nav-row';
import { HairlineDivider } from '@/ui/design-system/hairline-divider';
import { text } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

type MainRouteName = 'index' | 'articles/index' | 'context';

type AppleDrawerContentProps = DrawerContentComponentProps & {
  readonly chatSessions: ChatSessionRepository;
};

function resolveActiveRoute(routeName: string): MainRouteName | 'articles/index' {
  if (routeName === 'articles/[id]') {
    return 'articles/index';
  }
  if (routeName.startsWith('chat/')) {
    return 'index';
  }
  if (routeName === 'index' || routeName === 'articles/index' || routeName === 'context') {
    return routeName;
  }
  return 'index';
}

export function AppleDrawerContent({ navigation, state, chatSessions }: AppleDrawerContentProps) {
  const theme = useTheme();
  const activeRoute = resolveActiveRoute(state.routes[state.index]?.name ?? 'index');

  const recentResult = chatSessions.listRecent(5);
  const recentSessions = isOk(recentResult) ? recentResult.value : [];

  const closeAndNavigate = (route: MainRouteName) => {
    navigation.dispatch(DrawerActions.closeDrawer());
    if (route === 'index') {
      router.navigate('/');
      return;
    }
    if (route === 'articles/index') {
      router.navigate('/articles');
      return;
    }
    router.navigate('/context');
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderTopRightRadius: theme.radius.card,
        borderBottomRightRadius: theme.radius.card,
        overflow: 'hidden',
      }}
      edges={['top', 'bottom', 'left']}
    >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.neutral.studioMist,
              }}
            >
              <Ionicons name="flask-outline" size={20} color={theme.colors.brand.link} />
            </View>
            <AppleText variant="productNavTitle" color="primary">
              {text('nav', 'articleLab')}
            </AppleText>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.sm,
            paddingBottom: theme.spacing.md,
          }}
          showsVerticalScrollIndicator={false}
        >
          <DrawerSectionLabel>{text('nav', 'principal')}</DrawerSectionLabel>
          <DrawerNavRow
            label={text('nav', 'chat')}
            icon="chatbubble-outline"
            active={activeRoute === 'index'}
            onPress={() => {
              closeAndNavigate('index');
            }}
          />
          <DrawerNavRow
            label={text('nav', 'articles')}
            icon="layers-outline"
            active={activeRoute === 'articles/index'}
            onPress={() => {
              closeAndNavigate('articles/index');
            }}
          />
          <DrawerNavRow
            label={text('nav', 'context')}
            icon="book-outline"
            active={activeRoute === 'context'}
            onPress={() => {
              closeAndNavigate('context');
            }}
          />

          <View style={{ marginVertical: theme.spacing.md }}>
            <HairlineDivider />
          </View>

          <DrawerSectionLabel>{text('nav', 'recent')}</DrawerSectionLabel>
          {recentSessions.length === 0 ? (
            <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm }}>
              <AppleText variant="body14" color="muted">
                {text('nav', 'recentEmpty')}
              </AppleText>
            </View>
          ) : (
            recentSessions.map((session) => (
              <DrawerRecentRow
                key={session.id}
                label={session.topic}
                onPress={() => {
                  navigation.dispatch(DrawerActions.closeDrawer());
                  router.navigate(`/chat/${session.id}`);
                }}
              />
            ))
          )}
        </ScrollView>
    </SafeAreaView>
  );
}
