import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useStore, useReactFlow, useHandleConnections, useNodesData } from '@xyflow/react';
import { MousePointerClick, Keyboard } from 'lucide-react';
import { UserTurnEditor } from '../components/UserTurnEditor';
import { CanvasNodeCommentState } from '../types';
import { getVisibleUserTurnLabel } from '../../studio/userTurnLabels';
import { getComponentDisplay } from './utils/turnNodeUtils';
import { OUTER_NODE_HANDLE_OFFSET_PX } from './components/handleOffsets';
import type { Component } from '../../studio/types';

interface UserTurnNodeData {
    label?: string;
    labelMode?: 'auto' | 'custom';
    autoLabel?: string;
    inputType?: 'text' | 'prompt' | 'button';
    triggerValue?: string;
    readOnly?: boolean;
    commentState?: CanvasNodeCommentState;
    onUpdate?: (nodeId: string, updates: {
        label?: string;
        labelMode?: 'auto' | 'custom';
        autoLabel?: string;
        inputType?: 'text' | 'button' | 'prompt';
        triggerValue?: string;
    }) => void;
    onDelete?: (nodeId: string) => void;
}

interface LinkedTurnComponent {
    id: string;
    type: string;
    content?: {
        text?: string;
        items?: Array<{ id: string; title: string }>;
        showActions?: boolean;
        confirmLabel?: string;
        rejectLabel?: string;
        title?: string;
        primaryLabel?: string;
        secondaryLabel?: string;
        saveLabel?: string;
        cancelLabel?: string;
    };
}

