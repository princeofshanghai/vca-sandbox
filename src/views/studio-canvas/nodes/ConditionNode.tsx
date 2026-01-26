import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface ConditionNodeData {
    label: string;
    branches?: Array<{ id: string; label: string }>;
}

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
    const typedData = data as unknown as ConditionNodeData;
    const branches = typedData.branches || [
        { id: 'yes', label: 'Yes' },
        { id: 'no', label: 'No' }
    ];

    return (
        <div className={`bg-amber-50 border-2 rounded-lg shadow-sm min-w-[200px] transition-shadow cursor-default ${selected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-amber-400'
            }`}>
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-amber-500"
            />

            {/* Node Content */}
            <div className="p-3">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-700">⚙️ Condition</span>
                </div>

                {/* Label */}
                <div className="text-sm font-medium text-gray-900 mb-2">
                    {typedData.label}
                </div>

                {/* Branches */}
                <div className="text-xs text-gray-600">
                    {branches.map((branch: { id: string; label: string }) => (
                        <div key={branch.id} className="flex items-center gap-1">
                            <span>•</span>
                            <span>{branch.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Output Handles - one per branch */}
            {branches.map((branch: { id: string; label: string }, index: number) => {
                const totalBranches = branches.length;
                const position = totalBranches === 1
                    ? 50
                    : (index / (totalBranches - 1)) * 100;

                return (
                    <Handle
                        key={branch.id}
                        type="source"
                        position={Position.Bottom}
                        id={branch.id}
                        className="w-3 h-3 !bg-amber-500"
                        style={{ left: `${position}%` }}
                    />
                );
            })}
        </div>
    );
});

ConditionNode.displayName = 'ConditionNode';
