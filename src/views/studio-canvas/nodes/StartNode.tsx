import { Handle, Position } from '@xyflow/react';
import { Flag } from 'lucide-react';

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
                <Flag size={18} className="fill-current text-emerald-600" />
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
