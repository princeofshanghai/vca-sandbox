import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AppState, AppContextType, ViewType, ThemeMode } from '@/types/app';

const AppContext = createContext<AppContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'vca-shell-theme';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    let persistedTheme: ThemeMode = 'light';

    if (typeof window !== 'undefined') {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        persistedTheme = storedTheme;
      }
    }

    return {
      currentView: 'components',
      selectedComponentId: null,
      selectedFlowId: null,
      mobileMenuOpen: false,
      theme: persistedTheme,
    };
  });

  const setCurrentView = (view: ViewType) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  const selectComponent = (componentId: string) => {
    setState(prev => ({ ...prev, selectedComponentId: componentId }));
  };

  const selectFlow = (flowId: string) => {
    setState(prev => ({ ...prev, selectedFlowId: flowId }));
  };

  const setMobileMenuOpen = (open: boolean) => {
    setState(prev => ({ ...prev, mobileMenuOpen: open }));
  };

  const setTheme = (theme: ThemeMode) => {
    setState(prev => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, setCurrentView, selectComponent, selectFlow, setMobileMenuOpen, setTheme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
