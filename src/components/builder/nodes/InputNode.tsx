import { Handle, Position, NodeProps } from '@xyflow/react';
import { Type } from 'lucide-react';

export const InputNode = ({ data, isConnectable }: NodeProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-w-[250px] overflow-hidden">
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-green-500" />

            <div className="bg-green-50 px-3 py-2 border-b border-green-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Type size={14} className="text-green-600" />
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">User Input</span>
                </div>
            </div>

            <div className="p-3">
                <div className="text-sm text-gray-900 mb-2">
                    {data.label ? (data.label as string) : 'Waiting for user input...'}
                </div>
                <div className="w-full h-8 bg-gray-50 border border-gray-200 rounded px-2 flex items-center">
                    <span className="text-gray-400 text-sm">Type a message...</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-green-500" />
        </div>
    );
};
