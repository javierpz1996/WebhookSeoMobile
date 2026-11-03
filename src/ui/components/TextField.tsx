import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { resolveMessageKey } from '@/ui/strings/resolve-message-key';
import { useTheme } from '@/ui/theme/ThemeProvider';

type TextFieldProps = Omit<TextInputProps, 'onChange' | 'onChangeText'> & {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly onBlur?: () => void;
  readonly errorMessageKey?: string;
  readonly disabled?: boolean;
};

export function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  errorMessageKey,
  disabled = false,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const errorMessage = resolveMessageKey(errorMessageKey);
  const hasError = errorMessage !== null;

  return (
    <View style={styles.wrapper}>
      <Text
        style={{
          color: theme.colors.textPrimary,
          fontSize: theme.typography.bodySm.fontSize,
          lineHeight: theme.typography.bodySm.lineHeight,
          marginBottom: theme.spacing.xs,
        }}
      >
        {label}
      </Text>
      <TextInput
        accessibilityRole="text"
        accessibilityLabel={label}
        accessibilityHint={errorMessage ?? undefined}
        editable={!disabled}
        value={value}
        onChangeText={onChangeText}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onFocus={() => {
          setFocused(true);
        }}
        placeholderTextColor={theme.colors.textDisabled}
        style={{
          minHeight: theme.touchTarget,
          borderWidth: 1,
          borderColor: hasError
            ? theme.colors.error
            : focused
              ? theme.colors.brand.link
              : theme.colors.borderStrong,
          borderRadius: theme.radius.input,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          color: theme.colors.textPrimary,
          fontSize: theme.typography.body.fontSize,
          backgroundColor: disabled ? theme.colors.neutral.controlGray : theme.colors.surface,
        }}
        {...inputProps}
      />
      {errorMessage !== null ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{
            color: theme.colors.error,
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs,
          }}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
});
