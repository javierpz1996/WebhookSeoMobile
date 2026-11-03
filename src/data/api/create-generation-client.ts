import type { GenerationClient } from '@/core/ports/generation-client';

import { createN8nGenerationClient } from '@/data/api/n8n-generation-client';
import { readWebhookConfig } from '@/data/api/read-webhook-config';
import { createStubGenerationClient } from '@/data/api/stub-generation-client';

export function createGenerationClient(): GenerationClient {
  const config = readWebhookConfig();
  if (config.useStub) {
    return createStubGenerationClient();
  }
  return createN8nGenerationClient({
    url: config.url,
    token: config.token,
  });
}
