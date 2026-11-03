import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Chip } from '@/ui/components/Chip';
import { resolveMessageKey } from '@/ui/strings/resolve-message-key';
import { text, t } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { typographyStyle } from '@/ui/theme/typography';

import type { ChatStepSuggestion } from '@/features/chat/model/chat-step-suggestions';

type ChatComposerProps = {
  readonly accessibilityLabel: string;
  readonly value: string;
  readonly placeholder: string;
  readonly onChangeText: (value: string) => void;
  readonly onSubmit: () => void;
  readonly keyboardType?: 'default' | 'number-pad';
  readonly errorMessageKey?: string;
  readonly optionalSkip?: () => void;
  readonly bottomInset?: number;
  readonly suggestions?: readonly ChatStepSuggestion[];
  readonly onSuggestionPress?: (suggestion: ChatStepSuggestion) => void;
};

export function ChatComposer({
  accessibilityLabel,
  value,
  placeholder,
  onChangeText,
  onSubmit,
  keyboardType = 'default',
  errorMessageKey,
  optionalSkip,
  bottomInset = 0,
  suggestions = [],
  onSuggestionPress,
}: ChatComposerProps) {
  const theme = useTheme();
  const errorMessage = resolveMessageKey(errorMessageKey);
  const canSend = value.trim().length > 0;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const composerBottomPadding =
    keyboardVisible ? theme.spacing.sm : Math.max(bottomInset, theme.spacing.sm);
  const composerRowHeight = theme.touchTarget + 8;
  const isNumericKeyboard = keyboardType === 'number-pad';
  const body17 = theme.typography.body17;
  const inputTextStyle = {
    fontFamily: theme.fontFamily.text,
    fontSize: body17.fontSize,
    fontWeight: body17.fontWeight,
    letterSpacing: body17.letterSpacing,
    color: theme.colors.textPrimary,
    padding: 0,
    margin: 0,
    width: '100%' as const,
    ...(Platform.OS === 'android'
      ? { textAlignVertical: 'center' as const, includeFontPadding: false }
      : {}),
  };

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: composerBottomPadding,
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.background,
      }}
    >
      {suggestions.length > 0 && onSuggestionPress !== undefined ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexDirection: 'row',
            gap: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
          }}
        >
          {suggestions.map((suggestion) => (
            <Chip
              key={suggestion.value}
              variant="suggestion"
              label={suggestion.label}
              onPress={() => {
                onSuggestionPress(suggestion);
              }}
            />
          ))}
        </ScrollView>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: composerRowHeight,
          paddingLeft: theme.spacing.lg,
          paddingRight: theme.spacing.xs,
          borderRadius: theme.radius.input,
          backgroundColor: theme.colors.neutral.studioMist,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            minHeight: composerRowHeight,
            paddingVertical: 0,
          }}
        >
          <TextInput
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={text('a11y', 'chatComposerHint')}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textDisabled}
            keyboardType={keyboardType}
            returnKeyType={isNumericKeyboard ? 'done' : 'send'}
            multiline={false}
            scrollEnabled={false}
            underlineColorAndroid="transparent"
            onSubmitEditing={
              isNumericKeyboard
                ? undefined
                : () => {
                    if (canSend) {
                      onSubmit();
                    }
                  }
            }
            style={inputTextStyle}
          />
        </View>
        {optionalSkip !== undefined && !canSend ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('chat').skipPrompt}
            onPress={optionalSkip}
            style={({ pressed }) => ({
              minHeight: 36,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? theme.colors.ctaPressed : theme.colors.cta,
              opacity: pressed ? theme.motion.opacity.pressed : 1,
            })}
          >
            <Text style={typographyStyle(theme, 'body14', { color: theme.colors.onCta, textAlign: 'center' })}>
              {t('chat').skipPrompt}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('chat').send}
            accessibilityState={{ disabled: !canSend }}
            disabled={!canSend}
            onPress={onSubmit}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.neutral.ink,
              opacity: !canSend ? 0.35 : pressed ? theme.motion.opacity.pressed : 1,
            })}
          >
            <Ionicons name="arrow-forward" size={18} color={theme.colors.onPrimary} />
          </Pressable>
        )}
      </View>
      {errorMessage !== null ? (
        <Text
          accessibilityLiveRegion="polite"
          style={typographyStyle(theme, 'caption12', { color: theme.colors.error })}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
