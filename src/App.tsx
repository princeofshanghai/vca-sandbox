import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import ComponentLibraryView from '@/views/ComponentLibraryView';
import DashboardView from '@/views/dashboard/DashboardView';
import StudioView from '@/views/studio/StudioView';


const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/foundations/*" element={<ComponentLibraryView />} />
            <Route path="/components/*" element={<ComponentLibraryView />} />
            <Route path="/patterns/*" element={<ComponentLibraryView />} />
            <Route path="/studio/:id" element={<StudioView />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;

