import { cn } from '@/utils';

export type AppIconName = 
  | 'desktop' 
  | 'mobile' 
  | 'restart'
  | 'chevron-down';

export type AppIconProps = {
  icon: AppIconName;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

/**
 * AppIcon Component - Application shell icons (non-VCA)
 * 
 * Icons for the sandbox app interface (not part of VCA design system).
 * Based on Heroicons by Tailwind Labs.
 * 
 * @example
 * ```tsx
 * <AppIcon icon="desktop" size="md" />
 * <AppIcon icon="restart" size="sm" />
 * ```
 */
export const AppIcon = ({ icon, size = 'md', className }: AppIconProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconClass = cn('shrink-0 inline-block', sizeClasses[size], className);

  // Heroicons-style icons for app shell UI
  switch (icon) {
    case 'desktop':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'mobile':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'restart':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );

    case 'chevron-down':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );

    default:
      return null;
  }
};

