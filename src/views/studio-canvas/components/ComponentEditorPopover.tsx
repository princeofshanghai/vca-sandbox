import { ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';

interface ComponentEditorPopoverProps {
    children: ReactNode; // Trigger element (the component card)
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editorContent: ReactNode; // The actual editor form
    width?: number; // Default 360px
    componentId: string; // For preventing close when clicking trigger
    readOnly?: boolean;
}

/**
 * ComponentEditorPopover - Reusable popover wrapper for all component editors
 * 
 * Provides consistent positioning, interaction handling, and prevents sluggish behavior
 * by using a single source of truth for open state and proper click-away detection.
 */
export function ComponentEditorPopover({
    children,
    isOpen,
    onOpenChange,
    editorContent,
    width = 360,
    componentId,
    readOnly = false,
}: ComponentEditorPopoverProps) {
    const shouldKeepPopoverOpen = (target: HTMLElement) => {
        return Boolean(
            target.closest(`#component-${componentId}`) ||
            target.closest('[data-editor-keep-open]')
        );
    };

    return (
        <Popover.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <Popover.Anchor asChild>
                {children}
            </Popover.Anchor>

            <Popover.Portal>
                <Popover.Content
                    side="right"
                    sideOffset={16}
                    align="start"
                    collisionPadding={20}
                    className="z-[1001] rounded-2xl border border-shell-border-subtle bg-shell-bg p-0 shadow-[0_28px_72px_rgb(15_23_42/0.18)]"
                    style={{
                        width: `${width}px`,
                        maxHeight: 'calc(100vh - 40px)',
                        overflowY: 'auto'
                    }}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => {
                        // Prevent closing when clicking the trigger element or related floating editor controls.
                        const target = e.target as HTMLElement;
                        if (shouldKeepPopoverOpen(target)) {
                            e.preventDefault();
                        }
                    }}
                    onInteractOutside={(e) => {
                        // Prevent closing when clicking the trigger element or related floating editor controls.
                        const target = e.target as HTMLElement;
                        if (shouldKeepPopoverOpen(target)) {
                            e.preventDefault();
                        }
                    }}
                    onEscapeKeyDown={() => {
                        // Close on Escape key
                        onOpenChange(false);
                    }}
                >
                    {/* Stop event propagation for all interactions inside popover */}
                    <div
                        className={`w-full ${readOnly
                            ? "[&_input]:pointer-events-none [&_textarea]:pointer-events-none [&_select]:pointer-events-none [&_button:not([data-editor-close])]:pointer-events-none [&_input]:select-none [&_textarea]:select-none [&_select]:select-none [&_button:not([data-editor-close])]:cursor-not-allowed [&_button:not([data-editor-close])]:opacity-80"
                            : ""
                            }`}
                        data-readonly={readOnly ? 'true' : 'false'}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {editorContent}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
