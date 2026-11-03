import type { ExpoConfig } from 'expo/config';

const webhookUrl = process.env.EXPO_PUBLIC_WEBHOOK_URL ?? '';
const webhookToken = process.env.EXPO_PUBLIC_WEBHOOK_TOKEN ?? '';
const useGenerationStub = process.env.EXPO_PUBLIC_USE_GENERATION_STUB ?? '';
const useJsonStorage = process.env.EXPO_PUBLIC_USE_JSON_STORAGE ?? 'true';

const config: ExpoConfig = {
  name: 'Article Studio',
  slug: 'article-studio',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'article-studio',
  extra: {
    webhookUrl,
    webhookToken,
    useGenerationStub,
    useJsonStorage,
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: ['expo-router', 'expo-sqlite', 'expo-image'],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
