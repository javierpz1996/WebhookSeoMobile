import type { ChatMessage } from '@/features/chat/model/chat-store';
import type { ChatStepId } from '@/features/chat/model/chat-steps';
import { resolveChatStepSuggestions } from '@/features/chat/model/chat-step-suggestions';
import { t } from '@/ui/strings/es';

export function resolveChatMessageText(message: ChatMessage): string {
  if (message.role === 'assistant' && message.stepId !== undefined) {
    return t('chat').questions[message.stepId as ChatStepId];
  }
  if (message.role === 'system') {
    if (message.text === 'review') {
      return t('chat').review;
    }
    if (message.text === 'generating') {
      return t('chat').generating;
    }
    if (message.text === 'generated') {
      return t('chat').articleGenerated;
    }
    if (message.text.startsWith('success:')) {
      const count = message.text.split(':')[1] ?? '0';
      return t('chat').success.replace('{count}', count);
    }
  }
  return message.text;
}

export function resolveChatStepPlaceholder(stepId: ChatStepId): string {
  const suggestions = resolveChatStepSuggestions(stepId);
  if (suggestions.length > 0) {
    return suggestions.map((item) => item.label).join(', ');
  }
  return t('chat').placeholders[stepId];
}

export function resolveChatStepLabel(stepId: ChatStepId): string {
  return t('chat').fields[stepId];
}
