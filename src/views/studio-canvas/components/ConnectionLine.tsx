
import { ConnectionLineComponentProps, getBezierPath } from '@xyflow/react';

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

    return (
        <g>
            <path
                fill="none"
                stroke="rgb(var(--shell-accent) / 1)"
                strokeWidth={2.5}
                className="animated"
                d={edgePath}
                style={{
                    filter: "drop-shadow(0 1px 2px rgb(var(--shell-accent) / 0.2))"
                }}
            />
            <circle
                cx={toX}
                cy={toY}
                fill="rgb(var(--shell-bg) / 1)"
                r={4}
                stroke="rgb(var(--shell-accent) / 1)"
                strokeWidth={2}
            />
        </g>
    );
};
