import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginView } from './views/auth/LoginView';
import ShareView from './views/share/ShareView';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import ComponentLibraryView from '@/views/ComponentLibraryView';
import DashboardView from '@/views/dashboard/DashboardView';
import StudioView from '@/views/studio/StudioView';




const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/share/:id" element={<ShareView />} />

            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardView />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/foundations/*" element={
              <ProtectedRoute>
                <MainLayout>
                  <ComponentLibraryView />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/components/*" element={
              <ProtectedRoute>
                <MainLayout>
                  <ComponentLibraryView />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/patterns/*" element={
              <ProtectedRoute>
                <MainLayout>
                  <ComponentLibraryView />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Studio has its own layout, but still protected */}
            <Route path="/studio/:id" element={
              <ProtectedRoute>
                <StudioView />
              </ProtectedRoute>
            } />

            {/* Public Share Route - Future Implementation */}
            {/* <Route path="/share/:id" element={<SharedView />} /> */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

