import { useReactFlow } from '@xyflow/react';
import { Plus, Minus } from 'lucide-react';

export function ZoomControls() {
    const { zoomIn, zoomOut } = useReactFlow();

    return (
        <div className="absolute bottom-4 right-4 z-50 flex items-center bg-shell-bg dark:bg-shell-surface-subtle rounded-full shadow-md dark:shadow-[0_12px_28px_rgb(0_0_0/0.24)] border border-shell-border/70 dark:border-shell-border/55">
            <button
                onClick={() => zoomOut()}
                className="p-1.5 text-shell-muted hover:text-shell-text hover:bg-shell-surface rounded-l-full transition-colors border-r border-shell-border/70 cursor-pointer"
                title="Zoom Out"
            >
                <Minus className="w-4 h-4" />
            </button>
            <button
                onClick={() => zoomIn()}
                className="p-1.5 text-shell-muted hover:text-shell-text hover:bg-shell-surface rounded-r-full transition-colors cursor-pointer"
                title="Zoom In"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
}
