import { useState } from 'react';
import { cn } from '@/utils';
import { VcaIcon, VcaIconName } from '../icons';
import { ButtonLink } from '../buttons/ButtonLink';

export interface SelectionItem {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    iconName?: VcaIconName;
    disabled?: boolean;
}

export interface SelectionListProps {
    items: SelectionItem[];
    /**
     * Layout mode for the selection list.
     * 'list' - Standard vertical stack.
     * 'carousel' - Horizontal scrolling list.
     * 'grid' - Compact grid layout.
     */
    layout?: 'list' | 'carousel' | 'grid';
    onSelect?: (item: SelectionItem) => void;

    /**
     * Maximum number of items to show initially.
     * If items.length exceeds this, a "Show more" button will appear.
     */
    maxDisplayed?: number;

    className?: string;
}

/**
 * SelectionList - A generic component for selecting items (users, accounts, licenses, etc.)
 */
export const SelectionList = ({
    items,
    layout = 'list',
    onSelect,
    maxDisplayed,
    className,
}: SelectionListProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine which items to show
    const shouldTruncate = maxDisplayed !== undefined && items.length > maxDisplayed;
    const displayedItems = shouldTruncate && !isExpanded
        ? items.slice(0, maxDisplayed)
        : items;

    // Common item styles
    const itemBaseStyles = "group flex items-center gap-3 p-3 rounded-lg border border-transparent transition-all cursor-pointer relative overflow-hidden";
    const itemStateStyles = "bg-white hover:bg-vca-background-transparent-hover";

    // Layout-specific container styles
    const containerLayoutStyles = {
        list: "flex flex-col gap-2 w-full max-w-sm",
        carousel: "flex gap-2 w-full overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide",
        grid: "grid grid-cols-2 gap-2 w-full max-w-lg", // 2-col grid
    };

    // Layout-specific item styles
    const itemLayoutStyles = {
        list: "w-full text-left",
        carousel: "min-w-[200px] snap-center shrink-0 flex-col items-start gap-4 p-4", // Bigger cards for carousel
        grid: "w-full flex-col text-center p-4 gap-2", // Compact cards
    };

    return (
        <div className={cn("selection-list-container", className)}>
            <div className={cn(containerLayoutStyles[layout])}>
                {displayedItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => !item.disabled && onSelect?.(item)}
                        disabled={item.disabled}
                        className={cn(
                            itemBaseStyles,
                            itemStateStyles,
                            itemLayoutStyles[layout],
                            item.disabled && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                        )}
                        type="button"
                    >
                        {/* Visual (Image or Icon) - Optional */}
                        {(item.imageUrl || item.iconName) && (
                            <div className={cn(
                                "relative shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400",
                                layout === 'list' ? "w-8 h-8 rounded-full" : "w-10 h-10 rounded-lg"
                            )}>
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <VcaIcon icon={item.iconName || 'user'} size="md" />
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex flex-col min-w-0">
                            <span className="font-vca-text text-vca-small-bold text-gray-900 truncate leading-tight">
                                {item.title}
                            </span>
                            {item.subtitle && (
                                <span className="font-vca-text text-vca-xsmall text-vca-text truncate mt-0.5">
                                    {item.subtitle}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Expansion Toggle */}
            {
                shouldTruncate && (
                    <div className="mt-3 flex justify-start">
                        <ButtonLink
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded
                                ? 'Show less'
                                : `Show ${items.length - (maxDisplayed || 0)} more`
                            }
                        </ButtonLink>
                    </div>
                )
            }
        </div >
    );
};
