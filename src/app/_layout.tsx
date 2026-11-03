import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import type { DrawerContentComponentProps } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useCheckpointOnBackground } from '@/composition/use-checkpoint-on-background';
import { AppDataProvider, useAppData } from '@/composition/app-data-provider';
import { createAppData } from '@/data/composition/create-app-data';
import { loadJsonDocumentFromDisk } from '@/data/persistence/json-persistence-io';
import { initJsonDocumentStore } from '@/data/persistence/json-document-store';
import { readStorageConfig } from '@/data/persistence/read-storage-config';
import { MemoryDatabaseBanner } from '@/ui/components/MemoryDatabaseBanner';
import { RootErrorBoundary } from '@/ui/components/RootErrorBoundary';
import { StubGenerationBanner } from '@/ui/components/StubGenerationBanner';
import { text } from '@/ui/strings/es';
import { ThemeProvider, useTheme } from '@/ui/theme/ThemeProvider';
import { AppleDrawerContent } from '@/ui/drawer/apple-drawer-content';

function DrawerContentWithData(props: DrawerContentComponentProps) {
  const { chatSessions } = useAppData();
  return <AppleDrawerContent {...props} chatSessions={chatSessions} />;
}

function DrawerLayoutInner() {
  const theme = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <DrawerContentWithData {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: theme.typography.productNavTitle.fontSize,
          fontWeight: theme.typography.productNavTitle.fontWeight,
        },
        drawerStyle: {
          width: 320,
          backgroundColor: 'transparent',
          borderRightWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        drawerContentContainerStyle: {
          backgroundColor: 'transparent',
          flex: 1,
        },
        drawerContentStyle: {
          backgroundColor: 'transparent',
        },
        drawerType: 'front',
        overlayColor: theme.colors.overlay,
        swipeEdgeWidth: 48,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: text('chat', 'title'),
          drawerItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="articles/index"
        options={{
          title: text('articles', 'title'),
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="context"
        options={{
          title: text('context', 'title'),
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="articles/[id]"
        options={{
          drawerItemStyle: { display: 'none' },
          title: text('articles', 'title'),
        }}
      />
      <Drawer.Screen
        name="chat/[sessionId]"
        options={{
          drawerItemStyle: { display: 'none' },
          title: text('chat', 'title'),
        }}
      />
    </Drawer>
  );
}

function AppBootLoading() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <ActivityIndicator color={theme.colors.primary} accessibilityLabel={text('common', 'loadingApp')} />
    </View>
  );
}

function AppShell() {
  const usesJson = readStorageConfig().useJson;
  const [appData, setAppData] = useState<ReturnType<typeof createAppData> | null>(() =>
    usesJson ? null : createAppData(),
  );

  useEffect(() => {
    if (!usesJson) {
      return;
    }
    let cancelled = false;
    void loadJsonDocumentFromDisk().then((doc) => {
      initJsonDocumentStore(doc);
      if (!cancelled) {
        setAppData(createAppData());
      }
    });
    return () => {
      cancelled = true;
    };
  }, [usesJson]);

  if (appData === null) {
    return <AppBootLoading />;
  }

  return <AppShellReady appData={appData} />;
}

function AppShellReady({ appData }: { readonly appData: ReturnType<typeof createAppData> }) {
  useCheckpointOnBackground(appData);

  return (
    <AppDataProvider value={appData}>
      {appData.database.kind === 'memory-fallback' ? <MemoryDatabaseBanner /> : null}
      {appData.generationUsesStub ? <StubGenerationBanner /> : null}
      <DrawerLayoutInner />
    </AppDataProvider>
  );
}

export default function RootLayout() {
  return (
    <RootErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </GestureHandlerRootView>
    </RootErrorBoundary>
  );
}
