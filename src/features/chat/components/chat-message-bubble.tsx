import { Ionicons } from '@expo/vector-icons';
import { memo, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useChatStore, type ChatMessage, type ChatPhase } from '@/features/chat/model/chat-store';
import { resolveChatMessageText } from '@/features/chat/model/chat-message-text';
import { text, t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { typographyStyle } from '@/ui/theme/typography';

type ChatMessageBubbleProps = {
  readonly message: ChatMessage;
  readonly displayPhase?: ChatPhase;
};

function StatusGreenBubble({
  align,
  body,
  accessibilityLabel,
  leading,
}: {
  readonly align: 'left' | 'center';
  readonly body: string;
  readonly accessibilityLabel: string;
  readonly leading?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      style={[
        align === 'center' ? styles.statusPillCenter : styles.bubble,
        {
          alignSelf: align === 'center' ? 'center' : 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          backgroundColor: theme.colors.statusGreen,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      {leading}
      <Text
        style={[
          typographyStyle(theme, 'body17', { color: theme.colors.onPrimary }),
          styles.statusText,
        ]}
      >
        {body}
      </Text>
    </View>
  );
}

export const ChatMessageBubble = memo(function ChatMessageBubble({
  message,
  displayPhase,
}: ChatMessageBubbleProps) {
  const theme = useTheme();
  const livePhase = useChatStore((state) => state.phase);
  const phase = displayPhase ?? livePhase;
  const onPrimary = theme.colors.onPrimary;
  const isUser = message.role === 'user';
  const isReviewHint = message.role === 'system' && message.text === 'review';
  const isGeneratingMessage = message.role === 'system' && message.text === 'generating';
  const isGenerating = isGeneratingMessage && phase === 'generating';
  const isGenerated = message.role === 'system' && message.text === 'generated';
  const isSuccess = message.role === 'system' && message.text.startsWith('success:');
  const resolvedBody = resolveChatMessageText(message);
  const body =
    isGeneratingMessage && phase === 'success' ? t('chat').articleGenerated : resolvedBody;
  const accessibilityLabel = isUser
    ? `${text('a11y', 'chatUserMessage')}: ${body}`
    : `${text('a11y', 'chatAssistantMessage')}: ${body}`;

  const checkmarkIcon = <Ionicons name="checkmark-circle" size={22} color={onPrimary} />;

  if (isReviewHint) {
    return (
      <StatusGreenBubble align="left" body={body} accessibilityLabel={accessibilityLabel} />
    );
  }

  if (isSuccess) {
    return (
      <StatusGreenBubble
        align="left"
        body={body}
        accessibilityLabel={accessibilityLabel}
        leading={checkmarkIcon}
      />
    );
  }

  if (isGenerated || (isGeneratingMessage && phase === 'success')) {
    return (
      <StatusGreenBubble
        align="center"
        body={body}
        accessibilityLabel={accessibilityLabel}
        leading={checkmarkIcon}
      />
    );
  }

  if (isGeneratingMessage && isGenerating) {
    return (
      <StatusGreenBubble
        align="center"
        body={body}
        accessibilityLabel={accessibilityLabel}
        leading={<ActivityIndicator size="small" color={onPrimary} />}
      />
    );
  }

  const bubbleBackground = isUser ? theme.colors.neutral.ink : theme.colors.neutral.studioMist;
  const bubbleTextColor = isUser ? theme.colors.onPrimary : theme.colors.textPrimary;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.bubble,
        {
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          backgroundColor: bubbleBackground,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      <Text style={typographyStyle(theme, 'body17', { color: bubbleTextColor })}>{body}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '88%',
  },
  statusPillCenter: {
    maxWidth: '92%',
  },
  statusText: {
    flexShrink: 1,
  },
});
