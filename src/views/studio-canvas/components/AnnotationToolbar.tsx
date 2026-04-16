import * as Popover from '@radix-ui/react-popover';
import { NodeToolbar, Position } from '@xyflow/react';
import {
    ArrowDownToLine,
    ArrowUpToLine,
    ChevronDown,
    Trash2,
} from 'lucide-react';
import {
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuTrigger,
    ShellPopoverContent,
} from '@/components/shell';
import { cn } from '@/utils/cn';
import { ActionTooltip } from './ActionTooltip';
import type {
    CanvasAnnotation,
    CanvasRectangleAnnotationColor,
    CanvasTextAnnotationSize,
} from '../../studio/types';
import {
    RECTANGLE_ANNOTATION_COLORS,
    RECTANGLE_ANNOTATION_COLOR_ORDER,
    resolveRectangleAnnotationColor,
} from '../../studio/annotationColors';

interface AnnotationToolbarProps {
    annotation: CanvasAnnotation;
    onTextSizeChange: (size: CanvasTextAnnotationSize) => void;
    onRectangleColorChange: (color: CanvasRectangleAnnotationColor) => void;
    onBringToFront: () => void;
    onSendToBack: () => void;
    onDelete: () => void;
}

const TEXT_SIZE_LABELS: Record<CanvasTextAnnotationSize, string> = {
    sm: 'Small',
    md: 'Medium',
    lg: 'Large',
    xl: 'Extra large',
};

const toolbarButtonClassName =
    'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-shell-muted transition-colors hover:bg-shell-surface hover:text-shell-text';

export function AnnotationToolbar({
    annotation,
    onTextSizeChange,
    onRectangleColorChange,
    onBringToFront,
    onSendToBack,
    onDelete,
}: AnnotationToolbarProps) {
    const rectangleColor = annotation.type === 'rectangle'
        ? RECTANGLE_ANNOTATION_COLORS[resolveRectangleAnnotationColor(annotation)]
        : null;

    return (
        <NodeToolbar
            nodeId={annotation.id}
            isVisible
            position={Position.Top}
            offset={14}
            style={{ zIndex: 220 }}
            data-canvas-shell-zoom-blocker="true"
        >
            <div className="animate-in fade-in zoom-in-98 duration-100 ease-out">
                <div className="flex items-center gap-1 rounded-[18px] border border-shell-border/75 bg-shell-bg/95 px-1.5 py-1 shadow-[0_14px_36px_rgb(15_23_42/0.16)] backdrop-blur-md dark:shadow-[0_16px_36px_rgb(0_0_0/0.34)]">
                    {annotation.type === 'text' ? (
                        <ShellMenu>
                            <ShellMenuTrigger asChild>
                                <button
                                    type="button"
                                    className={toolbarButtonClassName}
                                    onPointerDown={(event) => event.stopPropagation()}
                                >
                                    <span>{TEXT_SIZE_LABELS[annotation.size]}</span>
                                    <ChevronDown size={14} />
                                </button>
                            </ShellMenuTrigger>
                            <ShellMenuContent align="center" sideOffset={8}>
                                {(['sm', 'md', 'lg', 'xl'] as CanvasTextAnnotationSize[]).map((size) => (
                                    <ShellMenuItem
                                        key={size}
                                        onClick={() => onTextSizeChange(size)}
                                        className={cn(annotation.size === size && 'text-shell-text')}
                                    >
                                        {TEXT_SIZE_LABELS[size]}
                                    </ShellMenuItem>
                                ))}
                            </ShellMenuContent>
                        </ShellMenu>
                    ) : (
                        <Popover.Root>
                            <Popover.Trigger asChild>
                                <button
                                    type="button"
                                    className={toolbarButtonClassName}
                                    onPointerDown={(event) => event.stopPropagation()}
                                    aria-label={`Rectangle color: ${rectangleColor?.label || 'Slate'}`}
                                >
                                    <span
                                        className="block h-5 w-5 rounded-full border border-shell-border/70 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]"
                                        style={{
                                            backgroundColor: rectangleColor?.swatch,
                                        }}
                                    />
                                    <ChevronDown size={14} />
                                </button>
                            </Popover.Trigger>
                            <ShellPopoverContent
                                align="start"
                                sideOffset={8}
                                className="w-[212px] rounded-2xl border border-shell-border/80 bg-shell-bg/98 p-3 shadow-[0_20px_48px_rgb(15_23_42/0.18)] backdrop-blur-md"
                                data-canvas-shell-zoom-blocker="true"
                                onPointerDown={(event) => event.stopPropagation()}
                            >
                                <div className="grid grid-cols-5 gap-2">
                                    {RECTANGLE_ANNOTATION_COLOR_ORDER.map((color) => {
                                        const colorDefinition = RECTANGLE_ANNOTATION_COLORS[color];
                                        const isSelected = color === resolveRectangleAnnotationColor(annotation);

                                        return (
                                            <Popover.Close asChild key={color}>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-[1.04] focus-visible:outline-none',
                                                        isSelected
                                                            ? 'ring-2 ring-shell-accent ring-offset-2 ring-offset-shell-bg'
                                                            : 'ring-1 ring-shell-border/60'
                                                    )}
                                                    style={{ backgroundColor: colorDefinition.swatch }}
                                                    onClick={() => onRectangleColorChange(color)}
                                                    aria-label={`Set rectangle color to ${colorDefinition.label}`}
                                                    title={colorDefinition.label}
                                                >
                                                    <span className="sr-only">{colorDefinition.label}</span>
                                                </button>
                                            </Popover.Close>
                                        );
                                    })}
                                </div>
                            </ShellPopoverContent>
                        </Popover.Root>
                    )}

                    <div className="mx-0.5 h-5 w-px bg-shell-border" />

                    <ActionTooltip content="Send to back">
                        <button
                            type="button"
                            className={toolbarButtonClassName}
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={onSendToBack}
                            aria-label="Send annotation to back"
                        >
                            <ArrowDownToLine size={15} />
                        </button>
                    </ActionTooltip>

                    <ActionTooltip content="Bring to front">
                        <button
                            type="button"
                            className={toolbarButtonClassName}
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={onBringToFront}
                            aria-label="Bring annotation to front"
                        >
                            <ArrowUpToLine size={15} />
                        </button>
                    </ActionTooltip>

                    <div className="mx-0.5 h-5 w-px bg-shell-border" />

                    <ActionTooltip content="Delete">
                        <button
                            type="button"
                            className={cn(toolbarButtonClassName, 'text-shell-muted hover:text-red-500')}
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={onDelete}
                            aria-label="Delete annotation"
                        >
                            <Trash2 size={15} />
                        </button>
                    </ActionTooltip>
                </div>
            </div>
        </NodeToolbar>
    );
}
