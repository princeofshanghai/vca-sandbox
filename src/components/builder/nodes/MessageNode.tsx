import { Handle, Position, NodeProps } from '@xyflow/react';

export const MessageNode = ({ data, isConnectable }: NodeProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-w-[250px] overflow-hidden">
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-blue-500" />

            <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bot Message</span>
            </div>

            <div className="p-3">
                <div className="text-sm text-gray-900">
                    {data.content ? (data.content as string) : <span className="text-gray-400 italic">Empty message...</span>}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-blue-500" />
        </div>
    );
};
