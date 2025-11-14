import { ReactNode, useEffect } from 'react';

interface SidebarProps {
  children: ReactNode;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ children, isMobileOpen = false, onClose }: SidebarProps) => {
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
        className={`
          fixed md:static
          top-0 left-0
          w-[240px] h-full
          border-r border-gray-200 bg-white
          overflow-y-auto scrollbar-thin
          z-50 md:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="px-4 pt-8 pb-4">
          {children}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

