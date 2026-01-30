import { useReactFlow } from '@xyflow/react';
import { Plus, Minus } from 'lucide-react';

export function ZoomControls() {
    const { zoomIn, zoomOut } = useReactFlow();

    return (
        <div className="absolute bottom-4 right-4 z-50 flex items-center bg-white rounded-full shadow-md border border-gray-200">
            <button
                onClick={() => zoomOut()}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-l-full transition-colors border-r border-gray-200 cursor-default"
                title="Zoom Out"
            >
                <Minus className="w-4 h-4" />
            </button>
            <button
                onClick={() => zoomIn()}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-r-full transition-colors cursor-default"
                title="Zoom In"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
}
