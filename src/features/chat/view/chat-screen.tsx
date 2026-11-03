import { useCallback, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatComposer } from '@/features/chat/components/chat-composer';
import { ChatMessageBubble } from '@/features/chat/components/chat-message-bubble';
import { ChatNewGenerationButton } from '@/features/chat/components/chat-new-generation-button';
import { ChatScreenHeaderMenu } from '@/features/chat/components/chat-screen-header-menu';
import {
  resolveChatStepLabel,
  resolveChatStepPlaceholder,
} from '@/features/chat/model/chat-message-text';
import { resolveChatStepSuggestions } from '@/features/chat/model/chat-step-suggestions';
import { useChatGenerationModel } from '@/features/chat/model/use-chat-generation-model';
import {
  FLAT_LIST_INITIAL_NUM_TO_RENDER,
  FLAT_LIST_MAX_TO_RENDER_PER_BATCH,
  FLAT_LIST_WINDOW_SIZE,
} from '@/core/constants';
import { AppleText } from '@/ui/design-system/apple-text';
import { Button } from '@/ui/components/Button';
import { ErrorState } from '@/ui/components/ErrorState';
import { resolveMessageKey } from '@/ui/strings/resolve-message-key';
import { t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

export function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const model = useChatGenerationModel();
  const [input, setInput] = useState('');

  const onSend = useCallback(() => {
    if (model.phase === 'collecting' && input.trim().length > 0) {
      model.submitCurrentStep(input);
      setInput('');
    }
  }, [input, model]);

  const showComposer = model.phase === 'collecting' && model.currentStep !== null;
  const showReviewActions = model.phase === 'review';
  const showError = model.lastError !== null && model.phase === 'review';

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
          minHeight: theme.touchTarget,
        }}
      >
        <View
          style={{ width: theme.touchTarget }}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        />
        <View style={styles.headerTitleSlot}>
          <AppleText variant="nav17" color="primary" style={styles.headerTitle}>
            {t('chat').title}
          </AppleText>
        </View>
        <ChatScreenHeaderMenu />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          testID="chat.messages"
          style={styles.flex}
          data={model.messages}
          keyExtractor={(item) => item.id}
          extraData={model.phase}
          initialNumToRender={FLAT_LIST_INITIAL_NUM_TO_RENDER}
          maxToRenderPerBatch={FLAT_LIST_MAX_TO_RENDER_PER_BATCH}
          windowSize={FLAT_LIST_WINDOW_SIZE}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.md,
            gap: theme.spacing.md,
            flexGrow: 1,
          }}
          renderItem={({ item }) => <ChatMessageBubble message={item} />}
        />

        {showError && model.errorMessageKey !== null ? (
          <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.sm }}>
            <ErrorState
              testID="chat.state.error"
              title={resolveMessageKey(model.errorMessageKey) ?? t('api').errors.unknown}
              retryLabel={t('chat').retryGenerate}
              onRetry={() => {
                void model.retryGenerate();
              }}
            />
          </View>
        ) : null}

        {showReviewActions ? (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              gap: theme.spacing.md,
            }}
          >
            <Button
              variant="inverse"
              trailingArrow
              label={t('chat').generate}
              onPress={() => {
                void model.generate();
              }}
            />
          </View>
        ) : null}

        {model.phase === 'success' ? (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              alignItems: 'center',
            }}
          >
            <ChatNewGenerationButton label={t('chat').newGeneration} onPress={model.resetSession} />
          </View>
        ) : null}

        {showComposer && model.currentStep !== null ? (
          <ChatComposer
            accessibilityLabel={resolveChatStepLabel(model.currentStep.id)}
            value={input}
            suggestions={resolveChatStepSuggestions(model.currentStep.id)}
            onSuggestionPress={(suggestion) => {
              if (model.inputErrorKey !== null) {
                model.setInputErrorKey(null);
              }
              model.submitCurrentStep(suggestion.value, { displayText: suggestion.label });
              setInput('');
            }}
            onChangeText={(value) => {
              setInput(value);
              if (model.inputErrorKey !== null) {
                model.setInputErrorKey(null);
              }
            }}
            placeholder={resolveChatStepPlaceholder(model.currentStep.id)}
            keyboardType={model.currentStep.keyboard === 'numeric' ? 'number-pad' : 'default'}
            errorMessageKey={model.inputErrorKey ?? undefined}
            onSubmit={onSend}
            optionalSkip={model.currentStep.optional === true ? model.skipPrompt : undefined}
            bottomInset={insets.bottom}
          />
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerTitleSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    textAlign: 'center',
  },
});
