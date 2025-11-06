import { VcaIcon } from '../icons';
import { cn } from '@/utils';

export type ComposerState = 'default' | 'active' | 'typing' | 'multiline' | 'disabled' | 'stop';

export type ComposerProps = {
  state?: ComposerState;
  value?: string;
  placeholder?: string;
  attachment?: boolean;
  onSend?: () => void;
  onStop?: () => void;
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
  onChange,
  className,
}: ComposerProps) => {
  
  // Stop state - shows "Stop answering" button when AI is generating
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
              className="flex gap-vca-xs items-center group"
            >
              <p className="font-vca-text text-vca-small text-vca-text-meta text-right">
                Stop answering
              </p>
              <div className="w-[42px] h-[42px] flex items-center justify-center">
                <div className="w-4 h-4 bg-vca-text-meta rounded-vca-sm opacity-60 group-hover:opacity-80 transition-opacity" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Multiline state - expands for longer text (max 4 lines)
  if (state === 'multiline') {
    return (
      <div className={cn(
        'bg-vca-background border-t border-vca-border-faint w-full',
        className
      )}>
        <div className="flex flex-col gap-vca-sm items-start justify-center pl-vca-lg pr-vca-md py-[10px]">
          <div className="flex gap-vca-xs items-end pl-0 pr-vca-md py-0 w-full">
            <div className="relative border border-vca-border-active flex items-end max-h-[88px] px-vca-lg py-vca-s rounded-vca-md w-full">
              <textarea
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="flex-1 font-vca-text text-vca-small-open text-vca-text resize-none outline-none bg-transparent max-h-[72px] overflow-auto"
                rows={4}
              />
              {/* Cursor blinker */}
              <div className="absolute bottom-[10px] right-[48px] w-[2px] h-[18px] bg-vca-action rounded-full animate-pulse" />
              
              {attachment && (
                <div className="ml-[10px] shrink-0">
                  <VcaIcon icon="attachment" size="sm" className="text-vca-text" />
                </div>
              )}
            </div>
            
            <button
              onClick={onSend}
              className="flex items-center justify-center p-vca-s rounded-full shrink-0 w-8 h-8 hover:bg-gray-100 transition-colors"
            >
              <VcaIcon icon="send" size="sm" className="text-vca-text" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All other states (default, active, typing, disabled)
  const isActive = state === 'active' || state === 'typing';
  const isDisabled = state === 'disabled';
  
  return (
    <div className={cn(
      'bg-vca-background border-t border-vca-border-faint',
      isDisabled ? 'h-[60px]' : 'h-[60px]',
      'w-full',
      className
    )}>
      <div className="flex flex-col gap-vca-sm h-full items-start justify-center pl-vca-lg pr-vca-md py-[10px]">
        <div className="flex gap-vca-xs items-center pl-0 pr-vca-md py-0 w-full">
          <div className={cn(
            'relative border flex gap-vca-s h-10 items-center px-vca-lg py-vca-xs rounded-full flex-1',
            isActive && 'border-vca-border-active',
            !isActive && !isDisabled && 'border-vca-border-subtle',
            isDisabled && 'border-vca-border-subtle bg-vca-background-disabled'
          )}>
            <div className="flex items-center flex-1 min-h-[21px]">
              {/* Show cursor blinker in active/typing states */}
              {isActive && (
                <div className="w-[2px] h-[18px] bg-vca-action rounded-full animate-pulse shrink-0" />
              )}
              
              {/* Input text or placeholder */}
              {state === 'typing' && value ? (
                <p className="font-vca-text text-vca-small-open text-vca-text whitespace-nowrap">
                  {value}
                </p>
              ) : (
                <p className={`font-vca-text text-vca-small-open flex-1 ${isDisabled ? 'text-vca-text-disabled' : 'text-vca-text-meta'}`}>
                  {placeholder}
                </p>
              )}
            </div>
            
            {attachment && (
              <VcaIcon 
                icon="attachment" 
                size="sm" 
                className={isDisabled ? 'text-vca-text-disabled' : 'text-vca-text'} 
              />
            )}
          </div>
          
          <button
            onClick={onSend}
            disabled={isDisabled}
            className="flex items-center justify-center p-vca-s rounded-full shrink-0 w-8 h-8 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <VcaIcon icon="send" size="sm" className="text-vca-text" />
          </button>
        </div>
      </div>
    </div>
  );
};

