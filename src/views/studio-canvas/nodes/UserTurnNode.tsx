import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useStore, useReactFlow, useHandleConnections, useNodesData } from '@xyflow/react';
import { MousePointerClick, ALargeSmall, MessageCirclePlus } from 'lucide-react';
import { UserTurnEditor } from '../components/UserTurnEditor';

interface UserTurnNodeData {
    label?: string;
    inputType?: 'text' | 'prompt' | 'button';
    triggerValue?: string;
    onUpdate?: (nodeId: string, updates: { label?: string; inputType?: 'text' | 'button' | 'prompt'; triggerValue?: string }) => void;
}

export const UserTurnNode = memo(({ id, data, selected }: NodeProps) => {
    const typedData = data as unknown as UserTurnNodeData;
    const { updateNodeData } = useReactFlow();
    const connections = useHandleConnections({ type: 'target', nodeId: id });
    const isLinked = connections.length > 0;
    const sourceNode = useNodesData(connections[0]?.source);

    // Editor state
    const [isEditorOpen, setIsEditorOpen] = useState(false);

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

    const handleUpdate = (updates: { label?: string; inputType?: 'text' | 'button' | 'prompt'; triggerValue?: string }) => {
        // Persist to Flow Model
        if (typedData.onUpdate) {
            typedData.onUpdate(id, updates);
        }

        // Always update local node data for immediate feedback
        updateNodeData(id, updates);
    };

    const handleLabelSave = () => {
        if (editedLabel.trim() !== (typedData.label || '')) {
            handleUpdate({ label: editedLabel.trim() });
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
                return <MousePointerClick className="w-4 h-4" />;
            case 'prompt':
                return <MessageCirclePlus className="w-4 h-4" />;
            case 'text':
            default:
                return <ALargeSmall className="w-4 h-4" />;
        }
    };

    const getLinkedPromptText = () => {
        if (!isLinked || !sourceNode || !connections[0]?.sourceHandle) return null;

        const handleId = connections[0].sourceHandle;
        if (!handleId.startsWith('handle-')) return null;

        const componentId = handleId.replace('handle-', '');
        // Safety cast for source node data
        const components = (sourceNode.data as { components?: Array<{ id: string; type: string; content?: { text?: string } }> })?.components;

        const component = components?.find(c => c.id === componentId);
        if (component?.type === 'prompt') {
            return component.content?.text;
        }
        return null;
    };

    const renderReadonlyContent = () => {
        const inputType = typedData.inputType || 'text';
        const val = typedData.triggerValue || '';

        if (inputType === 'text') {
            const hasTriggers = !!val;
            return (
                <div className="flex items-start gap-3 w-full">
                    <ALargeSmall className={`w-4 h-4 shrink-0 mt-0.5 ${hasTriggers ? 'text-purple-500' : 'text-gray-400'}`} />
                    <div className={`text-sm leading-normal break-words ${hasTriggers ? 'text-gray-900' : 'text-gray-400'}`}>
                        {val || 'What does the user say?'}
                    </div>
                </div>
            );
        }

        if (inputType === 'button') {
            const hasLabel = !!val;
            return (
                <div className="flex items-center gap-2 text-sm py-1">
                    <MousePointerClick className={`w-4 h-4 ${hasLabel ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`truncate ${hasLabel ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {val ? `User clicks ${val}` : 'Which button does the user click?'}
                    </span>
                </div>
            );
        }

        // Prompt Mode
        const promptText = getLinkedPromptText();

        return (
            <div className="flex items-center gap-2 text-sm py-1">
                <MessageCirclePlus className={`w-4 h-4 shrink-0 ${isLinked ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className={`truncate ${isLinked ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {isLinked ? `User clicks ${promptText || 'AI Prompt'}` : 'Which prompt does the user click?'}
                </span>
            </div>
        );
    };

    const zoom = useStore((s) => s.transform[2]);
    const scale = Math.max(1, 1 / zoom);

    const promptText = getLinkedPromptText();

    return (
        <UserTurnEditor
            nodeId={id}
            label={typedData.label || ''}
            inputType={typedData.inputType || 'text'}
            triggerValue={typedData.triggerValue || ''}
            onChange={handleUpdate}
            isLinked={isLinked}
            promptText={promptText || undefined}
            isOpen={isEditorOpen}
            onOpenChange={setIsEditorOpen}
        >
            <div
                id={`node-${id}`}
                className={`bg-white rounded-lg border shadow-sm w-[280px] transition-all cursor-pointer relative overflow-visible ${selected || isEditorOpen
                    ? 'border-purple-500 ring-1 ring-purple-500'
                    : 'border-gray-300 hover:border-purple-300 hover:shadow-md'
                    }`}
                onClick={() => {
                    // Don't stop propagation so React Flow selects the node
                    setIsEditorOpen(true);
                }}
            >
                {/* Node Label (Figma Style) - Above the card */}
                <div
                    className="absolute bottom-full left-0 mb-1.5 px-0.5 min-w-[100px] h-6 flex items-center gap-1.5 origin-bottom-left"
                    style={{
                        transform: `scale(${scale})`,
                    }}
                >
                    <div className="text-purple-600 flex-shrink-0">
                        {getIcon()}
                    </div>
                    {isEditingLabel ? (
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
                            className={`w-full h-full flex items-center text-xs font-medium truncate rounded transition-colors cursor-text ${!typedData.label ? 'text-gray-400' : 'text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingLabel(true);
                            }}
                            title="Click to rename"
                        >
                            {typedData.label || 'User Turn'}
                        </div>
                    )}
                </div >

                {/* Input Handle */}
                <Handle
                    type="target"
                    id="user-input"
                    position={Position.Left}
                    className="!bg-purple-400 !w-3 !h-3 !border-2 !border-white !z-50"
                />

                {/* Wrapper ID for Popover to detect clicks inside */}
                <div id={`component-${id}`} className="w-full h-full overflow-hidden rounded-lg">
                    {/* Content Body */}
                    <div className="px-4 py-3 bg-white rounded-b-lg">
                        {renderReadonlyContent()}
                    </div>
                </div>

                {/* Output Handle */}
                <Handle
                    type="source"
                    id="user-output"
                    position={Position.Right}
                    className="!bg-purple-400 !w-3 !h-3 !border-2 !border-white !z-50"
                />
            </div >
        </UserTurnEditor>
    );
});

UserTurnNode.displayName = 'UserTurnNode';
