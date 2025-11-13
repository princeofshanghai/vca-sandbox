import { ReactNode } from 'react';

type NavigationGroupProps = {
  /** Optional category label (e.g., "Actions", "Display") */
  label?: string;
  /** Navigation items (typically NavLink components) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
};

/**
 * NavigationGroup - Wrapper for grouped navigation items with optional label
 * 
 * Used in sidebars to organize navigation links into labeled categories.
 * Automatically handles spacing between groups.
 * 
 * @example
 * ```tsx
 * <NavigationGroup label="Actions">
 *   <NavLink to="/button">Button</NavLink>
 *   <NavLink to="/prompt">Prompt</NavLink>
 * </NavigationGroup>
 * ```
 */
const NavigationGroup = ({ label, children, className }: NavigationGroupProps) => {
  return (
    <div className={className}>
      {label && (
        <div className="text-xs font-normal text-gray-500 mb-2">{label}</div>
      )}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
};

export default NavigationGroup;

