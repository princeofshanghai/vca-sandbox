import { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
  return (
    <aside className="w-[240px] h-full border-r border-gray-200 bg-white overflow-y-auto scrollbar-thin">
      <div className="px-4 pt-8 pb-4">
        {children}
      </div>
    </aside>
  );
};

export default Sidebar;

