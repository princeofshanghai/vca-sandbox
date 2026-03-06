import { createPortal } from 'react-dom';
import { Plus, Component, MousePointerClick, GitBranch, ALargeSmall, MessageCirclePlus, ChevronDown } from 'lucide-react';
import { useStore } from '@xyflow/react';
import { SelectionState } from '../types';
import * as Popover from '@radix-ui/react-popover';
import { AddComponentContent } from './AddComponentPopover';
import { ActionTooltip } from './ActionTooltip';
import { Branch } from '../../studio/types'; // Import Branch type

interface ContextToolbarProps {
    selection: SelectionState;
    onAddComponent: (type: import('../../studio/types').ComponentType) => void;
    anchorEl: HTMLElement | null;
    currentUserTurnInputType?: 'text' | 'prompt' | 'button';
    onChangeUserTurnInputType?: (type: 'text' | 'prompt' | 'button') => void;
    currentBranches?: Branch[];
    onUpdateBranches?: (branches: Branch[]) => void;
}



export function ContextToolbar({
    selection,
    onAddComponent,
    anchorEl,
    currentUserTurnInputType,
    onChangeUserTurnInputType,
    currentBranches,
    onUpdateBranches,
    isAiTurn = false, // New prop
}: ContextToolbarProps & { isAiTurn?: boolean }) {
    // Subscribe to viewport transform changes to update toolbar position
    useStore((state) => state.transform);

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
    const hasNodeActions = selection.type === 'node' && (
        isAiTurn ||
        (currentUserTurnInputType && onChangeUserTurnInputType) ||
        (currentBranches && onUpdateBranches)
    );

    if (!hasNodeActions || selection.type !== 'node') {
        return null;
    }

    return createPortal(
        <div id="context-toolbar" style={getToolbarStyle()}>
            <div className="animate-in fade-in zoom-in-98 duration-100 ease-out">
                <div className="bg-shell-dark-panel rounded-xl shadow-2xl px-2 py-1.5 flex items-center gap-1 border border-shell-dark-border">
                    {/* Add Component Popover (Only for AI Turns) */}
                    {isAiTurn && (
                        <Popover.Root>
                            <ActionTooltip content="Add component">
                                <Popover.Trigger asChild>
                                    <button
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-shell-dark-text hover:bg-shell-dark-surface rounded transition-colors text-sm cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3 text-shell-dark-muted" />
                                        <Component className="w-4 h-4" />
                                    </button>
                                </Popover.Trigger>
                            </ActionTooltip>
                            <Popover.Portal>
                                <AddComponentContent onAdd={onAddComponent} />
                            </Popover.Portal>
                        </Popover.Root>
                    )}





                    {/* User Turn Input Type Popover */}
                    {currentUserTurnInputType && onChangeUserTurnInputType && (
                        <Popover.Root>
                            <ActionTooltip content="Interaction type">
                                <Popover.Trigger asChild>
                                    <button
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-shell-dark-text hover:bg-shell-dark-surface rounded transition-colors text-sm cursor-pointer"
                                    >
                                        {currentUserTurnInputType === 'text' && <ALargeSmall className="w-4 h-4" />}
                                        {currentUserTurnInputType === 'button' && <MousePointerClick className="w-4 h-4" />}
                                        {currentUserTurnInputType === 'prompt' && <MessageCirclePlus className="w-4 h-4" />}
                                        <ChevronDown className="w-3 h-3 text-shell-dark-muted" />
                                    </button>
                                </Popover.Trigger>
                            </ActionTooltip>
                            <Popover.Portal>
                                <Popover.Content
                                    side="top"
                                    sideOffset={8}
                                    align="center"
                                    className="bg-shell-dark-panel border border-shell-dark-border rounded-lg shadow-xl p-1 z-[1001] min-w-[140px] animate-in fade-in zoom-in-98 duration-100 ease-out"
                                >
                                    <button
                                        className={`w-full px-2 py-1.5 text-xs text-left hover:bg-shell-dark-surface rounded transition-colors cursor-pointer flex items-center gap-2 ${currentUserTurnInputType === 'text' ? 'bg-shell-accent-soft text-shell-accent-text font-medium' : 'text-shell-dark-muted'}`}
                                        onClick={() => onChangeUserTurnInputType('text')}
                                    >
                                        <ALargeSmall className="w-3.5 h-3.5" />
                                        <span>User message</span>
                                    </button>
                                    <button
                                        className={`w-full px-2 py-1.5 text-xs text-left hover:bg-shell-dark-surface rounded transition-colors cursor-pointer flex items-center gap-2 ${currentUserTurnInputType === 'button' ? 'bg-shell-accent-soft text-shell-accent-text font-medium' : 'text-shell-dark-muted'}`}
                                        onClick={() => onChangeUserTurnInputType('button')}
                                    >
                                        <MousePointerClick className="w-3.5 h-3.5" />
                                        <span>Click button</span>
                                    </button>
                                    <button
                                        className={`w-full px-2 py-1.5 text-xs text-left hover:bg-shell-dark-surface rounded transition-colors cursor-pointer flex items-center gap-2 ${currentUserTurnInputType === 'prompt' ? 'bg-shell-accent-soft text-shell-accent-text font-medium' : 'text-shell-dark-muted'}`}
                                        onClick={() => onChangeUserTurnInputType('prompt')}
                                    >
                                        <MessageCirclePlus className="w-3.5 h-3.5" />
                                        <span>Click prompt</span>
                                    </button>
                                    <Popover.Arrow className="fill-shell-dark-panel stroke-shell-dark-border" />
                                </Popover.Content>
                            </Popover.Portal>
                        </Popover.Root>
                    )}

                    {/* Condition Branch Management */}
                    {currentBranches && onUpdateBranches && (
                        <ActionTooltip content="Add branch">
                            <button
                                onClick={() => {
                                    const newBranch = { id: `branch-${Date.now()}`, condition: 'New Option' };
                                    onUpdateBranches([...currentBranches, newBranch]);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-shell-dark-text hover:bg-shell-dark-surface rounded transition-colors text-sm cursor-pointer"
                            >
                                <Plus className="w-3 h-3 text-shell-dark-muted" />
                                <GitBranch className="w-4 h-4" />
                            </button>
                        </ActionTooltip>
                    )}

                </div>
            </div>
        </div>,
        document.body
    );
}
