import { ReactNode } from 'react';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {

    // Hide sidebar for studio views to maximize space


    return (
        <div className="flex h-screen w-full overflow-hidden bg-shell-surface">
            {/* {!shouldHideSidebar && <GlobalSidebar />} - Removed for single sidebar design */}
            <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                {children}
            </div>
        </div>
    );
};
