import { createContext, useContext, type ReactNode } from 'react';

import type { AppData } from '@/data/composition/create-app-data';

const AppDataContext = createContext<AppData | null>(null);

type AppDataProviderProps = {
  readonly value: AppData;
  readonly children: ReactNode;
};

export function AppDataProvider({ value, children }: AppDataProviderProps) {
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const value = useContext(AppDataContext);
  if (value === null) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return value;
}
