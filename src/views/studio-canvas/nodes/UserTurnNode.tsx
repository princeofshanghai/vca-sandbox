import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare, MousePointerClick, List } from 'lucide-react';

interface UserTurnNodeData {
    label?: string;
    inputType?: 'text' | 'prompt' | 'button';
    triggerValue?: string;
    onLabelChange?: (newLabel: string) => void;
    onSelectNode?: (nodeId: string, anchorEl: HTMLElement) => void;
}

export const UserTurnNode = memo(({ id, data, selected }: NodeProps) => {
    const nodeId = id as string;
    const typedData = data as unknown as UserTurnNodeData;

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

    const handleNodeClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('input') && typedData.onSelectNode) {
            e.stopPropagation();
            const nodeEl = e.currentTarget as HTMLElement;
            typedData.onSelectNode(nodeId, nodeEl);
        }
    };

    const getIcon = () => {
        switch (typedData.inputType) {
            case 'button':
                return <MousePointerClick className="w-3.5 h-3.5" />;
            case 'prompt':
                return <List className="w-3.5 h-3.5" />;
            case 'text':
            default:
                return <MessageSquare className="w-3.5 h-3.5" />;
        }
    };

    const getBodyText = () => {
        switch (typedData.inputType) {
            case 'button':
                return 'User clicks a button';
            case 'prompt':
                return 'User selects a prompt';
            case 'text':
            default:
                return 'User types a message';
        }
    };

    return (
        <div
            id={`node-${id}`}
            className={`bg-white rounded-lg border shadow-sm w-[280px] transition-colors cursor-default relative ${selected
                ? 'border-purple-500 ring-1 ring-purple-500'
                : 'border-gray-300 hover:border-purple-300'
                }`}
            onClick={handleNodeClick}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-purple-200 !w-3 !h-3 !border-2 !border-white"
            />

            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 cursor-default bg-purple-50/50 rounded-t-lg">
                <div className="flex items-center gap-3">
                    {/* User Icon */}
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600">
                        {getIcon()}
                    </div>

                    {/* Editable Label */}
                    <div className="flex-1 min-w-0 h-6 flex items-center">
                        {isEditingLabel ? (
                            <input
                                ref={labelInputRef}
                                type="text"
                                value={editedLabel}
                                onChange={(e) => setEditedLabel(e.target.value)}
                                onBlur={handleLabelSave}
                                onKeyDown={handleLabelKeyDown}
                                className="w-full h-full text-sm font-semibold text-gray-900 bg-white border border-purple-500 rounded px-1 outline-none nodrag"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <div
                                className={`w-full h-full flex items-center px-1 text-sm font-semibold truncate rounded hover:bg-white/50 transition-colors cursor-default ${!typedData.label ? 'text-gray-400' : 'text-gray-900'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditingLabel(true);
                                }}
                                title="Click to edit label"
                            >
                                {typedData.label || 'User Action'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-4 py-2 bg-white rounded-b-lg">
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    {getBodyText()}
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-purple-200 !w-3 !h-3 !border-2 !border-white"
            />
        </div>
    );
});

UserTurnNode.displayName = 'UserTurnNode';
