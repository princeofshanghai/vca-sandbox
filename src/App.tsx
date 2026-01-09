import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import ComponentLibraryView from '@/views/ComponentLibraryView';
import HomeView from '@/views/HomeView';
import { FlowBuilder } from '@/components/builder/FlowBuilder';

import StudioV2View from '@/views/studio-v2/StudioV2View';

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/foundations/*" element={<ComponentLibraryView />} />
            <Route path="/components/*" element={<ComponentLibraryView />} />
            <Route path="/patterns/*" element={<ComponentLibraryView />} />
            <Route path="/flows" element={<FlowBuilder />} />
            <Route path="/studio-v2" element={<StudioV2View />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;

