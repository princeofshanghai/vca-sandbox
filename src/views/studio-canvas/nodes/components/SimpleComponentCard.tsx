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
            {/* Output Handle for Prompts - Refined Typeform Style */}
            {component.type === 'prompt' && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id={`handle-${component.id}`}
                    // Positioned at -30px to perfectly overlap the parent TurnNode's right border
                    // (Accounts for 20px padding + 10px half-width of the handle)
                    className="!w-[20px] !h-[20px] !bg-white !border !border-gray-200 !rounded-full !shadow-md !-right-[30px] !top-1/2 !-translate-y-1/2 z-50 cursor-crosshair flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ position: 'absolute' }}
                >
                    {/* Inner Orange Ring */}
                    <div className="w-[12px] h-[12px] border-[3px] border-orange-500 rounded-full" />
                </Handle>
            )}
        </div>
    );
}));

SimpleComponentCard.displayName = 'SimpleComponentCard';
