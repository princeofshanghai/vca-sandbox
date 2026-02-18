import { cn } from '@/utils';
import TextareaAutosize from 'react-textarea-autosize';
import { ButtonIcon } from '../buttons/ButtonIcon';

export type ComposerStatus = 'default' | 'active' | 'typing' | 'multiline' | 'disabled' | 'stop';

export type ComposerProps = {
  status?: ComposerStatus;
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
  status = 'default',
  value = '',
  placeholder = 'Ask a question...',
  attachment = true,
  onSend,
  onStop,
  onAttachment,
  onChange,
  className,
}: ComposerProps) => {

  // Stop state - shows "Stop answering" with loading spinner
  if (status === 'stop') {
    return (
      <div className={cn(
        'bg-vca-background border-t border-vca-border-faint w-full',
        className
      )}>
        <div className="flex flex-col gap-vca-sm items-start justify-center pl-vca-xxl pr-vca-lg py-[10px]">
          <div className="flex gap-vca-xs items-center justify-end w-full min-h-[40px]">
            <button
              onClick={onStop}
              className="flex gap-vca-s items-center group cursor-pointer"
            >
              {/* Stop answering text */}
              <span className="font-vca-text text-vca-small text-vca-text-meta">
                Stop answering
              </span>

              {/* Loading spinner GIF */}
              <img
                src="/answer-loading.gif"
                alt="Loading"
                className="w-8 h-8"
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine if we should show multiline layout (based on content length or newlines)
  const hasMultipleLines = value.length > 35 || value.includes('\n');
  const isActive = status === 'active' || status === 'typing' || status === 'multiline' || hasMultipleLines;
  const isDisabled = status === 'disabled';
  const isSendDisabled = isDisabled || !value || value.trim().length === 0;

  return (
    <div className={cn(
      'bg-vca-background border-t border-vca-border-faint w-full',
      className
    )}>
      <div className="flex flex-col gap-vca-xs items-start justify-end pl-vca-xxl pr-vca-lg py-[10px]">
        <div className={cn(
          'flex gap-vca-xs w-full py-0',
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
                onKeyDown={(e) => {
                  // Enter without Shift = send message
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSendDisabled && onSend) {
                      onSend();
                    }
                  }
                  // Shift + Enter = allow new line (default behavior)
                }}
                placeholder={placeholder}
                disabled={isDisabled}
                minRows={1}
                maxRows={5}
                className={`flex-1 font-vca-text text-vca-small-open bg-transparent outline-none border-none w-full caret-vca-action placeholder:text-vca-small-open placeholder:text-vca-text-meta resize-none leading-[21px] ${isDisabled ? 'text-vca-text-disabled cursor-not-allowed' : 'text-vca-text'
                  }`}
              />
            </div>

            {attachment && (
              <div className={cn('shrink-0', hasMultipleLines ? 'ml-[10px]' : 'ml-vca-s')}>
                <ButtonIcon
                  icon="attachment"
                  variant="tertiary"
                  emphasis={false}
                  size="sm"
                  disabled={isDisabled}
                  onClick={onAttachment}
                  ariaLabel="Attach file"
                />
              </div>
            )}
          </div>

          <div className={cn('shrink-0', hasMultipleLines && 'pb-vca-s')}>
            <ButtonIcon
              icon="send"
              variant="tertiary"
              emphasis={false}
              size="sm"
              disabled={isSendDisabled}
              onClick={onSend}
              ariaLabel="Send message"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

