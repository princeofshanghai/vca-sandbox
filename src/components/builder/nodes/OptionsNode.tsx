import { Handle, Position, NodeProps } from '@xyflow/react';
import { List } from 'lucide-react';

export const OptionsNode = ({ data, isConnectable }: NodeProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-w-[250px] overflow-hidden">
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-purple-500" />

            <div className="bg-purple-50 px-3 py-2 border-b border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <List size={14} className="text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Options</span>
                </div>
            </div>

            <div className="p-3 space-y-2">
                <div className="text-sm text-gray-900 mb-3">
                    {data.label ? (data.label as string) : 'Select an option:'}
                </div>

                {/* Visual representation of buttons with handles */}
                <div className="space-y-3 relative">
                    <div className="relative">
                        <div className="w-full px-3 py-2 bg-white border border-purple-200 rounded text-center text-sm text-purple-600 font-medium">
                            Option A
                        </div>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="option-a"
                            isConnectable={isConnectable}
                            className="w-3 h-3 bg-purple-500 !-right-5 !top-1/2 !-translate-y-1/2"
                        />
                    </div>

                    <div className="relative">
                        <div className="w-full px-3 py-2 bg-white border border-purple-200 rounded text-center text-sm text-purple-600 font-medium">
                            Option B
                        </div>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="option-b"
                            isConnectable={isConnectable}
                            className="w-3 h-3 bg-purple-500 !-right-5 !top-1/2 !-translate-y-1/2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
