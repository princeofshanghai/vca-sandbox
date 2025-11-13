import { ReactNode } from 'react';

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
      {children}
    </div>
  );
};

