import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Split, UserRound, StickyNote, MessageCircle } from 'lucide-react';
import { ActionTooltip } from './ActionTooltip';
import { renderToStaticMarkup } from 'react-dom/server';
import { cn } from '@/utils/cn';

interface FloatingToolbarProps {
    onAddAiTurn?: () => void;
    onAddUserTurn?: () => void;
    onAddCondition?: () => void;
    onAddNote?: () => void;
    onToggleComments: () => void;
    isCommentsActive?: boolean;
    showCreationTools?: boolean;
    commentButtonLabel?: string;
}

// Helper function to create custom drag preview
const createDragPreview = (config: {
    label: string;
    icon: JSX.Element;
    accentColor: string;
    bgColor?: string;
    width?: number;
}) => {
    const { label, icon, accentColor, bgColor = 'rgb(var(--shell-bg) / 1)', width = 200 } = config;

    // Create a temporary container
    const dragPreview = document.createElement('div');
    dragPreview.style.position = 'absolute';
    dragPreview.style.top = '-1000px';
    dragPreview.style.left = '-1000px';
    dragPreview.style.width = `${width}px`;
    dragPreview.style.padding = '12px 16px';
    dragPreview.style.background = bgColor;
    dragPreview.style.border = `2px solid ${accentColor}`;
    dragPreview.style.borderRadius = '8px';
    dragPreview.style.boxShadow = '0 4px 12px rgb(var(--shell-muted-strong) / 0.25)';
    dragPreview.style.display = 'flex';
    dragPreview.style.alignItems = 'center';
    dragPreview.style.gap = '8px';
    dragPreview.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    dragPreview.style.fontSize = '14px';
    dragPreview.style.fontWeight = '500';
    dragPreview.style.color = 'rgb(var(--shell-text) / 1)';
    dragPreview.style.pointerEvents = 'none';

    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.flexShrink = '0';

    // Render icon to HTML string and inject
    const iconMarkup = renderToStaticMarkup(icon);
    iconContainer.innerHTML = iconMarkup;

    // Create label
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    labelEl.style.flexGrow = '1';

    dragPreview.appendChild(iconContainer);
    dragPreview.appendChild(labelEl);

    return dragPreview;
};

