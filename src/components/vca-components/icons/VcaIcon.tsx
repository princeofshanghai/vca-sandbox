import { cn } from '@/utils';

export type VcaIconName = 
  | 'arrow-left' | 'check' | 'chevron-down' | 'close' | 'linkedin-bug' 
  | 'send' | 'signal-ai' | 'signal-error' | 'signal-notice' | 'signal-success'
  | 'thumbs-down-fill' | 'thumbs-down-outline' | 'thumbs-up-fill' | 'thumbs-up-outline'
  | 'attachment' | 'arrow-down' | 'arrow-up' | 'undo' | 'document' 
  | 'trash' | 'download' | 'messages' | 'placeholder';

export type VcaIconProps = {
  icon: VcaIconName;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

/**
 * VCA Icon Component - LinkedIn custom icons as inline SVGs
 */
export const VcaIcon = ({ icon, size = 'md', className }: VcaIconProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const iconClass = cn('shrink-0 inline-block', sizeClasses[size], className);

  // Inline SVG definitions for commonly used icons
  switch (icon) {
    case 'signal-error':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8.75 11.25H7.25V9.75H8.75V11.25ZM8.75 8.25H7.25V4.75H8.75V8.25Z" fill="#CC1016"/>
        </svg>
      );

    case 'signal-success':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM6.75 10.94L3.81 8L4.87 6.94L6.75 8.81L11.13 4.44L12.19 5.5L6.75 10.94Z" fill="#057642"/>
        </svg>
      );

    case 'send':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L14 8L2 14V9.5L10 8L2 6.5V2Z" fill="currentColor"/>
        </svg>
      );

    case 'check':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'close':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'arrow-left':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'arrow-down':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'arrow-up':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'chevron-down':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'thumbs-up-fill':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.5 6.5V14H2.5V6.5H4.5ZM14 7.5C14 6.67 13.33 6 12.5 6H9.5L10 3.5C10.04 3.33 10.02 3.16 9.95 3L9.87 2.78C9.58 2.11 8.83 1.82 8.16 2.11L7.91 2.21L4.91 5.21C4.66 5.46 4.5 5.81 4.5 6.19V13C4.5 13.83 5.17 14.5 6 14.5H11.5C12.15 14.5 12.7 14.06 12.87 13.44L14.43 8.44C14.47 8.3 14.5 8.15 14.5 8V7.5H14Z" fill="currentColor"/>
        </svg>
      );

    case 'thumbs-up-outline':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.5 6.5V14M4.5 6.5H2.5V14H4.5M4.5 6.5C4.5 5.81 4.66 5.46 4.91 5.21L7.91 2.21L8.16 2.11C8.83 1.82 9.58 2.11 9.87 2.78L9.95 3C10.02 3.16 10.04 3.33 10 3.5L9.5 6H12.5C13.33 6 14 6.67 14 7.5V8C14 8.15 13.97 8.3 13.93 8.44L12.37 13.44C12.2 14.06 11.65 14.5 11 14.5H6C5.17 14.5 4.5 13.83 4.5 13V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'thumbs-down-fill':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 9.5V2H13.5V9.5H11.5ZM2 8.5C2 9.33 2.67 10 3.5 10H6.5L6 12.5C5.96 12.67 5.98 12.84 6.05 13L6.13 13.22C6.42 13.89 7.17 14.18 7.84 13.89L8.09 13.79L11.09 10.79C11.34 10.54 11.5 10.19 11.5 9.81V3C11.5 2.17 10.83 1.5 10 1.5H4.5C3.85 1.5 3.3 1.94 3.13 2.56L1.57 7.56C1.53 7.7 1.5 7.85 1.5 8V8.5H2Z" fill="currentColor"/>
        </svg>
      );

    case 'thumbs-down-outline':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 9.5V2M11.5 9.5H13.5V2H11.5M11.5 9.5C11.5 10.19 11.34 10.54 11.09 10.79L8.09 13.79L7.84 13.89C7.17 14.18 6.42 13.89 6.13 13.22L6.05 13C5.98 12.84 5.96 12.67 6 12.5L6.5 10H3.5C2.67 10 2 9.33 2 8.5V8C2 7.85 2.03 7.7 2.07 7.56L3.63 2.56C3.8 1.94 4.35 1.5 5 1.5H10C10.83 1.5 11.5 2.17 11.5 3V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'attachment':
      return (
        <svg className={iconClass} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M16.8333 8.33329V13.3333C16.8333 15.6345 14.9678 17.5 12.6666 17.5C10.3655 17.5 8.49996 15.6345 8.49996 13.3333V6.66663C8.49996 5.28591 9.61925 4.16663 11 4.16663C12.3807 4.16663 13.5 5.28591 13.5 6.66663V12.5C13.5 13.0523 13.0522 13.5 12.5 13.5C11.9477 13.5 11.5 13.0523 11.5 12.5V7.49996H9.99996V12.5C9.99996 13.8807 11.1192 15 12.5 15C13.8807 15 15 13.8807 15 12.5V6.66663C15 4.45749 13.2091 2.66663 11 2.66663C8.79082 2.66663 6.99996 4.45749 6.99996 6.66663V13.3333C6.99996 16.4629 9.53711 19 12.6666 19C15.7962 19 18.3333 16.4629 18.3333 13.3333V8.33329H16.8333Z" fill="currentColor"/>
        </svg>
      );

    case 'document':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.5 1.5H4C3.45 1.5 3 1.95 3 2.5V13.5C3 14.05 3.45 14.5 4 14.5H12C12.55 14.5 13 14.05 13 13.5V5.5L9.5 1.5ZM9.5 5.5V2.5L12 5.5H9.5Z" fill="currentColor"/>
        </svg>
      );

    case 'linkedin-bug':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.632 13.635h-2.37V9.922c0-.886-.018-2.025-1.234-2.025-1.235 0-1.424.964-1.424 1.96v3.778h-2.37V6H8.51v1.04h.03c.318-.6 1.092-1.233 2.247-1.233 2.4 0 2.845 1.58 2.845 3.637v4.188zM3.558 4.955c-.762 0-1.376-.617-1.376-1.377 0-.758.614-1.375 1.376-1.375.76 0 1.376.617 1.376 1.375 0 .76-.617 1.377-1.376 1.377zm1.188 8.68H2.37V6h2.376v7.635zM14.816 0H1.18C.528 0 0 .516 0 1.153v13.694C0 15.484.528 16 1.18 16h13.635c.652 0 1.185-.516 1.185-1.153V1.153C16 .516 15.467 0 14.815 0z" fill="#0A66C2"/>
        </svg>
      );

    case 'signal-ai':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#0A66C2"/>
        </svg>
      );

    case 'signal-notice':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8.75 11.25H7.25V9.75H8.75V11.25ZM8.75 8.25H7.25V4.75H8.75V8.25Z" fill="#F5A623"/>
        </svg>
      );

    case 'undo':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4L2 8L6 12M2 8H10C11.66 8 13 9.34 13 11V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'trash':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4H13M12 4V13C12 13.55 11.55 14 11 14H5C4.45 14 4 13.55 4 13V4M6 4V3C6 2.45 6.45 2 7 2H9C9.55 2 10 2.45 10 3V4M6.5 7V11M9.5 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'download':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10.5L5 7.5M8 10.5L11 7.5M8 10.5V3M14 10.5V13C14 13.55 13.55 14 13 14H3C2.45 14 2 13.55 2 13V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );

    case 'messages':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H2C1.45 2 1 2.45 1 3V11C1 11.55 1.45 12 2 12H4V14.5L7.5 12H14C14.55 12 15 11.55 15 11V3C15 2.45 14.55 2 14 2Z" fill="currentColor"/>
        </svg>
      );

    case 'placeholder':
    default:
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
        </svg>
      );
  }
};
