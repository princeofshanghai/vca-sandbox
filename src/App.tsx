import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import TopNavigation from '@/components/layout/TopNavigation';
import ComponentLibraryView from '@/views/ComponentLibraryView';
import FlowPreviewView from '@/views/FlowPreviewView';

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="h-screen flex flex-col overflow-hidden">
          <TopNavigation />
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/foundations/typography" replace />} />
              <Route path="/foundations/*" element={<ComponentLibraryView />} />
              <Route path="/components/*" element={<ComponentLibraryView />} />
              <Route path="/flows" element={<FlowPreviewView />} />
              <Route path="/builder" element={<Navigate to="/foundations/typography" replace />} />
              <Route path="*" element={<Navigate to="/foundations/typography" replace />} />
            </Routes>
          </div>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;

