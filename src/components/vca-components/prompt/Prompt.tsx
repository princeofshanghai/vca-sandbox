import React from 'react';
import { VcaIcon } from '../icons';
import { cn } from '@/utils';
import { HotspotBeacon } from '../hotspot';

export type PromptProps = {
  children?: React.ReactNode;
  showAiIcon?: boolean;
  onClick?: () => void;
  className?: string;
  showHotspot?: boolean;
};

/**
 * Prompt - Clickable suggestion chip for AI prompts
 * Displays as a pill-shaped button with optional AI sparkle icon
 * Typically used as suggested follow-up questions or quick actions
 */
export const Prompt = ({
  children = 'This is a prompt',
  showAiIcon = false,
  onClick,
  className,
  showHotspot = false,
}: PromptProps) => {

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative bg-vca-surface-tint hover:bg-vca-surface-tint-hover flex gap-vca-xs items-center max-w-[320px] w-fit p-vca-md rounded-vca-md transition-colors cursor-pointer',
        className
      )}
    >
      {showHotspot && (
        <HotspotBeacon className="left-full ml-1.5 top-1/2 -translate-y-1/2" />
      )}
      {showAiIcon && (
        <VcaIcon
          icon="signal-ai"
          size="md"
          className="text-vca-action shrink-0"
        />
      )}
      <div className="font-vca-text text-vca-small-bold text-vca-link hover:text-vca-link-hover flex-1 text-left">
        {children}
      </div>
    </button>
  );
};
