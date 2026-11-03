import type { GenerationParams } from '@/core/types/generation-params';

export function buildGenerationFormData(
  params: GenerationParams,
  contextJson: string,
): FormData {
  const form = new FormData();
  form.append('language', params.language);
  form.append('topic', params.topic);
  form.append('tone', params.tone);
  form.append('audience', params.audience);
  form.append('keywords', params.keywords.join(','));
  form.append('wordCount', String(params.wordCount));
  form.append('sections', String(params.sections));
  form.append('articleCount', String(params.articleCount));
  form.append('context', contextJson);
  if (params.prompt !== null && params.prompt.trim().length > 0) {
    form.append('prompt', params.prompt.trim());
  }
  return form;
}
