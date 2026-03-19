import { createPortal } from 'react-dom';
import { Plus, Component } from 'lucide-react';
import { useStore } from '@xyflow/react';
import { SelectionState } from '../types';
import * as Popover from '@radix-ui/react-popover';
import { AddComponentContent } from './AddComponentPopover';
import { ActionTooltip } from './ActionTooltip';
import { useEffect, useState } from 'react';

interface ContextToolbarProps {
    selection: SelectionState;
    onAddComponent: (type: import('../../studio/types').ComponentType) => void;
    anchorEl: HTMLElement | null;
    autoOpenAddComponentPopover?: boolean;
    onAutoOpenAddComponentHandled?: () => void;
}



export function ContextToolbar({
    selection,
    onAddComponent,
    anchorEl,
    autoOpenAddComponentPopover = false,
    onAutoOpenAddComponentHandled,
    isAiTurn = false, // New prop
}: ContextToolbarProps & { isAiTurn?: boolean }) {
    // Subscribe to viewport transform changes to update toolbar position
    useStore((state) => state.transform);
    const [isAddComponentPopoverOpen, setIsAddComponentPopoverOpen] = useState(false);
    const selectedNodeId = selection.type === 'node' ? selection.nodeId : null;

    useEffect(() => {
        setIsAddComponentPopoverOpen(false);
    }, [selectedNodeId]);

    useEffect(() => {
        if (!isAiTurn || !autoOpenAddComponentPopover) return;
        setIsAddComponentPopoverOpen(true);
        onAutoOpenAddComponentHandled?.();
    }, [autoOpenAddComponentPopover, isAiTurn, onAutoOpenAddComponentHandled]);

    // Calculate toolbar position
    const getToolbarStyle = (): React.CSSProperties => {
        if (!anchorEl) return { display: 'none' };

        const rect = anchorEl.getBoundingClientRect();
        const spacing = 16; // FigJam-style spacing

        return {
            position: 'fixed',
            bottom: window.innerHeight - rect.top + spacing,
            left: rect.left + rect.width / 2,
            transform: 'translateX(-50%)',
            zIndex: 1000,
        };
    };

    // Check if we have any actions to render
    const hasNodeActions = selection.type === 'node' && isAiTurn;

    if (!hasNodeActions || selection.type !== 'node') {
        return null;
    }

    return createPortal(
        <div
            id="context-toolbar"
            data-editor-keep-open
            data-canvas-shell-zoom-blocker="true"
            style={getToolbarStyle()}
        >
            <div className="animate-in fade-in zoom-in-98 duration-100 ease-out">
                <div className="bg-shell-dark-panel rounded-xl shadow-2xl px-2 py-1.5 flex items-center gap-1 border border-shell-dark-border">
                    {/* Add Component Popover (Only for AI Turns) */}
                    {isAiTurn && (
                        <Popover.Root open={isAddComponentPopoverOpen} onOpenChange={setIsAddComponentPopoverOpen}>
                            <ActionTooltip content="Add component">
                                <Popover.Trigger asChild>
                                    <button
                                        className="flex items-center px-3 py-1.5 text-shell-dark-text hover:bg-shell-dark-surface rounded transition-colors text-sm cursor-pointer"
                                    >
                                        <span className="flex items-center gap-0.5">
                                            <Plus className="w-3 h-3 text-shell-dark-muted" />
                                            <Component className="w-4 h-4" />
                                        </span>
                                    </button>
                                </Popover.Trigger>
                            </ActionTooltip>
                            <Popover.Portal>
                                <AddComponentContent
                                    onAdd={(type) => {
                                        onAddComponent(type);
                                        setIsAddComponentPopoverOpen(false);
                                    }}
                                />
                            </Popover.Portal>
                        </Popover.Root>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
