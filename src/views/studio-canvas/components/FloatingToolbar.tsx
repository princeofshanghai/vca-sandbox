import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Split, UserRound, StickyNote } from 'lucide-react';
import { ActionTooltip } from './ActionTooltip';
import { renderToStaticMarkup } from 'react-dom/server';

interface FloatingToolbarProps {
    onAddAiTurn: () => void;
    onAddUserTurn: () => void;
    onAddCondition: () => void;
    onAddNote: () => void;
}

// Helper function to create custom drag preview
const createDragPreview = (config: {
    label: string;
    icon: JSX.Element;
    accentColor: string;
    bgColor?: string;
    width?: number;
}) => {
    const { label, icon, accentColor, bgColor = 'white', width = 200 } = config;

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
    dragPreview.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    dragPreview.style.display = 'flex';
    dragPreview.style.alignItems = 'center';
    dragPreview.style.gap = '8px';
    dragPreview.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    dragPreview.style.fontSize = '14px';
    dragPreview.style.fontWeight = '500';
    dragPreview.style.color = '#374151';
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

export function FloatingToolbar({ onAddAiTurn, onAddUserTurn, onAddCondition, onAddNote }: FloatingToolbarProps) {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';

        // Create custom drag preview based on node type
        let dragPreview: HTMLElement | null = null;

        switch (nodeType) {
            case 'turn':
                dragPreview = createDragPreview({
                    label: 'AI Turn',
                    icon: <VcaIcon icon="signal-ai" size="md" className="text-blue-600" />,
                    accentColor: '#3b82f6',
                    width: 180,
                });
                break;
            case 'user-turn':
                dragPreview = createDragPreview({
                    label: 'User Turn',
                    icon: <UserRound className="text-purple-600" size={20} />,
                    accentColor: '#9333ea',
                    width: 180,
                });
                break;
            case 'condition':
                dragPreview = createDragPreview({
                    label: 'Condition',
                    icon: <Split className="text-amber-500" size={20} />,
                    accentColor: '#f59e0b',
                    bgColor: '#fffbeb',
                    width: 180,
                });
                break;
            case 'note':
                dragPreview = createDragPreview({
                    label: 'Sticky Note',
                    icon: <StickyNote className="text-yellow-500" size={20} fill="currentColor" />,
                    accentColor: '#eab308',
                    bgColor: '#fefce8',
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 bg-white rounded-xl shadow-xl border border-gray-200/80 backdrop-blur-sm">

            {/* Group 1: Logic Nodes */}
            <div className="flex items-center gap-1">
                {/* AI Turn */}
                <ActionTooltip content="AI turn">
                    <button
                        onClick={onAddAiTurn}
                        draggable
                        onDragStart={(e) => onDragStart(e, 'turn')}
                        className="group relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors tooltip-trigger cursor-grab active:cursor-grabbing"
                    >
                        <VcaIcon icon="signal-ai" size="md" className="text-blue-600" />
                    </button>
                </ActionTooltip>

                {/* User Turn */}
                <ActionTooltip content="User turn">
                    <button
                        onClick={onAddUserTurn}
                        draggable
                        onDragStart={(e) => onDragStart(e, 'user-turn')}
                        className="group relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
                    >
                        <UserRound className="text-purple-600" size={20} />
                    </button>
                </ActionTooltip>

                {/* Condition */}
                <ActionTooltip content="Condition">
                    <button
                        onClick={onAddCondition}
                        draggable
                        onDragStart={(e) => onDragStart(e, 'condition')}
                        className="group relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
                    >
                        <Split className="text-amber-500" size={20} />
                    </button>
                </ActionTooltip>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Group 2: Annotations */}
            {/* Sticky Note */}
            <ActionTooltip content="Sticky note">
                <button
                    draggable
                    onDragStart={(e) => onDragStart(e, 'note')}
                    onClick={onAddNote}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors text-gray-400 tooltip-trigger cursor-grab active:cursor-grabbing"
                >
                    <StickyNote className="text-yellow-500/80" size={20} fill="currentColor" />
                </button>
            </ActionTooltip>


        </div>
    );
}
