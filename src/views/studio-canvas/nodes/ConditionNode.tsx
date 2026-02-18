import { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { Split } from 'lucide-react';
import { ConditionBranchEditor } from '../components/ConditionBranchEditor';
import { BranchCard } from './components/BranchCard';
import { Branch } from '../../studio/types';

interface ConditionNodeData {
    label: string;
    branches?: Branch[];
    onLabelChange?: (newLabel: string) => void;
    onUpdateBranches?: (branches: Branch[]) => void;
}

export const ConditionNode = memo(({ id, data, selected }: NodeProps) => {
    const typedData = data as unknown as ConditionNodeData;
    const branches = typedData.branches || [
        { id: 'yes', condition: 'Yes' },
        { id: 'no', condition: 'No' }
    ] as Branch[];

    // Label editing state
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(typedData.label || '');
    const labelInputRef = useRef<HTMLInputElement>(null);

    // Branch selection state
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

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

    const handleBranchUpdate = (branchId: string, updates: Partial<Branch>) => {
        const newBranches = branches.map(b =>
            b.id === branchId ? { ...b, ...updates } : b
        );
        typedData.onUpdateBranches?.(newBranches);
    };

    const handleBranchDelete = (branchId: string) => {
        const newBranches = branches.filter(b => b.id !== branchId);
        typedData.onUpdateBranches?.(newBranches);
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

            {/* Wrapper for branch rows */}
            <div className="w-full h-full p-5 space-y-2 bg-amber-50/30 rounded-lg">
                {branches.map((branch) => (
                    <ConditionBranchEditor
                        key={branch.id}
                        nodeId={id}
                        branchId={branch.id}
                        condition={branch.condition}
                        logic={branch.logic}
                        isDefault={branch.isDefault}
                        onChange={(u) => handleBranchUpdate(branch.id, u)}
                        onDelete={() => handleBranchDelete(branch.id)}
                        isOpen={selectedBranchId === branch.id}
                        onOpenChange={(open) => !open && setSelectedBranchId(null)}
                    >
                        <BranchCard
                            branch={branch}
                            isSelected={selectedBranchId === branch.id}
                            onClick={() => setSelectedBranchId(branch.id)}
                        />
                    </ConditionBranchEditor>
                ))}
            </div>
        </div>
    );
});

ConditionNode.displayName = 'ConditionNode';
