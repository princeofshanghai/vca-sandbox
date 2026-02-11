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
            {component.type === 'selectionList' ? (
                // Special layout for Selection List: Header + Items with Handles
                <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600 flex-shrink-0">{display.icon}</span>
                        <div className="text-xs font-medium text-gray-700">{display.label}</div>
                    </div>
                    <div className="flex flex-col gap-1.5 pl-6">
                        {(component.content as import('../../../studio/types').SelectionListContent).items?.map((item) => (
                            <div key={item.id} className="relative flex items-center justify-between px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 shadow-sm group-hover:border-blue-200 transition-colors">
                                <span className="truncate max-w-[180px]" title={item.title}>{item.title}</span>
                                {/* Handle for this specific item */}
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`handle-${component.id}-${item.id}`}
                                    className="!bg-blue-400 !w-2.5 !h-2.5 !border-2 !border-white !-right-[21px] !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125"
                                />
                            </div>
                        ))}
                    </div>
                    {/* Render Title if present */}
                    {(component.content as import('../../../studio/types').SelectionListContent).title && (
                        <div className="mt-2 pl-6 text-[10px] text-gray-400 italic truncate">
                            "{(component.content as import('../../../studio/types').SelectionListContent).title}"
                        </div>
                    )}
                </div>
            ) : component.type === 'checkboxGroup' ? (
                // Checkbox Group Layout: Header + Options List + Single Submit Handle
                <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600 flex-shrink-0">{display.icon}</span>
                        <div className="text-xs font-medium text-gray-700">{display.label}</div>
                    </div>
                    <div className="flex flex-col gap-1.5 pl-6">
                        {(component.content as import('../../../studio/types').CheckboxGroupContent).options?.map((option) => (
                            <div key={option.id} className="relative flex items-center gap-2 px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 shadow-sm">
                                <div className="w-3 h-3 border border-gray-300 rounded-[3px]" />
                                <span className="truncate max-w-[160px]" title={option.label}>{option.label}</span>
                            </div>
                        ))}
                    </div>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={`handle-${component.id}`}
                        className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white !-right-[26px] !top-1/2 !-translate-y-1/2 !z-30"
                    />
                </div>
            ) : (
                // Standard Layout for other components
                <>
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
                </>
            )}

            {/* Output Handle for Prompts - Standard Blue Dot Style */}
            {component.type === 'prompt' && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id={`handle-${component.id}`}
                    className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white !-right-[26px] !top-1/2 !-translate-y-1/2 !z-30"
                />
            )}
        </div>
    );
}));

SimpleComponentCard.displayName = 'SimpleComponentCard';
