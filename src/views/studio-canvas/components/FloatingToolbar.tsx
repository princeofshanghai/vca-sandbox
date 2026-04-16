import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Play, Split, UserRound, StickyNote, MessageCircle, Type, Square } from 'lucide-react';
import { ActionTooltip } from './ActionTooltip';
import { renderToStaticMarkup } from 'react-dom/server';
import { cn } from '@/utils/cn';

interface FloatingToolbarProps {
    onAddStart?: () => void;
    onAddAiTurn?: () => void;
    onAddUserTurn?: () => void;
    onAddCondition?: () => void;
    onAddNote?: () => void;
    onAddText?: () => void;
    onAddRectangle?: () => void;
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
    onAddStart,
    onAddAiTurn,
    onAddUserTurn,
    onAddCondition,
    onAddNote,
    onAddText,
    onAddRectangle,
    onToggleComments,
    isCommentsActive = false,
    showCreationTools = true,
    commentButtonLabel = 'Comments',
}: FloatingToolbarProps) {
    const handleToolbarAction = (
        action?: () => void,
    ) => (event: React.MouseEvent<HTMLButtonElement>) => {
        if (event.detail > 0) {
            event.currentTarget.blur();
        }

        action?.();
    };

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';

        // Create custom drag preview based on node type
        let dragPreview: HTMLElement | null = null;
        const accent = 'rgb(var(--shell-accent) / 1)';
        const startAccent = 'rgb(var(--shell-node-start) / 1)';
        const userAccent = 'rgb(var(--shell-node-user) / 1)';
        const conditionAccent = 'rgb(var(--shell-node-condition) / 1)';
        const noteAccent = 'rgb(var(--shell-node-note) / 1)';
        const textAccent = 'rgb(var(--shell-text) / 1)';
        const startSoft = 'rgb(var(--shell-node-start-surface) / 1)';
        const aiSoft = 'rgb(var(--shell-node-ai-surface) / 1)';
        const userSoft = 'rgb(var(--shell-node-user-surface) / 1)';
        const conditionSoft = 'rgb(var(--shell-node-condition-surface) / 1)';
        const noteSoft = 'rgb(var(--shell-node-note) / 0.14)';
        const annotationSoft = 'rgb(var(--shell-surface-subtle) / 0.92)';

        switch (nodeType) {
            case 'start':
                dragPreview = createDragPreview({
                    label: 'Start',
                    icon: <Play className="fill-current text-[rgb(var(--shell-node-start)/1)]" size={20} />,
                    accentColor: startAccent,
                    bgColor: startSoft,
                    width: 168,
                });
                break;
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
            case 'text':
                dragPreview = createDragPreview({
                    label: 'Text',
                    icon: <Type className="text-shell-text" size={20} />,
                    accentColor: textAccent,
                    bgColor: annotationSoft,
                    width: 160,
                });
                break;
            case 'rectangle':
                dragPreview = createDragPreview({
                    label: 'Rectangle',
                    icon: <Square className="text-shell-text" size={18} />,
                    accentColor: textAccent,
                    bgColor: annotationSoft,
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
                        <ActionTooltip content="AI turn" description="What the AI assistant does" shortcut="A">
                            <button
                                type="button"
                                onClick={handleToolbarAction(onAddAiTurn)}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'turn')}
                                className={cn(
                                    'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors tooltip-trigger',
                                    'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                                )}
                            >
                                <VcaIcon icon="signal-ai" size="md" className="text-shell-accent" />
                            </button>
                        </ActionTooltip>

                        <ActionTooltip content="User turn" description="What the user does" shortcut="U">
                            <button
                                type="button"
                                onClick={handleToolbarAction(onAddUserTurn)}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'user-turn')}
                                className={cn(
                                    'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors',
                                    'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                                )}
                            >
                                <UserRound className="text-shell-node-user" size={20} />
                            </button>
                        </ActionTooltip>

                        <ActionTooltip content="Condition" description="Choose different paths" shortcut="D">
                            <button
                                type="button"
                                onClick={handleToolbarAction(onAddCondition)}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'condition')}
                                className={cn(
                                    'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors',
                                    'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                                )}
                            >
                                <Split className="text-shell-node-condition" size={20} />
                            </button>
                        </ActionTooltip>

                        <ActionTooltip content="Start" description="Add new flow" shortcut="S">
                            <button
                                type="button"
                                onClick={handleToolbarAction(onAddStart)}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'start')}
                                className={cn(
                                    'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors tooltip-trigger',
                                    'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                                )}
                            >
                                <Play className="fill-current text-[rgb(var(--shell-node-start)/1)]" size={18} />
                            </button>
                        </ActionTooltip>
                    </div>

                    <div className="w-px h-6 bg-shell-chrome-divider mx-1" />

                    <ActionTooltip content="Sticky note" shortcut="N">
                        <button
                            type="button"
                            draggable
                            onDragStart={(e) => onDragStart(e, 'note')}
                            onClick={handleToolbarAction(onAddNote)}
                            className={cn(
                                'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors tooltip-trigger',
                                'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                            )}
                        >
                            <StickyNote className="text-shell-node-note" size={20} fill="currentColor" />
                        </button>
                    </ActionTooltip>

                    <ActionTooltip content="Text" shortcut="T">
                        <button
                            type="button"
                            draggable
                            onDragStart={(e) => onDragStart(e, 'text')}
                            onClick={handleToolbarAction(onAddText)}
                            className={cn(
                                'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors tooltip-trigger',
                                'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                            )}
                        >
                            <Type className="text-shell-text" size={20} />
                        </button>
                    </ActionTooltip>

                    <ActionTooltip content="Rectangle" shortcut="R">
                        <button
                            type="button"
                            draggable
                            onDragStart={(e) => onDragStart(e, 'rectangle')}
                            onClick={handleToolbarAction(onAddRectangle)}
                            className={cn(
                                'group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors tooltip-trigger',
                                'hover:bg-shell-surface cursor-grab active:cursor-grabbing'
                            )}
                        >
                            <Square className="text-shell-text" size={18} />
                        </button>
                    </ActionTooltip>
                </>
            ) : null}

            <ActionTooltip content={commentButtonLabel} shortcut="C">
                <button
                    type="button"
                    onClick={handleToolbarAction(onToggleComments)}
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
