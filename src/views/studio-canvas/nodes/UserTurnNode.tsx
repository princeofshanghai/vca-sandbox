import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { MessageSquare, MousePointerClick, List } from 'lucide-react';

interface UserTurnNodeData {
    label?: string;
    inputType?: 'text' | 'prompt' | 'button';
    triggerValue?: string;
    onLabelChange?: (newLabel: string) => void;
    onSelectNode?: (nodeId: string, anchorEl: HTMLElement) => void;
}

export const UserTurnNode = memo(({ id, data, selected }: NodeProps) => {
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

    const zoom = useStore((s) => s.transform[2]);
    const scale = Math.max(1, 1 / zoom);

    return (
        <div
            id={`node-${id}`}
            className={`bg-white rounded-lg border shadow-sm w-[280px] transition-colors cursor-default relative ${selected
                ? 'border-purple-500 ring-1 ring-purple-500'
                : 'border-gray-300 hover:border-purple-300'
                }`}
        >
            {/* Node Label (Figma Style) - Above the card */}
            <div
                className="absolute bottom-full left-0 mb-1.5 px-0.5 min-w-[100px] h-6 flex items-center gap-1.5 origin-bottom-left"
                style={{
                    transform: `scale(${scale})`,
                }}
            >
                {/* Interaction Icon relocated from header */}
                <div className="text-purple-600 flex-shrink-0">
                    {getIcon()}
                </div>

                {
                    isEditingLabel ? (
                        <input
                            ref={labelInputRef}
                            type="text"
                            value={editedLabel}
                            onChange={(e) => setEditedLabel(e.target.value)}
                            onBlur={handleLabelSave}
                            onKeyDown={handleLabelKeyDown}
                            className="w-full h-full text-xs font-medium text-gray-900 bg-transparent border border-purple-500 rounded px-1 outline-none nodrag"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div
                            className={`w-full h-full flex items-center text-xs font-medium truncate rounded transition-colors cursor-text ${!typedData.label ? 'text-gray-400' : 'text-gray-500 hover:text-gray-900'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingLabel(true);
                            }}
                        >
                            {typedData.label || 'User Turn'}
                        </div>
                    )}
            </div >

            {/* Input Handle */}
            < Handle
                type="target"
                position={Position.Left}
                className="!bg-purple-400 !w-3 !h-3 !border-2 !border-white"
            />

            {/* Internal Content Wrapper for clipping rounded corners */}
            < div className="w-full h-full overflow-hidden rounded-lg" >
                {/* Content Body */}
                < div className="px-4 py-2 bg-white rounded-b-lg" >
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        {getBodyText()}
                    </div>
                </div >
            </div >

            {/* Output Handle */}
            < Handle
                type="source"
                position={Position.Right}
                className="!bg-purple-400 !w-3 !h-3 !border-2 !border-white"
            />
        </div >
    );
});

UserTurnNode.displayName = 'UserTurnNode';
