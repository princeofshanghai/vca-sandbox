import { createPortal } from 'react-dom';
import { Plus, Tag, ArrowUp, ArrowDown, Component, Trash2, MousePointerClick, GitBranch, ALargeSmall, MessageCirclePlus, ChevronDown } from 'lucide-react';
import { useStore } from '@xyflow/react';
import { FlowPhase } from '../../studio/types';
import { SelectionState } from '../types';
import * as Popover from '@radix-ui/react-popover';
import { AddComponentContent } from './AddComponentPopover';
import { ActionTooltip } from './ActionTooltip';
import { Branch } from '../../studio/types'; // Import Branch type

interface ContextToolbarProps {
    selection: SelectionState;
    onAddComponent: (type: import('../../studio/types').ComponentType) => void;
    onChangePhase: (phase: FlowPhase | undefined) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    anchorEl: HTMLElement | null;
    currentPhase?: FlowPhase;
    currentUserTurnInputType?: 'text' | 'prompt' | 'button';
    onChangeUserTurnInputType?: (type: 'text' | 'prompt' | 'button') => void;
    currentBranches?: Branch[];
    onUpdateBranches?: (branches: Branch[]) => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
}

const phaseOptions: Array<{ value: FlowPhase | undefined; label: string }> = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'intent', label: 'Intent recognition' },
    { value: 'info', label: 'Info gathering' },
    { value: 'action', label: 'Action' },
    { value: undefined, label: 'No phase' },
];



