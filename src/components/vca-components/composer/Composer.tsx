import { cn } from '@/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { ButtonIcon } from '../buttons/ButtonIcon';
import { HotspotBeacon } from '../hotspot';

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
  showInteractionHotspot?: boolean;
  interactionSuggestions?: string[];
  onUseSuggestion?: (value: string) => void;
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
  showInteractionHotspot = false,
  interactionSuggestions = [],
  onUseSuggestion,
  className,
}: ComposerProps) => {
  const [isHotspotOpen, setIsHotspotOpen] = useState(false);
  const interactionRef = useRef<HTMLDivElement>(null);
  const canShowHotspot = showInteractionHotspot && status !== 'stop' && status !== 'disabled';
  const hasSuggestions = interactionSuggestions.length > 0;
  const uniqueSuggestions = useMemo(
    () => Array.from(new Set(interactionSuggestions.map((value) => value.trim()).filter(Boolean))),
    [interactionSuggestions]
  );

  useEffect(() => {
    if (!isHotspotOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && interactionRef.current && !interactionRef.current.contains(target)) {
        setIsHotspotOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isHotspotOpen]);

  useEffect(() => {
    if (!canShowHotspot) {
      setIsHotspotOpen(false);
    }
  }, [canShowHotspot]);

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
          )}
            ref={interactionRef}
          >
            <div className="flex items-end flex-1 min-h-[21px]">
              {/* Auto-resizing textarea using battle-tested library */}
              <TextareaAutosize
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onFocus={() => {
                  if (canShowHotspot) {
                    setIsHotspotOpen(true);
                  }
                }}
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

            {canShowHotspot && (
              <div
                className={cn(
                  'absolute z-20',
                  hasMultipleLines ? 'bottom-1.5 right-8' : 'right-8 top-1/2 -translate-y-1/2'
                )}
              >
                <button
                  type="button"
                  className="relative block h-5 w-5 cursor-pointer"
                  onClick={() => setIsHotspotOpen((current) => !current)}
                  aria-label="Show typing suggestions"
                >
                  <HotspotBeacon className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                </button>

                {isHotspotOpen && (
                  <div
                    className="absolute bottom-full right-0 mb-2 w-[280px] rounded-xl border border-vca-border-faint bg-white/95 p-1.5 shadow-[0_10px_26px_rgba(15,23,42,0.14)] backdrop-blur"
                  >
                    <p className="px-2 pb-1 text-vca-xsmall text-vca-text-meta">Choose a shortcut to send now</p>
                    {hasSuggestions ? (
                      <div className="mt-1 max-h-44 space-y-0.5 overflow-y-auto pr-0.5">
                        {uniqueSuggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion}-${index}`}
                            type="button"
                            className="w-full rounded-lg px-2 py-2 text-left font-vca-text text-vca-xsmall text-vca-text transition-colors hover:bg-vca-background-transparent-hover"
                            onClick={() => {
                              onUseSuggestion?.(suggestion);
                              setIsHotspotOpen(false);
                            }}
                          >
                            <span className="block truncate">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 px-2 pb-1 text-vca-xsmall text-vca-text-meta">
                        Type a message to continue.
                      </p>
                    )}
                  </div>
                )}
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
