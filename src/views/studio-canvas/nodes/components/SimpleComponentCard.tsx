import { memo, forwardRef, type MouseEvent } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CircleDashed, Check } from 'lucide-react';
import { Component } from '../../../studio/types';
import { StudioCard } from './StudioCard';
import {
    CARD_EDGE_OUTPUT_HANDLE_OFFSET_PX,
    SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX
} from './handleOffsets';

interface SimpleComponentCardProps {
    component: Component;
    display: { icon: JSX.Element; label: string; detail?: string };
    isSelected: boolean;
    readOnly?: boolean;
    onClick: (event: MouseEvent<HTMLDivElement>) => void;
    onHandleClick?: (
        handleId: string,
        handleEl?: HTMLElement | null,
        pointerClient?: { x: number; y: number }
    ) => void;
}

const stripMarkdown = (text?: string): string => {
    if (!text) return '';
    return text
        // Remove headers
        .replace(/^#+\s+/gm, '')
        // Remove bold/italic
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        // Remove links [text](url) -> text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove inline code
        .replace(/`([^`]+)`/g, '$1')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove list markers
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        // Remove images
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        .trim();
};

// Simplified Component Card - Display only, no inline editing
export const SimpleComponentCard = memo(forwardRef<HTMLDivElement, SimpleComponentCardProps>(({
    component,
    display,
    isSelected,
    readOnly = false,
    onClick,
    onHandleClick,
}, ref) => {
    const handlePreviewClass = readOnly ? '' : 'flow-create-handle flow-create-handle-accent';

    // Render specific content based on type
    const renderContent = () => {
        switch (component.type) {
            case 'message': {
                const content = component.content as import('../../../studio/types').AIMessageContent;
                if (!content.text) return null;
                return (
                    <div className="px-0.5 py-1 text-sm text-shell-text leading-relaxed">
                        {stripMarkdown(content.text)}
                    </div>
                );
            }
            case 'infoMessage': {
                const content = component.content as import('../../../studio/types').AIInfoContent;
                if (!content.body) return null;
                return (
                    <div className="px-0.5 py-1 text-sm text-shell-text">
                        <div className="leading-relaxed">{stripMarkdown(content.body)}</div>
                    </div>
                );
            }
            case 'prompt': {
                const content = component.content as import('../../../studio/types').PromptContent;
                if (!content.text) return null;
                return (
                    <div className="inline-flex items-center px-2.5 py-2.5 rounded-md bg-shell-accent-soft text-shell-accent-text text-sm max-w-full">
                        <span className="truncate">{content.text}</span>
                    </div>
                );
            }
            case 'statusCard': {
                const content = component.content as import('../../../studio/types').AIStatusContent;
                if (!content.loadingTitle && !content.successTitle) return null;
                return (

	                    <div className="flex flex-col gap-1.5 px-0.5 py-1">
	                        {/* Loading State */}
	                        <div className="relative flex flex-col justify-center rounded-md bg-shell-accent-soft overflow-hidden">
	                            <div className="flex items-center gap-2 px-2.5 py-2 text-sm text-shell-text">
	                                <CircleDashed className="w-4 h-4 text-shell-muted-strong animate-spin" />
	                                <span className="truncate">{content.loadingTitle || 'Loading...'}</span>
	                            </div>
	                        </div>

                        {/* Success State */}
                        <div className="flex items-center gap-2 px-2.5 py-2.5 rounded-md bg-shell-accent-soft text-sm text-shell-text">
                            <Check className="w-4 h-4 text-shell-muted-strong" />
                            <span className="truncate">{content.successTitle || 'Success'}</span>
                        </div>
                    </div>
                );
            }
            case 'selectionList': {
                const content = component.content as import('../../../studio/types').SelectionListContent;
                return (
                    <div className="flex flex-col gap-1.5">

                        {content.items?.map((item) => (
                            <div key={item.id} className="relative flex items-center justify-between px-3 py-2.5 bg-shell-surface border border-shell-border/70 rounded text-sm text-shell-muted-strong shadow-sm group-hover:border-shell-accent-border transition-colors">
                                <span className="truncate max-w-[180px]" title={item.title}>{item.title}</span>
                                {/* Handle for this specific item */}
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`handle-${component.id}-${item.id}`}
                                    style={{ right: -SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX }}
                                    className={`${handlePreviewClass} !bg-shell-accent !w-3.5 !h-3.5 !border-2 !border-shell-bg !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (readOnly) return;
                                        onHandleClick?.(
                                            `handle-${component.id}-${item.id}`,
                                            event.currentTarget as HTMLElement,
                                            { x: event.clientX, y: event.clientY }
                                        );
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                );
            }
            case 'confirmationCard': {
                const content = component.content as import('../../../studio/types').ConfirmationCardContent;
                return (
                    <div className="flex flex-col gap-1.5">
                        <div className="rounded border border-shell-border/70 bg-shell-surface px-3 py-2.5 text-sm text-shell-muted-strong shadow-sm group-hover:border-shell-accent-border transition-colors">
                            <span className="truncate block max-w-[180px]" title={content.item?.title}>
                                {content.item?.title || 'Candidate name'}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="relative flex w-full items-center rounded border border-shell-accent-border/70 bg-shell-accent-soft px-2.5 py-2 pr-8 text-[11px] font-medium text-shell-accent-text">
                                <span className="truncate max-w-full" title={content.confirmLabel || 'Yes, confirm'}>
                                    {content.confirmLabel || 'Yes, confirm'}
                                </span>
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`handle-${component.id}-confirm`}
                                    style={{ right: -SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX }}
                                    className={`${handlePreviewClass} !bg-shell-accent !w-3.5 !h-3.5 !border-2 !border-shell-bg !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (readOnly) return;
                                        onHandleClick?.(
                                            `handle-${component.id}-confirm`,
                                            event.currentTarget as HTMLElement,
                                            { x: event.clientX, y: event.clientY }
                                        );
                                    }}
                                />
                            </div>

                            <div className="relative flex w-full items-center rounded border border-shell-border/70 bg-shell-bg px-2.5 py-2 pr-8 text-[11px] font-medium text-shell-muted-strong">
                                <span className="truncate max-w-full" title={content.rejectLabel || 'No, not this person'}>
                                    {content.rejectLabel || 'No, not this person'}
                                </span>
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`handle-${component.id}-reject`}
                                    style={{ right: -SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX }}
                                    className={`${handlePreviewClass} !bg-shell-accent !w-3.5 !h-3.5 !border-2 !border-shell-bg !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (readOnly) return;
                                        onHandleClick?.(
                                            `handle-${component.id}-reject`,
                                            event.currentTarget as HTMLElement,
                                            { x: event.clientX, y: event.clientY }
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            }
            case 'checkboxGroup': {
                const content = component.content as import('../../../studio/types').CheckboxGroupContent;
                return (
                    <div className="flex flex-col gap-1.5">
                        {content.options?.map((option) => (
                            <div key={option.id} className="relative flex items-center gap-2 px-0.5 py-1 text-sm text-shell-muted-strong">
                                <div className="w-4 h-4 border border-shell-border/70 rounded-[4px] bg-shell-surface flex-shrink-0" />
                                <span className="truncate max-w-[160px] leading-tight" title={option.label}>{option.label}</span>
                            </div>
                        ))}
                    </div>
                );
            }
            default:
                return <div className="text-xs text-shell-muted italic">Unknown component</div>;
        }
    };

    const hasOutputHandle = component.type === 'prompt' || component.type === 'checkboxGroup';

    // Helper to check if content is empty
    const isEmpty = () => {
        switch (component.type) {
            case 'message':
                return !(component.content as import('../../../studio/types').AIMessageContent).text;
            case 'infoMessage':
                return !(component.content as import('../../../studio/types').AIInfoContent).body;
            case 'prompt':
                return !(component.content as import('../../../studio/types').PromptContent).text;
            case 'statusCard': {
                const content = component.content as import('../../../studio/types').AIStatusContent;
                return !content.loadingTitle && !content.successTitle;
            }
            case 'confirmationCard': {
                const content = component.content as import('../../../studio/types').ConfirmationCardContent;
                return !content.item?.title;
            }
            default:
                return false;
        }
    };

    // Update label to "Edit <Component>" if empty
    const getLabel = () => {
        if (isEmpty()) {
            switch (component.type) {
                case 'message': return 'Edit Message';
                case 'infoMessage': return 'Edit Info Message';
                case 'prompt': return 'Edit Prompt';
                case 'statusCard': return 'Edit Status Card';
                case 'confirmationCard': return 'Add Confirmation Card';
                default: return display.label;
            }
        }
        return display.label;
    };

    return (
        <div ref={ref} id={`component-${component.id}`} className="relative z-20">
            <StudioCard
                icon={display.icon}
                title={getLabel()}
                theme="blue"
                selected={isSelected}
                onClick={onClick}
                showOutputHandle={hasOutputHandle}
                outputHandleId={`handle-${component.id}`}
                outputHandleOffsetPx={CARD_EDGE_OUTPUT_HANDLE_OFFSET_PX}
                outputHandleClassName={readOnly ? undefined : 'flow-create-handle flow-create-handle-accent'}
                outputHandleOnClick={(event) => {
                    event.stopPropagation();
                    if (readOnly) return;
                    onHandleClick?.(
                        `handle-${component.id}`,
                        event.currentTarget as HTMLElement,
                        { x: event.clientX, y: event.clientY }
                    );
                }}
                isPlaceholder={isEmpty()}
                overflowVisible={component.type === 'selectionList' || component.type === 'confirmationCard'}
            >
                {renderContent()}
            </StudioCard>
        </div>
    );
}));

SimpleComponentCard.displayName = 'SimpleComponentCard';
