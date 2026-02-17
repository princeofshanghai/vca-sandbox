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
    // Render specific content based on type
    const renderContent = () => {
        switch (component.type) {
            case 'message': {
                const content = component.content as import('../../../studio/types').AIMessageContent;
                return (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {content.text || <span className="text-gray-400 italic">Empty message...</span>}
                    </div>
                );
            }
            case 'infoMessage': {
                const content = component.content as import('../../../studio/types').AIInfoContent;
                return (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded text-xs text-gray-600">
                        {content.title && <div className="font-medium text-slate-800 mb-1">{content.title}</div>}
                        <div className="line-clamp-2 leading-relaxed">{content.body || <span className="text-gray-400 italic">Empty info message...</span>}</div>
                    </div>
                );
            }
            case 'prompt': {
                const content = component.content as import('../../../studio/types').PromptContent;
                return (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium max-w-full">
                        <span className="truncate">{content.text || 'New Prompt'}</span>
                    </div>
                );
            }
            case 'statusCard': {
                const content = component.content as import('../../../studio/types').AIStatusContent;
                return (
                    <div className="p-2 bg-white border border-gray-200 rounded text-xs text-gray-600 shadow-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="truncate font-medium">{content.loadingTitle || content.successTitle || 'Status Card'}</span>
                    </div>
                );
            }
            case 'selectionList': {
                const content = component.content as import('../../../studio/types').SelectionListContent;
                return (
                    <div className="flex flex-col gap-1.5">
                        {content.items?.map((item) => (
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
                        {content.title && (
                            <div className="mt-1 text-[10px] text-gray-400 italic truncate">
                                "{content.title}"
                            </div>
                        )}
                    </div>
                );
            }
            case 'checkboxGroup': {
                const content = component.content as import('../../../studio/types').CheckboxGroupContent;
                return (
                    <div className="flex flex-col gap-1.5">
                        {content.options?.map((option) => (
                            <div key={option.id} className="relative flex items-center gap-2 px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 shadow-sm">
                                <div className="w-3 h-3 border border-gray-300 rounded-[3px]" />
                                <span className="truncate max-w-[160px]" title={option.label}>{option.label}</span>
                            </div>
                        ))}
                    </div>
                );
            }
            default:
                return <div className="text-xs text-gray-400 italic">Unknown component</div>;
        }
    };

    return (
        <div
            ref={ref}
            id={`component-${component.id}`}
            onClick={(e) => {
                e.stopPropagation(); // Prevent node selection
                onClick();
            }}
            className={`component-card flex flex-col gap-0 rounded-md border transition-all z-20 ${isSelected
                ? 'border-blue-500 bg-blue-50/50 relative'
                : 'border-gray-200 bg-white hover:border-blue-300 relative'
                } cursor-default nodrag group overflow-hidden`}
        >
            {/* Universal Header */}
            <div className="flex items-center gap-2 p-3 pb-2 border-b border-gray-100 bg-white/50">
                <span className={`flex-shrink-0 ${isSelected ? 'text-blue-700' : 'text-blue-600'}`}>
                    {display.icon}
                </span>
                <span className={`text-[13px] font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                    {display.label}
                </span>
            </div>

            {/* Content Body - Full Width */}
            <div className="w-full p-3 pt-2">
                {renderContent()}
            </div>

            {/* Output Handle for Prompt & CheckboxGroup - Standard Blue Dot Style */}
            {(component.type === 'prompt' || component.type === 'checkboxGroup') && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id={`handle-${component.id}`}
                    className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white !-right-[7px] !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125"
                />
            )}
        </div>
    );
}));

SimpleComponentCard.displayName = 'SimpleComponentCard';
