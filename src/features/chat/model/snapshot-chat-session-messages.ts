import type { StoredChatMessage } from '@/core/types/chat-session';
import { createId } from '@/core/utils/create-id';

import type { ChatMessage } from '@/features/chat/model/chat-store';

export function snapshotChatSessionMessages(
  messages: readonly ChatMessage[],
  savedCount: number,
): readonly StoredChatMessage[] {
  const withoutGenerating = messages.filter(
    (message) => !(message.role === 'system' && message.text === 'generating'),
  );
  const finalized: readonly ChatMessage[] = [
    ...withoutGenerating,
    { id: createId(), role: 'system', text: 'generated' },
    { id: createId(), role: 'system', text: `success:${String(savedCount)}` },
  ];
  return finalized.map((message) => ({
    id: message.id,
    role: message.role,
    text: message.text,
    ...(message.stepId !== undefined ? { stepId: message.stepId } : {}),
  }));
}
