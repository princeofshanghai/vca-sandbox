import { createPortal } from 'react-dom';
import { Plus, Tag, ArrowUp, ArrowDown, Component, Trash2 } from 'lucide-react';
import { useStore } from 'reactflow';
import { FlowPhase } from '../../studio/types';
import { SelectionState } from '../types';
import { useState, useRef, useEffect } from 'react';

interface ContextToolbarProps {
    selection: SelectionState;
    onAddComponent: () => void;
    onChangePhase: (phase: FlowPhase | undefined) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    anchorEl: HTMLElement | null;
    currentPhase?: FlowPhase;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
}

const phaseOptions: Array<{ value: FlowPhase | undefined; label: string }> = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'intent', label: 'Intent' },
    { value: 'info', label: 'Info' },
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
    canMoveUp = true,
    canMoveDown = true,
}: ContextToolbarProps) {
    // Subscribe to viewport transform changes to update toolbar position
    useStore((state) => state.transform);

    const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
    const phaseDropdownRef = useRef<HTMLDivElement>(null);

    // Close phase dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (phaseDropdownRef.current && !phaseDropdownRef.current.contains(event.target as Node)) {
                setShowPhaseDropdown(false);
            }
        };

        if (showPhaseDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showPhaseDropdown]);

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
        setShowPhaseDropdown(false);
    };

    return createPortal(
        <div style={getToolbarStyle()} className="animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gray-900 rounded-lg shadow-2xl px-2 py-1.5 flex items-center gap-1">
                {selection.type === 'node' ? (
                    // Node-specific actions
                    <>
                        {/* Add Component Button */}
                        <button
                            onClick={onAddComponent}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:bg-gray-800 rounded transition-colors text-sm cursor-default"
                            title="Add component"
                        >
                            <Plus className="w-4 h-4" />
                            <Component className="w-5 h-5" />
                        </button>

                        <div className="w-px h-5 bg-gray-700" />

                        {/* Intent Label / Phase Dropdown */}
                        <div className="relative" ref={phaseDropdownRef}>
                            <button
                                onClick={() => setShowPhaseDropdown(!showPhaseDropdown)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:bg-gray-800 rounded transition-colors text-sm cursor-default"
                                title="Change phase"
                            >
                                <Tag className="w-5 h-5" />
                            </button>

                            {/* Phase Dropdown */}
                            {showPhaseDropdown && (
                                <div className="absolute bottom-full left-0 mb-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-2 z-10 min-w-[160px]">
                                    {phaseOptions.map((option) => (
                                        <button
                                            key={option.value ?? 'none'}
                                            className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-800 transition-colors cursor-default ${currentPhase === option.value ? 'bg-blue-900/40 text-blue-400 font-medium' : 'text-gray-300'
                                                }`}
                                            onClick={() => handlePhaseSelect(option.value)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // Component-specific actions
                    <>
                        {/* Move Up */}
                        <button
                            onClick={onMoveUp}
                            disabled={!canMoveUp}
                            className="p-1.5 text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-default"
                            title="Move up"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>

                        {/* Move Down */}
                        <button
                            onClick={onMoveDown}
                            disabled={!canMoveDown}
                            className="p-1.5 text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-default"
                            title="Move down"
                        >
                            <ArrowDown className="w-5 h-5" />
                        </button>



                        {/* Delete */}
                        <button
                            onClick={onDelete}
                            className="p-1.5 text-white hover:bg-red-600 rounded transition-colors cursor-default"
                            title="Delete"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}
