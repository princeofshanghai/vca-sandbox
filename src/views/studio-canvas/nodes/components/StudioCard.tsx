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
    className,
    isPlaceholder = false,
    overflowVisible = false
}: StudioCardProps) => {
    // Theme configurations
    const themes = {
        blue: {
            border: 'border-blue-500',
            bg: 'bg-blue-50/50',
            text: 'text-blue-900',
            iconColor: 'text-blue-600',
            selectedIconColor: 'text-blue-700',
            hoverBorder: 'hover:border-blue-300',
            handle: '!bg-blue-400',
        },
        amber: {
            border: 'border-amber-500',
            bg: 'bg-amber-50/50',
            text: 'text-amber-900',
            iconColor: 'text-amber-600',
            selectedIconColor: 'text-amber-700',
            hoverBorder: 'hover:border-amber-300',
            handle: '!bg-amber-400',
        },
        gray: {
            border: 'border-gray-400',
            bg: 'bg-gray-50/50',
            text: 'text-gray-700', // Title color when selected
            iconColor: 'text-gray-400', // Icon color
            selectedIconColor: 'text-gray-600',
            hoverBorder: 'hover:border-gray-300',
            handle: '!bg-gray-400',
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
                "flex flex-col gap-0 rounded-md border transition-all z-20 relative cursor-default nodrag group bg-white",
                selected ? `${activeTheme.border} ${activeTheme.bg}` : `border-gray-200 ${activeTheme.hoverBorder}`,
                className
            )}
        >
            {/* Input Handle */}
            {showInputHandle && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className={cn("!w-3 !h-3 !border-2 !border-white !-left-[7px] !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125", activeTheme.handle)}
                />
            )}

            {/* Header - Only show if NOT a placeholder */}
            {/* Inner Content Wrapper - Clips content while allowing handles to pop out */}
            <div className={cn("flex flex-col w-full h-full rounded-[inherit]", overflowVisible ? "overflow-visible" : "overflow-hidden")}>
                {/* Header - Only show if NOT a placeholder */}
                {!isPlaceholder && (
                    <div className="flex items-center gap-2 p-3 pb-2 border-b border-gray-100 bg-white/50 rounded-t-[inherit]">
                        {icon && (
                            <span className={cn("flex-shrink-0", selected ? activeTheme.selectedIconColor : activeTheme.iconColor)}>
                                {icon}
                            </span>
                        )}
                        <span className={cn("text-sm font-semibold", selected ? activeTheme.text : "text-gray-700")}>
                            {title}
                        </span>
                    </div>
                )}

                {/* Body */}
                <div className={cn("w-full p-3", !isPlaceholder && "pt-2")}>
                    {isPlaceholder ? (
                        <div className="flex items-center gap-2">
                            {icon && (
                                <span className="flex-shrink-0 text-gray-400">
                                    {icon}
                                </span>
                            )}
                            <span className="text-sm font-normal text-gray-500">
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
                    className={cn("!w-3 !h-3 !border-2 !border-white !-right-[7px] !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125", activeTheme.handle)}
                />
            )}
        </div>
    );
});

StudioCard.displayName = 'StudioCard';
