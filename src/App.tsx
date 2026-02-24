import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginView } from './views/auth/LoginView';
import ShareView from './views/share/ShareView';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import DashboardView from '@/views/dashboard/DashboardView';
import { Toaster } from '@/components/ui/sonner';
import { LoadingScreen } from '@/components/ui/loading-screen';

const ComponentLibraryView = lazy(() => import('@/views/ComponentLibraryView'));
const StudioView = lazy(() => import('@/views/studio/StudioView'));

const RouteLoadingFallback = () => <LoadingScreen fullScreen />;

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
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ComponentLibraryView />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/components/*" element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ComponentLibraryView />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/patterns/*" element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ComponentLibraryView />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Studio has its own layout, but still protected */}
            <Route path="/studio/:id" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <StudioView />
                </Suspense>
              </ProtectedRoute>
            } />

            {/* Public Share Route - Future Implementation */}
            {/* <Route path="/share/:id" element={<SharedView />} /> */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
