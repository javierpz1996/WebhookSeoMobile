import { createContext, useContext, type ReactNode } from 'react';

import { tokens, type ThemeTokens } from '@/ui/theme/tokens';

const ThemeContext = createContext<ThemeTokens>(tokens);

type ThemeProviderProps = {
  readonly children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}
