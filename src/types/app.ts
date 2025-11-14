export type ViewType = 'components' | 'flows' | 'builder';

export interface AppState {
  currentView: ViewType;
  selectedComponentId: string | null;
  selectedFlowId: string | null;
  mobileMenuOpen: boolean;
}

export interface AppContextType {
  state: AppState;
  setCurrentView: (view: ViewType) => void;
  selectComponent: (componentId: string) => void;
  selectFlow: (flowId: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