export function FloatingToolbar({
    onAddAiTurn,
    onAddUserTurn,
    onAddCondition,
    onAddNote,
    onToggleComments,
    isCommentsActive = false,
    showCreationTools = true,
    commentButtonLabel = 'Comments',
}: FloatingToolbarProps) {
    const areCreationToolsDisabled = isCommentsActive;

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        if (areCreationToolsDisabled) {
            event.preventDefault();
            return;
        }

        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';

        // Create custom drag preview based on node type
        let dragPreview: HTMLElement | null = null;
        const accent = 'rgb(var(--shell-accent) / 1)';
        const userAccent = 'rgb(var(--shell-node-user) / 1)';
        const conditionAccent = 'rgb(var(--shell-node-condition) / 1)';
        const noteAccent = 'rgb(var(--shell-node-note) / 1)';
        const aiSoft = 'rgb(var(--shell-node-ai-surface) / 1)';
        const userSoft = 'rgb(var(--shell-node-user-surface) / 1)';
        const conditionSoft = 'rgb(var(--shell-node-condition-surface) / 1)';
        const noteSoft = 'rgb(var(--shell-node-note) / 0.14)';

        switch (nodeType) {
            case 'turn':
                dragPreview = createDragPreview({
                    label: 'AI Turn',
                    icon: <VcaIcon icon="signal-ai" size="md" className="text-shell-accent" />,
                    accentColor: accent,
                    bgColor: aiSoft,
                    width: 180,
                });
                break;
            case 'user-turn':
                dragPreview = createDragPreview({
                    label: 'User Turn',
                    icon: <UserRound className="text-shell-node-user" size={20} />,
                    accentColor: userAccent,
                    bgColor: userSoft,
                    width: 180,
                });
                break;
            case 'condition':
                dragPreview = createDragPreview({
                    label: 'Condition',
                    icon: <Split className="text-shell-node-condition" size={20} />,
                    accentColor: conditionAccent,
                    bgColor: conditionSoft,
                    width: 180,
                });
                break;
            case 'note':
                dragPreview = createDragPreview({
                    label: 'Sticky Note',
                    icon: <StickyNote className="text-shell-node-note" size={20} fill="currentColor" />,
                    accentColor: noteAccent,
                    bgColor: noteSoft,
                    width: 180,
                });
                break;
        }

        if (dragPreview) {
            document.body.appendChild(dragPreview);

            // Set the custom drag image
            event.dataTransfer.setDragImage(dragPreview, 90, 20);

            // Clean up after a short delay
            setTimeout(() => {
                document.body.removeChild(dragPreview);
            }, 0);
        }
    };

    return (
        <div
            data-floating-toolbar="true"
            data-canvas-shell-zoom-blocker="true"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 bg-shell-bg dark:bg-shell-surface-subtle rounded-xl shadow-xl dark:shadow-[0_14px_32px_rgb(0_0_0/0.26)] border border-shell-border/70 dark:border-shell-border/55 backdrop-blur-sm"
        >

            {showCreationTools ? (
                <>
                    {/* Group 1: Logic Nodes */}
                    <div className="flex items-center gap-1">
                        <ActionTooltip content="AI turn" shortcut="A">
                            <button
                                onClick={areCreationToolsDisabled ? undefined : onAddAiTurn}
                                draggable={!areCreationToolsDisabled}
                                onDragStart={(e) => onDragStart(e, 'turn')}
                                disabled={areCreationToolsDisabled}
                                className={cn(
                                    'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors tooltip-trigger',
                                    areCreationToolsDisabled
                                        ? 'cursor-not-allowed text-shell-muted/60'
                                        : 'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                                )}
                            >
                                <VcaIcon icon="signal-ai" size="md" className="text-shell-accent" />
                            </button>
                        </ActionTooltip>

                        <ActionTooltip content="User turn" shortcut="U">
                            <button
                                onClick={areCreationToolsDisabled ? undefined : onAddUserTurn}
                                draggable={!areCreationToolsDisabled}
                                onDragStart={(e) => onDragStart(e, 'user-turn')}
                                disabled={areCreationToolsDisabled}
                                className={cn(
                                    'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors',
                                    areCreationToolsDisabled
                                        ? 'cursor-not-allowed text-shell-muted/60'
                                        : 'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                                )}
                            >
                                <UserRound className="text-shell-node-user" size={20} />
                            </button>
                        </ActionTooltip>

                        <ActionTooltip content="Condition" shortcut="D">
                            <button
                                onClick={areCreationToolsDisabled ? undefined : onAddCondition}
                                draggable={!areCreationToolsDisabled}
                                onDragStart={(e) => onDragStart(e, 'condition')}
                                disabled={areCreationToolsDisabled}
                                className={cn(
                                    'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors',
                                    areCreationToolsDisabled
                                        ? 'cursor-not-allowed text-shell-muted/60'
                                        : 'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                                )}
                            >
                                <Split className="text-shell-node-condition" size={20} />
                            </button>
                        </ActionTooltip>
                    </div>

                    <div className="w-px h-6 bg-shell-chrome-divider mx-1" />

                    <ActionTooltip content="Sticky note" shortcut="N">
                        <button
                            draggable={!areCreationToolsDisabled}
                            onDragStart={(e) => onDragStart(e, 'note')}
                            onClick={areCreationToolsDisabled ? undefined : onAddNote}
                            disabled={areCreationToolsDisabled}
                            className={cn(
                                'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors tooltip-trigger',
                                areCreationToolsDisabled
                                    ? 'cursor-not-allowed text-shell-muted/60'
                                    : 'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                            )}
                        >
                            <StickyNote className="text-shell-node-note" size={20} fill="currentColor" />
                        </button>
                    </ActionTooltip>
                </>
            ) : null}

            <ActionTooltip content={commentButtonLabel} shortcut="C">
                <button
                    type="button"
                    onClick={onToggleComments}
                    aria-pressed={isCommentsActive}
                    aria-keyshortcuts="C"
                    className={cn(
                        'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors tooltip-trigger',
                        isCommentsActive
                            ? 'bg-shell-accent-soft text-shell-accent'
                            : 'text-shell-muted hover:bg-shell-surface hover:text-shell-text'
                    )}
                >
                    <MessageCircle size={18} />
                </button>
            </ActionTooltip>

        </div>
    );
}
