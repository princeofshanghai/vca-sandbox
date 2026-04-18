import type {
    CanvasRectangleAnnotation,
    CanvasRectangleAnnotationColor,
    CanvasRectangleAnnotationStyle,
} from './types';

export interface RectangleAnnotationColorDefinition {
    label: string;
    swatch: string;
    fill: string;
    border: string;
}

export const DEFAULT_RECTANGLE_ANNOTATION_COLOR: CanvasRectangleAnnotationColor = 'black';

export const RECTANGLE_ANNOTATION_COLOR_ORDER: CanvasRectangleAnnotationColor[] = [
    'black',
    'slate',
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'purple',
    'pink',
];

export const RECTANGLE_ANNOTATION_COLORS: Record<
    CanvasRectangleAnnotationColor,
    RectangleAnnotationColorDefinition
> = {
    black: {
        label: 'Black',
        swatch: '#000000',
        fill: '#000000',
        border: '#000000',
    },
    slate: {
        label: 'Slate',
        swatch: '#94a3b8',
        fill: 'rgba(148, 163, 184, 0.26)',
        border: 'rgba(100, 116, 139, 0.38)',
    },
    red: {
        label: 'Red',
        swatch: '#f97373',
        fill: 'rgba(249, 115, 115, 0.24)',
        border: 'rgba(239, 68, 68, 0.38)',
    },
    orange: {
        label: 'Orange',
        swatch: '#fb923c',
        fill: 'rgba(251, 146, 60, 0.24)',
        border: 'rgba(234, 88, 12, 0.36)',
    },
    yellow: {
        label: 'Yellow',
        swatch: '#facc15',
        fill: 'rgba(250, 204, 21, 0.22)',
        border: 'rgba(202, 138, 4, 0.34)',
    },
    green: {
        label: 'Green',
        swatch: '#4ade80',
        fill: 'rgba(74, 222, 128, 0.22)',
        border: 'rgba(22, 163, 74, 0.36)',
    },
    teal: {
        label: 'Teal',
        swatch: '#5eead4',
        fill: 'rgba(45, 212, 191, 0.22)',
        border: 'rgba(13, 148, 136, 0.34)',
    },
    blue: {
        label: 'Blue',
        swatch: '#60a5fa',
        fill: 'rgba(96, 165, 250, 0.22)',
        border: 'rgba(37, 99, 235, 0.34)',
    },
    purple: {
        label: 'Purple',
        swatch: '#c084fc',
        fill: 'rgba(192, 132, 252, 0.22)',
        border: 'rgba(147, 51, 234, 0.34)',
    },
    pink: {
        label: 'Pink',
        swatch: '#f9a8d4',
        fill: 'rgba(249, 168, 212, 0.24)',
        border: 'rgba(219, 39, 119, 0.34)',
    },
};

const LEGACY_STYLE_TO_COLOR: Record<CanvasRectangleAnnotationStyle, CanvasRectangleAnnotationColor> = {
    outline: DEFAULT_RECTANGLE_ANNOTATION_COLOR,
    soft: DEFAULT_RECTANGLE_ANNOTATION_COLOR,
};

export function resolveRectangleAnnotationColor(
    annotation: Pick<CanvasRectangleAnnotation, 'color' | 'style'>
) {
    if (annotation.color && annotation.color in RECTANGLE_ANNOTATION_COLORS) {
        return annotation.color;
    }

    if (annotation.style && annotation.style in LEGACY_STYLE_TO_COLOR) {
        return LEGACY_STYLE_TO_COLOR[annotation.style];
    }

    return DEFAULT_RECTANGLE_ANNOTATION_COLOR;
}

export function getRectangleAnnotationColorDefinition(
    annotation: Pick<CanvasRectangleAnnotation, 'color' | 'style'>
) {
    return RECTANGLE_ANNOTATION_COLORS[resolveRectangleAnnotationColor(annotation)];
}
