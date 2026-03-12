import { ConnectionLineComponentProps, getBezierPath, Position } from '@xyflow/react';
import {
    CONNECTION_PREVIEW_CARD_HEIGHT_PX,
    CONNECTION_PREVIEW_CARD_WIDTH_PX,
    CONNECTION_PREVIEW_DRAG_CARD_OFFSET_X_PX
} from './connectionPreviewConstants';

export type ConnectionPreviewVariant = 'neutral' | 'accent' | 'ai' | 'condition';
type ConnectionPreviewTone = 'regular' | 'subtle';

interface ConnectionPreviewGhostProps {
    anchorX: number;
    anchorY: number;
    variant: ConnectionPreviewVariant;
    cardOffsetX: number;
    tone?: ConnectionPreviewTone;
}

interface FrozenConnectionPreviewProps {
    fromX: number;
    fromY: number;
    fromPosition: Position;
    toX: number;
    toY: number;
    toPosition: Position;
    variant: ConnectionPreviewVariant;
}

const getPreviewStyles = (variant: ConnectionPreviewVariant, tone: ConnectionPreviewTone = 'regular') => {
    const subtle = tone === 'subtle';

    if (variant === 'accent') {
        return {
            cardStroke: subtle ? 'rgb(var(--shell-node-user) / 0.58)' : 'rgb(var(--shell-node-user) / 0.85)',
            cardFill: subtle ? 'rgb(var(--shell-node-user) / 0.14)' : 'rgb(var(--shell-node-user) / 0.25)',
            lineStroke: subtle ? 'rgb(var(--shell-muted-strong) / 0.72)' : 'rgb(var(--shell-muted-strong) / 0.92)',
            lineShadow: subtle
                ? 'drop-shadow(0 1px 2px rgb(var(--shell-muted-strong) / 0.14))'
                : 'drop-shadow(0 1px 2px rgb(var(--shell-muted-strong) / 0.22))',
        };
    }

    if (variant === 'ai') {
        return {
            cardStroke: subtle ? 'rgb(var(--shell-accent) / 0.62)' : 'rgb(var(--shell-accent) / 0.88)',
            cardFill: subtle ? 'rgb(var(--shell-accent) / 0.13)' : 'rgb(var(--shell-accent) / 0.22)',
            lineStroke: subtle ? 'rgb(var(--shell-muted-strong) / 0.72)' : 'rgb(var(--shell-muted-strong) / 0.92)',
            lineShadow: subtle
                ? 'drop-shadow(0 1px 2px rgb(var(--shell-muted-strong) / 0.14))'
                : 'drop-shadow(0 1px 2px rgb(var(--shell-muted-strong) / 0.22))',
        };
    }

    if (variant === 'condition') {
        return {
            cardStroke: subtle ? 'rgb(var(--shell-node-condition) / 0.62)' : 'rgb(var(--shell-node-condition) / 0.88)',
            cardFill: subtle ? 'rgb(var(--shell-node-condition) / 0.15)' : 'rgb(var(--shell-node-condition) / 0.24)',
            lineStroke: subtle ? 'rgb(var(--shell-muted-strong) / 0.72)' : 'rgb(var(--shell-muted-strong) / 0.92)',
            lineShadow: subtle
                ? 'drop-shadow(0 1px 2px rgb(var(--shell-muted-strong) / 0.14))'
                : 'drop-shadow(0 1px 2px rgb(var(--shell-muted-strong) / 0.22))',
        };
    }

    return {
        cardStroke: subtle ? 'rgb(var(--shell-muted-strong) / 0.56)' : 'rgb(var(--shell-muted-strong) / 0.94)',
        cardFill: subtle ? 'rgb(var(--shell-muted) / 0.2)' : 'rgb(var(--shell-muted) / 0.38)',
        lineStroke: subtle ? 'rgb(var(--shell-muted-strong) / 0.72)' : 'rgb(var(--shell-muted-strong) / 0.92)',
        lineShadow: subtle
            ? 'drop-shadow(0 1px 2px rgb(var(--shell-muted-strong) / 0.14))'
            : 'drop-shadow(0 1px 2px rgb(var(--shell-muted-strong) / 0.22))',
    };
};

const ConnectionPreviewGhost = ({
    anchorX,
    anchorY,
    variant,
    cardOffsetX,
    tone = 'regular',
}: ConnectionPreviewGhostProps) => {
    const previewWidth = CONNECTION_PREVIEW_CARD_WIDTH_PX;
    const previewHeight = CONNECTION_PREVIEW_CARD_HEIGHT_PX;
    const previewX = anchorX + cardOffsetX;
    const previewY = anchorY - previewHeight / 2;
    const { cardStroke, cardFill, lineStroke } = getPreviewStyles(variant, tone);

    return (
        <g className="pointer-events-none">
            <path
                d={`M ${anchorX + 2} ${anchorY} L ${previewX - 8} ${anchorY}`}
                fill="none"
                stroke={lineStroke}
                strokeOpacity={0.9}
                strokeWidth={2}
                strokeDasharray="6 4"
            >
                <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-20"
                    dur="0.9s"
                    repeatCount="indefinite"
                />
            </path>
            <rect
                x={previewX}
                y={previewY}
                width={previewWidth}
                height={previewHeight}
                rx={12}
                fill={cardFill}
                stroke={cardStroke}
                strokeWidth={2}
                strokeDasharray="7 5"
            />
        </g>
    );
};

export const FrozenConnectionPreview = ({
    fromX,
    fromY,
    fromPosition,
    toX,
    toY,
    toPosition,
    variant,
}: FrozenConnectionPreviewProps) => {
    const [edgePath] = getBezierPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition,
    });

    const { lineStroke, lineShadow } = getPreviewStyles('neutral');

    return (
        <g className="pointer-events-none">
            <path
                fill="none"
                stroke={lineStroke}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                d={edgePath}
                style={{
                    filter: lineShadow
                }}
            >
                <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-22"
                    dur="0.95s"
                    repeatCount="indefinite"
                />
            </path>
            <circle
                cx={toX}
                cy={toY}
                fill="rgb(var(--shell-bg) / 1)"
                r={4}
                stroke={lineStroke}
                strokeWidth={2}
            />
            <ConnectionPreviewGhost
                anchorX={toX}
                anchorY={toY}
                variant={variant}
                cardOffsetX={CONNECTION_PREVIEW_DRAG_CARD_OFFSET_X_PX}
            />
        </g>
    );
};

export const ConnectionLine = ({
    fromX,
    fromY,
    fromPosition,
    toX,
    toY,
    toPosition,
}: ConnectionLineComponentProps) => {
    const [edgePath] = getBezierPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition,
    });

    const lineStroke = 'rgb(var(--shell-muted-strong) / 0.92)';
    const lineShadow = getPreviewStyles('neutral').lineShadow;

    return (
        <g>
            <path
                fill="none"
                stroke={lineStroke}
                strokeWidth={2.5}
                className="animated"
                d={edgePath}
                style={{
                    filter: lineShadow
                }}
            />
            <circle
                cx={toX}
                cy={toY}
                fill="rgb(var(--shell-bg) / 1)"
                r={4}
                stroke={lineStroke}
                strokeWidth={2}
            />
        </g>
    );
};
