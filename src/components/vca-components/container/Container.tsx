import { Header } from '../header';
import { Composer } from '../composer';
import { cn } from '@/utils';
import { ReactNode, useState, RefObject } from 'react';

export type ContainerViewport = 'desktop' | 'mobile';

export type ContainerProps = {
  children?: ReactNode;
  viewport?: ContainerViewport;
  showPremiumBorder?: boolean;
  headerTitle?: string;
  showHeaderBack?: boolean;
  showHeaderPremiumIcon?: boolean;
  showHeaderAction?: boolean;
  onHeaderBack?: () => void;
  onHeaderAction?: () => void;
  onHeaderClose?: () => void;
  onAttachment?: () => void;
  className?: string;
  contentRef?: RefObject<HTMLDivElement>;
};

/**
 * Container - Complete VCA chatbot panel
 * Combines Header, scrollable content area, and Composer into a full chat interface
 * Supports both desktop (400×788px) and mobile (393×772px) viewports
 */
export const Container = ({
  children,
  viewport = 'desktop',
  showPremiumBorder = false,
  headerTitle = 'Help',
  showHeaderBack = false,
  showHeaderPremiumIcon = false,
  showHeaderAction = false,
  onHeaderBack,
  onHeaderAction,
  onHeaderClose,
  onAttachment,
  className,
  contentRef,
}: ContainerProps) => {
  // Interactive composer state (simplified - library handles auto-resize)
  const [composerValue, setComposerValue] = useState('');
  
  const handleSend = () => {
    if (composerValue.trim()) {
      // Clear the input after sending
      setComposerValue('');
    }
  };
  
  // Dimensions and styling based on viewport
  const dimensions = viewport === 'mobile' 
    ? 'w-[393px] h-[772px]' 
    : 'w-[400px] h-[688px]';
  
  // Mobile: only top corners rounded (bottom sheet). Desktop: all corners rounded
  const borderRadius = viewport === 'mobile'
    ? 'rounded-t-2xl' // 16px top corners only
    : 'rounded-vca-sm'; // 8px all corners
  
  return (
    <div 
      className={cn(
        dimensions,
        borderRadius,
        'border border-vca-border-faint overflow-hidden',
        'flex flex-col',
        'shadow-[0_4px_12px_0_rgba(0,0,0,0.30),0_0_1px_0_rgba(140,140,140,0.20)]',
        className
      )}
    >
      {/* Header - Fixed at top */}
      <Header 
        title={headerTitle}
        position="left"
        viewport={viewport}
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
      <div ref={contentRef} className="flex-1 bg-vca-background overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col justify-end min-h-full py-vca-lg">
          {children}
        </div>
      </div>
      
      {/* Composer - Fixed at bottom */}
      <Composer 
        value={composerValue}
        onChange={setComposerValue}
        onSend={handleSend}
        onAttachment={onAttachment}
        className="shrink-0"
      />
    </div>
  );
};

