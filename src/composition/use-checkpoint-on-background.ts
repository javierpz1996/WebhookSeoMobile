import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { AppData } from '@/data/composition/create-app-data';

export function useCheckpointOnBackground(appData: AppData): void {
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state !== 'active' && appData.driver.isPersistent) {
        appData.driver.checkpoint();
      }
    };
    const subscription = AppState.addEventListener('change', onChange);
    return () => {
      subscription.remove();
    };
  }, [appData]);
}
