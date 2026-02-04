
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
                stroke="#2563eb" // Blue-600
                strokeWidth={2.5}
                className="animated"
                d={edgePath}
                style={{
                    filter: "drop-shadow(0 1px 2px rgb(37 99 235 / 0.2))"
                }}
            />
            <circle
                cx={toX}
                cy={toY}
                fill="#fff"
                r={4}
                stroke="#2563eb"
                strokeWidth={2}
            />
        </g>
    );
};
