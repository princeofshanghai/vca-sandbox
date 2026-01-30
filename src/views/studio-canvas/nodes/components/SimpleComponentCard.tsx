import { memo, forwardRef } from 'react';
import { Handle, Position } from '@xyflow/react';
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
            className={`component-card flex items-start gap-2 px-3 py-2.5 rounded-md border transition-all z-20 ${isSelected
                ? 'border-blue-500 bg-blue-50 relative'
                : 'border-gray-200 bg-white hover:border-blue-300 relative'
                } cursor-default nodrag`}
        >
            <span className={`${display.detail ? 'text-blue-600' : 'text-gray-400'} flex-shrink-0 mt-0.5`}>{display.icon}</span>
            <div className="flex-1 min-w-0">
                {display.detail ? (
                    <div className="text-xs text-gray-700 whitespace-pre-wrap leading-normal font-sans break-words">
                        {display.detail}
                    </div>
                ) : (
                    <div className="text-xs text-gray-400">Edit {display.label}</div>
                )}
            </div>
            {/* Output Handle for Prompts - Standard Blue Dot Style */}
            {component.type === 'prompt' && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id={`handle-${component.id}`}
                    className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white !-right-[26px] !top-1/2 !-translate-y-1/2"
                />
            )}
        </div>
    );
}));

SimpleComponentCard.displayName = 'SimpleComponentCard';
