import NetInfo from '@react-native-community/netinfo';

import type { GenerationError } from '@/core/types/generation-error';
import { err, ok, type Result } from '@/core/utils/result';

export async function ensureOnlineForGeneration(): Promise<Result<void, GenerationError>> {
  const state = await NetInfo.fetch();
  const online = state.isConnected === true && state.isInternetReachable !== false;
  if (!online) {
    return err({ kind: 'network-offline' });
  }
  return ok(undefined);
}
