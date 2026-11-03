import * as v from 'valibot';

import type { PartialGenerationParams } from '@/core/types/generation-params';
import type { ChatStepId } from '@/features/chat/model/chat-steps';

export type StepValidationResult =
  | { readonly ok: true; readonly patch: PartialGenerationParams }
  | { readonly ok: false; readonly messageKey: string };

export function validateChatStepAnswer(stepId: ChatStepId, raw: string): StepValidationResult {
  switch (stepId) {
    case 'language':
    case 'topic':
    case 'tone':
    case 'audience': {
      const parsed = v.safeParse(
        v.pipe(v.string(), v.trim(), v.minLength(1, 'chat.errors.required')),
        raw,
      );
      if (!parsed.success) {
        return { ok: false, messageKey: 'chat.errors.required' };
      }
      return { ok: true, patch: { [stepId]: parsed.output } };
    }
    case 'keywords': {
      const parsed = v.safeParse(
        v.pipe(v.string(), v.trim(), v.minLength(1, 'chat.errors.required')),
        raw,
      );
      if (!parsed.success) {
        return { ok: false, messageKey: 'chat.errors.required' };
      }
      const keywords = parsed.output
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
      if (keywords.length === 0) {
        return { ok: false, messageKey: 'chat.errors.required' };
      }
      return { ok: true, patch: { keywords } };
    }
    case 'wordCount':
    case 'sections':
    case 'articleCount': {
      const parsed = v.safeParse(
        v.pipe(
          v.string(),
          v.trim(),
          v.transform(Number),
          v.number('chat.errors.number'),
          v.integer('chat.errors.number'),
          v.minValue(1, 'chat.errors.number'),
        ),
        raw,
      );
      if (!parsed.success) {
        return { ok: false, messageKey: 'chat.errors.number' };
      }
      return { ok: true, patch: { [stepId]: parsed.output } };
    }
    case 'prompt': {
      if (raw.trim().length === 0) {
        return { ok: true, patch: { prompt: null } };
      }
      return { ok: true, patch: { prompt: raw.trim() } };
    }
    default:
      return { ok: false, messageKey: 'chat.errors.required' };
  }
}
