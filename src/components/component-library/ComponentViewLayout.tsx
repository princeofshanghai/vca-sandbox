import { ReactNode } from 'react';
import { OnThisPage } from './OnThisPage';

type ComponentViewLayoutProps = {
  /** Component name (displays as page title) */
  title: string;
  /** Brief description of the component */
  description: string;
  /** Page content (typically DemoSection and usage examples) */
  children: ReactNode;
};

/**
 * ComponentViewLayout - Consistent page layout for all component view pages
 * 
 * Provides unified styling for component documentation pages.
 * Change styles here to update all 23+ component pages at once.
 * 
 * @example
 * ```tsx
 * <ComponentViewLayout
 *   title="Button"
 *   description="Buttons are used for primary actions..."
 * >
 *   <DemoSection>...</DemoSection>
 * </ComponentViewLayout>
 * ```
 */
export const ComponentViewLayout = ({
  title,
  description,
  children,
}: ComponentViewLayoutProps) => {
  return (
    <div className="pt-16">
      <h1 className="mb-4">{title}</h1>
      <p className="text-base text-gray-500 mb-12">{description}</p>
      
      {/* Main content */}
      <div>
        {children}
      </div>
      
      {/* On This Page sidebar - fixed on right, visually separated */}
      <div className="hidden lg:block fixed right-0 top-[57px] w-48 h-[calc(100vh-3.5rem-1px)] overflow-y-auto">
        <div className="h-full bg-white pl-6 pr-4 pt-16">
          <OnThisPage />
        </div>
      </div>
    </div>
  );
};

