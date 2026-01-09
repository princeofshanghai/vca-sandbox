import { ReactNode } from 'react';
import { GlobalSidebar } from './GlobalSidebar';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-50">
            <GlobalSidebar />
            <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                {children}
            </div>
        </div>
    );
};
