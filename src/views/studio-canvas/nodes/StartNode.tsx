import { memo, useEffect, useRef, useState } from 'react';
import { Handle, NodeProps, NodeToolbar, Position, useReactFlow } from '@xyflow/react';
import { Play, Star, Trash2 } from 'lucide-react';
import { ShellTooltip } from '@/components/shell';
import { OUTER_NODE_HANDLE_OFFSET_PX, OUTER_NODE_HANDLE_SIZE_PX } from './components/handleOffsets';
import { getStartNodeDisplayLabel } from '../../studio/startNodes';

interface StartNodeData {
    label?: string;
    isDefault?: boolean;
    readOnly?: boolean;
    canDelete?: boolean;
    onLabelChange?: (nodeId: string, label: string) => void;
    onSetDefault?: (nodeId: string) => void;
    onDelete?: (nodeId: string) => void;
}

export const StartNode = memo(({ id, data, selected }: NodeProps) => {
    const typedData = data as unknown as StartNodeData;
    const { updateNodeData } = useReactFlow();
    const displayLabel = getStartNodeDisplayLabel({ label: typedData.label || '' });
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(displayLabel);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isEditingLabel) {
            setEditedLabel(displayLabel);
        }
    }, [displayLabel, isEditingLabel]);

    useEffect(() => {
        if (!isEditingLabel || !inputRef.current) {
            return;
        }

        inputRef.current.focus();
        inputRef.current.select();
    }, [isEditingLabel]);

    const handleLabelSave = () => {
        const nextLabel = editedLabel.trim() || displayLabel;
        if (!typedData.readOnly && nextLabel !== displayLabel) {
            typedData.onLabelChange?.(String(id), nextLabel);
            updateNodeData(String(id), { label: nextLabel });
        }
        setIsEditingLabel(false);
    };

    const handleLabelKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleLabelSave();
        } else if (event.key === 'Escape') {
            setEditedLabel(displayLabel);
            setIsEditingLabel(false);
        }
    };

    const borderClassName = selected
        ? 'border-[rgb(var(--shell-node-start)/0.9)] ring-1 ring-[rgb(var(--shell-node-start)/0.3)]'
        : 'border-[rgb(var(--shell-node-start)/0.45)] hover:border-[rgb(var(--shell-node-start)/0.62)]';

    return (
        <div className="group relative">
            {selected && !typedData.readOnly ? (
                <NodeToolbar
                    isVisible
                    position={Position.Top}
                    offset={16}
                    className="nodrag nopan flex items-center gap-2 rounded-xl border border-shell-border/70 bg-shell-bg px-2 py-1.5 shadow-lg"
                >
                    {typedData.isDefault ? (
                        <ShellTooltip
                            label="This is the only flow right now"
                            disabled={Boolean(typedData.canDelete)}
                        >
                            <div className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--shell-node-start-surface)/1)] px-2 py-1 text-[11px] font-medium text-[rgb(var(--shell-node-start-text)/1)]">
                                <Star size={11} className="fill-current" />
                                Default flow
                            </div>
                        </ShellTooltip>
                    ) : (
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-shell-muted transition-colors hover:bg-shell-surface hover:text-shell-text"
                            onClick={(event) => {
                                event.stopPropagation();
                                typedData.onSetDefault?.(String(id));
                            }}
                        >
                            <Star size={11} />
                            Make default
                        </button>
                    )}

                    {typedData.canDelete ? (
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-shell-muted transition-colors hover:bg-shell-surface hover:text-shell-text"
                            onClick={(event) => {
                                event.stopPropagation();
                                typedData.onDelete?.(String(id));
                            }}
                        >
                            <Trash2 size={11} />
                            Delete
                        </button>
                    ) : null}
                </NodeToolbar>
            ) : null}

            <div
                className={`flex min-w-[220px] max-w-[360px] items-center gap-2 rounded-full border px-4 py-2.5 text-[rgb(var(--shell-node-start-text)/1)] shadow-sm transition-colors bg-[rgb(var(--shell-node-start-surface)/1)] ${borderClassName}`}
                onDoubleClick={(event) => {
                    if (typedData.readOnly) {
                        return;
                    }

                    event.stopPropagation();
                    setIsEditingLabel(true);
                }}
            >
                <Play size={18} className="shrink-0 fill-current text-[rgb(var(--shell-node-start)/1)]" />
                <div className="min-w-0 flex-1">
                    {isEditingLabel ? (
                        <input
                            ref={inputRef}
                            value={editedLabel}
                            onChange={(event) => setEditedLabel(event.target.value)}
                            onBlur={handleLabelSave}
                            onKeyDown={handleLabelKeyDown}
                            onClick={(event) => event.stopPropagation()}
                            className="nodrag w-full bg-transparent text-sm font-semibold text-[rgb(var(--shell-node-start-text)/1)] outline-none"
                        />
                    ) : (
                        <span className="block truncate text-sm font-semibold" title={displayLabel}>
                            {displayLabel}
                        </span>
                    )}
                </div>
                {typedData.isDefault ? (
                    <ShellTooltip label="Default flow">
                        <span
                            className="shrink-0 rounded-full border border-[rgb(var(--shell-node-start)/0.2)] bg-[rgb(var(--shell-node-start)/0.12)] p-1.5 text-[rgb(var(--shell-node-start)/1)]"
                            role="img"
                            aria-label="Default flow"
                        >
                            <Star size={12} className="fill-current" />
                        </span>
                    </ShellTooltip>
                ) : null}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                className="!bg-[rgb(var(--shell-node-start)/1)] !border-2 !border-shell-bg !z-50 !top-1/2 !-translate-y-1/2"
                style={{
                    width: OUTER_NODE_HANDLE_SIZE_PX,
                    height: OUTER_NODE_HANDLE_SIZE_PX,
                    right: -OUTER_NODE_HANDLE_OFFSET_PX,
                }}
            />
        </div>
    );
});

StartNode.displayName = 'StartNode';
