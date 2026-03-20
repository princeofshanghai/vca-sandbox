import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import { OUTER_NODE_HANDLE_OFFSET_PX, OUTER_NODE_HANDLE_SIZE_PX } from './components/handleOffsets';

export const StartNode = memo(({ selected }: NodeProps) => {
    const borderClassName = selected
        ? 'border-[rgb(var(--shell-node-start)/0.9)] ring-1 ring-[rgb(var(--shell-node-start)/0.3)]'
        : 'border-[rgb(var(--shell-node-start)/0.45)] hover:border-[rgb(var(--shell-node-start)/0.62)]';

    return (
        <div className="group relative">
            {/* Main Pill Shape */}
            <div
                className={`flex items-center gap-2 rounded-full border px-6 py-2.5 text-[rgb(var(--shell-node-start-text)/1)] shadow-sm transition-colors bg-[rgb(var(--shell-node-start-surface)/1)] ${borderClassName}`}
            >
                <Play size={18} className="mr-[1px] fill-current text-[rgb(var(--shell-node-start)/1)]" />
                <span className="font-semibold text-sm tracking-wide">Start</span>
            </div>

            {/* Connection Handle (Right) */}
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-[rgb(var(--shell-node-start)/1)] !border-2 !border-shell-bg !z-50 !top-1/2 !-translate-y-1/2"
                style={{
                    width: OUTER_NODE_HANDLE_SIZE_PX,
                    height: OUTER_NODE_HANDLE_SIZE_PX,
                    right: -OUTER_NODE_HANDLE_OFFSET_PX,
                }}
            />
        </div>
    );
});

StartNode.displayName = 'StartNode';
