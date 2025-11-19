import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

export const StartNode = ({ isConnectable }: NodeProps) => {
    return (
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <Play fill="white" className="text-white ml-1" size={20} />
            </div>
            <div className="mt-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                Start
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-green-500 !top-10"
            />
        </div>
    );
};
