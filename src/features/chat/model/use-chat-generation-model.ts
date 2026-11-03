import { useCallback, useEffect } from 'react';

import { serializeContextPayload } from '@/core/utils/context-payload';
import { mergeGenerationParams } from '@/core/utils/merge-generation-params';
import { useAppData } from '@/composition/app-data-provider';
import { ensureOnlineForGeneration } from '@/data/api/ensure-online';
import { CHAT_STEPS } from '@/features/chat/model/chat-steps';
import { generationErrorMessageKey } from '@/features/chat/model/generation-error-message-key';
import { snapshotChatSessionMessages } from '@/features/chat/model/snapshot-chat-session-messages';
import { useChatStore } from '@/features/chat/model/chat-store';
import { validateChatStepAnswer } from '@/features/chat/model/validate-chat-step';

export function useChatGenerationModel() {
  const appData = useAppData();
  const store = useChatStore();

  useEffect(() => {
    useChatStore.getState().resetSession();
  }, []);

  const currentStep = CHAT_STEPS[store.stepIndex] ?? null;

  const submitCurrentStep = useCallback(
    (raw: string, options?: { readonly displayText?: string }) => {
      if (store.phase !== 'collecting' || currentStep === null) {
        return;
      }
      const validated = validateChatStepAnswer(currentStep.id, raw);
      if (!validated.ok) {
        store.setInputErrorKey(validated.messageKey);
        return;
      }
      const displayText = options?.displayText ?? raw;
      store.appendUserMessage(displayText);
      store.advanceStep(validated.patch);
    },
    [currentStep, store],
  );

  const skipPrompt = useCallback(() => {
    if (currentStep?.id !== 'prompt') {
      return;
    }
    store.skipPromptStep();
  }, [currentStep, store]);

  const generate = useCallback(async () => {
    store.startGenerating();

    if (!appData.generationUsesStub) {
      const online = await ensureOnlineForGeneration();
      if (!online.ok) {
        store.setGenerationError(online.error);
        return;
      }
    }

    const contextResult = appData.context.listAll();
    if (!contextResult.ok) {
      store.setGenerationError({ kind: 'unknown', message: 'context load failed' });
      return;
    }

    const merged = mergeGenerationParams(store.draft, contextResult.value);
    if (!merged.ok) {
      store.setGenerationError({ kind: 'unknown', message: 'merge failed' });
      return;
    }

    const generationResult = await appData.generation.generate({
      params: merged.value,
      contextJson: serializeContextPayload(contextResult.value),
    });

    if (!generationResult.ok) {
      store.setGenerationError(generationResult.error);
      return;
    }

    const preSuccessMessages = useChatStore.getState().messages;
    const savedArticles: { readonly id: string; readonly topic: string }[] = [];

    let saved = 0;
    for (const article of generationResult.value) {
      const saveResult = appData.articles.save({
        id: article.id,
        title: article.title,
        slug: article.slug,
        contentMarkdown: article.contentMarkdown,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        seoKeywords: article.seoKeywords,
        faq: article.faq,
        coverImageUrl: article.coverImageUrl,
        language: article.language,
        topic: article.topic,
        params: article.params,
        createdAt: article.createdAt,
      });
      if (!saveResult.ok) {
        store.setGenerationError({ kind: 'unknown', message: saveResult.error.kind });
        return;
      }
      savedArticles.push({ id: saveResult.value.id, topic: saveResult.value.topic });
      saved += 1;
    }

    const sessionMessages = snapshotChatSessionMessages(preSuccessMessages, saved);
    for (const savedArticle of savedArticles) {
      const sessionResult = appData.chatSessions.save({
        articleId: savedArticle.id,
        topic: savedArticle.topic,
        messages: sessionMessages,
      });
      if (!sessionResult.ok) {
        store.setGenerationError({ kind: 'unknown', message: sessionResult.error.kind });
        return;
      }
    }

    store.markSuccess(saved);
  }, [appData, store]);

  const retryGenerate = useCallback(() => {
    void generate();
  }, [generate]);

  const errorMessageKey =
    store.lastError !== null ? generationErrorMessageKey(store.lastError) : null;

  return {
    ...store,
    currentStep,
    submitCurrentStep,
    skipPrompt,
    generate,
    retryGenerate,
    errorMessageKey,
  };
}
