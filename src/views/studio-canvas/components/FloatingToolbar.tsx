import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Split, UserRound, StickyNote } from 'lucide-react';

interface FloatingToolbarProps {
    onAddAiTurn: () => void;
    onAddUserTurn: () => void;
    onAddCondition: () => void;
    onAddNote: () => void;
}

export function FloatingToolbar({ onAddAiTurn, onAddUserTurn, onAddCondition, onAddNote }: FloatingToolbarProps) {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 bg-white rounded-xl shadow-xl border border-gray-200/80 backdrop-blur-sm">

            {/* Group 1: Logic Nodes */}
            <div className="flex items-center gap-1">
                {/* AI Turn */}
                <button
                    onClick={onAddAiTurn}
                    draggable
                    onDragStart={(e) => onDragStart(e, 'turn')}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors tooltip-trigger cursor-grab active:cursor-grabbing"
                    title="Drag to add AI Turn"
                >
                    <VcaIcon icon="signal-ai" size="md" className="text-blue-600" />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        AI Turn
                    </span>
                </button>

                {/* User Turn */}
                <button
                    onClick={onAddUserTurn}
                    draggable
                    onDragStart={(e) => onDragStart(e, 'user-turn')}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
                    title="Drag to add User Turn"
                >
                    <UserRound className="text-purple-600" size={20} />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        User Turn
                    </span>
                </button>

                {/* Condition */}
                <button
                    onClick={onAddCondition}
                    draggable
                    onDragStart={(e) => onDragStart(e, 'condition')}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
                    title="Drag to add Condition"
                >
                    <Split className="text-amber-500" size={20} />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Condition
                    </span>
                </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Group 2: Annotations */}
            {/* Sticky Note */}
            <button
                draggable
                onDragStart={(e) => onDragStart(e, 'note')}
                onClick={onAddNote}
                className="group relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors text-gray-400 tooltip-trigger cursor-grab active:cursor-grabbing"
                title="Drag to add Sticky Note"
            >
                <StickyNote className="text-yellow-500/80" size={20} fill="currentColor" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Sticky Note
                </span>
            </button>


        </div>
    );
}
