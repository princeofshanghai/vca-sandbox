import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Split, UserRound } from 'lucide-react';

interface FloatingToolbarProps {
    onAddAiTurn: () => void;
    onAddUserTurn: () => void;
    onAddCondition: () => void;
}

export function FloatingToolbar({ onAddAiTurn, onAddUserTurn, onAddCondition }: FloatingToolbarProps) {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 bg-white rounded-full shadow-xl border border-gray-200/80 backdrop-blur-sm">

            {/* AI Turn */}
            <button
                onClick={onAddAiTurn}
                draggable
                onDragStart={(e) => onDragStart(e, 'turn')}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors tooltip-trigger cursor-grab active:cursor-grabbing"
                title="Drag to add AI Turn"
            >
                <VcaIcon icon="signal-ai" size="md" className="text-blue-600" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    AI Turn
                </span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* User Turn */}
            <button
                onClick={onAddUserTurn}
                draggable
                onDragStart={(e) => onDragStart(e, 'user-turn')}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
                title="Drag to add User Turn"
            >
                <UserRound className="text-purple-600" size={20} />
                {/* <VcaIcon icon="user" size="md" className="text-purple-600" /> */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    User Turn
                </span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Condition */}
            <button
                onClick={onAddCondition}
                draggable
                onDragStart={(e) => onDragStart(e, 'condition')}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
                title="Drag to add Condition"
            >
                <Split className="text-amber-500" size={20} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Condition
                </span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Sticky Note / Comment (Placeholder for now) */}
            <button
                draggable
                onDragStart={(e) => onDragStart(e, 'note')}
                onClick={() => { }}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-400 cursor-not-allowed"
                title="Add Note (Coming soon)"
            >
                <span className="text-xl">📝</span>
            </button>


        </div>
    );
}
