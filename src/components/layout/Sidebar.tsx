import { ReactNode, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ children, header, footer, isMobileOpen = false, onClose }: SidebarProps) => {

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isMobileOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileOpen, onClose]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static top-0 left-0 w-[240px] h-full border-r border-gray-200 bg-white z-50 md:z-auto flex flex-col transform transition-transform duration-300 ease-in-out",
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {header && (
          <div className="flex-shrink-0">
            {header}
          </div>
        )}

        <div className={cn(
          "flex-1 overflow-y-auto scrollbar-thin px-4 pb-4",
          !header && "pt-8",
          header && "pt-4"
        )}>
          {children}
        </div>

        <div className="flex-shrink-0 bg-white">
          {footer}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

