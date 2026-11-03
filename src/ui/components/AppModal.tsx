import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { text } from '@/ui/strings/es';
import { useTheme } from '@/ui/theme/ThemeProvider';

type AppModalProps = {
  readonly visible: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
};

export function AppModal({ visible, title, onClose, children }: AppModalProps) {
  const theme = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={{
            marginHorizontal: theme.spacing.lg,
            marginVertical: theme.spacing['3xl'],
            padding: theme.spacing.lg,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.surface,
            gap: theme.spacing.lg,
            maxHeight: '90%',
          }}
        >
          <View style={styles.header}>
            <Text
              accessibilityRole="header"
              style={{
                flex: 1,
                color: theme.colors.textPrimary,
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
              }}
            >
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={text('common', 'close')}
              onPress={onClose}
              style={{
                minWidth: theme.touchTarget,
                minHeight: theme.touchTarget,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: theme.colors.primary, fontSize: theme.typography.body.fontSize }}>
                ×
              </Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
