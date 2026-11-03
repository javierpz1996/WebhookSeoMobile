import type { PartialGenerationParams } from '@/core/types/generation-params';

export type ChatStepId =
  | 'language'
  | 'topic'
  | 'tone'
  | 'audience'
  | 'keywords'
  | 'wordCount'
  | 'sections'
  | 'articleCount'
  | 'prompt';

export type ChatStep = {
  readonly id: ChatStepId;
  readonly questionKey: ChatStepId;
  readonly field: keyof PartialGenerationParams;
  readonly optional?: boolean;
  readonly keyboard: 'default' | 'numeric';
};

export const CHAT_STEPS: readonly ChatStep[] = [
  { id: 'language', questionKey: 'language', field: 'language', keyboard: 'default' },
  { id: 'topic', questionKey: 'topic', field: 'topic', keyboard: 'default' },
  { id: 'tone', questionKey: 'tone', field: 'tone', keyboard: 'default' },
  { id: 'audience', questionKey: 'audience', field: 'audience', keyboard: 'default' },
  { id: 'keywords', questionKey: 'keywords', field: 'keywords', keyboard: 'default' },
  { id: 'wordCount', questionKey: 'wordCount', field: 'wordCount', keyboard: 'numeric' },
  { id: 'sections', questionKey: 'sections', field: 'sections', keyboard: 'numeric' },
  {
    id: 'articleCount',
    questionKey: 'articleCount',
    field: 'articleCount',
    keyboard: 'numeric',
  },
  { id: 'prompt', questionKey: 'prompt', field: 'prompt', optional: true, keyboard: 'default' },
];

export function getChatStep(index: number): ChatStep | null {
  return CHAT_STEPS[index] ?? null;
}
