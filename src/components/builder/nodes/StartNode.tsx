import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export const StartNode = () => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500 min-w-[150px]">
            <div className="flex items-center">
                <div className="rounded-full w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 mr-2">
                    <Play size={14} className="ml-0.5" />
                </div>
                <div className="text-sm font-bold text-gray-900">Start</div>
            </div>
            <div className="mt-2 text-[10px] text-gray-500">
                Configures Welcome Message & Prompts
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-green-500 !bottom-[-7px]"
            />
        </div>
    );
};
