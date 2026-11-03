import { create } from 'zustand';

import type { GenerationError } from '@/core/types/generation-error';
import type { PartialGenerationParams } from '@/core/types/generation-params';
import { createId } from '@/core/utils/create-id';
import { CHAT_STEPS, type ChatStepId } from '@/features/chat/model/chat-steps';

export type ChatMessageRole = 'assistant' | 'user' | 'system';

export type ChatMessage = {
  readonly id: string;
  readonly role: ChatMessageRole;
  readonly stepId?: ChatStepId;
  readonly text: string;
};

export type ChatPhase = 'collecting' | 'review' | 'generating' | 'success';

type ChatState = {
  readonly messages: readonly ChatMessage[];
  readonly draft: PartialGenerationParams;
  readonly stepIndex: number;
  readonly phase: ChatPhase;
  readonly lastError: GenerationError | null;
  readonly inputErrorKey: string | null;
  readonly savedCount: number;
};

type ChatActions = {
  resetSession: () => void;
  appendUserMessage: (text: string) => void;
  advanceStep: (patch: PartialGenerationParams) => void;
  skipPromptStep: () => void;
  setInputErrorKey: (key: string | null) => void;
  setGenerationError: (error: GenerationError | null) => void;
  startGenerating: () => void;
  markSuccess: (count: number) => void;
};

export type ChatStore = ChatState & ChatActions;

function questionForStep(index: number): ChatMessage {
  const step = CHAT_STEPS[index];
  return {
    id: createId(),
    role: 'assistant',
    stepId: step?.id,
    text: step?.id ?? '',
  };
}

const baseState = (): ChatState => ({
  messages: [questionForStep(0)],
  draft: {},
  stepIndex: 0,
  phase: 'collecting',
  lastError: null,
  inputErrorKey: null,
  savedCount: 0,
});

export const useChatStore = create<ChatStore>((set, get) => ({
  ...baseState(),

  resetSession: () => {
    set(baseState());
  },

  appendUserMessage: (text) => {
    set((state) => ({
      messages: [...state.messages, { id: createId(), role: 'user', text }],
      inputErrorKey: null,
    }));
  },

  advanceStep: (patch) => {
    const state = get();
    const nextIndex = state.stepIndex + 1;
    const nextDraft = { ...state.draft, ...patch };
    if (nextIndex >= CHAT_STEPS.length) {
      set({
        draft: nextDraft,
        stepIndex: nextIndex,
        phase: 'review',
        messages: [...state.messages, { id: createId(), role: 'system', text: 'review' }],
      });
      return;
    }
    set({
      draft: nextDraft,
      stepIndex: nextIndex,
      phase: 'collecting',
      messages: [...state.messages, questionForStep(nextIndex)],
    });
  },

  skipPromptStep: () => {
    get().advanceStep({ prompt: null });
  },

  setInputErrorKey: (key) => {
    set({ inputErrorKey: key });
  },

  setGenerationError: (error) => {
    set((state) => ({
      lastError: error,
      phase: 'review',
      messages: state.messages.filter(
        (message) => !(message.role === 'system' && message.text === 'generating'),
      ),
    }));
  },

  startGenerating: () => {
    set((state) => ({
      phase: 'generating',
      lastError: null,
      messages: [...state.messages, { id: createId(), role: 'system', text: 'generating' }],
    }));
  },

  markSuccess: (count) => {
    set((state) => {
      const withoutGenerating = state.messages.filter(
        (message) => !(message.role === 'system' && message.text === 'generating'),
      );
      return {
        phase: 'success',
        savedCount: count,
        lastError: null,
        messages: [
          ...withoutGenerating,
          { id: createId(), role: 'system', text: 'generated' },
          { id: createId(), role: 'system', text: `success:${String(count)}` },
        ],
      };
    });
  },
}));
