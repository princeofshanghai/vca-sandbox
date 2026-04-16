import { memo, useEffect, useRef } from 'react';
import { useViewport } from '@xyflow/react';
import { cn } from '@/utils/cn';

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface AnnotationResizeBounds {
    position: { x: number; y: number };
    width: number;
    height: number;
}

interface AnnotationResizeHandlesProps {
    selected: boolean;
    readOnly?: boolean;
    bounds: AnnotationResizeBounds;
    minWidth: number;
    minHeight?: number;
    directions: ResizeDirection[];
    variant?: 'rectangle' | 'text';
    onResizePreview: (nextBounds: AnnotationResizeBounds) => void;
    onResizeCommit: (nextBounds: AnnotationResizeBounds) => void;
}

const DIRECTION_META: Record<ResizeDirection, {
    cursorClassName: string;
    cursor: string;
    positionClassName: string;
    indicatorClassName: string;
}> = {
    n: {
        cursorClassName: 'cursor-ns-resize',
        cursor: 'ns-resize',
        positionClassName: 'left-1/2 top-0 h-5 w-10 -translate-x-1/2 -translate-y-1/2',
        indicatorClassName: 'h-1.5 w-6 rounded-full',
    },
    s: {
        cursorClassName: 'cursor-ns-resize',
        cursor: 'ns-resize',
        positionClassName: 'bottom-0 left-1/2 h-5 w-10 -translate-x-1/2 translate-y-1/2',
        indicatorClassName: 'h-1.5 w-6 rounded-full',
    },
    e: {
        cursorClassName: 'cursor-ew-resize',
        cursor: 'ew-resize',
        positionClassName: 'right-0 top-1/2 h-10 w-5 translate-x-1/2 -translate-y-1/2',
        indicatorClassName: 'h-6 w-1.5 rounded-full',
    },
    w: {
        cursorClassName: 'cursor-ew-resize',
        cursor: 'ew-resize',
        positionClassName: 'left-0 top-1/2 h-10 w-5 -translate-x-1/2 -translate-y-1/2',
        indicatorClassName: 'h-6 w-1.5 rounded-full',
    },
    ne: {
        cursorClassName: 'cursor-nesw-resize',
        cursor: 'nesw-resize',
        positionClassName: 'right-0 top-0 h-6 w-6 translate-x-1/2 -translate-y-1/2',
        indicatorClassName: 'h-3.5 w-3.5 rounded-full',
    },
    nw: {
        cursorClassName: 'cursor-nwse-resize',
        cursor: 'nwse-resize',
        positionClassName: 'left-0 top-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2',
        indicatorClassName: 'h-3.5 w-3.5 rounded-full',
    },
    se: {
        cursorClassName: 'cursor-nwse-resize',
        cursor: 'nwse-resize',
        positionClassName: 'bottom-0 right-0 h-6 w-6 translate-x-1/2 translate-y-1/2',
        indicatorClassName: 'h-3.5 w-3.5 rounded-full',
    },
    sw: {
        cursorClassName: 'cursor-nesw-resize',
        cursor: 'nesw-resize',
        positionClassName: 'bottom-0 left-0 h-6 w-6 -translate-x-1/2 translate-y-1/2',
        indicatorClassName: 'h-3.5 w-3.5 rounded-full',
    },
};

function clamp(value: number, minimum: number) {
    return Math.max(value, minimum);
}

