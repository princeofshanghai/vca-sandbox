import { cn } from '@/utils';
import TextareaAutosize from 'react-textarea-autosize';
import { ButtonIcon } from '../buttons/ButtonIcon';

export type ComposerState = 'default' | 'active' | 'typing' | 'multiline' | 'disabled' | 'stop';

export type ComposerProps = {
  state?: ComposerState;
  value?: string;
  placeholder?: string;
  attachment?: boolean;
  onSend?: () => void;
  onStop?: () => void;
  onAttachment?: () => void;
  onChange?: (value: string) => void;
  className?: string;
};

/**
 * Composer - VCA chat input component
 * Handles text input with multiple states (default, active, typing, multiline, disabled, stop)
 */
export const Composer = ({
  state = 'default',
  value = '',
  placeholder = 'Ask a question...',
  attachment = true,
  onSend,
  onStop,
  onAttachment,
  onChange,
  className,
}: ComposerProps) => {
  
  // Stop state - shows loading spinner with stop button when AI is generating
  if (state === 'stop') {
    return (
      <div className={cn(
        'bg-vca-background border-t border-vca-border-faint w-full',
        className
      )}>
        <div className="flex flex-col gap-vca-sm items-start justify-center pl-vca-lg pr-vca-md py-[10px]">
          <div className="flex gap-vca-xs items-center justify-end w-full">
            <button
              onClick={onStop}
              className="relative w-8 h-8 flex items-center justify-center group"
            >
              {/* Loading spinner */}
              <svg 
                className="absolute inset-0 w-8 h-8 animate-spin" 
                viewBox="0 0 32 32"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="70 20"
                  strokeLinecap="round"
                  className="text-vca-text-meta opacity-60"
                />
              </svg>
              
              {/* Stop square icon */}
              <div className="w-3 h-3 bg-vca-text-meta rounded-vca-xs opacity-60 group-hover:opacity-80 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine if we should show multiline layout (based on content length or newlines)
  const hasMultipleLines = value.length > 35 || value.includes('\n');
  const isActive = state === 'active' || state === 'typing' || state === 'multiline' || hasMultipleLines;
  const isDisabled = state === 'disabled';
  const isSendDisabled = isDisabled || !value || value.trim().length === 0;
  
  return (
    <div className={cn(
      'bg-vca-background border-t border-vca-border-faint w-full',
      className
    )}>
      <div className="flex flex-col gap-vca-sm items-start justify-end pl-vca-lg pr-vca-md py-[10px]">
        <div className={cn(
          'flex gap-vca-xs w-full pl-0 pr-vca-md py-0',
          hasMultipleLines ? 'items-end' : 'items-center'
        )}>
          <div className={cn(
            'relative border flex pl-vca-lg pr-vca-s flex-1',
            hasMultipleLines ? 'py-vca-s rounded-vca-md items-end' : 'py-vca-xs rounded-full min-h-[40px] items-center',
            isActive && 'border-vca-border-active',
            !isActive && !isDisabled && 'border-vca-border-subtle',
            isDisabled && 'border-vca-border-subtle bg-vca-background-disabled'
          )}>
            <div className="flex items-end flex-1 min-h-[21px]">
              {/* Auto-resizing textarea using battle-tested library */}
              <TextareaAutosize
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                disabled={isDisabled}
                minRows={1}
                maxRows={5}
                className={`flex-1 font-vca-text text-vca-small-open bg-transparent outline-none border-none w-full caret-vca-action placeholder:text-vca-small-open placeholder:text-vca-text-meta resize-none leading-[21px] ${
                  isDisabled ? 'text-vca-text-disabled cursor-not-allowed' : 'text-vca-text'
                }`}
              />
            </div>
            
            {attachment && (
              <div className={cn('shrink-0', hasMultipleLines ? 'ml-[10px]' : 'ml-vca-s')}>
                <ButtonIcon
                  icon="attachment"
                  type="tertiary"
                  emphasis={false}
                  size="sm"
                  disabled={isDisabled}
                  onClick={onAttachment}
                  ariaLabel="Attach file"
                />
              </div>
            )}
          </div>
          
          <ButtonIcon
            icon="send"
            type="tertiary"
            emphasis={false}
            size="sm"
            disabled={isSendDisabled}
            onClick={onSend}
            ariaLabel="Send message"
          />
        </div>
      </div>
    </div>
  );
};

