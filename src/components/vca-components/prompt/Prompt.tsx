import { VcaIcon } from '../icons';
import { cn } from '@/utils';

export type PromptProps = {
  text?: string;
  showAiIcon?: boolean;
  onClick?: () => void;
  className?: string;
};

/**
 * Prompt - Clickable suggestion chip for AI prompts
 * Displays as a pill-shaped button with optional AI sparkle icon
 * Typically used as suggested follow-up questions or quick actions
 */
export const Prompt = ({
  text = 'This is a prompt',
  showAiIcon = false,
  onClick,
  className,
}: PromptProps) => {
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-[#f6fbff] hover:bg-[#e8f3ff] flex gap-vca-xs items-center max-w-[320px] p-vca-md rounded-vca-md transition-colors cursor-pointer',
        className
      )}
    >
      {showAiIcon && (
        <VcaIcon 
          icon="signal-ai" 
          size="md" 
          className="text-vca-link hover:text-[#004182] shrink-0" 
        />
      )}
      <p className="font-vca-text text-[14px] leading-[18px] font-semibold text-vca-link hover:text-[#004182] flex-1 text-left">
        {text}
      </p>
    </button>
  );
};

