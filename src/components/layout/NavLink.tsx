import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';

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
    'block text-left px-3 py-1.5 text-2xs rounded-vca-sm transition-colors',
    isActive 
      ? 'bg-shell-border-subtle text-shell-text font-medium hover:bg-shell-border hover:text-shell-text'
      : 'text-shell-muted-strong hover:bg-shell-surface hover:text-shell-text',
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
      <Button
        onClick={props.onClick} 
        className={cn(
          baseClasses,
          'w-full justify-start h-auto',
          !isActive && 'font-normal'
        )}
        variant="ghost"
        type="button"
      >
        {children}
      </Button>
    );
  }

  // Fallback (should never happen with proper TypeScript usage)
  return null;
};

export default NavLink;
