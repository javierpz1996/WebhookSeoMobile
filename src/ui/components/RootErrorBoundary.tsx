import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { text } from '@/ui/strings/es';
import { tokens } from '@/ui/theme/tokens';

type RootErrorBoundaryProps = {
  readonly children: ReactNode;
};

type RootErrorBoundaryState = {
  readonly message: string | null;
};

export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = { message: null };

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('RootErrorBoundary', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.message !== null) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{text('common', 'fatalErrorTitle')}</Text>
          <Text style={styles.body}>{this.state.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: tokens.spacing.xl,
    backgroundColor: tokens.colors.background,
  },
  title: {
    color: tokens.colors.textPrimary,
    fontSize: tokens.typography.h2.fontSize,
    fontWeight: tokens.typography.h2.fontWeight,
    marginBottom: tokens.spacing.md,
  },
  body: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.bodySm.fontSize,
    lineHeight: tokens.typography.bodySm.lineHeight,
  },
});
