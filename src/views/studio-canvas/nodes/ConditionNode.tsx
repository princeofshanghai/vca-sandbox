import { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { Split } from 'lucide-react';

interface ConditionNodeData {
    label: string;
    branches?: Array<{ id: string; condition: string }>;
    onLabelChange?: (newLabel: string) => void;
}

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
    const typedData = data as unknown as ConditionNodeData;
    const branches = typedData.branches || [
        { id: 'yes', condition: 'Yes' },
        { id: 'no', condition: 'No' }
    ];

    // Label editing state
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(typedData.label || '');
    const labelInputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingLabel && labelInputRef.current) {
            labelInputRef.current.focus();
            labelInputRef.current.select();
        }
    }, [isEditingLabel]);

    const handleLabelSave = () => {
        if (editedLabel.trim() !== (typedData.label || '')) {
            typedData.onLabelChange?.(editedLabel.trim());
        }
        setIsEditingLabel(false);
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLabelSave();
        } else if (e.key === 'Escape') {
            setEditedLabel(typedData.label || '');
            setIsEditingLabel(false);
        }
    };

    const zoom = useStore((s) => s.transform[2]);
    const scale = Math.max(1, 1 / zoom);

    return (
        <div
            className={`bg-white rounded-lg border shadow-sm min-w-[200px] transition-colors cursor-default relative ${selected
                ? 'border-amber-500 ring-1 ring-amber-500'
                : 'border-gray-300 hover:border-amber-300'
                }`}
        >
            {/* Condition Label (Figma Style) - Above the card */}
            <div
                className="absolute bottom-full left-0 mb-1.5 px-0.5 min-w-[100px] h-6 flex items-center gap-1.5 origin-bottom-left"
                style={{
                    transform: `scale(${scale})`,
                }}
            >
                <Split size={12} className="text-amber-500 flex-shrink-0" />
                {isEditingLabel ? (
                    <input
                        ref={labelInputRef}
                        type="text"
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        onBlur={handleLabelSave}
                        onKeyDown={handleLabelKeyDown}
                        className="w-full h-full text-xs font-medium text-gray-900 bg-transparent border border-blue-500 rounded px-1 outline-none nodrag"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div
                        className={`w-full h-full flex items-center text-xs font-medium truncate rounded transition-colors cursor-text ${!typedData.label ? 'text-gray-400' : 'text-gray-500 hover:text-gray-900'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingLabel(true);
                        }}
                        title="Click to rename"
                    >
                        {typedData.label || 'Condition'}
                    </div>
                )}
            </div>

            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-amber-400 !w-3 !h-3 !border-2 !border-white"
            />

            {/* Internal Content Wrapper for clipping rounded corners */}
            <div className="w-full h-full overflow-hidden rounded-lg">
                {/* Node Content */}
                <div className="p-3">
                    {/* Header removed from inside */}
                    <div className="hidden">
                        <span className="text-amber-700">⚙️ Condition</span>
                    </div>

                    {/* Label */}
                    {/* Label removed from inside */}
                    <div className="hidden">
                        {typedData.label}
                    </div>

                    {/* Branches */}
                    <div className="text-xs text-gray-600">
                        {branches.map((branch: { id: string; condition: string }) => (
                            <div key={branch.id} className="flex items-center gap-1">
                                <span>•</span>
                                <span>{branch.condition}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Output Handles - one per branch, stacked on right */}
            {branches.map((branch: { id: string; condition: string }, index: number) => {
                // Calculate position for vertical stacking
                // Start from top 20px, space by 24px (example)
                // Or better: Distribute evenly along the height using percentages
                const totalBranches = branches.length;
                const position = totalBranches === 1
                    ? 50
                    : 20 + ((index / (totalBranches - 1)) * 60); // Spread across middle 60% of height

                return (
                    <Handle
                        key={branch.id}
                        type="source"
                        position={Position.Right}
                        id={branch.id}
                        className="!bg-amber-400 !w-3 !h-3 !border-2 !border-white"
                        style={{ top: `${position}%` }}
                    />
                );
            })}
        </div>
    );
});

ConditionNode.displayName = 'ConditionNode';
