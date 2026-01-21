import { useNavigate, useLocation } from 'react-router-dom';
import { BookMarked, Blocks } from 'lucide-react';
import VcaLogo from '@/components/VcaLogo';
import { cn } from '@/utils/cn'; // Assuming cn utility exists, otherwise I'll use template literals

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, isActive, onClick }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={cn(
            "flex flex-col items-center justify-center w-full py-4 gap-1 transition-colors relative group",
            isActive
                ? "text-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        )}
        title={label}
    >
        {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-md" />
        )}
        <Icon size={22} strokeWidth={1.25} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export const GlobalSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Mapping active states
    // Mapping active states
    const isStudioActive = location.pathname === '/' || location.pathname.startsWith('/studio');
    const isLibraryActive = location.pathname.startsWith('/components') || location.pathname.startsWith('/foundations');

    return (
        <div className="w-[72px] h-full bg-white border-r border-gray-200 flex flex-col items-center flex-shrink-0 z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center w-full border-b border-gray-100">
                <div className="scale-75">
                    <VcaLogo />
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 w-full flex flex-col">
                <SidebarItem
                    icon={Blocks}
                    label="Studio"
                    isActive={isStudioActive}
                    onClick={() => navigate('/')}
                />

                <SidebarItem
                    icon={BookMarked}
                    label="Library"
                    isActive={isLibraryActive}
                    onClick={() => navigate('/foundations/typography')}
                />
            </div>
        </div>
    );
};
