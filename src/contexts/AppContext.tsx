import { createContext, useContext, useState, ReactNode } from 'react';
import type { AppState, AppContextType, ViewType } from '@/types/app';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    currentView: 'components',
    selectedComponentId: null,
    selectedFlowId: null,
    mobileMenuOpen: false,
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

  return (
    <AppContext.Provider value={{ state, setCurrentView, selectComponent, selectFlow, setMobileMenuOpen }}>
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

