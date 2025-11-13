import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';

type NavLinkBaseProps = {
  /** Link text or custom content */
  children: ReactNode;
  /** Whether this link is currently active/selected */
  isActive?: boolean;
  /** Additional CSS classes */
  className?: string;
};

type NavLinkAsRouterLink = NavLinkBaseProps & {
  /** Navigation path for React Router Link */
  to: string;
  /** Not used when 'to' is provided */
  onClick?: never;
};

type NavLinkAsButton = NavLinkBaseProps & {
  /** Click handler for button-style navigation */
  onClick: () => void;
  /** Not used when 'onClick' is provided */
  to?: never;
};

type NavLinkProps = NavLinkAsRouterLink | NavLinkAsButton;

/**
 * NavLink - Reusable navigation link component for sidebars
 * 
 * Can render as either a React Router Link or a button based on props.
 * Uses consistent styling for active/inactive states.
 * 
 * @example
 * ```tsx
 * // As a React Router Link
 * <NavLink to="/foundations/typography" isActive={pathname === '/foundations/typography'}>
 *   Typography
 * </NavLink>
 * 
 * // As a button
 * <NavLink onClick={() => selectFlow('my-flow')} isActive={currentFlow === 'my-flow'}>
 *   My Flow
 * </NavLink>
 * ```
 */
const NavLink = ({ children, isActive = false, className, ...props }: NavLinkProps) => {
  // Shared classes for both Link and button variants
  const baseClasses = cn(
    'block text-left px-3 py-2 text-2xs rounded transition-colors',
    isActive 
      ? 'bg-gray-100 text-gray-900'
      : 'text-gray-700 hover:bg-gray-50',
    className
  );

  // Render as React Router Link if 'to' prop is provided
  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={baseClasses}>
        {children}
      </Link>
    );
  }

  // Render as button if 'onClick' prop is provided
  if ('onClick' in props && props.onClick) {
    return (
      <button 
        onClick={props.onClick} 
        className={cn(baseClasses, 'w-full')}
        type="button"
      >
        {children}
      </button>
    );
  }

  // Fallback (should never happen with proper TypeScript usage)
  return null;
};

export default NavLink;