function computeResizedBounds(
    startBounds: AnnotationResizeBounds,
    direction: ResizeDirection,
    deltaX: number,
    deltaY: number,
    minWidth: number,
    minHeight: number
) {
    let nextX = startBounds.position.x;
    let nextY = startBounds.position.y;
    let nextWidth = startBounds.width;
    let nextHeight = startBounds.height;

    if (direction.includes('e')) {
        nextWidth = clamp(startBounds.width + deltaX, minWidth);
    }

    if (direction.includes('w')) {
        nextWidth = clamp(startBounds.width - deltaX, minWidth);
        nextX = startBounds.position.x + (startBounds.width - nextWidth);
    }

    if (direction.includes('s')) {
        nextHeight = clamp(startBounds.height + deltaY, minHeight);
    }

    if (direction.includes('n')) {
        nextHeight = clamp(startBounds.height - deltaY, minHeight);
        nextY = startBounds.position.y + (startBounds.height - nextHeight);
    }

    return {
        position: {
            x: Math.round(nextX),
            y: Math.round(nextY),
        },
        width: Math.round(nextWidth),
        height: Math.round(nextHeight),
    };
}

export const AnnotationResizeHandles = memo(({
    selected,
    readOnly,
    bounds,
    minWidth,
    minHeight,
    directions,
    variant = 'rectangle',
    onResizePreview,
    onResizeCommit,
}: AnnotationResizeHandlesProps) => {
    const { zoom } = useViewport();
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        return () => {
            cleanupRef.current?.();
        };
    }, []);

    if (!selected || readOnly) {
        return null;
    }

    return (
        <div className="pointer-events-none absolute inset-0 z-20">
            {directions.map((direction) => {
                const meta = DIRECTION_META[direction];

                return (
                    <button
                        key={direction}
                        type="button"
                        tabIndex={-1}
                        aria-label={`Resize ${direction}`}
                        onPointerDown={(event) => {
                            if (event.button !== 0) return;

                            event.preventDefault();
                            event.stopPropagation();

                            cleanupRef.current?.();

                            const startClientX = event.clientX;
                            const startClientY = event.clientY;
                            const startBounds = bounds;
                            const effectiveZoom = zoom > 0 ? zoom : 1;
                            let nextBounds = startBounds;

                            const restoreUserSelect = document.body.style.userSelect;
                            const restoreCursor = document.body.style.cursor;
                            document.body.style.userSelect = 'none';
                            document.body.style.cursor = meta.cursor;

                            const handlePointerMove = (moveEvent: PointerEvent) => {
                                moveEvent.preventDefault();

                                const deltaX = (moveEvent.clientX - startClientX) / effectiveZoom;
                                const deltaY = (moveEvent.clientY - startClientY) / effectiveZoom;

                                nextBounds = computeResizedBounds(
                                    startBounds,
                                    direction,
                                    deltaX,
                                    deltaY,
                                    minWidth,
                                    minHeight ?? startBounds.height
                                );

                                onResizePreview(nextBounds);
                            };

                            const cleanup = () => {
                                window.removeEventListener('pointermove', handlePointerMove);
                                window.removeEventListener('pointerup', handlePointerUp);
                                window.removeEventListener('pointercancel', handlePointerUp);
                                document.body.style.userSelect = restoreUserSelect;
                                document.body.style.cursor = restoreCursor;
                                cleanupRef.current = null;
                            };

                            const handlePointerUp = (upEvent: PointerEvent) => {
                                upEvent.preventDefault();
                                cleanup();
                                onResizeCommit(nextBounds);
                            };

                            cleanupRef.current = cleanup;
                            window.addEventListener('pointermove', handlePointerMove, { passive: false });
                            window.addEventListener('pointerup', handlePointerUp, { passive: false });
                            window.addEventListener('pointercancel', handlePointerUp, { passive: false });
                        }}
                        className={cn(
                            'pointer-events-auto absolute flex items-center justify-center rounded-full bg-transparent touch-none select-none nodrag nopan',
                            meta.positionClassName,
                            meta.cursorClassName
                        )}
                    >
                        <span
                            className={cn(
                                'pointer-events-none block border border-shell-bg bg-shell-accent shadow-[0_1px_3px_rgb(15_23_42/0.18)]',
                                variant === 'text' ? 'opacity-85' : 'opacity-100',
                                meta.indicatorClassName
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
});

AnnotationResizeHandles.displayName = 'AnnotationResizeHandles';
