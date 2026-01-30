import { ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';

interface ComponentEditorPopoverProps {
    children: ReactNode; // Trigger element (the component card)
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editorContent: ReactNode; // The actual editor form
    width?: number; // Default 360px
    componentId: string; // For preventing close when clicking trigger
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
}: ComponentEditorPopoverProps) {
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
                    className="bg-white rounded-xl shadow-2xl border border-gray-200 p-0 z-[1001]"
                    style={{ width: `${width}px` }}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => {
                        // Prevent closing when clicking the trigger element, contextual toolbar, or markdown toolbar
                        const target = e.target as HTMLElement;
                        if (target.closest(`#component-${componentId}`) || target.closest('#context-toolbar') || target.closest('#markdown-toolbar')) {
                            e.preventDefault();
                        }
                    }}
                    onInteractOutside={(e) => {
                        // Prevent closing when clicking the trigger element, contextual toolbar, or markdown toolbar
                        const target = e.target as HTMLElement;
                        if (target.closest(`#component-${componentId}`) || target.closest('#context-toolbar') || target.closest('#markdown-toolbar')) {
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
                        className="w-full"
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
