import Constants from 'expo-constants';

export type WebhookConfig = {
  readonly url: string;
  readonly token: string | null;
  readonly useStub: boolean;
};

function readExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra;
  if (extra === undefined || typeof extra !== 'object') {
    return undefined;
  }
  const value = (extra as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

export function readWebhookConfig(): WebhookConfig {
  const url = readExtra('webhookUrl') ?? '';
  const tokenRaw = readExtra('webhookToken');
  const token = tokenRaw !== undefined && tokenRaw.length > 0 ? tokenRaw : null;
  const useStub =
    readExtra('useGenerationStub') === 'true' || url.trim().length === 0;
  return { url, token, useStub };
}