export function ContextToolbar({
    selection,
    onAddComponent,
    onChangePhase,
    onMoveUp,
    onMoveDown,
    onDelete,
    anchorEl,
    currentPhase,
    currentUserTurnInputType,
    onChangeUserTurnInputType,
    currentBranches,
    onUpdateBranches,
    canMoveUp = true,
    canMoveDown = true,
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

    const handlePhaseSelect = (phase: FlowPhase | undefined) => {
        onChangePhase(phase);
    };

    return createPortal(
        <div id="context-toolbar" style={getToolbarStyle()}>
            <div className="animate-in fade-in zoom-in-95 duration-200 ease-out">
                <div className="bg-gray-900 rounded-xl shadow-2xl px-2 py-1.5 flex items-center gap-1">
                    {selection.type === 'node' ? (
                        // Node-specific actions
                        <>
                            {/* Add Component Popover (Only for AI Turns) */}
                            {isAiTurn && (
                                <Popover.Root>
                                    <ActionTooltip content="Add component">
                                        <Popover.Trigger asChild>
                                            <button
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:bg-gray-800 rounded transition-colors text-sm cursor-default"
                                            >
                                                <Plus className="w-3 h-3 text-gray-400" />
                                                <Component className="w-4 h-4" />
                                            </button>
                                        </Popover.Trigger>
                                    </ActionTooltip>
                                    <Popover.Portal>
                                        <AddComponentContent onAdd={onAddComponent} />
                                    </Popover.Portal>
                                </Popover.Root>
                            )}

                            {isAiTurn && <div className="w-px h-5 bg-gray-700" />}



                            {/* User Turn Input Type Popover */}
                            {currentUserTurnInputType && onChangeUserTurnInputType && (
                                <Popover.Root>
                                    <ActionTooltip content="Interaction type">
                                        <Popover.Trigger asChild>
                                            <button
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:bg-gray-800 rounded transition-colors text-sm cursor-default"
                                            >
                                                {currentUserTurnInputType === 'text' && <ALargeSmall className="w-4 h-4" />}
                                                {currentUserTurnInputType === 'button' && <MousePointerClick className="w-4 h-4" />}
                                                {currentUserTurnInputType === 'prompt' && <MessageCirclePlus className="w-4 h-4" />}
                                                <ChevronDown className="w-3 h-3 text-gray-400" />
                                            </button>
                                        </Popover.Trigger>
                                    </ActionTooltip>
                                    <Popover.Portal>
                                        <Popover.Content
                                            side="top"
                                            sideOffset={8}
                                            align="center"
                                            className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-1 z-[1001] min-w-[140px] animate-in fade-in zoom-in-95 duration-200 ease-out"
                                        >
                                            <button
                                                className={`w-full px-2 py-1.5 text-xs text-left hover:bg-gray-800 rounded transition-colors cursor-default flex items-center gap-2 ${currentUserTurnInputType === 'text' ? 'bg-purple-900/40 text-purple-400 font-medium' : 'text-gray-300'}`}
                                                onClick={() => onChangeUserTurnInputType('text')}
                                            >
                                                <ALargeSmall className="w-3.5 h-3.5" />
                                                <span>User message</span>
                                            </button>
                                            <button
                                                className={`w-full px-2 py-1.5 text-xs text-left hover:bg-gray-800 rounded transition-colors cursor-default flex items-center gap-2 ${currentUserTurnInputType === 'button' ? 'bg-purple-900/40 text-purple-400 font-medium' : 'text-gray-300'}`}
                                                onClick={() => onChangeUserTurnInputType('button')}
                                            >
                                                <MousePointerClick className="w-3.5 h-3.5" />
                                                <span>Click button</span>
                                            </button>
                                            <button
                                                className={`w-full px-2 py-1.5 text-xs text-left hover:bg-gray-800 rounded transition-colors cursor-default flex items-center gap-2 ${currentUserTurnInputType === 'prompt' ? 'bg-purple-900/40 text-purple-400 font-medium' : 'text-gray-300'}`}
                                                onClick={() => onChangeUserTurnInputType('prompt')}
                                            >
                                                <MessageCirclePlus className="w-3.5 h-3.5" />
                                                <span>Click prompt</span>
                                            </button>
                                            <Popover.Arrow className="fill-gray-900 stroke-gray-800" />
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
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:bg-gray-800 rounded transition-colors text-sm cursor-default"
                                    >
                                        <Plus className="w-3 h-3 text-gray-400" />
                                        <GitBranch className="w-4 h-4" />
                                    </button>
                                </ActionTooltip>
                            )}

                            {/* Only show phase picker if we have a phase (AI Turn) */}
                            {isAiTurn && (
                                <Popover.Root>
                                    <ActionTooltip content="Change phase">
                                        <Popover.Trigger asChild>
                                            <button
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:bg-gray-800 rounded transition-colors text-sm cursor-default"
                                            >
                                                <Tag className="w-4 h-4" />
                                                <ChevronDown className="w-3 h-3 text-gray-400" />
                                            </button>
                                        </Popover.Trigger>
                                    </ActionTooltip>
                                    <Popover.Portal>
                                        <Popover.Content
                                            side="top"
                                            sideOffset={8}
                                            align="center"
                                            className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-1 z-[1001] min-w-[140px] animate-in fade-in zoom-in-95 duration-200 ease-out"
                                        >
                                            {phaseOptions.map((option) => (
                                                <button
                                                    key={option.value ?? 'none'}
                                                    className={`w-full px-2 py-1.5 text-xs text-left hover:bg-gray-800 rounded transition-colors cursor-default flex items-center gap-2 ${currentPhase === option.value ? 'bg-blue-900/40 text-blue-400 font-medium' : 'text-gray-300'
                                                        }`}
                                                    onClick={() => handlePhaseSelect(option.value)}
                                                >
                                                    {option.value && (
                                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${option.value === 'welcome' ? 'bg-purple-400' :
                                                            option.value === 'intent' ? 'bg-amber-400' :
                                                                option.value === 'info' ? 'bg-emerald-400' :
                                                                    option.value === 'action' ? 'bg-rose-400' :
                                                                        'bg-blue-400'
                                                            }`} />
                                                    )}
                                                    {!option.value && <div className="w-2 h-2 rounded-full border border-gray-600 flex-shrink-0" />}
                                                    <span className="flex-1">{option.label}</span>
                                                </button>
                                            ))}
                                            <Popover.Arrow className="fill-gray-900 stroke-gray-800" />
                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>
                            )}

                        </>
                    ) : (
                        // Component-specific actions
                        <>
                            {/* Move Up */}
                            <ActionTooltip content="Move up">
                                <button
                                    onClick={onMoveUp}
                                    disabled={!canMoveUp}
                                    className="p-1.5 text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-default"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                            </ActionTooltip>

                            {/* Move Down */}
                            <ActionTooltip content="Move down">
                                <button
                                    onClick={onMoveDown}
                                    disabled={!canMoveDown}
                                    className="p-1.5 text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-default"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </ActionTooltip>



                            {/* Delete */}
                            <ActionTooltip content="Delete">
                                <button
                                    onClick={onDelete}
                                    className="p-1.5 text-white hover:bg-red-600 rounded transition-colors cursor-default"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </ActionTooltip>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
