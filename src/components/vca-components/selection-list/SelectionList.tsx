import { useState } from 'react';
import { cn } from '@/utils';
import { VcaIcon, VcaIconName } from '../icons';
import { ButtonLink } from '../buttons/ButtonLink';
import { Avatar, getAvatarFallbackTone } from '../avatar';
import { HotspotBeacon } from '../hotspot';

export type SelectionItemVisualType = 'avatar' | 'icon' | 'none';

export interface SelectionItem {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    iconName?: VcaIconName;
    visualType?: SelectionItemVisualType;
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
  hotspotItemIds?: string[];

  className?: string;
}

/**
 * Select Cards - A generic set of selectable cards with optional leading visuals.
 */
export const SelectionList = ({
    items,
    layout = 'list',
    onSelect,
    maxDisplayed,
    hotspotItemIds = [],
    className,
}: SelectionListProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine which items to show
    const shouldTruncate = maxDisplayed !== undefined && items.length > maxDisplayed;
    const displayedItems = shouldTruncate && !isExpanded
        ? items.slice(0, maxDisplayed)
        : items;

    const hasHotspots = hotspotItemIds.length > 0;

    // Common item styles
    const itemBaseStyles = "group flex items-center gap-3 p-3 rounded-lg border border-transparent transition-all cursor-pointer relative";
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
            <div className={cn(containerLayoutStyles[layout], hasHotspots && "pr-4")}>
                {displayedItems.map((item) => {
                    const showHotspot = hotspotItemIds.includes(item.id);
                    const resolvedVisualType: SelectionItemVisualType =
                        item.imageUrl
                            ? 'avatar'
                            : item.visualType || (item.iconName ? 'icon' : 'none');
                    const showAvatar = resolvedVisualType === 'avatar';
                    const showIcon = resolvedVisualType === 'icon';
                    const fallbackTone = getAvatarFallbackTone(item.id || item.title || 'item');

                    return (
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
                            {showHotspot && (
                                <HotspotBeacon className="-right-2 top-1/2 -translate-y-1/2" />
                            )}
                            {(showAvatar || showIcon) && (
                                <div className={cn(
                                    "relative shrink-0 flex items-center justify-center",
                                    layout === 'list' ? "w-8 h-8" : "w-10 h-10"
                                )}>
                                    {showAvatar ? (
                                        <Avatar
                                            size={32}
                                            src={item.imageUrl}
                                            alt={item.title ? `${item.title} avatar` : 'Card avatar'}
                                            fallbackStyle="silhouette"
                                            fallbackTone={fallbackTone}
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-lg overflow-hidden bg-vca-background-neutral-soft flex items-center justify-center text-vca-text-meta">
                                            <VcaIcon icon={item.iconName || 'placeholder'} size="md" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex flex-col min-w-0">
                                <span className="font-vca-text text-vca-small-bold text-gray-900 truncate leading-tight">
                                    {item.title}
                                </span>
                                {item.subtitle && (
                                    <span className="font-vca-text text-vca-xsmall text-vca-text-meta truncate mt-0.5">
                                        {item.subtitle}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
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

export type SelectCardVisualType = SelectionItemVisualType;
export type SelectCard = SelectionItem;
export type SelectCardsProps = SelectionListProps;
export const SelectCards = SelectionList;
