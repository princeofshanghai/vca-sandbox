import { memo, ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/utils/cn';

interface StudioCardProps {
    /** Icon to display in the header */
    icon: ReactNode;
    /** Title to display in the header */
    title: string;
    /** Theme color for the card */
    theme: 'blue' | 'amber' | 'gray';
    /** Whether the card is currently selected */
    selected?: boolean;
    /** Content to display in the body */
    children: ReactNode;
    /** Optional click handler */
    onClick?: () => void;
    /** Optional ID for the root element */
    id?: string;
    /** Whether to show the input handle (left) */
    showInputHandle?: boolean;
    /** Whether to show the output handle (right) */
    showOutputHandle?: boolean;
    /** Whether the card is in a placeholder/empty state */
    isPlaceholder?: boolean;
    /** ID for the output handle */
    outputHandleId?: string;
    /** Right offset in px for the output handle */
    outputHandleOffsetPx?: number;
    /** Whether to allow content to overflow (e.g. for inner handles) */
    overflowVisible?: boolean;
    /** Additional classes for the root element */
    className?: string;
}

export const StudioCard = memo(({
    icon,
    title,
    theme,
    selected,
    children,
    onClick,
    id,
    showInputHandle,
    showOutputHandle,
    outputHandleId,
    outputHandleOffsetPx = 7,
    className,
    isPlaceholder = false,
    overflowVisible = false
}: StudioCardProps) => {
    // Theme configurations
    const themes = {
        blue: {
            selectedBorder: 'border-shell-accent ring-1 ring-shell-accent/30',
            baseBorder: 'border-shell-border/70',
            hoverBorder: 'hover:border-shell-accent/60',
            text: 'text-shell-text',
            iconColor: 'text-shell-accent',
            selectedIconColor: 'text-shell-accent',
            handle: '!bg-shell-accent',
        },
        amber: {
            selectedBorder: 'border-shell-node-condition ring-1 ring-shell-node-condition/30',
            baseBorder: 'border-shell-border/70',
            hoverBorder: 'hover:border-shell-node-condition/60',
            text: 'text-shell-text',
            iconColor: 'text-shell-node-condition',
            selectedIconColor: 'text-shell-node-condition',
            handle: '!bg-shell-node-condition',
        },
        gray: {
            selectedBorder: 'border-shell-muted-strong ring-1 ring-shell-muted-strong/30',
            baseBorder: 'border-shell-border/70',
            hoverBorder: 'hover:border-shell-muted-strong/70',
            text: 'text-shell-text',
            iconColor: 'text-shell-muted-strong',
            selectedIconColor: 'text-shell-muted-strong',
            handle: '!bg-shell-muted',
        }
    };

    const activeTheme = themes[theme];

    return (
        <div
            id={id}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            className={cn(
                "flex flex-col gap-0 rounded-md border transition-all z-20 relative cursor-pointer nodrag group bg-shell-bg",
                selected ? activeTheme.selectedBorder : `${activeTheme.baseBorder} ${activeTheme.hoverBorder}`,
                className
            )}
        >
            {/* Input Handle */}
            {showInputHandle && (
                <Handle
                    type="target"
                position={Position.Left}
                className={cn("!w-3 !h-3 !border-2 !border-shell-bg !-left-[7px] !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125", activeTheme.handle)}
            />
            )}

            {/* Header - Only show if NOT a placeholder */}
            {/* Inner Content Wrapper - Clips content while allowing handles to pop out */}
            <div className={cn("flex flex-col w-full h-full rounded-[inherit]", overflowVisible ? "overflow-visible" : "overflow-hidden")}>
                {/* Header - Only show if NOT a placeholder */}
                {!isPlaceholder && (
                    <div className="flex items-center gap-2 p-3 pb-2 border-b border-shell-border-subtle bg-shell-bg rounded-t-[inherit]">
                        {icon && (
                            <span className={cn("flex-shrink-0", selected ? activeTheme.selectedIconColor : activeTheme.iconColor)}>
                                {icon}
                            </span>
                        )}
                        <span className={cn("text-sm font-semibold", selected ? activeTheme.text : "text-shell-muted-strong")}>
                            {title}
                        </span>
                    </div>
                )}

                {/* Body */}
                <div className={cn("w-full p-3 bg-shell-bg", !isPlaceholder && "pt-2")}>
                    {isPlaceholder ? (
                        <div className="flex items-center gap-2">
                            {icon && (
                                <span className="flex-shrink-0 text-shell-text">
                                    {icon}
                                </span>
                            )}
                            <span className="text-sm font-medium text-shell-text">
                                {title}
                            </span>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>

            {/* Output Handle */}
            {showOutputHandle && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id={outputHandleId}
                    style={{ right: -outputHandleOffsetPx }}
                    className={cn("!w-3 !h-3 !border-2 !border-shell-bg !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125", activeTheme.handle)}
                />
            )}
        </div>
    );
});

StudioCard.displayName = 'StudioCard';
