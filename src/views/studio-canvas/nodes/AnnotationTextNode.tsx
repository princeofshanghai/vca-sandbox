import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { cn } from '@/utils/cn';
import type { CanvasTextAnnotationSize } from '../../studio/types';
import { AnnotationResizeBounds, AnnotationResizeHandles } from '../components/AnnotationResizeHandles';

interface AnnotationTextNodeData {
    text: string;
    size: CanvasTextAnnotationSize;
    width: number;
    readOnly?: boolean;
    isEditing?: boolean;
    onTextChange?: (nodeId: string, text: string) => void;
    onStartEditing?: (nodeId: string) => void;
    onStopEditing?: (nodeId: string) => void;
    onResizePreview?: (
        nodeId: string,
        nextBounds: { position: { x: number; y: number }; width: number; height: number }
    ) => void;
    onResize?: (
        nodeId: string,
        nextBounds: { position: { x: number; y: number }; width: number; height: number }
    ) => void;
}

const sizeClassNames: Record<CanvasTextAnnotationSize, string> = {
    sm: 'text-sm leading-5',
    md: 'text-xl leading-7',
    lg: 'text-3xl leading-9',
    xl: 'text-5xl leading-[1.05]',
};

export const AnnotationTextNode = memo(({
    id,
    data,
    selected,
    height,
    positionAbsoluteX,
    positionAbsoluteY,
}: NodeProps) => {
    const typedData = data as unknown as AnnotationTextNodeData;
    const [draftText, setDraftText] = useState(typedData.text);
    const [measuredHeight, setMeasuredHeight] = useState(height ?? 56);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const updateNodeInternals = useUpdateNodeInternals();
    const isEditing = Boolean(typedData.isEditing) && !typedData.readOnly;
    const currentWidth = typedData.width;

    useEffect(() => {
        if (!isEditing) {
            setDraftText(typedData.text);
        }
    }, [isEditing, typedData.text]);

    useLayoutEffect(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }, [draftText, isEditing]);

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const nextHeight = containerRef.current.offsetHeight;
        if (!nextHeight) return;
        setMeasuredHeight((currentHeight) => currentHeight === nextHeight ? currentHeight : nextHeight);
    }, [currentWidth, draftText, height, isEditing, selected, typedData.size, typedData.text]);

    useEffect(() => {
        updateNodeInternals(id);
    }, [currentWidth, draftText, id, isEditing, measuredHeight, typedData.size, typedData.text, updateNodeInternals]);

    useEffect(() => {
        if (!isEditing || !textareaRef.current) return;
        const textarea = textareaRef.current;
        const focusTextarea = () => {
            if (!textareaRef.current) {
                return;
            }

            textareaRef.current.focus({ preventScroll: true });
            textareaRef.current.select();
        };

        focusTextarea();
        const frameId = requestAnimationFrame(focusTextarea);

        return () => {
            cancelAnimationFrame(frameId);
            if (document.activeElement === textarea) {
                textarea.blur();
            }
        };
    }, [isEditing]);

    const stopEditing = () => {
        typedData.onStopEditing?.(id);
    };

    const commitText = () => {
        if (!typedData.readOnly) {
            typedData.onTextChange?.(id, draftText);
        }
        stopEditing();
    };

    const cancelEditing = () => {
        setDraftText(typedData.text);
        stopEditing();
    };

    const currentBounds: AnnotationResizeBounds = {
        position: {
            x: positionAbsoluteX,
            y: positionAbsoluteY,
        },
        width: currentWidth,
        height: height ?? measuredHeight,
    };

    return (
        <div
            id={`node-${id}`}
            ref={containerRef}
            onClick={(event) => {
                if (!selected || isEditing || typedData.readOnly) {
                    return;
                }

                event.stopPropagation();
                typedData.onStartEditing?.(id);
            }}
            onDoubleClick={(event) => {
                event.stopPropagation();
                if (typedData.readOnly) return;
                typedData.onStartEditing?.(id);
            }}
            className={cn(
                'relative rounded-xl px-2 py-1.5 transition-shadow',
                selected || isEditing ? 'bg-shell-bg/92 shadow-sm ring-2 ring-shell-accent/70' : 'bg-transparent',
                isEditing ? 'cursor-text' : typedData.readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
            )}
            style={{ width: currentWidth }}
        >
            <AnnotationResizeHandles
                selected={selected && !isEditing}
                readOnly={typedData.readOnly}
                bounds={currentBounds}
                minWidth={120}
                directions={['w', 'e']}
                variant="text"
                onResizePreview={(nextBounds) => typedData.onResizePreview?.(id, nextBounds)}
                onResizeCommit={(nextBounds) => typedData.onResize?.(id, nextBounds)}
            />
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    autoFocus
                    value={draftText}
                    onChange={(event) => setDraftText(event.target.value)}
                    onBlur={commitText}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                            event.preventDefault();
                            cancelEditing();
                            return;
                        }

                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            commitText();
                        }
                    }}
                    rows={1}
                    placeholder="Add text"
                    className={cn(
                        'nodrag nopan nowheel block w-full resize-none overflow-hidden border-none bg-transparent p-0 outline-none placeholder:text-shell-muted',
                        'font-medium tracking-tight text-shell-text',
                        sizeClassNames[typedData.size]
                    )}
                />
            ) : (
                <div
                    className={cn(
                        'block w-full whitespace-pre-wrap break-words font-medium tracking-tight text-shell-text',
                        !typedData.text.trim() && 'text-shell-muted',
                        sizeClassNames[typedData.size]
                    )}
                >
                    {typedData.text.trim() ? typedData.text : 'Add text'}
                </div>
            )}
        </div>
    );
});

AnnotationTextNode.displayName = 'AnnotationTextNode';
