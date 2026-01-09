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
    <div className="pt-16 max-w-6xl mx-auto px-6 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 relative">

        {/* Main Content Column */}
        <div className="min-w-0">
          <h1 className="mb-4">{title}</h1>
          <p className="text-base text-gray-500 mb-12 max-w-6xl">{description}</p>

          {/* Page Content */}
          <div>
            {children}
          </div>
        </div>

        {/* Sidebar Column - Sticky */}
        <div className="hidden lg:block relative">
          <div className="sticky top-24 border-l border-gray-100 pl-6">
            <OnThisPage />
          </div>
        </div>

      </div>
    </div>
  );
};

