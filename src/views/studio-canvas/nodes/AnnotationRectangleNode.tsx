import { memo, useEffect } from 'react';
import { NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { cn } from '@/utils/cn';
import type { CanvasRectangleAnnotationColor } from '../../studio/types';
import { AnnotationResizeBounds, AnnotationResizeHandles } from '../components/AnnotationResizeHandles';
import { RECTANGLE_ANNOTATION_COLORS } from '../../studio/annotationColors';

interface AnnotationRectangleNodeData {
    width: number;
    height: number;
    color: CanvasRectangleAnnotationColor;
    readOnly?: boolean;
    onResizePreview?: (
        nodeId: string,
        nextBounds: { position: { x: number; y: number }; width: number; height: number }
    ) => void;
    onResize?: (
        nodeId: string,
        nextBounds: { position: { x: number; y: number }; width: number; height: number }
    ) => void;
}

export const AnnotationRectangleNode = memo(({
    id,
    data,
    selected,
    positionAbsoluteX,
    positionAbsoluteY,
}: NodeProps) => {
    const typedData = data as unknown as AnnotationRectangleNodeData;
    const updateNodeInternals = useUpdateNodeInternals();
    const colorDefinition = RECTANGLE_ANNOTATION_COLORS[typedData.color];

    useEffect(() => {
        updateNodeInternals(id);
    }, [colorDefinition.border, colorDefinition.fill, id, typedData.height, typedData.width, updateNodeInternals]);

    const currentBounds: AnnotationResizeBounds = {
        position: {
            x: positionAbsoluteX,
            y: positionAbsoluteY,
        },
        width: typedData.width,
        height: typedData.height,
    };

    return (
        <div
            id={`node-${id}`}
            className={cn(
                'relative rounded-2xl border transition-shadow',
                selected ? 'shadow-[0_0_0_2px_rgb(var(--shell-accent)/0.75)]' : 'shadow-none'
            )}
            style={{
                width: typedData.width,
                height: typedData.height,
                backgroundColor: colorDefinition.fill,
                borderColor: colorDefinition.border,
            }}
        >
            <AnnotationResizeHandles
                selected={selected}
                readOnly={typedData.readOnly}
                bounds={currentBounds}
                minWidth={160}
                minHeight={96}
                directions={['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']}
                variant="rectangle"
                onResizePreview={(nextBounds) => typedData.onResizePreview?.(id, nextBounds)}
                onResizeCommit={(nextBounds) => typedData.onResize?.(id, nextBounds)}
            />
        </div>
    );
});

AnnotationRectangleNode.displayName = 'AnnotationRectangleNode';
