import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export const StartNode = () => {
    return (
        <div className="group relative">
            {/* Main Pill Shape */}
            <div className="
                flex items-center gap-2 px-6 py-2.5 
                bg-emerald-50 text-emerald-700 
                rounded-full shadow-sm 
                border-2 border-emerald-500
                hover:shadow-md transition-all
            ">
                <Play size={18} className="fill-current text-emerald-600 mr-[1px]" />
                <span className="font-semibold text-sm tracking-wide">Start</span>
            </div>

            {/* Connection Handle (Right) */}
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white"
                style={{ top: 19 }}
            />
        </div>
    );
};
