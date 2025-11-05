import { Header } from '../header';
import { Composer } from '../composer';
import { cn } from '@/utils';
import { ReactNode } from 'react';

export type ContainerProps = {
  children?: ReactNode;
  showPremiumBorder?: boolean;
  headerTitle?: string;
  showHeaderBack?: boolean;
  showHeaderPremiumIcon?: boolean;
  showHeaderAction?: boolean;
  onHeaderBack?: () => void;
  onHeaderAction?: () => void;
  onHeaderClose?: () => void;
  className?: string;
};

/**
 * Container - Complete VCA chatbot panel
 * Combines Header, scrollable content area, and Composer into a full chat interface
 */
export const Container = ({
  children,
  showPremiumBorder = false,
  headerTitle = 'Help',
  showHeaderBack = false,
  showHeaderPremiumIcon = false,
  showHeaderAction = false,
  onHeaderBack,
  onHeaderAction,
  onHeaderClose,
  className,
}: ContainerProps) => {
  
  return (
    <div 
      className={cn(
        'w-[400px] h-[788px] rounded-vca-sm border border-vca-border-faint overflow-hidden',
        'flex flex-col',
        'shadow-[0_4px_12px_0_rgba(0,0,0,0.30),0_0_1px_0_rgba(140,140,140,0.20)]',
        className
      )}
    >
      {/* Header - Fixed at top */}
      <Header 
        title={headerTitle}
        position="left"
        showBack={showHeaderBack}
        showPremiumIcon={showHeaderPremiumIcon}
        showAction={showHeaderAction}
        showPremiumBorder={showPremiumBorder}
        onBack={onHeaderBack}
        onAction={onHeaderAction}
        onClose={onHeaderClose}
        className="shrink-0"
      />
      
      {/* Content Area - Scrollable */}
      <div className="flex-1 bg-vca-background overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col justify-end min-h-full py-vca-lg">
          {children}
        </div>
      </div>
      
      {/* Composer - Fixed at bottom */}
      <Composer 
        state="default"
        className="shrink-0"
      />
    </div>
  );
};

