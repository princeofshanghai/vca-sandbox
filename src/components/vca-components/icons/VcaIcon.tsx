import { cn } from '@/utils';

export type VcaIconName =
  | 'arrow-left' | 'check' | 'chevron-down' | 'close' | 'linkedin-bug'
  | 'send' | 'signal-ai' | 'signal-error' | 'signal-notice' | 'signal-success'
  | 'thumbs-down-fill' | 'thumbs-down-outline' | 'thumbs-up-fill' | 'thumbs-up-outline'
  | 'attachment' | 'arrow-down' | 'arrow-up' | 'undo' | 'document'
  | 'trash' | 'download' | 'messages' | 'placeholder' | 'external-link'
  | 'building' | 'user';

export type VcaIconProps = {
  icon: VcaIconName;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

/**
 * VCA Icon Component - LinkedIn custom icons as inline SVGs
 * Icons use VCA design tokens for colors where appropriate
 */
export const VcaIcon = ({ icon, size = 'md', className }: VcaIconProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const iconClass = cn('shrink-0 inline-block', sizeClasses[size], className);

  // Inline SVG definitions with real LinkedIn designs
  // Icons are neutral by default - color comes from context/usage
  switch (icon) {
    case 'signal-error':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2L2 8V16L8 22H16L22 16V8L16 2H8ZM18 13H6V11H18V13Z" fill="currentColor" />
        </svg>
      );

    case 'signal-success':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10.8 17L7 13.2L8.4 11.8L10.6 14L15.4 8H18L10.8 17Z" fill="currentColor" />
        </svg>
      );

    case 'signal-notice':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 3H6C4.3 3 3 4.3 3 6V18C3 19.7 4.3 21 6 21H18C19.7 21 21 19.7 21 18V6C21 4.3 19.7 3 18 3ZM14 18H13C11.3 18 10 16.6 10 15C10 14.8 10 14.5 10.1 14.2L11.2 10H13.3L12 14.7C11.9 15.4 12.3 16 13 16H14V18ZM13 8.2C12.3 8.2 11.8 7.7 11.8 7C11.8 6.3 12.4 5.7 13 5.7C13.7 5.7 14.2 6.3 14.2 7C14.2 7.7 13.7 8.2 13 8.2Z" fill="currentColor" />
        </svg>
      );

    case 'signal-ai':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.5 12C21.5 11.5 21.1 11 20.6 11C16.6 10.6 13.4 7.4 13 3.4C12.9 2.9 12.5 2.5 12 2.5C11.5 2.5 11 2.9 11 3.4C10.6 7.4 7.4 10.6 3.4 11C2.9 11.1 2.5 11.5 2.5 12C2.5 12.5 2.9 12.9 3.4 13C7.4 13.4 10.6 16.6 11 20.6C11.1 21.1 11.5 21.5 12 21.5C12.5 21.5 13 21.1 13 20.6C13.4 16.6 16.6 13.4 20.6 13C21.1 12.9 21.5 12.5 21.5 12Z" fill="currentColor" />
        </svg>
      );

    case 'linkedin-bug':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.5 2H3.5C2.7 2 2 2.7 2 3.5V20.5C2 21.3 2.7 22 3.5 22H20.5C21.3 22 22 21.3 22 20.5V3.5C22 2.7 21.3 2 20.5 2ZM8 19H5V10H8V19ZM6.5 8.2C5.5 8.2 4.7 7.4 4.7 6.4C4.7 5.4 5.5 4.6 6.5 4.6C7.5 4.6 8.3 5.4 8.3 6.4C8.3 7.5 7.5 8.2 6.5 8.2ZM19 19H16V14.3C16 12.9 15.4 12.4 14.6 12.4C13.8 12.4 13 13.1 13 14.4V19H10V10H12.9V11.3C13.3 10.7 14.2 9.9 15.6 9.9C17.1 9.9 19 10.8 19 13.6V19Z" fill="currentColor" />
        </svg>
      );

    case 'send':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3L6.5 10.5L16 12L6.5 13.5L3 21L22 12L3 3Z" fill="currentColor" />
        </svg>
      );

    case 'check':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.6 4L9.7 16.9L5.4 12.6L4 14L10 20L21 4H18.6Z" fill="currentColor" />
        </svg>
      );

    case 'close':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 5.4L18.6 4L12 10.6L5.4 4L4 5.4L10.6 12L4 18.6L5.4 20L12 13.4L18.6 20L20 18.6L13.4 12L20 5.4Z" fill="currentColor" />
        </svg>
      );

    case 'arrow-left':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.6 4L1 12L6.6 20H9L4.1 13H22V11H4.1L9 4H6.6Z" fill="currentColor" />
        </svg>
      );

    case 'arrow-down':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16.9L12 22.5L20 16.9V14.5L13 19.4V1.5H11V19.4L4 14.5V16.9Z" fill="currentColor" />
        </svg>
      );

    case 'arrow-up':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6.6L12 1L4 6.6V9L11 4.1V22H13V4.1L20 9V6.6Z" fill="currentColor" />
        </svg>
      );

    case 'chevron-down':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 10.5L12 18L22 10.5V8L12 15.5L2 8V10.5Z" fill="currentColor" />
        </svg>
      );

    case 'thumbs-up-fill':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.5 11L14.2 6.7C13.3 5.8 12.6 4.7 12.2 3.4L11.8 2C11.6 1.4 11.1 1 10.4 1C9.6 1 9 1.6 9 2.4V3.7C9 4.5 9.1 5.4 9.4 6.2L10.3 9H4.1C3 9 2 10 2 11.1C2 11.8 2.4 12.5 2.9 12.9C2.3 13.3 2 13.9 2 14.6C2 15.5 2.5 16.2 3.3 16.6C3.1 16.9 3 17.3 3 17.6C3 18.7 3.9 19.7 5 19.7V19.8C5 21 6 22 7.1 22H14.6C15.8 22 17.1 21.7 18.2 21.2L18.5 21H21V11H18.5Z" fill="currentColor" />
        </svg>
      );

    case 'thumbs-up-outline':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.5 11L15.6 7.1C14.8 6.3 14.3 5.4 13.9 4.4L13.4 2.9C13 1.8 11.9 1 10.8 1C9.2 1 8 2.2 8 3.8V4.9C8 5.9 8.2 6.8 8.5 7.7L8.9 9H4.1C3 9 2 10 2 11.1C2 11.8 2.4 12.5 2.9 12.9C2.3 13.3 2 13.9 2 14.6C2 15.5 2.5 16.2 3.3 16.6C3.1 16.9 3 17.3 3 17.6C3 18.7 3.9 19.7 5 19.7V19.8C5 21 6 22 7.1 22H14.6C15.8 22 17.1 21.7 18.2 21.2L18.5 21H21V11H19.5ZM19 19H18L17.3 19.4C16.5 19.8 15.5 20 14.6 20H7.7C7.3 20 6.9 19.7 6.7 19.3L6.4 18.4L5.6 18C5.2 17.9 4.9 17.4 5 17L5.2 16L4.4 15.3C4.1 14.9 4 14.4 4.3 14L5 12.9L4.3 11.8C4 11.4 4.2 11 4.6 11H11.6L10.3 7.1C10.1 6.4 10 5.6 10 4.9V3.8C10 3.3 10.3 3 10.8 3C11.1 3 11.4 3.2 11.5 3.5L12 5C12.4 6.3 13.2 7.5 14.2 8.5L18.7 13H19V19Z" fill="currentColor" />
        </svg>
      );

    case 'thumbs-down-fill':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 13V3H18.5L18.2 2.8C17.1 2.3 15.9 2 14.6 2H7.1C6 2 5 3 5 4.1V4.2C3.9 4.3 3 5.2 3 6.3C3 6.7 3.1 7 3.3 7.3C2.5 7.7 2 8.5 2 9.4C2 10.1 2.4 10.8 2.9 11.1C2.3 11.5 2 12.1 2 12.9C2 14 3 15 4.1 15H10.3L9.4 17.8C9.1 18.6 9 19.4 9 20.3V21.6C9 22.4 9.6 23 10.4 23C11 23 11.6 22.6 11.8 22L12.3 20.5C12.7 19.3 13.4 18.2 14.3 17.2L18.6 12.9H21V13Z" fill="currentColor" />
        </svg>
      );

    case 'thumbs-down-outline':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.5 13L15.6 16.9C14.8 17.7 14.3 18.6 13.9 19.6L13.4 21.1C13 22.2 11.9 23 10.8 23C9.2 23 8 21.8 8 20.2V19.1C8 18.1 8.2 17.2 8.5 16.3L8.9 15H4.1C3 15 2 14 2 12.9C2 12.2 2.4 11.5 2.9 11.1C2.3 10.7 2 10.1 2 9.4C2 8.5 2.5 7.8 3.3 7.4C3.1 7.1 3 6.7 3 6.4C3 5.3 3.9 4.3 5 4.3V4.2C5 3 6 2 7.1 2H14.6C15.8 2 17.1 2.3 18.2 2.8L18.5 3H21V13H19.5ZM19 5H18L17.3 4.6C16.5 4.2 15.5 4 14.6 4H7.7C7.3 4 6.9 4.3 6.7 4.7L6.4 5.6L5.6 6C5.2 6.1 4.9 6.6 5 7L5.2 8L4.4 8.7C4.1 9.1 4 9.6 4.3 10L5 11.1L4.3 12.2C4 12.6 4.2 13 4.6 13H11.6L10.3 16.9C10.1 17.6 10 18.4 10 19.1V20.2C10 20.7 10.3 21 10.8 21C11.1 21 11.4 20.8 11.5 20.5L12 19C12.4 17.7 13.2 16.5 14.2 15.5L18.7 11H19V5Z" fill="currentColor" />
        </svg>
      );

    case 'attachment':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.5 10.5L14.1 17C13.5 17.6 12.7 17.9 12 17.9C11.2 17.9 10.5 17.6 9.9 17C9.3 16.4 9 15.6 9 14.8C9 14 9.3 13.3 9.9 12.7L15.6 7L17 8.4L11.3 14.1C11.1 14.3 11 14.6 11 14.8C11 15.1 11.1 15.3 11.3 15.5C11.5 15.7 11.8 15.8 12 15.8C12.3 15.8 12.5 15.7 12.7 15.5L19.1 9.1C19.7 8.5 20 7.8 20 7C20 6.2 19.7 5.5 19.1 4.9C18.5 4.3 17.8 4 17 4C16.2 4 15.5 4.3 14.9 4.9L4.9 14.9C4.3 15.5 4 16.2 4 17C4 17.8 4.3 18.5 4.9 19.1C5.5 19.7 6.2 20 7 20C7.8 20 8.5 19.7 9.1 19.1L9.8 18.4L11.2 19.8L10.5 20.5C9.5 21.5 8.2 22 7 22C5.7 22 4.4 21.5 3.5 20.5C2.5 19.5 2 18.2 2 17C2 15.7 2.5 14.4 3.5 13.5L13.5 3.5C14.5 2.5 15.8 2 17 2C18.3 2 19.6 2.5 20.5 3.5C21.5 4.5 22 5.8 22 7C22 8.3 21.5 9.6 20.5 10.5Z" fill="currentColor" />
        </svg>
      );

    case 'undo':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L14 1H11.6L9 5L11.6 9H14L12 6C15.8 6 19 9.2 19 13C19 16.9 15.9 20 12 20C8.1 20 5 16.9 5 13C5 11.5 5.5 10.1 6.3 9H3.9C3.3 10.2 3 11.6 3 13C3 18 7 22 12 22C17 22 21 18 21 13C21 8 17 4 12 4Z" fill="currentColor" />
        </svg>
      );

    case 'document':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 1.5H4V21.5H20V6L15.5 1.5ZM6 19.5V3.5H14V7.5H18V19.5H6Z" fill="currentColor" />
        </svg>
      );

    case 'trash':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4V5H4V4C4 3.4 4.4 3 5 3H9C9 2.4 9.4 2 10 2H14C14.6 2 15 2.4 15 3H19C19.6 3 20 3.4 20 4ZM5 6H19V19C19 20.7 17.7 22 16 22H8C6.3 22 5 20.7 5 19V6ZM14 18H15V8H14V18ZM9 18H10V8H9V18Z" fill="currentColor" />
        </svg>
      );

    case 'download':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 13.5V18.5C21 20.2 19.7 21.5 18 21.5H6C4.3 21.5 3 20.2 3 18.5V13.5H5V18.5C5 19.1 5.4 19.5 6 19.5H18C18.6 19.5 19 19.1 19 18.5V13.5H21ZM17 12.9V10.5L13 13.3V2.5H11V13.3L7 10.5V12.9L12 16.5L17 12.9Z" fill="currentColor" />
        </svg>
      );

    case 'messages':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 3H8C4.134 3 1 6.134 1 10C1 13.866 4.134 17 8 17H12V21L20.16 15.605C22 14.308 23 12.228 23 10C23 6.134 19.866 3 16 3ZM8 11.25C7.31 11.25 6.75 10.69 6.75 10C6.75 9.31 7.31 8.75 8 8.75C8.69 8.75 9.25 9.31 9.25 10C9.25 10.69 8.69 11.25 8 11.25ZM12 11.25C11.31 11.25 10.75 10.69 10.75 10C10.75 9.31 11.31 8.75 12 8.75C12.69 8.75 13.25 9.31 13.25 10C13.25 10.69 12.69 11.25 12 11.25ZM16 11.25C15.31 11.25 14.75 10.69 14.75 10C14.75 9.31 15.31 8.75 16 8.75C16.69 8.75 17.25 9.31 17.25 10C17.25 10.69 16.69 11.25 16 11.25Z" fill="currentColor" />
        </svg>
      );

    case 'external-link':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11M15 3H21M21 3V9M21 3L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'building':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21H21V19H19V8H13V10H11V3H5V19H3V21ZM7 19V5H9V7H7V9H9V11H7V13H9V15H7V17H9V19H7ZM13 19V12H15V14H13V16H15V19H13ZM17 19V10H15V12H17V19H17Z" fill="currentColor" />
        </svg>
      );

    case 'user':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
        </svg>
      );

    case 'placeholder':
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 3H6C4.3 3 3 4.3 3 6V18C3 19.7 4.3 21 6 21H18C19.7 21 21 19.7 21 18V6C21 4.3 19.7 3 18 3ZM6 5H18C18.1 5 18.2 5 18.2 5L12 11.3L5.8 5C5.8 5 5.9 5 6 5ZM5 18V6C5 5.9 5 5.8 5 5.8L11.2 12L5 18.2C5 18.2 5 18.1 5 18ZM18 19H6C5.9 19 5.8 19 5.8 19L12 12.8L18.2 19C18.2 19 18.1 19 18 19ZM19 18C19 18.1 19 18.2 19 18.2L12.7 12L19 5.8C19 5.9 19 6 19 6V18Z" fill="currentColor" />
        </svg>
      );
  }
};
