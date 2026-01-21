import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import { Flow, Block, FlowPhase, BlockType, AIBlockVariant } from './types';
import { PhaseSection } from './PhaseSection';
import { IntentPicker } from './IntentPicker';

interface LifecycleCanvasProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    renderBlock: (block: Block, index: number) => React.ReactNode;
    onAddBlock: (phase: FlowPhase, type: BlockType, variant?: AIBlockVariant) => void;
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export const LifecycleCanvas = ({ flow, onUpdateFlow, renderBlock, onAddBlock }: LifecycleCanvasProps) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [pickerState, setPickerState] = useState<{ isOpen: boolean, phase: FlowPhase | null, position: { x: number, y: number } }>({
        isOpen: false,
        phase: null,
        position: { x: 0, y: 0 }
    });

    const activeBlock = activeId ? flow.blocks.find(b => b.id === activeId) : null;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group blocks by phase
    const sections: Record<FlowPhase, Block[]> = {
        welcome: flow.blocks.filter(b => b.phase === 'welcome'),
        intent: flow.blocks.filter(b => b.phase === 'intent'),
        info: flow.blocks.filter(b => b.phase === 'info'),
        action: flow.blocks.filter(b => b.phase === 'action'),
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Find the containers
        const activeBlock = flow.blocks.find(b => b.id === active.id);
        const overBlock = flow.blocks.find(b => b.id === over.id);
        const overPhase = (over.data.current?.type === 'Phase' ? over.id : overBlock?.phase) as FlowPhase;

        if (!activeBlock || !overPhase) return;

        // If moving to a different phase, update the block's phase immediately
        if (activeBlock.phase !== overPhase) {
            const updatedBlocks = flow.blocks.map(b => {
                if (b.id === activeBlock.id) {
                    return { ...b, phase: overPhase };
                }
                return b;
            });

            onUpdateFlow({ ...flow, blocks: updatedBlocks });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeBlock = flow.blocks.find(b => b.id === active.id);
        const overBlock = flow.blocks.find(b => b.id === over.id);

        if (activeBlock && overBlock && active.id !== over.id) {
            // Reorder within the full list
            const oldIndex = flow.blocks.findIndex(b => b.id === active.id);
            const newIndex = flow.blocks.findIndex(b => b.id === over.id);

            onUpdateFlow({
                ...flow,
                blocks: arrayMove(flow.blocks, oldIndex, newIndex)
            });
        }
    };

    const handleAddClick = (phase: FlowPhase, event: React.MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        // Position relative to viewport, slightly offset
        setPickerState({
            isOpen: true,
            phase,
            position: { x: rect.left, y: rect.bottom + 10 }
        });
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="max-w-2xl mx-auto py-8 px-4">
                    {(['welcome', 'intent', 'info', 'action'] as FlowPhase[]).map(phase => (
                        <PhaseSection
                            key={phase}
                            id={phase}
                            title={phase.charAt(0).toUpperCase() + phase.slice(1)}
                            description={
                                phase === 'welcome' ? "Establish context" :
                                    phase === 'intent' ? "Confirm request" :
                                        phase === 'info' ? "Collect details" : "Execute & Follow up"
                            }
                            icon={
                                phase === 'welcome' ? "👋" :
                                    phase === 'intent' ? "🤔" :
                                        phase === 'info' ? "📝" : "⚡️"
                            }
                            items={sections[phase].map(b => b.id)}
                            onAddBlock={(e) => handleAddClick(phase, e as React.MouseEvent)}
                        >
                            {sections[phase].map((block, i) => renderBlock(block, i))}
                        </PhaseSection>
                    ))}
                </div>

                {createPortal(
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeBlock ? (
                            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xl opacity-90 w-[400px]">
                                <span className="font-semibold text-gray-900">Moving block...</span>
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            {/* Portal the picker to ensure it's on top */}
            {pickerState.isOpen && createPortal(
                <IntentPicker
                    position={pickerState.position}
                    onClose={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
                    onSelect={(type, variant) => {
                        if (pickerState.phase) {
                            onAddBlock(pickerState.phase, type, variant);
                        }
                        setPickerState(prev => ({ ...prev, isOpen: false }));
                    }}
                />,
                document.body
            )}
        </>
    );
};