export const UserTurnNode = memo(({ id, data, selected }: NodeProps) => {
    const typedData = data as unknown as UserTurnNodeData;
    const { updateNodeData } = useReactFlow();
    const connections = useHandleConnections({ type: 'target', nodeId: id });
    const isLinked = connections.length > 0;
    const sourceNode = useNodesData(connections[0]?.source);
    const displayLabel = getVisibleUserTurnLabel({
        label: typedData.label || '',
        labelMode: typedData.labelMode,
        autoLabel: typedData.autoLabel,
        inputType: typedData.inputType || 'text',
    });
    const isClickMode = typedData.inputType === 'button' || typedData.inputType === 'prompt';

    // Editor state
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    // Label editing state
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(displayLabel);
    const labelInputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingLabel && labelInputRef.current) {
            labelInputRef.current.focus();
            labelInputRef.current.select();
        }
    }, [isEditingLabel]);

    useEffect(() => {
        if (!isEditingLabel) {
            setEditedLabel(displayLabel);
        }
    }, [displayLabel, isEditingLabel]);

    const handleUpdate = (updates: {
        label?: string;
        labelMode?: 'auto' | 'custom';
        autoLabel?: string;
        inputType?: 'text' | 'button' | 'prompt';
        triggerValue?: string;
    }) => {
        if (typedData.readOnly) return;

        // Persist to Flow Model
        if (typedData.onUpdate) {
            typedData.onUpdate(id, updates);
        }

        // Always update local node data for immediate feedback
        updateNodeData(id, updates);
    };

    const handleLabelSave = () => {
        const nextLabel = editedLabel.trim();
        if (nextLabel !== displayLabel) {
            handleUpdate({
                label: nextLabel,
                labelMode: 'custom',
                autoLabel: undefined,
            });
        }
        setIsEditingLabel(false);
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLabelSave();
        } else if (e.key === 'Escape') {
            setEditedLabel(displayLabel);
            setIsEditingLabel(false);
        }
    };

    const handleDelete = () => {
        if (typedData.readOnly) return;
        setIsEditorOpen(false);
        typedData.onDelete?.(id);
    };

    const getIcon = () => {
        return isClickMode
            ? <MousePointerClick className="w-4 h-4" />
            : <Keyboard className="w-4 h-4" />;
    };

    const getLinkedSource = () => {
        if (!isLinked || !sourceNode || !connections[0]?.sourceHandle) return null;

        const handleId = connections[0].sourceHandle;
        if (!handleId.startsWith('handle-')) return null;

        const handlePath = handleId.slice('handle-'.length);
        const components = (sourceNode.data as { components?: LinkedTurnComponent[] })?.components;
        if (!components) return null;

        const component = components.find((candidate) =>
            handlePath === candidate.id || handlePath.startsWith(`${candidate.id}-`)
        );
        if (!component) return null;

        return { handleId, component };
    };

    const getLinkedClickText = () => {
        const linkedSource = getLinkedSource();
        if (!linkedSource) return null;

        const { component, handleId } = linkedSource;

        if (component.type === 'prompt') {
            return component.content?.text || null;
        }

        if (component.type === 'selectionList') {
            const itemId = handleId.split(`${component.id}-`)[1];
            if (!itemId) return null;

            const selectedItem = component.content?.items?.find((item) => item.id === itemId);
            return selectedItem?.title || null;
        }

        if (component.type === 'confirmationCard') {
            if (component.content?.showActions === false) return null;
            const actionId = handleId.split(`${component.id}-`)[1];
            return actionId === 'reject'
                ? (component.content?.rejectLabel || 'Cancel')
                : (component.content?.confirmLabel || 'Confirm');
        }

        if (component.type === 'checkboxGroup') {
            const isSecondary = handleId.endsWith('-secondary');
            return isSecondary
                ? (component.content?.secondaryLabel || component.content?.cancelLabel || 'Cancel')
                : (component.content?.primaryLabel || component.content?.saveLabel || 'Save');
        }

        return null;
    };

    const getLinkedClickComponent = () => {
        const linkedSource = getLinkedSource();
        if (!linkedSource) return null;

        return getComponentDisplay(linkedSource.component as Component);
    };

    const renderReadonlyContent = () => {
        const val = typedData.triggerValue || '';
        const clickLabel = getLinkedClickText() || val;

        if (!isClickMode) {
            const hasTriggers = !!val;
            return (
                <div className="flex items-start gap-3 w-full">
                    <Keyboard className={`w-4 h-4 shrink-0 mt-0.5 ${hasTriggers ? 'text-shell-node-user' : 'text-shell-muted'}`} />
                    <div className={`text-sm leading-normal break-words ${hasTriggers ? 'text-shell-text' : 'text-shell-muted'}`}>
                        {val || 'What does the user say?'}
                    </div>
                </div>
            );
        }

        const hasClickLabel = !!clickLabel;

        return (
            <div className="flex items-center gap-2 text-sm py-1">
                <MousePointerClick className={`w-4 h-4 shrink-0 ${hasClickLabel || isLinked ? 'text-shell-node-user' : 'text-shell-muted'}`} />
                <span className={`truncate ${hasClickLabel || isLinked ? 'text-shell-text font-medium' : 'text-shell-muted'}`}>
                    {clickLabel ? `User clicks ${clickLabel}` : 'User clicks'}
                </span>
            </div>
        );
    };

    const zoom = useStore((s) => s.transform[2]);
    const scale = Math.max(1, 1 / zoom);
    const userSurfaceClassName = 'bg-[rgb(var(--shell-node-user-surface)/1)]';
    const commentState = typedData.commentState;
    const isCommentHighlighted = Boolean(commentState?.isActive);
    const isCommentPlacementMode = Boolean(commentState?.isPlacementMode);
    const borderClassName = selected || isEditorOpen
        ? 'border-shell-node-user ring-1 ring-shell-node-user/30'
        : isCommentHighlighted
            ? 'border-shell-accent ring-2 ring-shell-accent/28 shadow-[0_16px_36px_rgb(var(--shell-accent)/0.12)]'
            : isCommentPlacementMode
                ? 'border-shell-node-user/35 hover:border-shell-accent/60 hover:ring-1 hover:ring-shell-accent/18 cursor-pointer'
                : 'border-shell-node-user/35 hover:border-shell-node-user/60';

    const clickLabel = getLinkedClickText();
    const clickComponent = getLinkedClickComponent();

    return (
        <UserTurnEditor
            nodeId={id}
            mode={isClickMode ? 'click' : 'text'}
            triggerValue={typedData.triggerValue || ''}
            onChange={handleUpdate}
            clickLabel={clickLabel || undefined}
            clickComponentLabel={clickComponent?.label}
            clickComponentIcon={clickComponent?.icon}
            onDelete={handleDelete}
            isOpen={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            readOnly={typedData.readOnly}
        >
            <div
                id={`node-${id}`}
                className={`${userSurfaceClassName} rounded-full border shadow-sm w-[280px] transition-all relative overflow-visible ${borderClassName}`}
                onClick={() => {
                    // Don't stop propagation so React Flow selects the node
                    if (typedData.commentState?.isPlacementMode) return;
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
                    <div className="text-shell-node-user flex-shrink-0">
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
                            className="w-full h-full text-xs font-medium text-shell-text bg-transparent border border-shell-node-user rounded px-1 outline-none nodrag"
                            onClick={(e) => e.stopPropagation()}
                            readOnly={typedData.readOnly}
                        />
                    ) : (
                        <div
                            className={`w-full h-full flex items-center text-xs font-medium truncate rounded transition-colors ${typedData.readOnly ? 'cursor-default text-shell-muted-strong border border-transparent' : 'cursor-text'} ${!typedData.label ? 'text-shell-muted' : 'text-shell-muted-strong hover:text-shell-text border border-transparent hover:border-shell-border/70'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (typedData.readOnly) return;
                                setIsEditingLabel(true);
                            }}
                            title={typedData.readOnly ? undefined : 'Click to rename'}
                        >
                            {displayLabel}
                        </div>
                    )}
                </div >

                {/* Input Handle */}
                <Handle
                    type="target"
                    id="user-input"
                    position={Position.Left}
                    className="!bg-shell-node-user !w-4 !h-4 !border-2 !border-shell-bg !z-50"
                    style={{ left: -OUTER_NODE_HANDLE_OFFSET_PX }}
                />

                {/* Wrapper ID for Popover to detect clicks inside */}
                <div id={`component-${id}`} className="w-full h-full overflow-hidden rounded-full">
                    {/* Content Body */}
                    <div className={`px-5 py-4 ${userSurfaceClassName} rounded-full`}>
                        {renderReadonlyContent()}
                    </div>
                </div>

                {/* Output Handle */}
                <Handle
                    type="source"
                    id="user-output"
                    position={Position.Right}
                    className="!bg-shell-node-user !w-4 !h-4 !border-2 !border-shell-bg !z-50"
                    style={{ right: -OUTER_NODE_HANDLE_OFFSET_PX }}
                />
            </div >
        </UserTurnEditor>
    );
});

UserTurnNode.displayName = 'UserTurnNode';
