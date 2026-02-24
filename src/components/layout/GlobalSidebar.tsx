import { useNavigate, useLocation } from 'react-router-dom';
import { BookMarked, Blocks } from 'lucide-react';
import VcaLogo from '@/components/VcaLogo';
import { cn } from '@/utils/cn'; // Assuming cn utility exists, otherwise I'll use template literals
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, isActive, onClick }: SidebarItemProps) => (
    <Button
        onClick={onClick}
        className={cn(
            "relative group h-auto w-full flex-col items-center justify-center gap-1 rounded-none py-4 transition-colors",
            isActive
                ? "text-shell-accent-text bg-shell-accent-soft"
                : "text-shell-muted hover:text-shell-text hover:bg-shell-surface"
        )}
        title={label}
        variant="ghost"
        type="button"
    >
        {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-shell-accent rounded-r-md" />
        )}
        <Icon size={22} strokeWidth={1.25} />
        <span className="text-[10px] font-medium">{label}</span>
    </Button>
);

export const GlobalSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Mapping active states
    // Mapping active states
    const isStudioActive = location.pathname === '/' || location.pathname.startsWith('/studio');
    const isLibraryActive = location.pathname.startsWith('/components') || location.pathname.startsWith('/foundations');

    return (
        <div className="w-[72px] h-full bg-shell-bg border-r border-shell-border flex flex-col items-center flex-shrink-0 z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center w-full border-b border-shell-border-subtle">
                <div className="scale-75">
                    <VcaLogo autoInvertInDark />
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
