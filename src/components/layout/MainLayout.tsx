import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalSidebar } from './GlobalSidebar';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const location = useLocation();

    // Hide sidebar for studio views to maximize space
    const shouldHideSidebar = location.pathname.startsWith('/studio');

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-50">
            {!shouldHideSidebar && <GlobalSidebar />}
            <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                {children}
            </div>
        </div>
    );
};
