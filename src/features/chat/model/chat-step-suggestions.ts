import type { ChatStepId } from '@/features/chat/model/chat-steps';
import { t } from '@/ui/strings/es';

export type ChatStepSuggestion = {
  readonly label: string;
  readonly value: string;
};

const LANGUAGE_SUGGESTION_CODES = ['es', 'en', 'pt', 'fr', 'it', 'de'] as const;
const TONE_SUGGESTION_CODES = ['formal', 'informal', 'conversacional'] as const;

export function resolveChatStepSuggestions(stepId: ChatStepId): readonly ChatStepSuggestion[] {
  if (stepId === 'language') {
    const labels = t('chat').suggestions.language;
    return LANGUAGE_SUGGESTION_CODES.map((code) => ({
      value: code,
      label: labels[code],
    }));
  }
  if (stepId === 'tone') {
    const labels = t('chat').suggestions.tone;
    return TONE_SUGGESTION_CODES.map((code) => ({
      value: code,
      label: labels[code],
    }));
  }
  return [];
}
