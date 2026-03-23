import { memo, forwardRef, type MouseEvent } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CircleDashed, Check } from 'lucide-react';
import { Component } from '../../../studio/types';
import { StudioCard } from './StudioCard';
import {
    getCheckboxGroupPrimaryLabel,
    getCheckboxGroupSecondaryLabel,
} from '@/components/vca-components/checkbox-group/CheckboxGroup';
import { MarkdownRenderer } from '@/components/vca-components/markdown-renderer/MarkdownRenderer';
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
}

const CompactRichTextPreview = ({
    content,
}: {
    content: string;
}) => (
    <div className="overflow-x-hidden pr-1">
        <MarkdownRenderer
            content={content}
            linkMode="static"
            spacing="compact"
            textTone="inherit"
            className="pointer-events-none text-shell-text [&_.vca-static-link]:!text-shell-accent [&_a]:!text-shell-accent [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-shell-node-card-divider [&_blockquote]:pl-3 [&_blockquote]:text-shell-muted-strong [&_code]:rounded-sm [&_code]:bg-shell-bg/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px]"
        />
    </div>
);

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
                if (!content.text) return null;
                return (
                    <div className="px-0.5 py-1">
                        <CompactRichTextPreview content={content.text} />
                    </div>
                );
            }
            case 'infoMessage': {
                const content = component.content as import('../../../studio/types').AIInfoContent;
                if (!content.body) return null;
                const sources = (content.sources || []).filter((source) => source.text?.trim() || source.url?.trim());
                return (
                    <div className="flex flex-col gap-2 px-0.5 py-1 text-sm text-shell-text">
                        <CompactRichTextPreview
                            content={content.body}
                        />

                        {sources.length > 0 && (
                            <div className="border-t border-shell-border/70 pt-2">
                                <span className="font-vca-text text-vca-xsmall-open text-shell-muted-strong">
                                    {sources.length} {sources.length === 1 ? 'source' : 'sources'}
                                </span>
                            </div>
                        )}
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
                            <div key={item.id} className="relative flex items-start px-3 py-2.5 bg-shell-surface border border-shell-border/70 rounded text-sm text-shell-muted-strong shadow-sm group-hover:border-shell-accent-border transition-colors">
                                <div className="min-w-0 max-w-[180px] pr-4">
                                    <span className="truncate block" title={item.title}>
                                        {item.title}
                                    </span>
                                    {item.subtitle?.trim() && (
                                        <span className="mt-0.5 block truncate text-[10px] leading-tight text-shell-muted" title={item.subtitle}>
                                            {item.subtitle}
                                        </span>
                                    )}
                                </div>
                                {/* Handle for this specific item */}
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`handle-${component.id}-${item.id}`}
                                    style={{ right: -SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX }}
                                    className="!bg-shell-accent !w-3.5 !h-3.5 !border-2 !border-shell-bg !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125"
                                />
                            </div>
                        ))}
                    </div>
                );
            }
            case 'confirmationCard': {
                const content = component.content as import('../../../studio/types').ConfirmationCardContent;
                const showActions = content.showActions ?? true;
                const title = content.item?.title?.trim();
                const subtitle = content.item?.subtitle?.trim();
                return (
                    <div className="flex flex-col gap-1.5">
                        <div className="rounded border border-shell-border/70 bg-shell-surface px-3 py-2.5 text-sm text-shell-muted-strong shadow-sm group-hover:border-shell-accent-border transition-colors">
                            {title ? (
                                <span className="block max-w-[180px] truncate" title={title}>
                                    {title}
                                </span>
                            ) : null}
                            {subtitle ? (
                                <span className={`${title ? 'mt-0.5 ' : ''}block max-w-[180px] truncate text-[10px] leading-tight text-shell-muted`} title={subtitle}>
                                    {subtitle}
                                </span>
                            ) : null}
                            {!title && !subtitle ? (
                                <span className="block max-w-[180px] truncate text-shell-muted" title="Card label">
                                    Card label
                                </span>
                            ) : null}
                        </div>

                        {showActions && (
                            <div className="flex flex-col gap-1.5">
                                <div className="relative flex min-h-[32px] items-center">
                                    <div className="inline-flex min-w-0 max-w-[70%] items-center rounded-full border border-shell-accent-border bg-shell-bg px-3 py-1.5 text-[11px] font-medium text-shell-accent-text shadow-sm">
                                        <span className="truncate max-w-full" title={content.confirmLabel || 'Confirm'}>
                                            {content.confirmLabel || 'Confirm'}
                                        </span>
                                    </div>
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        id={`handle-${component.id}-confirm`}
                                        style={{ right: -SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX }}
                                        className="!bg-shell-accent !w-3.5 !h-3.5 !border-2 !border-shell-bg !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125"
                                    />
                                </div>

                                <div className="relative flex min-h-[32px] items-center">
                                    <div className="inline-flex min-w-0 max-w-[70%] items-center px-3 py-1.5 text-[11px] font-medium text-shell-muted-strong">
                                        <span className="truncate max-w-full" title={content.rejectLabel || 'Cancel'}>
                                            {content.rejectLabel || 'Cancel'}
                                        </span>
                                    </div>
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        id={`handle-${component.id}-reject`}
                                        style={{ right: -SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX }}
                                        className="!bg-shell-accent !w-3.5 !h-3.5 !border-2 !border-shell-bg !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            case 'checkboxGroup': {
                const content = component.content as import('../../../studio/types').CheckboxGroupContent;
                const primaryLabel = getCheckboxGroupPrimaryLabel(content);
                const secondaryLabel = getCheckboxGroupSecondaryLabel(content);
                return (
                    <div className="flex flex-col gap-1.5">
                        {content.options?.map((option) => (
                            <div key={option.id} className="relative flex items-start gap-2 px-0.5 py-1 text-sm text-shell-muted-strong">
                                <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-[4px] border border-shell-border/70 bg-shell-surface" />
                                <div className="min-w-0 max-w-[160px]">
                                    <span className="block truncate leading-tight" title={option.label}>
                                        {option.label}
                                    </span>
                                    {option.description?.trim() && (
                                        <span className="mt-0.5 block truncate text-[10px] leading-tight text-shell-muted" title={option.description}>
                                            {option.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col gap-1.5 pt-1">
                            <div className="relative flex min-h-[32px] items-center">
                                <div className="inline-flex min-w-0 max-w-[70%] items-center rounded-full border border-shell-accent-border bg-shell-bg px-3 py-1.5 text-[11px] font-medium text-shell-accent-text shadow-sm">
                                    <span className="truncate max-w-full" title={primaryLabel}>
                                        {primaryLabel}
                                    </span>
                                </div>
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`handle-${component.id}`}
                                    style={{ right: -SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX }}
                                    className="!bg-shell-accent !w-3.5 !h-3.5 !border-2 !border-shell-bg !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125"
                                />
                            </div>

                            <div className="relative flex min-h-[32px] items-center">
                                <div className="inline-flex min-w-0 max-w-[70%] items-center px-3 py-1.5 text-[11px] font-medium text-shell-muted-strong">
                                    <span className="truncate max-w-full" title={secondaryLabel}>
                                        {secondaryLabel}
                                    </span>
                                </div>
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`handle-${component.id}-secondary`}
                                    style={{ right: -SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX }}
                                    className="!bg-shell-accent !w-3.5 !h-3.5 !border-2 !border-shell-bg !top-1/2 !-translate-y-1/2 !z-30 transition-transform hover:scale-125"
                                />
                            </div>
                        </div>
                    </div>
                );
            }
            default:
                return <div className="text-xs text-shell-muted italic">Unknown component</div>;
        }
    };

    const hasOutputHandle = component.type === 'prompt';

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
                return !content.item?.title?.trim() && !content.item?.subtitle?.trim();
            }
            case 'selectionList': {
                const content = component.content as import('../../../studio/types').SelectionListContent;
                return (content.items?.length || 0) === 0;
            }
            case 'checkboxGroup': {
                return false;
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
                case 'confirmationCard': return 'Add Display Card';
                case 'selectionList': return 'Add Select Cards';
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
                isPlaceholder={isEmpty()}
                overflowVisible={
                    component.type === 'selectionList' ||
                    component.type === 'checkboxGroup' ||
                    (
                        component.type === 'confirmationCard' &&
                        ((component.content as import('../../../studio/types').ConfirmationCardContent).showActions ?? true)
                    )
                }
            >
                {renderContent()}
            </StudioCard>
        </div>
    );
}));

SimpleComponentCard.displayName = 'SimpleComponentCard';
