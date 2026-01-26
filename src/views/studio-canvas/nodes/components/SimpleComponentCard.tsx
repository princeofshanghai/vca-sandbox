import { memo, forwardRef } from 'react';
import { Component } from '../../../studio/types';

interface SimpleComponentCardProps {
    component: Component;
    display: { icon: JSX.Element; label: string; detail?: string };
    isSelected: boolean;
    onClick: () => void;
}

// Simplified Component Card - Display only, no inline editing
export const SimpleComponentCard = memo(forwardRef<HTMLDivElement, SimpleComponentCardProps>(({
    component,
    display,
    isSelected,
    onClick,
}, ref) => {
    return (
        <div
            ref={ref}
            id={`component-${component.id}`}
            onClick={(e) => {
                e.stopPropagation(); // Prevent node selection
                onClick();
            }}
            className={`component-card flex items-start gap-2 px-3 py-2.5 rounded-md border transition-all ${isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
                } cursor-default`}
        >
            <span className="text-gray-600 flex-shrink-0 mt-0.5">{display.icon}</span>
            <div className="flex-1 min-w-0">
                {display.detail ? (
                    <div className="text-xs text-gray-700 whitespace-pre-wrap leading-normal font-sans break-words">
                        {display.detail}
                    </div>
                ) : (
                    <div className="text-[11px] text-gray-400">Add {display.label.toLowerCase()} text</div>
                )}
            </div>
        </div>
    );
}));

SimpleComponentCard.displayName = 'SimpleComponentCard';
