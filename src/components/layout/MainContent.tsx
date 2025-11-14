import { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <main className="flex-1 h-full overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-8">
        {children}
      </div>
    </main>
  );
};

export default MainContent;

