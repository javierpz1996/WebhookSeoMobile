import { useLayoutEffect, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppData } from '@/composition/app-data-provider';
import {
  FLAT_LIST_INITIAL_NUM_TO_RENDER,
  FLAT_LIST_MAX_TO_RENDER_PER_BATCH,
  FLAT_LIST_WINDOW_SIZE,
} from '@/core/constants';
import type { StoredChatMessage } from '@/core/types/chat-session';
import { isOk } from '@/core/utils/result';
import { ChatMessageBubble } from '@/features/chat/components/chat-message-bubble';
import type { ChatStepId } from '@/features/chat/model/chat-steps';
import type { ChatMessage } from '@/features/chat/model/chat-store';
import { Button } from '@/ui/components/Button';
import { ErrorState } from '@/ui/components/ErrorState';
import { AppleText } from '@/ui/design-system/apple-text';
import { t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

const CHAT_STEP_IDS: ReadonlySet<string> = new Set([
  'language',
  'topic',
  'tone',
  'audience',
  'keywords',
  'wordCount',
  'sections',
  'articleCount',
  'prompt',
]);

function toChatMessage(stored: StoredChatMessage): ChatMessage {
  const stepId =
    stored.stepId !== undefined && CHAT_STEP_IDS.has(stored.stepId)
      ? (stored.stepId as ChatStepId)
      : undefined;
  return {
    id: stored.id,
    role: stored.role,
    text: stored.text,
    ...(stepId !== undefined ? { stepId } : {}),
  };
}

export function ChatHistoryScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { chatSessions } = useAppData();
  const params = useLocalSearchParams<{ sessionId: string | string[] }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : params.sessionId?.[0];

  const session = useMemo(() => {
    if (sessionId === undefined || sessionId.length === 0) {
      return null;
    }
    const result = chatSessions.getById(sessionId);
    return isOk(result) ? result.value : null;
  }, [chatSessions, sessionId]);
  const messages = useMemo(
    () => (session !== null ? session.messages.map(toChatMessage) : []),
    [session],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: session?.topic ?? t('chat').title,
    });
  }, [navigation, session?.topic]);

  if (session === null) {
    return (
      <SafeAreaView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        edges={['left', 'right', 'bottom']}
      >
        <View style={{ flex: 1, justifyContent: 'center', padding: theme.spacing.lg }}>
          <ErrorState
            title={t('chatHistory').notFoundTitle}
            retryLabel={t('chatHistory').backToChat}
            onRetry={() => {
              router.navigate('/');
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <FlatList
        testID="chat.history.messages"
        style={styles.flex}
        data={messages}
        keyExtractor={(item) => item.id}
        extraData={session.id}
        initialNumToRender={FLAT_LIST_INITIAL_NUM_TO_RENDER}
        maxToRenderPerBatch={FLAT_LIST_MAX_TO_RENDER_PER_BATCH}
        windowSize={FLAT_LIST_WINDOW_SIZE}
        removeClippedSubviews={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.md,
          gap: theme.spacing.md,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <ChatMessageBubble message={item} displayPhase="success" />
        )}
        ListFooterComponent={
          <View
            style={{
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              gap: theme.spacing.sm,
            }}
          >
            <AppleText variant="body14" color="muted" style={{ textAlign: 'center' }}>
              {t('chatHistory').footerHint}
            </AppleText>
            <Button
              variant="inverse"
              trailingArrow
              label={t('chatHistory').viewArticle}
              onPress={() => {
                router.navigate(`/articles/${session.articleId}`);
              }}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
