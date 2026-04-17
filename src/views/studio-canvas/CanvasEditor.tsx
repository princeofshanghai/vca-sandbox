import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    NodeTypes,
    Node,
    Edge,
    useReactFlow,
    ReactFlowProvider,
    OnConnect,
    OnConnectStart,
    OnConnectEnd,
    ConnectionLineComponentProps,
    MarkerType,
    Position,
    NodeToolbar,
    SelectionMode,
    useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ELK as ElkLayoutEngine, ElkNode } from 'elkjs/lib/elk.bundled.js';
import { TurnNode } from './nodes/TurnNode';
import { UserTurnNode } from './nodes/UserTurnNode';
import { ConditionNode } from './nodes/ConditionNode';
import { StartNode as StartNodeComponent } from './nodes/StartNode';
import { NoteNode } from './nodes/NoteNode';
import { AnnotationTextNode } from './nodes/AnnotationTextNode';
import { AnnotationRectangleNode } from './nodes/AnnotationRectangleNode';
import {
    CanvasAnnotation,
    CanvasRectangleAnnotation,
    CanvasRectangleAnnotationColor,
    CanvasTextAnnotation,
    CanvasTextAnnotationSize,
    Flow,
    Component,
    ComponentType,
    Turn,
    ComponentContent,
    UserTurn,
    Condition,
    Branch,
    Note,
    Step,
    StartNode as StartStep,
    PromptContent,
    SelectionListContent,
    ConfirmationCardContent,
    CheckboxGroupContent,
} from '../studio/types';
import {
    DEFAULT_RECTANGLE_ANNOTATION_COLOR,
    resolveRectangleAnnotationColor,
} from '../studio/annotationColors';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { SelectionState } from './types';
import { FloatingToolbar } from './components/FloatingToolbar';
import { ZoomControls } from './components/ZoomControls';
import { ActionTooltip } from './components/ActionTooltip';
import { AnnotationToolbar } from './components/AnnotationToolbar';
import {
    ConnectionLine,
    FrozenConnectionPreview,
    type ConnectionPreviewVariant
} from './components/ConnectionLine';
import { ConnectionQuickAddMenu, QuickAddNodeType } from './components/ConnectionQuickAddMenu';
import { ShareDialog } from '../studio/components/ShareDialog';
import { ArrowLeft, ChevronDown, Download, ExternalLink, Grid3x3, PanelRightOpen, Play, Split, Square, StickyNote, Type, UserRound } from 'lucide-react';
import {
    ShellButton,
    ShellCoachmark,
    ShellIconButton,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuSeparator,
    ShellMenuTrigger,
    ShellUserAvatar,
} from '@/components/shell';
import { UserMenu } from '@/components/layout/UserMenu';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import type { CommentSurfaceTone } from '@/components/comments/CommentPrimitives';
import {
    CommentThreadHoverPreview,
    COMMENT_THREAD_HOVER_PREVIEW_GAP_PX,
} from '@/components/comments/CommentThreadHoverPreview';
import { cn } from '@/utils/cn';
import { CANVAS_DEFAULT_CURSOR, COMMENT_PLACEMENT_CURSOR } from '@/utils/commentPlacementCursor';
import { toast } from 'sonner';
import { CanvasCommentPopover } from '../studio/CanvasCommentPopover';
import {
    formatCommentDate,
    formatCommentRelativeTime,
    getCanvasCommentAnchor,
    getCanvasCommentStepId,
    getCommentExcerpt,
    getStepCommentLabel,
} from '../studio/canvasComments';
import { DESKTOP_CANVAS_COMMENTS_RESERVED_WIDTH_PX } from '../studio/canvasCommentsLayout';
import { createDefaultConditionBranches } from '../studio/conditionBranches';
import { materializeConditionQuestion } from '../studio/conditionBranchLabels';
import type { CanvasCommentsController } from '../studio/useCanvasCommentsController';
import {
    type FlowCommentCanvasAnchor,
    type FlowCommentThread,
    isFlowCommentCanvasNodeAnchor,
} from '../share/shareComments';
import {
    ShareCommentPin,
    SHARE_COMMENT_PIN_HEAD_CENTER_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_TO_LEFT_EDGE_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_TO_RIGHT_EDGE_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_X_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX,
    SHARE_COMMENT_PIN_WIDTH_PX,
} from '../share/components/ShareCommentPin';
import {
    getAutoUserTurnLabel,
    getAutoUserTurnTextLabel,
    getPrimaryUserTurnTriggerText,
    getVisibleUserTurnLabel,
} from '../studio/userTurnLabels';
import { getAutoConditionLabel, getVisibleConditionLabel } from '../studio/conditionLabels';
import { ShareViewOnlyBadge } from '../share/components/ShareViewOnlyBadge';
import { getStartNodeDisplayLabel, normalizeFlowStartNodes, resolveStartStepId } from '../studio/startNodes';
import { useAuth } from '@/hooks/useAuth';
import { getUserAvatarUrl, getUserInitials } from '@/utils/userIdentity';


// Register custom node types
const nodeTypes: NodeTypes = {
    turn: TurnNode,
    'user-turn': UserTurnNode,
    condition: ConditionNode,
    start: StartNodeComponent,
    note: NoteNode,
    'annotation-text': AnnotationTextNode,
    'annotation-rectangle': AnnotationRectangleNode,
};

// Helper function to create default content for each component type
const getDefaultContent = (type: ComponentType): ComponentContent => {
    switch (type) {
        case 'message':
            return { text: '' };
        case 'prompt':
            return { text: '', showAiIcon: false };
        case 'infoMessage':
            return { title: '', body: '', sources: [], showFeedback: true };
        case 'statusCard':
            return { loadingTitle: '', successTitle: '', successDescription: '' };
        case 'selectionList':
            return {
                layout: 'list',
                items: []
            };
        case 'confirmationCard':
            return {
                item: {
                    id: 'item-1',
                    title: '',
                    subtitle: '',
                    visualType: 'none'
                },
                showActions: false,
                confirmLabel: 'Confirm',
                rejectLabel: 'Cancel'
            };
        case 'checkboxGroup':
            return {
                primaryLabel: 'Select',
                secondaryLabel: 'Cancel',
                options: []
            };
        default: {
            const exhaustiveCheck: never = type;
            throw new Error(`Unhandled component type: ${exhaustiveCheck}`);
        }
    }
};

interface CanvasEditorProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    onBack: () => void;
    backItemLabel?: string;
    onPreview: () => void;
    onPreviewFromTurn?: (turnId: string) => void;
    isPreviewActive?: boolean;
    onToggleComments?: () => void;
    onOpenCommentsPanel?: () => void;
    isCommentModeActive?: boolean;
    isCommentsPanelOpen?: boolean;
    comments?: CanvasCommentsController | null;
    showCommentsToggle?: {
        checked: boolean;
        onCheckedChange: (checked: boolean) => void;
    };
    headerAccessory?: React.ReactNode;
    mode?: 'edit' | 'share-readonly' | 'share-commentable';
    menuActionItems?: Array<{
        label: string;
        onSelect: () => void;
        disabled?: boolean;
    }>;
    useSectionedUserMenu?: boolean;
    onCommentSignIn?: () => void;
    commentSurfaceTone?: CommentSurfaceTone;
    previewCoachmark?: {
        message: string;
        onDismiss: () => void;
    };
}

const QUICK_CONNECT_CLICK_DISTANCE_PX = 6;
const NODE_PASTE_OFFSET_PX = 40;
type ConnectionDropBehavior = 'popover' | 'auto-user-turn';

interface ConnectionGestureState {
    sourceNodeId: string;
    sourceHandleId: string | null;
    startClient: { x: number; y: number };
    sourceCanvasPoint: { x: number; y: number } | null;
    dropBehavior: ConnectionDropBehavior;
}

interface QuickAddMenuState {
    sourceNodeId: string;
    sourceHandleId: string | null;
    screenPosition: { x: number; y: number };
    flowPosition: { x: number; y: number };
}

interface QuickAddConnectionPreviewState {
    fromX: number;
    fromY: number;
    fromPosition: Position;
    toX: number;
    toY: number;
    toPosition: Position;
    variant: ConnectionPreviewVariant;
}

type ToolbarPlacementType = QuickAddNodeType | 'note' | 'start' | 'text' | 'rectangle';

interface PendingToolbarPlacementState {
    type: ToolbarPlacementType;
    canvasPosition: { x: number; y: number } | null;
}

interface AnnotationResizeUpdate {
    position: { x: number; y: number };
    width: number;
    height: number;
}

type CanvasPinPoint = {
    x: number;
    y: number;
};

type ComposerSide = 'left' | 'right';

type ComposerPlacement = {
    left: number;
    top: number;
    side: ComposerSide;
};

type RenderedCanvasCommentPin = {
    thread: FlowCommentThread;
    anchor: FlowCommentCanvasAnchor;
    point: CanvasPinPoint;
};

type CommentDragState = {
    threadId: string;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    movedPx: number;
    originPoint: CanvasPinPoint;
    draftPoint: CanvasPinPoint;
    draftAnchor: FlowCommentCanvasAnchor;
};

type SafariGestureEventLike = Event & {
    clientX?: number;
    clientY?: number;
    scale?: number;
};

const FLOATING_TOOLBAR_SELECTOR = '[data-floating-toolbar="true"]';
const FLOATING_TOOLBAR_GAP_PX = 24;
const FLOATING_TOOLBAR_FALLBACK_BOTTOM_OFFSET_PX = 24;
const FLOATING_TOOLBAR_FALLBACK_HEIGHT_PX = 56;
const TOOLBAR_NODE_PLACEMENT_PADDING_PX = 16;
const TOOLBAR_NODE_INSERT_HORIZONTAL_GAP_PX = 96;
const TOOLBAR_NODE_COLLISION_PADDING_PX = 24;
const TOOLBAR_NODE_COLLISION_MAX_ATTEMPTS = 12;
const TOOLBAR_NODE_ESTIMATED_DIMENSIONS: Record<ToolbarPlacementType, { width: number; height: number }> = {
    start: { width: 220, height: 52 },
    turn: { width: 360, height: 48 },
    'user-turn': { width: 280, height: 64 },
    condition: { width: 280, height: 220 },
    note: { width: 300, height: 112 },
    text: { width: 240, height: 72 },
    rectangle: { width: 240, height: 140 },
};
const ANNOTATION_NODE_Z_INDEX_BASE = 1;
const FLOW_NODE_Z_INDEX_BASE = 100;
const DEFAULT_TEXT_ANNOTATION_SIZE: CanvasTextAnnotationSize = 'lg';
const DEFAULT_TEXT_ANNOTATION_WIDTH = 240;
const SELECTION_ACTION_TOOLBAR_OFFSET_PX = 8;
const AUTO_ORGANIZE_LAYER_SPACING_PX = 104;
const AUTO_ORGANIZE_NODE_SPACING_PX = 48;
const AUTO_ORGANIZE_GRID_COLUMN_GAP_PX = 96;
const AUTO_ORGANIZE_GRID_ROW_GAP_PX = 48;

const COMMENT_POPUP_EDGE_PADDING_PX = 12;
const COMMENT_POPUP_NEW_WIDTH_PX = 320;
const COMMENT_POPUP_THREAD_WIDTH_PX = 360;
const COMMENT_POPUP_NEW_HEIGHT_PX = 72;
const COMMENT_POPUP_THREAD_HEIGHT_PX = 380;
const COMMENT_POPUP_GAP_PX = 8;
const COMMENT_DRAG_THRESHOLD_PX = 5;
const CANVAS_SHELL_ZOOM_BLOCKER_SELECTOR = '[data-canvas-shell-zoom-blocker="true"]';
const TITLE_PILL_COLLAPSED_MAX_WIDTH_PX = 320;
const TITLE_PILL_EXPANDED_MAX_WIDTH_PX = 560;
const TITLE_PILL_VIEWPORT_EDGE_PADDING_PX = 16;
const TITLE_PILL_ACTION_GAP_PX = 24;

const clampValue = (value: number, min: number, max: number) => {
    if (max < min) return min;
    return Math.min(Math.max(value, min), max);
};

const getCanvasTextAnnotationWidth = (annotation: Pick<CanvasTextAnnotation, 'text' | 'width'>) => (
    annotation.width ?? Math.min(Math.max((annotation.text.trim().length || 8) * 18, 120), 320)
);

const getRectBounds = <T extends { x: number; y: number; width: number; height: number }>(items: T[]) => {
    if (items.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    items.forEach((item) => {
        minX = Math.min(minX, item.x);
        minY = Math.min(minY, item.y);
        maxX = Math.max(maxX, item.x + item.width);
        maxY = Math.max(maxY, item.y + item.height);
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
};

const getAnchoredPopoverPosition = ({
    surfaceRect,
    anchor,
    popoverWidth,
    popoverHeight,
    gapPx = COMMENT_POPUP_GAP_PX,
    anchorOffsetYPx = 0,
    anchorClearanceLeftPx = 0,
    anchorClearanceRightPx = 0,
}: {
    surfaceRect: DOMRect;
    anchor: CanvasPinPoint;
    popoverWidth: number;
    popoverHeight: number;
    gapPx?: number;
    anchorOffsetYPx?: number;
    anchorClearanceLeftPx?: number;
    anchorClearanceRightPx?: number;
}): ComposerPlacement => {
    const availableRight = surfaceRect.width - anchor.x;
    const availableLeft = anchor.x;
    const side: ComposerSide =
        availableRight >= popoverWidth + gapPx + anchorClearanceRightPx ||
        availableRight >= availableLeft
            ? 'right'
            : 'left';

    const left =
        side === 'right'
            ? clampValue(
                anchor.x + anchorClearanceRightPx + gapPx,
                COMMENT_POPUP_EDGE_PADDING_PX,
                surfaceRect.width - popoverWidth - COMMENT_POPUP_EDGE_PADDING_PX
            )
            : clampValue(
                anchor.x - anchorClearanceLeftPx - gapPx - popoverWidth,
                COMMENT_POPUP_EDGE_PADDING_PX,
                surfaceRect.width - popoverWidth - COMMENT_POPUP_EDGE_PADDING_PX
            );

    const top = clampValue(
        anchor.y + anchorOffsetYPx - popoverHeight / 2,
        COMMENT_POPUP_EDGE_PADDING_PX,
        surfaceRect.height - popoverHeight - COMMENT_POPUP_EDGE_PADDING_PX
    );

    return { left, top, side };
};

const getToolbarPlacementPreviewConfig = (type: ToolbarPlacementType): {
    label: string;
    borderClassName: string;
    surfaceClassName: string;
    icon: React.ReactNode;
} => {
    switch (type) {
        case 'turn':
            return {
                label: 'AI Turn',
                borderClassName: 'border-shell-accent',
                surfaceClassName: 'bg-[rgb(var(--shell-node-ai-surface)/0.96)]',
                icon: <VcaIcon icon="signal-ai" size="md" className="text-shell-accent" />,
            };
        case 'start':
            return {
                label: 'Start',
                borderClassName: 'border-[rgb(var(--shell-node-start)/1)]',
                surfaceClassName: 'bg-[rgb(var(--shell-node-start-surface)/0.96)]',
                icon: <Play className="fill-current text-[rgb(var(--shell-node-start)/1)]" size={18} />,
            };
        case 'user-turn':
            return {
                label: 'User Turn',
                borderClassName: 'border-shell-node-user',
                surfaceClassName: 'bg-[rgb(var(--shell-node-user-surface)/0.96)]',
                icon: <UserRound className="text-shell-node-user" size={18} />,
            };
        case 'condition':
            return {
                label: 'Condition',
                borderClassName: 'border-shell-node-condition',
                surfaceClassName: 'bg-[rgb(var(--shell-node-condition-surface)/0.96)]',
                icon: <Split className="text-shell-node-condition" size={18} />,
            };
        case 'note':
            return {
                label: 'Sticky Note',
                borderClassName: 'border-shell-node-note',
                surfaceClassName: 'bg-[rgb(var(--shell-node-note)/0.14)]',
                icon: <StickyNote className="text-shell-node-note" size={18} fill="currentColor" />,
            };
        case 'text':
            return {
                label: 'Text',
                borderClassName: 'border-shell-border',
                surfaceClassName: 'bg-shell-bg/95',
                icon: <Type className="text-shell-text" size={18} />,
            };
        case 'rectangle':
            return {
                label: 'Rectangle',
                borderClassName: 'border-[rgba(100,116,139,0.38)]',
                surfaceClassName: 'bg-[rgba(148,163,184,0.26)]',
                icon: <Square className="text-shell-text" size={18} />,
            };
    }
};

const getClientPositionFromPointerEvent = (
    event: MouseEvent | TouchEvent
): { x: number; y: number } | null => {
    if ('touches' in event) {
        const touch = event.touches[0] ?? event.changedTouches[0];
        if (!touch) return null;
        return { x: touch.clientX, y: touch.clientY };
    }

    return { x: event.clientX, y: event.clientY };
};

const getQuickAddPreviewVariant = (type: QuickAddNodeType | null): ConnectionPreviewVariant => {
    if (type === 'user-turn') return 'accent';
    if (type === 'turn') return 'ai';
    if (type === 'condition') return 'condition';
    return 'neutral';
};

type ClipboardNodeStep = Turn | UserTurn | Condition | Note | StartStep;
type CanvasClipboardPayload =
    | { type: 'node'; step: ClipboardNodeStep; pasteCount: number }
    | { type: 'nodes'; steps: ClipboardNodeStep[]; pasteCount: number }
    | { type: 'component'; component: Component }
    | { type: 'components'; components: Component[] }
    | { type: 'branch'; branch: Branch };
type SharedCanvasClipboardRecord = {
    version: 1;
    copiedAt: number;
    sourceFlowId: string;
    payload: CanvasClipboardPayload;
};

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const SHARED_CANVAS_CLIPBOARD_STORAGE_KEY = 'studio-canvas:clipboard:v1';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isClipboardNodeStep = (value: unknown): value is ClipboardNodeStep => {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.type !== 'string') {
        return false;
    }

    switch (value.type) {
        case 'turn':
            return Array.isArray(value.components);
        case 'user-turn':
            return typeof value.label === 'string' && typeof value.inputType === 'string';
        case 'condition':
            return Array.isArray(value.branches);
        case 'start':
            return typeof value.label === 'string';
        case 'note':
            return typeof value.content === 'string';
        default:
            return false;
    }
};

const isClipboardComponent = (value: unknown): value is Component =>
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    'content' in value;

const isClipboardBranch = (value: unknown): value is Branch =>
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.condition === 'string';

const isCanvasClipboardPayload = (value: unknown): value is CanvasClipboardPayload => {
    if (!isRecord(value) || typeof value.type !== 'string') {
        return false;
    }

    switch (value.type) {
        case 'node':
            return isClipboardNodeStep(value.step) && typeof value.pasteCount === 'number';
        case 'nodes':
            return Array.isArray(value.steps) &&
                value.steps.every(isClipboardNodeStep) &&
                typeof value.pasteCount === 'number';
        case 'component':
            return isClipboardComponent(value.component);
        case 'components':
            return Array.isArray(value.components) && value.components.every(isClipboardComponent);
        case 'branch':
            return isClipboardBranch(value.branch);
        default:
            return false;
    }
};

const readSharedCanvasClipboard = (): CanvasClipboardPayload | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const rawClipboard = window.localStorage.getItem(SHARED_CANVAS_CLIPBOARD_STORAGE_KEY);
        if (!rawClipboard) {
            return null;
        }

        const parsedClipboard: unknown = JSON.parse(rawClipboard);
        if (!isRecord(parsedClipboard) || parsedClipboard.version !== 1 || !isCanvasClipboardPayload(parsedClipboard.payload)) {
            return null;
        }

        return parsedClipboard.payload;
    } catch {
        return null;
    }
};

const writeSharedCanvasClipboard = (sourceFlowId: string, payload: CanvasClipboardPayload): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const record: SharedCanvasClipboardRecord = {
            version: 1,
            copiedAt: Date.now(),
            sourceFlowId,
            payload,
        };
        window.localStorage.setItem(SHARED_CANVAS_CLIPBOARD_STORAGE_KEY, JSON.stringify(record));
    } catch (error) {
        console.warn('Failed to persist shared canvas clipboard.', error);
    }
};

type LabelableNodeType = ClipboardNodeStep['type'];

const COPY_SUFFIX_PATTERN = /^(.*) \(Copy(?: (\d+))?\)$/i;
const DEFAULT_NODE_LABELS: Record<LabelableNodeType, string> = {
    start: 'Flow',
    turn: 'AI Turn',
    'user-turn': 'User Turn',
    condition: 'Condition',
    note: 'Sticky note',
};

const normalizeNodeLabel = (label: string): string => label.trim().toLowerCase();

const getDefaultNodeLabel = (type: LabelableNodeType): string => DEFAULT_NODE_LABELS[type];

const getNodeLabelsForType = (steps: Step[], type: LabelableNodeType): string[] =>
    steps.reduce<string[]>((labels, step) => {
        if (step.type !== type) {
            return labels;
        }

        const label = 'label' in step ? step.label?.trim() || '' : '';
        if (label) {
            labels.push(label);
        }

        return labels;
    }, []);

const getNextFreshNodeLabel = (type: LabelableNodeType, steps: Step[]): string => {
    const baseLabel = getDefaultNodeLabel(type);
    const existingLabels = new Set(getNodeLabelsForType(steps, type).map(normalizeNodeLabel));
    let labelIndex = 1;

    while (existingLabels.has(normalizeNodeLabel(`${baseLabel} ${labelIndex}`))) {
        labelIndex += 1;
    }

    return `${baseLabel} ${labelIndex}`;
};

const getDuplicateBaseLabel = (label: string): string => {
    const trimmedLabel = label.trim();
    const copyPatternMatch = trimmedLabel.match(COPY_SUFFIX_PATTERN);
    if (!copyPatternMatch?.[1]) {
        return trimmedLabel;
    }

    return copyPatternMatch[1].trim() || trimmedLabel;
};

const getNextDuplicateNodeLabel = (
    type: LabelableNodeType,
    label: string | undefined,
    steps: Step[]
): string => {
    const baseLabel = getDuplicateBaseLabel(label?.trim() ? label.trim() : getDefaultNodeLabel(type));
    const existingLabels = new Set(getNodeLabelsForType(steps, type).map(normalizeNodeLabel));
    const firstDuplicateLabel = `${baseLabel} (Copy)`;

    if (!existingLabels.has(normalizeNodeLabel(firstDuplicateLabel))) {
        return firstDuplicateLabel;
    }

    let copyIndex = 2;
    while (existingLabels.has(normalizeNodeLabel(`${baseLabel} (Copy ${copyIndex})`))) {
        copyIndex += 1;
    }

    return `${baseLabel} (Copy ${copyIndex})`;
};

type ConnectedUserTurnSource = {
    text: string;
};

const getConnectedUserTurnSource = (flow: Flow, userTurnId: string): ConnectedUserTurnSource | null => {
    const connection = (flow.connections || []).find((candidate) =>
        candidate.target === userTurnId && Boolean(candidate.sourceHandle?.startsWith('handle-'))
    );
    if (!connection?.sourceHandle) {
        return null;
    }

    const sourceStep = flow.steps?.find((step): step is Turn =>
        step.id === connection.source && step.type === 'turn'
    );
    if (!sourceStep) {
        return null;
    }

    const handleId = connection.sourceHandle;
    const sourceComponent = sourceStep.components.find((component) => handleId.includes(component.id));
    if (!sourceComponent) {
        return null;
    }

    if (sourceComponent.type === 'prompt') {
        const promptText = (sourceComponent.content as PromptContent).text?.trim() || '';
        return { text: promptText };
    }

    if (sourceComponent.type === 'selectionList') {
        const listContent = sourceComponent.content as SelectionListContent;
        const itemId = handleId.split(`${sourceComponent.id}-`)[1];
        const item = listContent.items.find((candidate) => candidate.id === itemId);
        const buttonText = item?.title?.trim() || '';
        return { text: buttonText };
    }

    if (sourceComponent.type === 'confirmationCard') {
        const confirmationContent = sourceComponent.content as ConfirmationCardContent;
        if (confirmationContent.showActions === false) {
            return null;
        }

        const actionId = handleId.split(`${sourceComponent.id}-`)[1];
        const buttonText = (
            actionId === 'reject'
                ? confirmationContent.rejectLabel || 'Cancel'
                : confirmationContent.confirmLabel || 'Confirm'
        ).trim();
        return { text: buttonText };
    }

    if (sourceComponent.type === 'checkboxGroup') {
        const checkboxContent = sourceComponent.content as CheckboxGroupContent;
        const isSecondaryAction = handleId.endsWith('-secondary');
        const buttonText = (
            isSecondaryAction
                ? checkboxContent.secondaryLabel || checkboxContent.cancelLabel || 'Cancel'
                : checkboxContent.primaryLabel || checkboxContent.saveLabel || 'Save'
        ).trim();
        return { text: buttonText };
    }

    return null;
};

const syncAutoManagedUserTurns = (flow: Flow): Flow => {
    const currentSteps = flow.steps || [];
    if (currentSteps.length === 0) {
        return flow;
    }

    let didChange = false;
    const nextSteps = currentSteps.map((step) => {
        if (step.type !== 'user-turn') {
            return step;
        }

        const connectedSource = getConnectedUserTurnSource(flow, step.id);
        const nextInputType: UserTurn['inputType'] = connectedSource ? 'button' : 'text';
        const nextTriggerValue = connectedSource
            ? (connectedSource.text || undefined)
            : step.inputType === 'text'
                ? step.triggerValue
                : undefined;
        const normalizedLabelMode = step.labelMode ?? 'auto';
        const textTrigger = nextInputType === 'text'
            ? getPrimaryUserTurnTriggerText(nextTriggerValue)
            : '';
        const nextAutoLabel = normalizedLabelMode === 'custom'
            ? step.autoLabel
            : connectedSource
                ? connectedSource.text
                    ? getAutoUserTurnLabel(connectedSource.text)
                    : undefined
                : nextInputType === 'text'
                    ? (textTrigger ? getAutoUserTurnTextLabel(textTrigger) : undefined)
                    : step.autoLabel;

        if (
            step.inputType === nextInputType &&
            step.triggerValue === nextTriggerValue &&
            step.labelMode === normalizedLabelMode &&
            step.autoLabel === nextAutoLabel
        ) {
            return step;
        }

        didChange = true;
        return {
            ...step,
            inputType: nextInputType,
            triggerValue: nextTriggerValue,
            labelMode: normalizedLabelMode,
            autoLabel: nextAutoLabel,
        };
    });

    if (!didChange) {
        return flow;
    }

    return {
        ...flow,
        steps: nextSteps,
    };
};

const syncAutoManagedConditions = (flow: Flow): Flow => {
    const currentSteps = flow.steps || [];
    if (currentSteps.length === 0) {
        return flow;
    }

    let didChange = false;
    const nextSteps = currentSteps.map((step) => {
        if (step.type !== 'condition') {
            return step;
        }

        const normalizedLabelMode = step.labelMode ?? 'auto';
        const questionText = step.question?.trim() || '';
        const nextAutoLabel = normalizedLabelMode === 'custom'
            ? step.autoLabel
            : (questionText ? getAutoConditionLabel(questionText) : undefined);

        if (
            step.labelMode === normalizedLabelMode &&
            step.autoLabel === nextAutoLabel
        ) {
            return step;
        }

        didChange = true;
        return {
            ...step,
            labelMode: normalizedLabelMode,
            autoLabel: nextAutoLabel,
        };
    });

    if (!didChange) {
        return flow;
    }

    return {
        ...flow,
        steps: nextSteps,
    };
};

const cloneComponentForPaste = (component: Component): Component => ({
    ...cloneValue(component),
    id: `component-${crypto.randomUUID()}`,
});

const cloneBranchForPaste = (branch: Branch): Branch => ({
    ...cloneValue(branch),
    id: `branch-${crypto.randomUUID()}`,
});

const cloneNodeStepForPaste = (
    step: ClipboardNodeStep,
    pasteCount: number,
    existingSteps: Step[]
): ClipboardNodeStep => {
    const offset = NODE_PASTE_OFFSET_PX * Math.max(1, pasteCount);

    if (step.type === 'start') {
        const clonedStep = cloneValue(step);
        return {
            ...clonedStep,
            id: crypto.randomUUID(),
            label: getNextDuplicateNodeLabel('start', clonedStep.label, existingSteps),
            position: {
                x: (clonedStep.position?.x ?? 250) + offset,
                y: (clonedStep.position?.y ?? 0) + offset,
            },
        };
    }

    if (step.type === 'turn') {
        const clonedStep = cloneValue(step);
        return {
            ...clonedStep,
            id: crypto.randomUUID(),
            label: getNextDuplicateNodeLabel('turn', clonedStep.label, existingSteps),
            position: {
                x: (clonedStep.position?.x ?? 250) + offset,
                y: (clonedStep.position?.y ?? 0) + offset,
            },
            components: clonedStep.components.map((component) => ({
                ...component,
                id: `component-${crypto.randomUUID()}`,
            })),
        };
    }

    if (step.type === 'condition') {
        const clonedStep = cloneValue(step);
        return {
            ...clonedStep,
            id: crypto.randomUUID(),
            label: getNextDuplicateNodeLabel('condition', getVisibleConditionLabel(clonedStep), existingSteps),
            autoLabel: undefined,
            labelMode: clonedStep.labelMode ?? 'auto',
            question: materializeConditionQuestion(clonedStep.question, clonedStep.label),
            position: {
                x: (clonedStep.position?.x ?? 250) + offset,
                y: (clonedStep.position?.y ?? 0) + offset,
            },
            branches: clonedStep.branches.map((branch) => ({
                ...branch,
                id: `branch-${crypto.randomUUID()}`,
            })),
        };
    }

    if (step.type === 'user-turn') {
        const clonedStep = cloneValue(step);
        return {
            ...clonedStep,
            id: crypto.randomUUID(),
            label: getNextDuplicateNodeLabel('user-turn', getVisibleUserTurnLabel(clonedStep), existingSteps),
            autoLabel: undefined,
            labelMode: clonedStep.labelMode ?? 'auto',
            position: {
                x: (clonedStep.position?.x ?? 250) + offset,
                y: (clonedStep.position?.y ?? 0) + offset,
            },
        };
    }

    const clonedStep = cloneValue(step);
    return {
        ...clonedStep,
        id: crypto.randomUUID(),
        label: getNextDuplicateNodeLabel('note', clonedStep.label, existingSteps),
        position: {
            x: (clonedStep.position?.x ?? 250) + offset,
            y: (clonedStep.position?.y ?? 0) + offset,
        },
    };
};

const cloneNodeStepsForPaste = (
    steps: ClipboardNodeStep[],
    pasteCount: number,
    existingSteps: Step[]
): ClipboardNodeStep[] =>
    steps.reduce<ClipboardNodeStep[]>((nextSteps, step) => {
        const clonedStep = cloneNodeStepForPaste(step, pasteCount, [...existingSteps, ...nextSteps]);
        nextSteps.push(clonedStep);
        return nextSteps;
    }, []);

const getDisplayCardActionHandleIds = (componentId: string): string[] => [
    `handle-${componentId}-confirm`,
    `handle-${componentId}-reject`,
];

const areStringArraysEqual = (left: string[] | undefined, right: string[] | undefined): boolean => {
    if (left === right) {
        return true;
    }
    if (!left || !right || left.length !== right.length) {
        return false;
    }
    return left.every((value, index) => value === right[index]);
};

const getSingleSelectedNodeId = (selection: SelectionState | null): string | null => {
    if (!selection) {
        return null;
    }

    if (selection.type === 'node') {
        return selection.nodeId;
    }

    if (selection.type === 'nodes' && selection.nodeIds.length === 1) {
        return selection.nodeIds[0];
    }

    return null;
};

const getSelectionNodeIds = (selection: SelectionState | null): string[] => {
    if (!selection) {
        return [];
    }

    if (selection.type === 'node') {
        return [selection.nodeId];
    }

    if (selection.type === 'nodes') {
        return selection.nodeIds;
    }

    return [selection.nodeId];
};

export function CanvasEditor(props: CanvasEditorProps) {
    return (
        <ReactFlowProvider>
            <CanvasEditorInner {...props} />
        </ReactFlowProvider>
    );
}

function CanvasEditorInner({
    flow,
    onUpdateFlow,
    onBack,
    backItemLabel,
    onPreview,
    onPreviewFromTurn,
    isPreviewActive,
    onToggleComments,
    onOpenCommentsPanel,
    isCommentModeActive: isCommentModeActiveProp = false,
    isCommentsPanelOpen = false,
    comments = null,
    showCommentsToggle,
    headerAccessory,
    mode = 'edit',
    menuActionItems = [],
    useSectionedUserMenu = false,
    onCommentSignIn,
    commentSurfaceTone = 'default',
    previewCoachmark,
}: CanvasEditorProps) {
    const { screenToFlowPosition, setCenter, getViewport, setViewport, getNodesBounds } = useReactFlow();
    const viewport = useViewport();
    const { user, isLoading: isAuthLoading } = useAuth();
    const canvasAreaRef = useRef<HTMLDivElement | null>(null);
    const commentPopoverRef = useRef<HTMLDivElement | null>(null);
    const leftHeaderPillRef = useRef<HTMLDivElement | null>(null);
    const rightHeaderPillRef = useRef<HTMLDivElement | null>(null);
    const titleShellRef = useRef<HTMLDivElement | null>(null);
    const suppressNextCommentPlacementRef = useRef(false);
    const suppressCommentPlacementUntilRef = useRef(0);
    const suppressCommentClickRef = useRef<{ threadId: string; expiresAt: number } | null>(null);
    const isFlowReadOnly = mode !== 'edit';
    const usesStudioMenuTrigger = mode !== 'share-readonly';
    const canPlaceComments = mode !== 'share-readonly';
    const isCommentModeActive = canPlaceComments && isCommentModeActiveProp;
    const floatingToolbarVariant = mode === 'share-commentable' ? 'comments-only' : 'full';
    const [isAltPressed, setIsAltPressed] = useState(false);
    const usesSelectionBoxInBrowseMode = mode === 'edit' || mode === 'share-commentable';
    const selectionOnDragEnabled = usesSelectionBoxInBrowseMode && !isCommentModeActive;
    const panOnDragEnabled =
        mode === 'share-readonly' || isCommentModeActive || (!isFlowReadOnly && isAltPressed);
    const areCommentsVisible = !!comments;
    const isSignedIn = Boolean(user?.email);
    const userEmail = user?.email ?? '';
    const userAvatarUrl = getUserAvatarUrl(user);
    const userInitials = getUserInitials(user);

    // Selection state
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [editingTextAnnotationId, setEditingTextAnnotationId] = useState<string | null>(null);
    const [pendingReactFlowSelectedNodeIds, setPendingReactFlowSelectedNodeIds] = useState<string[] | null>(null);
    const [isSelectionLayoutPending, setIsSelectionLayoutPending] = useState(false);
    const [isSelectionGestureActive, setIsSelectionGestureActive] = useState(false);
    const [isPreviewMenuOpen, setIsPreviewMenuOpen] = useState(false);
    const [isTitleHovered, setIsTitleHovered] = useState(false);
    const [isTitleFocused, setIsTitleFocused] = useState(false);
    const [isTitlePinnedOpen, setIsTitlePinnedOpen] = useState(false);
    const [expandedTitleMaxWidth, setExpandedTitleMaxWidth] = useState(TITLE_PILL_COLLAPSED_MAX_WIDTH_PX);
    const [pendingAutoOpenComponent, setPendingAutoOpenComponent] = useState<{
        nodeId: string;
        componentId: string;
    } | null>(null);

    const selectionRef = useRef<SelectionState | null>(selection);
    const previewAnnotationResizeRef = useRef<(annotationId: string, nextBounds: AnnotationResizeUpdate) => void>(() => {});
    const flowRef = useRef(flow);
    const elkRef = useRef<ElkLayoutEngine | null>(null);
    const elkLoadPromiseRef = useRef<Promise<ElkLayoutEngine> | null>(null);
    const clipboardRef = useRef<CanvasClipboardPayload | null>(null);
    const connectionGestureRef = useRef<ConnectionGestureState | null>(null);
    const lastCanvasPointerClientRef = useRef<{ x: number; y: number } | null>(null);
    const isCanvasPointerInsideRef = useRef(false);
    const [quickAddMenu, setQuickAddMenu] = useState<QuickAddMenuState | null>(null);
    const [quickAddConnectionPreview, setQuickAddConnectionPreview] = useState<QuickAddConnectionPreviewState | null>(null);
    const [pendingToolbarPlacement, setPendingToolbarPlacement] = useState<PendingToolbarPlacementState | null>(null);
    const [commentDragState, setCommentDragState] = useState<CommentDragState | null>(null);
    const [commentComposerPlacement, setCommentComposerPlacement] = useState<ComposerPlacement | null>(null);
    const [renderedCommentPins, setRenderedCommentPins] = useState<RenderedCanvasCommentPin[]>([]);
    const [pendingCommentPoint, setPendingCommentPoint] = useState<CanvasPinPoint | null>(null);
    const pinchGestureStateRef = useRef<{
        startZoom: number;
        anchorFlowPoint: { x: number; y: number };
        clientX: number;
        clientY: number;
    } | null>(null);

    const applyCanvasPinchZoom = useCallback((
        anchorFlowPoint: { x: number; y: number },
        clientX: number,
        clientY: number,
        rawZoom: number
    ) => {
        const reactFlowRect =
            canvasAreaRef.current?.querySelector<HTMLElement>('.react-flow')?.getBoundingClientRect()
            ?? canvasAreaRef.current?.getBoundingClientRect();

        if (!reactFlowRect) return;

        const nextZoom = Math.min(2, Math.max(0.1, rawZoom));
        const pointerX = clientX - reactFlowRect.left;
        const pointerY = clientY - reactFlowRect.top;

        void setViewport({
            x: pointerX - anchorFlowPoint.x * nextZoom,
            y: pointerY - anchorFlowPoint.y * nextZoom,
            zoom: nextZoom,
        });
    }, [setViewport]);

    const titleText = flow.title || 'Untitled flow';
    const isTitleExpanded = isTitleHovered || isTitleFocused || isTitlePinnedOpen;
    const titleSlotMaxWidth = isTitleExpanded ? expandedTitleMaxWidth : TITLE_PILL_COLLAPSED_MAX_WIDTH_PX;

    const updateExpandedTitleMaxWidth = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const titleShell = titleShellRef.current;
        if (!titleShell) {
            return;
        }

        const titleRect = titleShell.getBoundingClientRect();
        const rightHeaderRect = rightHeaderPillRef.current?.getBoundingClientRect();
        const viewportAvailableWidth = window.innerWidth - titleRect.left - TITLE_PILL_VIEWPORT_EDGE_PADDING_PX;
        const headerGapAvailableWidth = rightHeaderRect
            ? rightHeaderRect.left - titleRect.left - TITLE_PILL_ACTION_GAP_PX
            : viewportAvailableWidth;
        const nextExpandedWidth = Math.min(
            TITLE_PILL_EXPANDED_MAX_WIDTH_PX,
            viewportAvailableWidth,
            headerGapAvailableWidth
        );

        setExpandedTitleMaxWidth(Math.max(TITLE_PILL_COLLAPSED_MAX_WIDTH_PX, Math.floor(nextExpandedWidth)));
    }, []);

    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (!event.ctrlKey) return;

            const target = event.target as HTMLElement | null;
            if (target?.closest(CANVAS_SHELL_ZOOM_BLOCKER_SELECTOR)) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            if (!target || !canvasAreaRef.current?.contains(target)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const currentViewport = getViewport();
            const anchorFlowPoint = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Match React Flow's underlying d3 zoom feel so pinching on overlays
            // behaves the same way as pinching directly on the canvas.
            const wheelDelta =
                -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * 10;
            const nextZoom = currentViewport.zoom * Math.pow(2, wheelDelta);

            if (Math.abs(nextZoom - currentViewport.zoom) < 0.0001) return;

            applyCanvasPinchZoom(anchorFlowPoint, event.clientX, event.clientY, nextZoom);
        };

        const handleGestureStart = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest(CANVAS_SHELL_ZOOM_BLOCKER_SELECTOR)) {
                event.preventDefault();
                event.stopPropagation();
                pinchGestureStateRef.current = null;
                return;
            }

            if (!target || !canvasAreaRef.current?.contains(target)) {
                return;
            }

            const gestureEvent = event as SafariGestureEventLike;
            const clientX = gestureEvent.clientX ?? 0;
            const clientY = gestureEvent.clientY ?? 0;

            event.preventDefault();
            event.stopPropagation();

            pinchGestureStateRef.current = {
                startZoom: getViewport().zoom,
                anchorFlowPoint: screenToFlowPosition({ x: clientX, y: clientY }),
                clientX,
                clientY,
            };
        };

        const handleGestureChange = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest(CANVAS_SHELL_ZOOM_BLOCKER_SELECTOR)) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            if (!target || !canvasAreaRef.current?.contains(target)) {
                return;
            }

            const gestureState = pinchGestureStateRef.current;
            if (!gestureState) return;

            const gestureEvent = event as SafariGestureEventLike;
            const clientX = gestureEvent.clientX ?? gestureState.clientX;
            const clientY = gestureEvent.clientY ?? gestureState.clientY;
            const scale = typeof gestureEvent.scale === 'number' ? gestureEvent.scale : 1;

            event.preventDefault();
            event.stopPropagation();

            applyCanvasPinchZoom(
                gestureState.anchorFlowPoint,
                clientX,
                clientY,
                gestureState.startZoom * scale
            );
        };

        const handleGestureEnd = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (
                target?.closest(CANVAS_SHELL_ZOOM_BLOCKER_SELECTOR) ||
                (target && canvasAreaRef.current?.contains(target))
            ) {
                event.preventDefault();
                event.stopPropagation();
            }

            pinchGestureStateRef.current = null;
        };

        document.addEventListener('wheel', handleWheel, { capture: true, passive: false });
        document.addEventListener('gesturestart', handleGestureStart, { capture: true, passive: false });
        document.addEventListener('gesturechange', handleGestureChange, { capture: true, passive: false });
        document.addEventListener('gestureend', handleGestureEnd, { capture: true, passive: false });

        return () => {
            document.removeEventListener('wheel', handleWheel, true);
            document.removeEventListener('gesturestart', handleGestureStart, true);
            document.removeEventListener('gesturechange', handleGestureChange, true);
            document.removeEventListener('gestureend', handleGestureEnd, true);
        };
    }, [applyCanvasPinchZoom, getViewport, screenToFlowPosition]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        updateExpandedTitleMaxWidth();

        const handleResize = () => {
            updateExpandedTitleMaxWidth();
        };

        const resizeObserver = typeof ResizeObserver === 'undefined'
            ? null
            : new ResizeObserver(() => {
                updateExpandedTitleMaxWidth();
            });

        if (resizeObserver) {
            if (leftHeaderPillRef.current) resizeObserver.observe(leftHeaderPillRef.current);
            if (rightHeaderPillRef.current) resizeObserver.observe(rightHeaderPillRef.current);
            if (titleShellRef.current) resizeObserver.observe(titleShellRef.current);
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver?.disconnect();
        };
    }, [titleText, updateExpandedTitleMaxWidth]);

    useEffect(() => {
        if (isFlowReadOnly) {
            return;
        }

        setIsTitlePinnedOpen(false);
    }, [isFlowReadOnly]);

    useEffect(() => {
        if (!isTitlePinnedOpen) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as globalThis.Node | null;
            if (target && titleShellRef.current?.contains(target)) {
                return;
            }

            setIsTitlePinnedOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            setIsTitlePinnedOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isTitlePinnedOpen]);

    const applyFlowUpdate = useCallback((nextFlow: Flow) => {
        if (isFlowReadOnly) return;
        onUpdateFlow(normalizeFlowStartNodes(syncAutoManagedConditions(syncAutoManagedUserTurns(nextFlow))));
    }, [isFlowReadOnly, onUpdateFlow]);

    useEffect(() => {
        if (!isFlowReadOnly) return;
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
        setPendingToolbarPlacement(null);
    }, [isFlowReadOnly]);

    useEffect(() => {
        selectionRef.current = selection;
    }, [selection]);

    const setCanvasSelection = useCallback((nextSelection: SelectionState | null) => {
        const nextSelectedNodeId = getSingleSelectedNodeId(nextSelection);

        setEditingTextAnnotationId((currentId) => {
            if (!currentId) {
                return currentId;
            }

            return nextSelectedNodeId === currentId ? currentId : null;
        });

        selectionRef.current = nextSelection;
        setSelection(nextSelection);
    }, []);

    const getElkEngine = useCallback(async () => {
        if (elkRef.current) {
            return elkRef.current;
        }

        if (!elkLoadPromiseRef.current) {
            elkLoadPromiseRef.current = import('elkjs/lib/elk.bundled.js').then((module) => {
                const ElkConstructor = module.default;
                const instance = new ElkConstructor();
                elkRef.current = instance;
                return instance;
            });
        }

        return elkLoadPromiseRef.current;
    }, []);

    const multiSelectedNodeIds = useMemo(
        () => selection?.type === 'nodes' ? selection.nodeIds : [],
        [selection]
    );
    const selectedNodeId = useMemo(() => getSingleSelectedNodeId(selection), [selection]);
    const selectedStepIdSet = useMemo(
        () => new Set((flow.steps || []).map((step) => step.id)),
        [flow.steps]
    );
    const selectedAnnotation = useMemo(
        () => (flow.annotations || []).find((annotation) => annotation.id === selectedNodeId) || null,
        [flow.annotations, selectedNodeId]
    );
    const selectedStepNodeIds = useMemo(
        () => multiSelectedNodeIds.filter((nodeId) => selectedStepIdSet.has(nodeId)),
        [multiSelectedNodeIds, selectedStepIdSet]
    );
    const showSelectionAutoOrganizeAction =
        !isFlowReadOnly &&
        !isCommentModeActive &&
        !isSelectionGestureActive &&
        multiSelectedNodeIds.length > 1 &&
        selectedStepNodeIds.length === multiSelectedNodeIds.length;

    useEffect(() => {
        if (isFlowReadOnly) {
            setEditingTextAnnotationId(null);
        }
    }, [isFlowReadOnly]);

    useEffect(() => {
        flowRef.current = flow;
    }, [flow]);

    const setActiveClipboard = useCallback((nextClipboard: CanvasClipboardPayload) => {
        clipboardRef.current = nextClipboard;
        writeSharedCanvasClipboard(flowRef.current.id, nextClipboard);
    }, []);

    const getActiveClipboard = useCallback((): CanvasClipboardPayload | null => {
        const sharedClipboard = readSharedCanvasClipboard();
        if (sharedClipboard) {
            clipboardRef.current = sharedClipboard;
            return sharedClipboard;
        }

        return clipboardRef.current;
    }, []);

    const getCanvasPositionFromClient = useCallback((client: { x: number; y: number }) => {
        const canvasRect = canvasAreaRef.current?.getBoundingClientRect();
        if (!canvasRect) return null;

        const isInsideCanvas = (
            client.x >= canvasRect.left &&
            client.x <= canvasRect.right &&
            client.y >= canvasRect.top &&
            client.y <= canvasRect.bottom
        );

        if (!isInsideCanvas) return null;

        return {
            x: client.x - canvasRect.left,
            y: client.y - canvasRect.top,
        };
    }, []);

    const getCanvasPointFromClient = useCallback((clientX: number, clientY: number): CanvasPinPoint | null => {
        const canvasRect = canvasAreaRef.current?.getBoundingClientRect();
        if (!canvasRect) return null;

        return {
            x: clientX - canvasRect.left,
            y: clientY - canvasRect.top,
        };
    }, []);

    const getFreeAnchorFromClient = useCallback((clientX: number, clientY: number) => {
        const worldPoint = screenToFlowPosition({ x: clientX, y: clientY });
        const point = getCanvasPointFromClient(clientX, clientY);
        if (!point) return null;

        return {
            anchor: {
                anchorMode: 'canvas' as const,
                anchorKind: 'feedback' as const,
                canvasAnchorType: 'free' as const,
                anchorCanvasX: Number(worldPoint.x.toFixed(2)),
                anchorCanvasY: Number(worldPoint.y.toFixed(2)),
            },
            point,
        };
    }, [getCanvasPointFromClient, screenToFlowPosition]);

    const resolveCanvasPointForAnchor = useCallback((anchor: FlowCommentCanvasAnchor): CanvasPinPoint | null => {
        if (isFlowCommentCanvasNodeAnchor(anchor)) {
            const canvasRect = canvasAreaRef.current?.getBoundingClientRect();
            const nodeEl = document.getElementById(`node-${anchor.anchorStepId}`);
            if (!canvasRect || !nodeEl) return null;

            const nodeRect = nodeEl.getBoundingClientRect();
            if (nodeRect.width <= 0 || nodeRect.height <= 0) return null;

            return {
                x: nodeRect.left - canvasRect.left + (nodeRect.width * anchor.anchorLocalX) / 100,
                y: nodeRect.top - canvasRect.top + (nodeRect.height * anchor.anchorLocalY) / 100,
            };
        }

        return {
            x: viewport.x + anchor.anchorCanvasX * viewport.zoom,
            y: viewport.y + anchor.anchorCanvasY * viewport.zoom,
        };
    }, [viewport.x, viewport.y, viewport.zoom]);

    const focusNodeSelection = useCallback((nodeId: string, options?: { enterTextEditMode?: boolean }) => {
        let attempts = 0;
        const maxAttempts = 24;

        const syncSelectionToNode = () => {
            const nodeEl = document.getElementById(`node-${nodeId}`) as HTMLElement | null;
            if (nodeEl || attempts >= maxAttempts) {
                setCanvasSelection({ type: 'node', nodeId });
                setPendingReactFlowSelectedNodeIds([nodeId]);
                if (options?.enterTextEditMode) {
                    setEditingTextAnnotationId(nodeId);
                }
                return;
            }

            attempts += 1;
            requestAnimationFrame(syncSelectionToNode);
        };

        requestAnimationFrame(syncSelectionToNode);
    }, [setCanvasSelection]);

    const getSelectedToolbarAnchorStepId = useCallback(() => {
        const currentSelection = selectionRef.current;
        if (!currentSelection) return null;

        if (currentSelection.type === 'node') {
            return currentSelection.nodeId;
        }

        if (currentSelection.type === 'nodes') {
            return currentSelection.nodeIds.length === 1 ? currentSelection.nodeIds[0] : null;
        }

        return currentSelection.nodeId;
    }, []);

    const getEstimatedStepDimensions = useCallback((step: Step) => {
        switch (step.type) {
            case 'start':
                return TOOLBAR_NODE_ESTIMATED_DIMENSIONS.start;
            case 'turn':
                return TOOLBAR_NODE_ESTIMATED_DIMENSIONS.turn;
            case 'user-turn':
                return TOOLBAR_NODE_ESTIMATED_DIMENSIONS['user-turn'];
            case 'condition':
                return TOOLBAR_NODE_ESTIMATED_DIMENSIONS.condition;
            case 'note':
                return TOOLBAR_NODE_ESTIMATED_DIMENSIONS.note;
            default: {
                const exhaustiveCheck: never = step;
                return exhaustiveCheck;
            }
        }
    }, []);

    const getRenderedStepSize = useCallback((step: Step) => {
        const fallbackSize = getEstimatedStepDimensions(step);
        const nodeEl = document.getElementById(`node-${step.id}`);
        const nodeRect = nodeEl?.getBoundingClientRect();

        if (!nodeRect || nodeRect.width <= 0 || nodeRect.height <= 0 || viewport.zoom <= 0) {
            return fallbackSize;
        }

        return {
            width: nodeRect.width / viewport.zoom,
            height: nodeRect.height / viewport.zoom,
        };
    }, [getEstimatedStepDimensions, viewport.zoom]);

    const getPlacementBoundsForStep = useCallback((step: Step) => {
        const size = getRenderedStepSize(step);
        const position = step.position ?? { x: 250, y: 0 };

        return {
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
        };
    }, [getRenderedStepSize]);

    const getFallbackSelectionLayout = useCallback((selectedSteps: Step[]) => {
        const orderedSteps = [...selectedSteps]
            .map((step) => ({
                id: step.id,
                ...(getPlacementBoundsForStep(step)),
            }))
            .sort((left, right) => left.x - right.x || left.y - right.y);

        if (orderedSteps.length === 0) {
            return [];
        }

        const columnCount = Math.max(1, Math.ceil(Math.sqrt(orderedSteps.length)));
        let cursorX = 0;
        let cursorY = 0;
        let currentRowHeight = 0;

        return orderedSteps.map((step, index) => {
            const layout = {
                id: step.id,
                x: cursorX,
                y: cursorY,
                width: step.width,
                height: step.height,
            };

            currentRowHeight = Math.max(currentRowHeight, step.height);
            const isRowEnd = (index + 1) % columnCount === 0;

            if (isRowEnd) {
                cursorX = 0;
                cursorY += currentRowHeight + AUTO_ORGANIZE_GRID_ROW_GAP_PX;
                currentRowHeight = 0;
            } else {
                cursorX += step.width + AUTO_ORGANIZE_GRID_COLUMN_GAP_PX;
            }

            return layout;
        });
    }, [getPlacementBoundsForStep]);

    const handleAutoOrganizeSelection = useCallback(async () => {
        if (isFlowReadOnly || isSelectionLayoutPending) {
            return;
        }

        const currentSelection = selectionRef.current;
        if (currentSelection?.type !== 'nodes' || currentSelection.nodeIds.length < 2) {
            return;
        }

        const currentFlow = flowRef.current;
        const flowSteps = currentFlow.steps || [];
        const selectedNodeIds = [...currentSelection.nodeIds];
        const selectedStepIdSet = new Set(selectedNodeIds);
        const selectedSteps = flowSteps
            .filter((step) => selectedStepIdSet.has(step.id))
            .sort((left, right) => {
                const leftPosition = left.position ?? { x: 250, y: 0 };
                const rightPosition = right.position ?? { x: 250, y: 0 };
                return leftPosition.x - rightPosition.x || leftPosition.y - rightPosition.y;
            });

        if (selectedSteps.length < 2) {
            return;
        }

        const selectionBounds = getNodesBounds(selectedNodeIds);
        const internalConnections = (currentFlow.connections || []).filter((connection) => (
            selectedStepIdSet.has(connection.source) &&
            selectedStepIdSet.has(connection.target) &&
            connection.source !== connection.target
        ));

        setIsSelectionLayoutPending(true);

        try {
            let nextLayout = getFallbackSelectionLayout(selectedSteps);

            if (internalConnections.length > 0) {
                const elkEngine = await getElkEngine();
                const elkGraph: ElkNode = {
                    id: 'selection-layout-root',
                    layoutOptions: {
                        'elk.algorithm': 'layered',
                        'elk.direction': 'RIGHT',
                        'elk.layered.spacing.nodeNodeBetweenLayers': String(AUTO_ORGANIZE_LAYER_SPACING_PX),
                        'elk.spacing.nodeNode': String(AUTO_ORGANIZE_NODE_SPACING_PX),
                        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
                        'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
                        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
                    },
                    children: selectedSteps.map((step) => {
                        const size = getRenderedStepSize(step);
                        return {
                            id: step.id,
                            width: size.width,
                            height: size.height,
                        };
                    }),
                    edges: internalConnections.map((connection) => ({
                        id: connection.id,
                        sources: [connection.source],
                        targets: [connection.target],
                    })),
                };

                const elkLayout = await elkEngine.layout(elkGraph);
                const laidOutChildren = elkLayout.children?.map((child: ElkNode) => ({
                    id: child.id,
                    x: child.x ?? 0,
                    y: child.y ?? 0,
                    width: child.width ?? 0,
                    height: child.height ?? 0,
                })) ?? [];

                if (laidOutChildren.length === selectedSteps.length) {
                    nextLayout = laidOutChildren;
                }
            }

            if (nextLayout.length === 0) {
                return;
            }

            const nextLayoutBounds = getRectBounds(nextLayout);
            const offsetX = selectionBounds.x - nextLayoutBounds.x;
            const offsetY = selectionBounds.y - nextLayoutBounds.y;
            const nextPositions = new Map(
                nextLayout.map((node) => [
                    node.id,
                    {
                        x: Math.round(node.x + offsetX),
                        y: Math.round(node.y + offsetY),
                    },
                ])
            );

            const latestFlow = flowRef.current;
            const latestSteps = latestFlow.steps || [];
            let didChange = false;
            const updatedSteps = latestSteps.map((step) => {
                const nextPosition = nextPositions.get(step.id);
                if (!nextPosition) {
                    return step;
                }

                const currentPosition = step.position ?? { x: 250, y: 0 };
                if (
                    Math.abs(currentPosition.x - nextPosition.x) < 1 &&
                    Math.abs(currentPosition.y - nextPosition.y) < 1
                ) {
                    return step;
                }

                didChange = true;
                return {
                    ...step,
                    position: nextPosition,
                };
            });

            if (!didChange) {
                return;
            }

            applyFlowUpdate({
                ...latestFlow,
                steps: updatedSteps,
                lastModified: Date.now(),
            });
            setPendingReactFlowSelectedNodeIds(selectedNodeIds);
        } catch (error) {
            console.error('Failed to organize selection', error);
            toast("Couldn't organize selection");
        } finally {
            setIsSelectionLayoutPending(false);
        }
    }, [
        applyFlowUpdate,
        getFallbackSelectionLayout,
        getElkEngine,
        getNodesBounds,
        getRenderedStepSize,
        isFlowReadOnly,
        isSelectionLayoutPending,
    ]);

    const getToolbarPlacementInputOffset = useCallback((type: ToolbarPlacementType) => {
        const size = TOOLBAR_NODE_ESTIMATED_DIMENSIONS[type];
        if (type === 'turn') {
            return size.height / 2;
        }
        if (type === 'user-turn') {
            return size.height / 2;
        }
        if (type === 'condition') {
            return size.height / 2;
        }
        return size.height / 2;
    }, []);

    const getStepPrimaryOutputOffset = useCallback((step: Step, bounds: { height: number }) => {
        if (step.type === 'turn') {
            return step.components.length > 0 ? 19 : bounds.height / 2;
        }

        return bounds.height / 2;
    }, []);

    const findNonOverlappingToolbarPlacement = useCallback(({
        initialPosition,
        targetType,
        excludedStepIds,
    }: {
        initialPosition: { x: number; y: number };
        targetType: ToolbarPlacementType;
        excludedStepIds?: string[];
    }) => {
        const targetSize = TOOLBAR_NODE_ESTIMATED_DIMENSIONS[targetType];
        const currentSteps = flowRef.current.steps || [];
        const excludedIds = new Set(excludedStepIds || []);
        const occupiedBounds = currentSteps
            .filter((step) => !excludedIds.has(step.id))
            .map((step) => getPlacementBoundsForStep(step));

        let candidate = {
            x: Math.round(initialPosition.x),
            y: Math.round(initialPosition.y),
        };

        for (let attempt = 0; attempt < TOOLBAR_NODE_COLLISION_MAX_ATTEMPTS; attempt += 1) {
            const collision = occupiedBounds.find((bounds) => (
                candidate.x < bounds.x + bounds.width + TOOLBAR_NODE_COLLISION_PADDING_PX &&
                candidate.x + targetSize.width + TOOLBAR_NODE_COLLISION_PADDING_PX > bounds.x &&
                candidate.y < bounds.y + bounds.height + TOOLBAR_NODE_COLLISION_PADDING_PX &&
                candidate.y + targetSize.height + TOOLBAR_NODE_COLLISION_PADDING_PX > bounds.y
            ));

            if (!collision) {
                return candidate;
            }

            candidate = {
                x: candidate.x,
                y: Math.round(collision.y + collision.height + TOOLBAR_NODE_COLLISION_PADDING_PX),
            };
        }

        return candidate;
    }, [getPlacementBoundsForStep]);

    const createToolbarNodeAtPosition = useCallback((type: ToolbarPlacementType, position: { x: number; y: number }) => {
        const currentFlow = flowRef.current;
        const currentSteps = currentFlow.steps || [];

        if (type === 'start') {
            const newStartNode: StartStep = {
                id: crypto.randomUUID(),
                type: 'start',
                label: getNextFreshNodeLabel('start', currentSteps),
                position,
            };

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, newStartNode],
                startStepId: currentFlow.startStepId || newStartNode.id,
                lastModified: Date.now(),
            });
            focusNodeSelection(newStartNode.id);
            return;
        }

        if (type === 'turn') {
            const newTurn: Turn = {
                id: crypto.randomUUID(),
                type: 'turn',
                speaker: 'ai',
                label: getNextFreshNodeLabel('turn', currentSteps),
                components: [],
                position,
            };

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, newTurn],
                lastModified: Date.now(),
            });
            focusNodeSelection(newTurn.id);
            return;
        }

        if (type === 'user-turn') {
            const newUserTurn: UserTurn = {
                id: crypto.randomUUID(),
                type: 'user-turn',
                label: getNextFreshNodeLabel('user-turn', currentSteps),
                labelMode: 'auto',
                inputType: 'text',
                position,
            };

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, newUserTurn],
                lastModified: Date.now(),
            });
            focusNodeSelection(newUserTurn.id);
            return;
        }

        if (type === 'condition') {
            const newCondition: Condition = {
                id: crypto.randomUUID(),
                type: 'condition',
                label: getNextFreshNodeLabel('condition', currentSteps),
                labelMode: 'auto',
                question: '',
                branches: createDefaultConditionBranches(),
                position,
            };

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, newCondition],
                lastModified: Date.now(),
            });
            focusNodeSelection(newCondition.id);
            return;
        }

        if (type === 'text') {
            const newTextAnnotation: CanvasTextAnnotation = {
                id: crypto.randomUUID(),
                type: 'text',
                text: '',
                size: DEFAULT_TEXT_ANNOTATION_SIZE,
                width: DEFAULT_TEXT_ANNOTATION_WIDTH,
                position,
            };

            applyFlowUpdate({
                ...currentFlow,
                annotations: [...(currentFlow.annotations || []), newTextAnnotation],
                lastModified: Date.now(),
            });
            focusNodeSelection(newTextAnnotation.id, { enterTextEditMode: true });
            return;
        }

        if (type === 'rectangle') {
            const newRectangleAnnotation: CanvasRectangleAnnotation = {
                id: crypto.randomUUID(),
                type: 'rectangle',
                position,
                width: TOOLBAR_NODE_ESTIMATED_DIMENSIONS.rectangle.width,
                height: TOOLBAR_NODE_ESTIMATED_DIMENSIONS.rectangle.height,
                color: DEFAULT_RECTANGLE_ANNOTATION_COLOR,
            };

            applyFlowUpdate({
                ...currentFlow,
                annotations: [...(currentFlow.annotations || []), newRectangleAnnotation],
                lastModified: Date.now(),
            });
            focusNodeSelection(newRectangleAnnotation.id);
            return;
        }

        const newNote: Note = {
            id: crypto.randomUUID(),
            type: 'note',
            label: getNextFreshNodeLabel('note', currentSteps),
            content: '',
            position,
        };

        applyFlowUpdate({
            ...currentFlow,
            steps: [...currentSteps, newNote],
            lastModified: Date.now(),
        });
        focusNodeSelection(newNote.id);
    }, [applyFlowUpdate, focusNodeSelection]);

    const getFloatingToolbarFallbackPlacement = useCallback((type: ToolbarPlacementType) => {
        const canvasRect = canvasAreaRef.current?.getBoundingClientRect();
        if (!canvasRect) {
            const fallbackSteps = flowRef.current.steps?.length || 0;
            return { x: 100, y: 100 + fallbackSteps * 50 };
        }

        const toolbarRect = canvasAreaRef.current
            ?.querySelector<HTMLElement>(FLOATING_TOOLBAR_SELECTOR)
            ?.getBoundingClientRect();
        const estimatedNodeSize = TOOLBAR_NODE_ESTIMATED_DIMENSIONS[type];
        const toolbarTop = toolbarRect?.top
            ?? (canvasRect.bottom - FLOATING_TOOLBAR_FALLBACK_BOTTOM_OFFSET_PX - FLOATING_TOOLBAR_FALLBACK_HEIGHT_PX);
        const maxLeft = Math.max(
            canvasRect.left + TOOLBAR_NODE_PLACEMENT_PADDING_PX,
            canvasRect.right - estimatedNodeSize.width - TOOLBAR_NODE_PLACEMENT_PADDING_PX
        );
        const maxTop = Math.max(
            canvasRect.top + TOOLBAR_NODE_PLACEMENT_PADDING_PX,
            canvasRect.bottom - estimatedNodeSize.height - TOOLBAR_NODE_PLACEMENT_PADDING_PX
        );

        const left = Math.min(
            Math.max(
                canvasRect.left + ((canvasRect.width - estimatedNodeSize.width) / 2),
                canvasRect.left + TOOLBAR_NODE_PLACEMENT_PADDING_PX
            ),
            maxLeft
        );
        const top = Math.min(
            Math.max(
                toolbarTop - FLOATING_TOOLBAR_GAP_PX - estimatedNodeSize.height,
                canvasRect.top + TOOLBAR_NODE_PLACEMENT_PADDING_PX
            ),
            maxTop
        );

        return screenToFlowPosition({ x: left, y: top });
    }, [screenToFlowPosition]);

    const getFloatingToolbarNodePlacement = useCallback((type: ToolbarPlacementType) => {
        const anchorStepId = getSelectedToolbarAnchorStepId();
        if (!anchorStepId) {
            return getFloatingToolbarFallbackPlacement(type);
        }

        const anchorStep = flowRef.current.steps?.find((step) => step.id === anchorStepId);
        if (!anchorStep || !anchorStep.position) {
            return getFloatingToolbarFallbackPlacement(type);
        }

        const anchorBounds = getPlacementBoundsForStep(anchorStep);
        const targetInputOffset = getToolbarPlacementInputOffset(type);
        const anchorOutputOffset = getStepPrimaryOutputOffset(anchorStep, anchorBounds);

        const initialPosition = {
            x: anchorBounds.x + anchorBounds.width + TOOLBAR_NODE_INSERT_HORIZONTAL_GAP_PX,
            y: anchorStep.position.y + anchorOutputOffset - targetInputOffset,
        };

        return findNonOverlappingToolbarPlacement({
            initialPosition,
            targetType: type,
            excludedStepIds: [anchorStep.id],
        });
    }, [
        findNonOverlappingToolbarPlacement,
        getFloatingToolbarFallbackPlacement,
        getPlacementBoundsForStep,
        getSelectedToolbarAnchorStepId,
        getStepPrimaryOutputOffset,
        getToolbarPlacementInputOffset,
    ]);

    const updatePendingToolbarPlacementPreview = useCallback((client: { x: number; y: number }) => {
        lastCanvasPointerClientRef.current = client;

        setPendingToolbarPlacement((current) => {
            if (!current) {
                return current;
            }

            const nextCanvasPosition = getCanvasPositionFromClient(client);
            const currentCanvasPosition = current.canvasPosition;

            if (!nextCanvasPosition && !currentCanvasPosition) {
                return current;
            }

            if (
                nextCanvasPosition &&
                currentCanvasPosition &&
                Math.abs(nextCanvasPosition.x - currentCanvasPosition.x) < 0.5 &&
                Math.abs(nextCanvasPosition.y - currentCanvasPosition.y) < 0.5
            ) {
                return current;
            }

            return {
                ...current,
                canvasPosition: nextCanvasPosition,
            };
        });
    }, [getCanvasPositionFromClient]);

    const cancelPendingToolbarPlacement = useCallback(() => {
        setPendingToolbarPlacement(null);
    }, []);

    const armPendingToolbarPlacement = useCallback((type: ToolbarPlacementType) => {
        if (isFlowReadOnly) return;

        const initialCanvasPosition = (
            isCanvasPointerInsideRef.current && lastCanvasPointerClientRef.current
        )
            ? getCanvasPositionFromClient(lastCanvasPointerClientRef.current)
            : null;

        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
        setPendingToolbarPlacement({ type, canvasPosition: initialCanvasPosition });
    }, [getCanvasPositionFromClient, isFlowReadOnly]);

    const placePendingToolbarPlacementAtClient = useCallback((client: { x: number; y: number }) => {
        if (!pendingToolbarPlacement) return false;

        const canvasPosition = getCanvasPositionFromClient(client);
        if (!canvasPosition) return false;

        createToolbarNodeAtPosition(pendingToolbarPlacement.type, screenToFlowPosition(client));
        setPendingToolbarPlacement(null);
        return true;
    }, [createToolbarNodeAtPosition, getCanvasPositionFromClient, pendingToolbarPlacement, screenToFlowPosition]);

    useEffect(() => {
        if (isFlowReadOnly) return;

        const canvasEl = canvasAreaRef.current;
        if (!canvasEl) return;

        const handlePointerMove = (event: PointerEvent) => {
            isCanvasPointerInsideRef.current = true;
            updatePendingToolbarPlacementPreview({ x: event.clientX, y: event.clientY });
        };

        const handlePointerLeave = () => {
            isCanvasPointerInsideRef.current = false;
            setPendingToolbarPlacement((current) => current ? { ...current, canvasPosition: null } : current);
        };

        const handlePointerEnter = (event: PointerEvent) => {
            isCanvasPointerInsideRef.current = true;
            updatePendingToolbarPlacementPreview({ x: event.clientX, y: event.clientY });
        };

        canvasEl.addEventListener('pointermove', handlePointerMove, true);
        canvasEl.addEventListener('pointerleave', handlePointerLeave, true);
        canvasEl.addEventListener('pointerenter', handlePointerEnter, true);

        return () => {
            canvasEl.removeEventListener('pointermove', handlePointerMove, true);
            canvasEl.removeEventListener('pointerleave', handlePointerLeave, true);
            canvasEl.removeEventListener('pointerenter', handlePointerEnter, true);
        };
    }, [isFlowReadOnly, updatePendingToolbarPlacementPreview]);

    // Export/Import handlers
    const handleExportJSON = () => {
        // Create clean JSON export
        const exportData = {
            version: 1,
            id: flow.id,
            title: flow.title,
            description: flow.description,
            settings: flow.settings,
            steps: flow.steps,
            connections: flow.connections,
            metadata: {
                exportedAt: new Date().toISOString(),
                exportedBy: 'VCA Sandbox Studio',
            }
        };

        // Convert to JSON string
        const jsonString = JSON.stringify(exportData, null, 2);

        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename: flow-title-YYYY-MM-DD.json
        const date = new Date().toISOString().split('T')[0];
        const safeTitle = (flow.title || 'untitled-flow').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        link.download = `${safeTitle}-${date}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDeselect = useCallback(() => {
        setCanvasSelection(null);
        setPendingReactFlowSelectedNodeIds([]);
        setEditingTextAnnotationId(null);
    }, [setCanvasSelection]);

    useEffect(() => {
        if (!isCommentModeActive) return;
        handleDeselect();
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
        setPendingToolbarPlacement(null);
    }, [handleDeselect, isCommentModeActive]);

    const handleSelectComponent = useCallback((
        nodeId: string,
        componentId: string,
        _anchorEl: HTMLElement,
        options?: { appendToSelection?: boolean }
    ) => {
        if (options?.appendToSelection) {
            const currentSelection = selectionRef.current;

            if (currentSelection?.type === 'components' && currentSelection.nodeId === nodeId) {
                const nextComponentIds = currentSelection.componentIds.includes(componentId)
                    ? currentSelection.componentIds.filter((id) => id !== componentId)
                    : [...currentSelection.componentIds, componentId];

                setCanvasSelection(
                    nextComponentIds.length === 0
                        ? null
                        : { type: 'components', nodeId, componentIds: nextComponentIds }
                );
            } else if (currentSelection?.type === 'component' && currentSelection.nodeId === nodeId) {
                const nextComponentIds = currentSelection.componentId === componentId
                    ? []
                    : [currentSelection.componentId, componentId];

                setCanvasSelection(
                    nextComponentIds.length === 0
                        ? null
                        : { type: 'components', nodeId, componentIds: nextComponentIds }
                );
            } else {
                setCanvasSelection({ type: 'components', nodeId, componentIds: [componentId] });
            }
        } else {
            // Keep card selection sticky so Delete consistently targets the card.
            setCanvasSelection({ type: 'component', nodeId, componentId });
        }

        setPendingReactFlowSelectedNodeIds([]);
    }, [setCanvasSelection]);

    const handleTurnLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'turn'
                ? { ...s, label: newLabel }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [applyFlowUpdate]);

    const handleDeleteTurnComponent = useCallback((nodeId: string, componentId: string) => {
        const currentFlow = flowRef.current;
        const currentSelection = selectionRef.current;

        if (!currentFlow.steps) return;

        const updatedSteps = currentFlow.steps.map((step) =>
            step.id === nodeId && step.type === 'turn'
                ? { ...step, components: step.components.filter((component) => component.id !== componentId) }
                : step
        );

        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });

        const shouldClearSelection =
            (currentSelection?.type === 'component' &&
                currentSelection.nodeId === nodeId &&
                currentSelection.componentId === componentId) ||
            (currentSelection?.type === 'components' &&
                currentSelection.nodeId === nodeId &&
                currentSelection.componentIds.includes(componentId));

        if (shouldClearSelection) {
            handleDeselect();
        }
    }, [applyFlowUpdate, handleDeselect]);

    const handleTurnComponentUpdate = useCallback((nodeId: string, componentId: string, updates: Partial<Component>) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const sourceTurn = currentFlow.steps.find(
            (step): step is Turn => step.id === nodeId && step.type === 'turn'
        );
        const previousComponent = sourceTurn?.components.find((component) => component.id === componentId) ?? null;
        const nextComponent = previousComponent ? { ...previousComponent, ...updates } : null;

        const updatedSteps = currentFlow.steps.map(s => {
            if (s.id === nodeId && s.type === 'turn') {
                return {
                    ...s,
                    components: s.components.map(c =>
                        c.id === componentId && nextComponent
                            ? nextComponent
                            : c
                    )
                };
            }
            return s;
        });

        let updatedConnections = currentFlow.connections;
        if (
            previousComponent?.type === 'confirmationCard' &&
            nextComponent?.type === 'confirmationCard'
        ) {
            const previousContent = previousComponent.content as import('../studio/types').ConfirmationCardContent;
            const nextContent = nextComponent.content as import('../studio/types').ConfirmationCardContent;
            const turnedDisplayOnly = (previousContent.showActions ?? true) && nextContent.showActions === false;

            if (turnedDisplayOnly && currentFlow.connections?.length) {
                const disabledHandleIds = new Set(getDisplayCardActionHandleIds(componentId));
                updatedConnections = currentFlow.connections.filter((connection) =>
                    !(connection.source === nodeId && disabledHandleIds.has(connection.sourceHandle || ''))
                );
            }
        }

        applyFlowUpdate({
            ...currentFlow,
            steps: updatedSteps,
            connections: updatedConnections,
            lastModified: Date.now()
        });
    }, [applyFlowUpdate]);

    const handleTurnComponentReorder = useCallback((nodeId: string, activeComponentId: string, overComponentId: string) => {
        if (activeComponentId === overComponentId) return;

        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;

        let didReorder = false;
        const updatedSteps = currentFlow.steps.map((step) => {
            if (step.id !== nodeId || step.type !== 'turn') {
                return step;
            }

            const oldIndex = step.components.findIndex((component) => component.id === activeComponentId);
            const newIndex = step.components.findIndex((component) => component.id === overComponentId);

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                return step;
            }

            const reorderedComponents = [...step.components];
            const [movedComponent] = reorderedComponents.splice(oldIndex, 1);
            reorderedComponents.splice(newIndex, 0, movedComponent);
            didReorder = true;

            return {
                ...step,
                components: reorderedComponents
            };
        });

        if (!didReorder) return;

        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [applyFlowUpdate]);

    const handleUserTurnUpdate = useCallback((nodeId: string, updates: Partial<UserTurn>) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'user-turn'
                ? { ...s, ...updates }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [applyFlowUpdate]);

    const handleStartNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;

        const trimmedLabel = newLabel.trim();
        if (!trimmedLabel) {
            return;
        }

        const updatedSteps = currentFlow.steps.map((step) =>
            step.id === nodeId && step.type === 'start'
                ? { ...step, label: trimmedLabel }
                : step
        );

        applyFlowUpdate({
            ...currentFlow,
            steps: updatedSteps,
            lastModified: Date.now(),
        });
    }, [applyFlowUpdate]);

    const handleSetDefaultStartNode = useCallback((nodeId: string) => {
        const currentFlow = flowRef.current;
        applyFlowUpdate({
            ...currentFlow,
            startStepId: nodeId,
            lastModified: Date.now(),
        });
    }, [applyFlowUpdate]);

    const deleteNodesFromFlow = useCallback((nodeIds: string[]) => {
        if (nodeIds.length === 0) {
            return;
        }

        const currentFlow = flowRef.current;
        const deletedIds = new Set(nodeIds);
        const startNodes = (currentFlow.steps || []).filter((step): step is StartStep => step.type === 'start');
        const deletedStartNodes = startNodes.filter((startNode) => deletedIds.has(startNode.id));

        if (startNodes.length > 0 && startNodes.length - deletedStartNodes.length < 1) {
            const preservedStartId = resolveStartStepId(currentFlow) || startNodes[0].id;
            deletedIds.delete(preservedStartId);
            toast('Keep at least one flow entry');
        }

        if (deletedIds.size === 0) {
            return;
        }

        const updatedSteps = (currentFlow.steps || []).filter((step) => !deletedIds.has(step.id));
        const updatedAnnotations = (currentFlow.annotations || []).filter((annotation) => !deletedIds.has(annotation.id));
        const updatedConnections = (currentFlow.connections || []).filter(
            (connection) => !deletedIds.has(connection.source) && !deletedIds.has(connection.target)
        );
        const nextStartStepId = resolveStartStepId({
            steps: updatedSteps,
            startStepId: deletedIds.has(currentFlow.startStepId || '') ? undefined : currentFlow.startStepId,
        });

        applyFlowUpdate({
            ...currentFlow,
            steps: updatedSteps,
            annotations: updatedAnnotations,
            connections: updatedConnections,
            startStepId: nextStartStepId || undefined,
            lastModified: Date.now(),
        });

        const currentSelection = selectionRef.current;
        if (getSelectionNodeIds(currentSelection).some((nodeId) => deletedIds.has(nodeId))) {
            handleDeselect();
        }
    }, [applyFlowUpdate, handleDeselect]);

    const handleDeleteFlowNode = useCallback((nodeId: string) => {
        deleteNodesFromFlow([nodeId]);
    }, [deleteNodesFromFlow]);

    const handleConditionLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'condition'
                ? {
                    ...s,
                    label: newLabel,
                    labelMode: 'custom' as const,
                    autoLabel: undefined,
                    question: materializeConditionQuestion(s.question, s.label),
                }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [applyFlowUpdate]);

    const handleConditionQuestionChange = useCallback((nodeId: string, newQuestion: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'condition'
                ? { ...s, question: newQuestion }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [applyFlowUpdate]);

    const handleConditionUpdateBranches = useCallback((nodeId: string, branches: Branch[]) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'condition'
                ? { ...s, branches }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [applyFlowUpdate]);

    const handleNoteLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'note'
                ? { ...s, label: newLabel }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [applyFlowUpdate]);

    const handleNoteContentChange = useCallback((nodeId: string, newContent: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'note'
                ? { ...s, content: newContent }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [applyFlowUpdate]);

    const updateAnnotations = useCallback((updater: (annotations: CanvasAnnotation[]) => CanvasAnnotation[]) => {
        const currentFlow = flowRef.current;
        const currentAnnotations = currentFlow.annotations || [];
        const nextAnnotations = updater(currentAnnotations);

        applyFlowUpdate({
            ...currentFlow,
            annotations: nextAnnotations,
            lastModified: Date.now(),
        });
    }, [applyFlowUpdate]);

    const handleAnnotationTextChange = useCallback((annotationId: string, text: string) => {
        const currentFlow = flowRef.current;
        const currentAnnotations = currentFlow.annotations || [];
        const currentAnnotation = currentAnnotations.find((annotation) => (
            annotation.id === annotationId && annotation.type === 'text'
        ));

        if (!currentAnnotation || currentAnnotation.type !== 'text') {
            return;
        }

        const nextText = text.trim();
        const shouldRemoveEmptyDraft = currentAnnotation.text.trim().length === 0 && nextText.length === 0;

        if (shouldRemoveEmptyDraft) {
            applyFlowUpdate({
                ...currentFlow,
                annotations: currentAnnotations.filter((annotation) => annotation.id !== annotationId),
                lastModified: Date.now(),
            });

            if (getSelectionNodeIds(selectionRef.current).includes(annotationId)) {
                handleDeselect();
            } else {
                setEditingTextAnnotationId((currentId) => currentId === annotationId ? null : currentId);
            }
            return;
        }

        updateAnnotations((annotations) =>
            annotations.map((annotation) =>
                annotation.id === annotationId && annotation.type === 'text'
                    ? { ...annotation, text }
                    : annotation
            )
        );
        setEditingTextAnnotationId((currentId) => currentId === annotationId ? null : currentId);
    }, [applyFlowUpdate, handleDeselect, updateAnnotations]);

    const handleAnnotationTextEditStart = useCallback((annotationId: string) => {
        if (isFlowReadOnly) return;
        focusNodeSelection(annotationId, { enterTextEditMode: true });
    }, [focusNodeSelection, isFlowReadOnly]);

    const handleAnnotationTextEditStop = useCallback((annotationId: string) => {
        setEditingTextAnnotationId((currentId) => currentId === annotationId ? null : currentId);
    }, []);

    const handleAnnotationTextSizeChange = useCallback((annotationId: string, size: CanvasTextAnnotationSize) => {
        updateAnnotations((annotations) =>
            annotations.map((annotation) =>
                annotation.id === annotationId && annotation.type === 'text'
                    ? { ...annotation, size }
                    : annotation
            )
        );
    }, [updateAnnotations]);

    const handleAnnotationRectangleColorChange = useCallback((
        annotationId: string,
        color: CanvasRectangleAnnotationColor
    ) => {
        updateAnnotations((annotations) =>
            annotations.map((annotation) =>
                annotation.id === annotationId && annotation.type === 'rectangle'
                    ? { ...annotation, color }
                    : annotation
            )
        );
    }, [updateAnnotations]);

    const handleAnnotationResize = useCallback((
        annotationId: string,
        nextBounds: AnnotationResizeUpdate
    ) => {
        updateAnnotations((annotations) =>
            annotations.map((annotation) =>
                annotation.id === annotationId
                    ? annotation.type === 'rectangle'
                        ? {
                            ...annotation,
                            position: nextBounds.position,
                            width: nextBounds.width,
                            height: nextBounds.height,
                        }
                        : {
                            ...annotation,
                            position: nextBounds.position,
                            width: nextBounds.width,
                        }
                    : annotation
            )
        );
    }, [updateAnnotations]);

    const handleDeleteAnnotation = useCallback((annotationId: string) => {
        updateAnnotations((annotations) => annotations.filter((annotation) => annotation.id !== annotationId));
        setEditingTextAnnotationId((currentId) => currentId === annotationId ? null : currentId);

        if (getSelectionNodeIds(selectionRef.current).includes(annotationId)) {
            handleDeselect();
        }
    }, [handleDeselect, updateAnnotations]);

    const handleMoveAnnotationToFront = useCallback((annotationId: string) => {
        updateAnnotations((annotations) => {
            const targetAnnotation = annotations.find((annotation) => annotation.id === annotationId);
            if (!targetAnnotation) {
                return annotations;
            }

            return [
                ...annotations.filter((annotation) => annotation.id !== annotationId),
                targetAnnotation,
            ];
        });
    }, [updateAnnotations]);

    const handleSendAnnotationToBack = useCallback((annotationId: string) => {
        updateAnnotations((annotations) => {
            const targetAnnotation = annotations.find((annotation) => annotation.id === annotationId);
            if (!targetAnnotation) {
                return annotations;
            }

            return [
                targetAnnotation,
                ...annotations.filter((annotation) => annotation.id !== annotationId),
            ];
        });
    }, [updateAnnotations]);

    const resolveDefaultUserTurnInputType = useCallback((
        sourceNodeId: string,
        sourceHandleId: string | null
    ): UserTurn['inputType'] => {
        if (!sourceHandleId || sourceHandleId === 'main-output') {
            return 'text';
        }

        if (!sourceHandleId.startsWith('handle-')) {
            return 'text';
        }

        const sourceStep = flowRef.current.steps?.find(step => step.id === sourceNodeId);
        if (!sourceStep || sourceStep.type !== 'turn') {
            return 'text';
        }

        const sourceComponent = sourceStep.components.find(component => sourceHandleId.includes(component.id));
        if (!sourceComponent) {
            return 'text';
        }

        if (
            sourceComponent.type === 'prompt' ||
            sourceComponent.type === 'selectionList' ||
            sourceComponent.type === 'confirmationCard' ||
            sourceComponent.type === 'checkboxGroup'
        ) {
            return 'button';
        }

        return 'text';
    }, []);

    const createConnectedNode = useCallback(({
        sourceNodeId,
        sourceHandleId,
        targetType,
        position,
    }: {
        sourceNodeId: string;
        sourceHandleId: string | null;
        targetType: QuickAddNodeType;
        position: { x: number; y: number };
    }) => {
        const currentFlow = flowRef.current;
        const existingSteps = currentFlow.steps || [];
        const existingConnections = currentFlow.connections || [];

        let newStep: Turn | UserTurn | Condition;

        if (targetType === 'turn') {
            newStep = {
                id: crypto.randomUUID(),
                type: 'turn',
                speaker: 'ai',
                label: getNextFreshNodeLabel('turn', existingSteps),
                components: [],
                position,
            };
        } else if (targetType === 'condition') {
            newStep = {
                id: crypto.randomUUID(),
                type: 'condition',
                label: getNextFreshNodeLabel('condition', existingSteps),
                labelMode: 'auto',
                question: '',
                branches: createDefaultConditionBranches(),
                position,
            };
        } else {
            newStep = {
                id: crypto.randomUUID(),
                type: 'user-turn',
                label: getNextFreshNodeLabel('user-turn', existingSteps),
                labelMode: 'auto',
                inputType: resolveDefaultUserTurnInputType(sourceNodeId, sourceHandleId),
                position,
            };
        }

        const newConnection: import('../studio/types').Connection = {
            id: `edge-${sourceNodeId}-${newStep.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            source: sourceNodeId,
            sourceHandle: sourceHandleId || undefined,
            target: newStep.id,
        };

        applyFlowUpdate({
            ...currentFlow,
            steps: [...existingSteps, newStep],
            connections: [...existingConnections, newConnection],
            lastModified: Date.now(),
        });

        if (newStep.type === 'turn') {
            focusNodeSelection(newStep.id);
        }
    }, [applyFlowUpdate, focusNodeSelection, resolveDefaultUserTurnInputType]);

    const onConnectStart: OnConnectStart = useCallback((event, params) => {
        if (isFlowReadOnly) return;

        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);

        if (params.handleType !== 'source' || !params.nodeId) {
            connectionGestureRef.current = null;
            return;
        }

        const sourceStep = flowRef.current.steps?.find(step => step.id === params.nodeId);
        let dropBehavior: ConnectionDropBehavior | null = null;
        let previewVariant: ConnectionPreviewVariant | null = null;

        if (sourceStep?.type === 'turn' && sourceStep.speaker === 'ai') {
            const isAiMainHandle = !params.handleId || params.handleId === 'main-output';
            const isAiComponentHandle = Boolean(params.handleId && params.handleId.startsWith('handle-'));

            if (isAiComponentHandle && !isAiMainHandle) {
                dropBehavior = 'auto-user-turn';
                previewVariant = 'accent';
            } else if (isAiMainHandle) {
                dropBehavior = 'popover';
                previewVariant = 'neutral';
            }
        } else if (sourceStep?.type === 'user-turn' || sourceStep?.type === 'condition') {
            dropBehavior = 'popover';
            previewVariant = 'neutral';
        }

        if (!dropBehavior || !previewVariant) {
            connectionGestureRef.current = null;
            return;
        }

        const startClient = getClientPositionFromPointerEvent(event);
        if (!startClient) {
            connectionGestureRef.current = null;
            return;
        }

        const canvasRect = canvasAreaRef.current?.getBoundingClientRect();
        const sourceCanvasPoint = canvasRect
            ? {
                x: startClient.x - canvasRect.left,
                y: startClient.y - canvasRect.top,
            }
            : null;

        connectionGestureRef.current = {
            sourceNodeId: params.nodeId,
            sourceHandleId: params.handleId,
            startClient,
            sourceCanvasPoint,
            dropBehavior,
        };
    }, [isFlowReadOnly]);

    const onConnectEnd: OnConnectEnd = useCallback((event, connectionState) => {
        if (isFlowReadOnly) return;

        const gesture = connectionGestureRef.current;
        connectionGestureRef.current = null;

        if (!gesture) return;

        // Only defer when React Flow reports a VALID target connection.
        // A simple click can still report the source handle as "toHandle", which is not a valid edge.
        if (connectionState.isValid && (connectionState.toNode || connectionState.toHandle)) {
            return;
        }

        const dropClient = getClientPositionFromPointerEvent(event);
        if (!dropClient) return;

        const canvasRect = canvasAreaRef.current?.getBoundingClientRect();
        if (canvasRect) {
            const isInsideCanvas = (
                dropClient.x >= canvasRect.left &&
                dropClient.x <= canvasRect.right &&
                dropClient.y >= canvasRect.top &&
                dropClient.y <= canvasRect.bottom
            );

            if (!isInsideCanvas) {
                return;
            }
        }

        const distance = Math.hypot(
            dropClient.x - gesture.startClient.x,
            dropClient.y - gesture.startClient.y
        );

        if (distance <= QUICK_CONNECT_CLICK_DISTANCE_PX) {
            // Ignore short clicks so handles only create nodes when the user drags.
            return;
        }

        if (gesture.dropBehavior === 'auto-user-turn') {
            setQuickAddConnectionPreview(null);
            createConnectedNode({
                sourceNodeId: gesture.sourceNodeId,
                sourceHandleId: gesture.sourceHandleId,
                targetType: 'user-turn',
                position: screenToFlowPosition(dropClient),
            });
            return;
        }

        setQuickAddMenu({
            sourceNodeId: gesture.sourceNodeId,
            sourceHandleId: gesture.sourceHandleId,
            screenPosition: dropClient,
            flowPosition: screenToFlowPosition(dropClient),
        });

        if (canvasRect && gesture.sourceCanvasPoint) {
            const dropCanvasPoint = {
                x: dropClient.x - canvasRect.left,
                y: dropClient.y - canvasRect.top,
            };

            setQuickAddConnectionPreview({
                fromX: gesture.sourceCanvasPoint.x,
                fromY: gesture.sourceCanvasPoint.y,
                fromPosition: connectionState.fromPosition ?? Position.Right,
                toX: dropCanvasPoint.x,
                toY: dropCanvasPoint.y,
                toPosition: connectionState.toPosition
                    ?? (dropCanvasPoint.x >= gesture.sourceCanvasPoint.x ? Position.Left : Position.Right),
                variant: 'neutral',
            });
        } else {
            setQuickAddConnectionPreview(null);
        }
    }, [createConnectedNode, isFlowReadOnly, screenToFlowPosition]);

    const handleQuickAddSelect = useCallback((targetType: QuickAddNodeType) => {
        if (isFlowReadOnly) return;
        if (!quickAddMenu) return;

        createConnectedNode({
            sourceNodeId: quickAddMenu.sourceNodeId,
            sourceHandleId: quickAddMenu.sourceHandleId,
            targetType,
            position: quickAddMenu.flowPosition,
        });
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
    }, [quickAddMenu, createConnectedNode, isFlowReadOnly]);

    const handleQuickAddCancel = useCallback(() => {
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
    }, []);

    const handleQuickAddOptionHover = useCallback((type: QuickAddNodeType | null) => {
        setQuickAddConnectionPreview((current) => {
            if (!current) return null;
            const nextVariant = getQuickAddPreviewVariant(type);
            if (nextVariant === current.variant) {
                return current;
            }
            return {
                ...current,
                variant: nextVariant,
            };
        });
    }, []);

    const handleComponentAdd = useCallback((
        type: ComponentType,
        targetNodeId?: string,
        options?: { autoOpenEditor?: boolean }
    ) => {
        const currentFlow = flowRef.current;
        const currentSelection = selectionRef.current;
        const resolvedNodeId = targetNodeId ?? getSingleSelectedNodeId(currentSelection);

        if (!resolvedNodeId) return;

        const step = currentFlow.steps?.find(s => s.id === resolvedNodeId && s.type === 'turn');
        if (!step || step.type !== 'turn') return;

        const newComponent: Component = {
            id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            content: getDefaultContent(type)
        };

        const updatedSteps = currentFlow.steps?.map(s =>
            s.id === resolvedNodeId && s.type === 'turn'
                ? { ...s, components: [...s.components, newComponent] }
                : s
        );

        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
        setPendingReactFlowSelectedNodeIds([]);
        if (options?.autoOpenEditor) {
            setPendingAutoOpenComponent({ nodeId: resolvedNodeId, componentId: newComponent.id });
            return;
        }

        setCanvasSelection({ type: 'component', nodeId: resolvedNodeId, componentId: newComponent.id });
    }, [applyFlowUpdate, setCanvasSelection]);

    const handleTurnAddComponent = useCallback((nodeId: string, type: ComponentType) => {
        handleComponentAdd(type, nodeId, { autoOpenEditor: true });
    }, [handleComponentAdd]);

    const handleTurnPreviewFromHere = useCallback((nodeId: string) => {
        onPreviewFromTurn?.(nodeId);
    }, [onPreviewFromTurn]);

    const getNodeCommentState = useCallback(() => {
        return {
            hasComments: false,
            isActive: false,
            isPlacementMode: isCommentModeActive,
        };
    }, [isCommentModeActive]);
    const defaultStartStepId = useMemo(() => resolveStartStepId(flow), [flow]);
    const startNodeCount = useMemo(
        () => (flow.steps || []).filter((step) => step.type === 'start').length,
        [flow.steps]
    );

    // Convert flow steps to React Flow nodes
    const baseNodes = useMemo(() => {
        const annotationNodes = (flow.annotations || []).map((annotation, index) => {
            if (annotation.type === 'text') {
                const textWidth = getCanvasTextAnnotationWidth(annotation);

                return {
                    id: annotation.id,
                    type: 'annotation-text',
                    position: annotation.position,
                    zIndex: ANNOTATION_NODE_Z_INDEX_BASE + index,
                    data: {
                        text: annotation.text,
                        size: annotation.size,
                        width: textWidth,
                        readOnly: isFlowReadOnly,
                        isEditing: editingTextAnnotationId === annotation.id,
                        onTextChange: handleAnnotationTextChange,
                        onStartEditing: handleAnnotationTextEditStart,
                        onStopEditing: handleAnnotationTextEditStop,
                        onResizePreview: (annotationId: string, nextBounds: AnnotationResizeUpdate) => {
                            previewAnnotationResizeRef.current(annotationId, nextBounds);
                        },
                        onResize: handleAnnotationResize,
                    },
                };
            }

            return {
                id: annotation.id,
                type: 'annotation-rectangle',
                position: annotation.position,
                zIndex: ANNOTATION_NODE_Z_INDEX_BASE + index,
                data: {
                    width: annotation.width,
                    height: annotation.height,
                    color: resolveRectangleAnnotationColor(annotation),
                    readOnly: isFlowReadOnly,
                    onResizePreview: (annotationId: string, nextBounds: AnnotationResizeUpdate) => {
                        previewAnnotationResizeRef.current(annotationId, nextBounds);
                    },
                    onResize: handleAnnotationResize,
                },
                style: {
                    width: annotation.width,
                    height: annotation.height,
                },
            };
        });

        // Use new steps[] if available, otherwise fall back to old blocks[]
        const steps = flow.steps || [];

        if (steps.length === 0) {
            // Fallback: convert old blocks to display (for backward compatibility)
            return [
                ...annotationNodes,
                ...flow.blocks.map((block, index) => ({
                    id: block.id,
                    type: 'turn',
                    position: { x: 250, y: index * 150 },
                    zIndex: FLOW_NODE_Z_INDEX_BASE + index,
                    data: {
                        speaker: block.type as 'user' | 'ai',
                        phase: block.phase,
                        label: block.type === 'ai' && 'variant' in block
                            ? block.variant
                            : undefined,
                        entryPoint: flow.settings.entryPoint,
                        readOnly: isFlowReadOnly,
                        onSelectComponent: handleSelectComponent,
                        onDeselect: handleDeselect,
                    },
                })),
            ];
        }

        // Use new Turn structure
        return [
            ...annotationNodes,
            ...steps.map((step, index) => {
                const commentState = getNodeCommentState();

                if (step.type === 'turn') {
                    return {
                        id: step.id,
                        type: 'turn',
                        position: step.position || { x: 250, y: 0 },
                        zIndex: FLOW_NODE_Z_INDEX_BASE + index,
                        data: {
                            speaker: step.speaker,
                            phase: step.phase,
                            label: step.label,
                            components: step.components,
                            entryPoint: flow.settings.entryPoint,
                            readOnly: isFlowReadOnly,
                            commentState,
                            onSelectComponent: handleSelectComponent,
                            onDeselect: handleDeselect,
                            onComponentReorder: handleTurnComponentReorder,
                            onComponentDelete: handleDeleteTurnComponent,
                            onLabelChange: handleTurnLabelChange,
                            onComponentUpdate: handleTurnComponentUpdate,
                            onAddComponent: handleTurnAddComponent,
                            onPreviewFromTurn: handleTurnPreviewFromHere,
                        },
                    };
                } else if (step.type === 'user-turn') {
                    return {
                        id: step.id,
                        type: 'user-turn',
                        position: step.position || { x: 250, y: 0 },
                        zIndex: FLOW_NODE_Z_INDEX_BASE + index,
                        data: {
                            label: step.label,
                            labelMode: step.labelMode,
                            autoLabel: step.autoLabel,
                            inputType: step.inputType || 'text',
                            triggerValue: step.triggerValue,
                            readOnly: isFlowReadOnly,
                            commentState,
                            onUpdate: handleUserTurnUpdate,
                            onDelete: handleDeleteFlowNode,
                        }
                    };
                } else if (step.type === 'condition') {
                    // Condition node
                    return {
                        id: step.id,
                        type: 'condition',
                        position: step.position || { x: 250, y: 0 },
                        zIndex: FLOW_NODE_Z_INDEX_BASE + index,
                        data: {
                            label: step.label,
                            labelMode: step.labelMode,
                            autoLabel: step.autoLabel,
                            question: step.question,
                            branches: step.branches,
                            readOnly: isFlowReadOnly,
                            commentState,
                            onLabelChange: handleConditionLabelChange,
                            onQuestionChange: handleConditionQuestionChange,
                            onUpdateBranches: handleConditionUpdateBranches,
                            onDelete: handleDeleteFlowNode,
                        },
                    };
                } else if (step.type === 'note') {
                    return {
                        id: step.id,
                        type: 'note',
                        position: step.position || { x: 250, y: 0 },
                        zIndex: FLOW_NODE_Z_INDEX_BASE + index,
                        data: {
                            label: step.label,
                            content: step.content,
                            readOnly: isFlowReadOnly,
                            commentState,
                            onLabelChange: handleNoteLabelChange,
                            onContentChange: handleNoteContentChange,
                        },
                    };
                } else {
                    // Start Node
                    return {
                        id: step.id,
                        type: 'start',
                        position: step.position || { x: 250, y: 0 },
                        zIndex: FLOW_NODE_Z_INDEX_BASE + index,
                        data: {
                            label: getStartNodeDisplayLabel(step),
                            readOnly: isFlowReadOnly,
                            isDefault: step.id === defaultStartStepId,
                            canDelete: startNodeCount > 1,
                            onLabelChange: handleStartNodeLabelChange,
                            onSetDefault: handleSetDefaultStartNode,
                            onDelete: handleDeleteFlowNode,
                        },
                        deletable: startNodeCount > 1,
                    };
                }
            }),
        ];
    }, [
        editingTextAnnotationId,
        defaultStartStepId,
        flow.annotations,
        flow.blocks,
        isFlowReadOnly,
        flow.settings.entryPoint,
        flow.steps,
        handleAnnotationResize,
        handleAnnotationTextChange,
        handleAnnotationTextEditStart,
        handleAnnotationTextEditStop,
        handleConditionLabelChange,
        handleConditionQuestionChange,
        handleConditionUpdateBranches,
        handleDeselect,
        handleDeleteFlowNode,
        handleDeleteTurnComponent,
        getNodeCommentState,
        handleNoteContentChange,
        handleNoteLabelChange,
        handleSelectComponent,
        handleSetDefaultStartNode,
        handleStartNodeLabelChange,
        handleTurnAddComponent,
        handleTurnComponentReorder,
        handleTurnComponentUpdate,
        handleTurnLabelChange,
        handleTurnPreviewFromHere,
        handleUserTurnUpdate,
        startNodeCount,
    ]);

    // Create connections from flow.connections or generate from blocks
    const initialEdges = useMemo(() => {
        const edgeMarker = {
            type: MarkerType.Arrow,
            color: 'rgb(var(--shell-flow-edge-marker) / 1)',
            width: 14,
            height: 14,
            strokeWidth: 1.4,
        };

        // Use new connections[] if available
        if (flow.connections && flow.connections.length > 0) {
            return flow.connections.map(conn => ({
                id: conn.id,
                source: conn.source,
                sourceHandle: conn.sourceHandle,
                target: conn.target,
                targetHandle: conn.targetHandle,
                type: 'default', // Bezier curve
                markerEnd: edgeMarker,
            }));
        }

        // Fallback: generate sequential connections from blocks
        return flow.blocks.slice(0, -1).map((block, index) => ({
            id: `edge-${block.id}-${flow.blocks[index + 1].id}`,
            source: block.id,
            target: flow.blocks[index + 1].id,
            type: 'default', // Bezier curve
            markerEnd: edgeMarker,
        }));
    }, [flow.blocks, flow.connections]);

    const [nodes, setNodes, onNodesChange] = useNodesState(baseNodes as Node[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);

    const handleAnnotationResizePreview = useCallback((
        annotationId: string,
        nextBounds: AnnotationResizeUpdate
    ) => {
        setNodes((currentNodes) => currentNodes.map((node) => {
            if (node.id !== annotationId) {
                return node;
            }

            if (node.type === 'annotation-rectangle') {
                const data = node.data as {
                    width: number;
                    height: number;
                    [key: string]: unknown;
                };

                return {
                    ...node,
                    position: nextBounds.position,
                    data: {
                        ...data,
                        width: nextBounds.width,
                        height: nextBounds.height,
                    },
                    style: {
                        ...(node.style || {}),
                        width: nextBounds.width,
                        height: nextBounds.height,
                    },
                };
            }

            if (node.type === 'annotation-text') {
                const data = node.data as {
                    width: number;
                    [key: string]: unknown;
                };

                return {
                    ...node,
                    position: nextBounds.position,
                    data: {
                        ...data,
                        width: nextBounds.width,
                    },
                };
            }

            return node;
        }));
    }, [setNodes]);

    useEffect(() => {
        previewAnnotationResizeRef.current = handleAnnotationResizePreview;
    }, [handleAnnotationResizePreview]);

    useEffect(() => {
        if (!comments) {
            setRenderedCommentPins([]);
            setPendingCommentPoint(null);
            return;
        }

        const nextRenderedPins = comments.visibleThreads
            .map((thread) => {
                const fallbackAnchor = getCanvasCommentAnchor(thread.root);
                const anchor =
                    commentDragState?.threadId === thread.id
                        ? commentDragState.draftAnchor
                        : fallbackAnchor;

                if (!anchor) return null;

                const point =
                    commentDragState?.threadId === thread.id
                        ? commentDragState.draftPoint
                        : resolveCanvasPointForAnchor(anchor);

                if (!point) return null;

                return {
                    thread,
                    anchor,
                    point,
                };
            })
            .filter((pin): pin is RenderedCanvasCommentPin => !!pin);

        setRenderedCommentPins(nextRenderedPins);
        setPendingCommentPoint(
            comments.pendingComment
                ? resolveCanvasPointForAnchor(comments.pendingComment.anchor)
                : null
        );
    }, [commentDragState, comments, resolveCanvasPointForAnchor]);

    const renderedCommentPinMap = useMemo(
        () => new Map(renderedCommentPins.map((pin) => [pin.thread.id, pin])),
        [renderedCommentPins]
    );

    const commentComposerAnchor = pendingCommentPoint ||
        (comments?.activeThreadId
            ? renderedCommentPinMap.get(comments.activeThreadId)?.point || null
            : null);

    useEffect(() => {
        if (!isCommentModeActive) {
            setCommentDragState(null);
            setCommentComposerPlacement(null);
            suppressNextCommentPlacementRef.current = false;
            return;
        }

        // Entering comment mode should always feel immediately "armed".
        // Clear any stale suppression left over from dismissing a prior composer
        // or from unrelated drag/drop interactions.
        suppressNextCommentPlacementRef.current = false;
        suppressCommentPlacementUntilRef.current = 0;
    }, [isCommentModeActive]);

    useEffect(() => {
        if (!commentComposerAnchor) {
            setCommentComposerPlacement(null);
            return;
        }

        const updatePlacement = () => {
            const canvasRect = canvasAreaRef.current?.getBoundingClientRect();
            if (!canvasRect) return;
            const shouldReserveCommentsPanelSpace =
                isCommentsPanelOpen &&
                typeof window !== 'undefined' &&
                window.innerWidth >= 768;
            const placementSurfaceRect = shouldReserveCommentsPanelSpace
                ? new DOMRect(
                    canvasRect.x,
                    canvasRect.y,
                    Math.max(canvasRect.width - DESKTOP_CANVAS_COMMENTS_RESERVED_WIDTH_PX, 0),
                    canvasRect.height
                )
                : canvasRect;

            const popoverRect = commentPopoverRef.current?.getBoundingClientRect();
            const popoverWidth =
                popoverRect?.width ||
                (comments?.pendingComment ? COMMENT_POPUP_NEW_WIDTH_PX : COMMENT_POPUP_THREAD_WIDTH_PX);
            const popoverHeight =
                popoverRect?.height ||
                (comments?.pendingComment ? COMMENT_POPUP_NEW_HEIGHT_PX : COMMENT_POPUP_THREAD_HEIGHT_PX);

            setCommentComposerPlacement(
                getAnchoredPopoverPosition({
                    surfaceRect: placementSurfaceRect,
                    anchor: commentComposerAnchor,
                    popoverWidth,
                    popoverHeight,
                    anchorOffsetYPx: -SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX,
                    anchorClearanceLeftPx: SHARE_COMMENT_PIN_TIP_TO_LEFT_EDGE_OFFSET_PX,
                    anchorClearanceRightPx: SHARE_COMMENT_PIN_TIP_TO_RIGHT_EDGE_OFFSET_PX,
                })
            );
        };

        updatePlacement();

        const resizeObserver = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(() => updatePlacement())
            : null;

        if (resizeObserver) {
            if (canvasAreaRef.current) resizeObserver.observe(canvasAreaRef.current);
            if (commentPopoverRef.current) resizeObserver.observe(commentPopoverRef.current);
        }

        window.addEventListener('resize', updatePlacement);
        return () => {
            window.removeEventListener('resize', updatePlacement);
            resizeObserver?.disconnect();
        };
    }, [commentComposerAnchor, comments?.pendingComment, isCommentsPanelOpen]);

    useEffect(() => {
        if (!comments?.pendingRevealThreadId) return;

        const targetPin = renderedCommentPinMap.get(comments.pendingRevealThreadId);
        if (!targetPin) {
            comments.markRevealHandled();
            return;
        }

        const worldPoint = {
            x: (targetPin.point.x - viewport.x) / viewport.zoom,
            y: (targetPin.point.y - viewport.y) / viewport.zoom,
        };

        setCenter(worldPoint.x, worldPoint.y, {
            zoom: viewport.zoom,
            duration: 260,
        });
        comments.markRevealHandled();
    }, [comments, renderedCommentPinMap, setCenter, viewport.x, viewport.y, viewport.zoom]);

    useEffect(() => {
        if (!comments && !isCommentModeActive) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;

            if (comments?.pendingComment || comments?.activeThreadId) {
                comments?.dismissComposer();
                return;
            }

            onToggleComments?.();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [comments, isCommentModeActive, onToggleComments]);

    // Handle node clicks natively from React Flow
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (isCommentModeActive) {
            event.preventDefault();
            event.stopPropagation();

            if (suppressCommentPlacementUntilRef.current > Date.now()) {
                return;
            }

            if (suppressNextCommentPlacementRef.current) {
                suppressNextCommentPlacementRef.current = false;
                return;
            }

            const placement = getFreeAnchorFromClient(event.clientX, event.clientY);
            if (!placement) return;

            setCommentComposerPlacement(null);
            setPendingCommentPoint(placement.point);
            comments?.startPendingComment(placement.anchor);

            return;
        }

        if (placePendingToolbarPlacementAtClient({ x: event.clientX, y: event.clientY })) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (event.shiftKey) {
            return;
        }

        // Just update selection state.
        // React Flow handles the visual 'selected' prop automatically.
        setCanvasSelection({ type: 'node', nodeId: node.id });
    }, [comments, getFreeAnchorFromClient, isCommentModeActive, placePendingToolbarPlacementAtClient, setCanvasSelection]);

    const onEdgeClick = useCallback((event: React.MouseEvent) => {
        if (!placePendingToolbarPlacementAtClient({ x: event.clientX, y: event.clientY })) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    }, [placePendingToolbarPlacementAtClient]);

    const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[]; edges: Edge[] }) => {
        if (isCommentModeActive) {
            return;
        }

        const selectedNodeIds = selectedNodes.map((node) => node.id);
        const currentSelection = selectionRef.current;

        if (selectedNodeIds.length === 0) {
            if (currentSelection?.type === 'node' || currentSelection?.type === 'nodes') {
                handleDeselect();
            }
            return;
        }

        if (selectedNodeIds.length === 1) {
            const [nodeId] = selectedNodeIds;
            setCanvasSelection({ type: 'node', nodeId });
            return;
        }

        setCanvasSelection({ type: 'nodes', nodeIds: selectedNodeIds });
    }, [handleDeselect, isCommentModeActive, setCanvasSelection]);

    const handleSelectionStart = useCallback(() => {
        if (isCommentModeActive) {
            return;
        }

        setIsSelectionGestureActive(true);
    }, [isCommentModeActive]);

    const handleSelectionEnd = useCallback(() => {
        setIsSelectionGestureActive(false);
    }, []);

    // Sync edges when flow model changes
    useEffect(() => {
        setEdges(initialEdges as Edge[]);
    }, [initialEdges, setEdges]);

    useEffect(() => {
        if (!pendingReactFlowSelectedNodeIds) {
            return;
        }

        const pendingSelectionSet = new Set(pendingReactFlowSelectedNodeIds);
        const hasAllPendingNodes = pendingReactFlowSelectedNodeIds.length === 0 || pendingReactFlowSelectedNodeIds.every((id) =>
            nodes.some((node) => node.id === id)
        );

        if (!hasAllPendingNodes) {
            return;
        }

        setNodes((currentNodes) => {
            let didChange = false;
            const nextNodes = currentNodes.map((node) => {
                const nextSelected = pendingSelectionSet.has(node.id);
                if (Boolean(node.selected) === nextSelected) {
                    return node;
                }
                didChange = true;
                return {
                    ...node,
                    selected: nextSelected,
                };
            });

            return didChange ? nextNodes : currentNodes;
        });
        setPendingReactFlowSelectedNodeIds(null);
    }, [nodes, pendingReactFlowSelectedNodeIds, setNodes]);

    useEffect(() => {
        if (!pendingAutoOpenComponent) {
            return;
        }

        const step = flow.steps?.find((candidate) => (
            candidate.id === pendingAutoOpenComponent.nodeId &&
            candidate.type === 'turn'
        ));
        const componentExists = step?.type === 'turn' && step.components.some((component) => (
            component.id === pendingAutoOpenComponent.componentId
        ));
        const targetNode = nodes.find((node) => node.id === pendingAutoOpenComponent.nodeId);

        if (!componentExists || !targetNode || targetNode.selected) {
            return;
        }

        setCanvasSelection({
            type: 'component',
            nodeId: pendingAutoOpenComponent.nodeId,
            componentId: pendingAutoOpenComponent.componentId,
        });
        setPendingAutoOpenComponent(null);
    }, [flow.steps, nodes, pendingAutoOpenComponent, setCanvasSelection]);

    // Sync node data when flow changes
    useEffect(() => {
        setNodes((currentNodes) => {
            // Create a map of current node states to preserve transient state not in 'flow'
            // (like React Flow's internal 'selected' state, or dragging position before commit)
            const currentNodeMap = new Map(currentNodes.map(n => [n.id, n]));

            return baseNodes.map(newNode => {
                const existingNode = currentNodeMap.get(newNode.id);
                if (existingNode) {
                    const existingData = existingNode.data as {
                        selectedComponentIds?: string[];
                        openComponentId?: string;
                    } | undefined;
                    let nextData: unknown = newNode.data;

                    if (newNode.type === 'turn') {
                        nextData = {
                            ...(newNode.data as Record<string, unknown>),
                            selectedComponentIds: existingData?.selectedComponentIds,
                            openComponentId: existingData?.openComponentId,
                        };
                    }

                    return {
                        ...newNode,
                        data: nextData,
                        // Preserve React Flow's internal state
                        selected: existingNode.selected,
                        // Optionally preserve position if currently dragging? 
                        // But 'flow' is the source of truth for position, unless we are in the middle of a drag?
                        // For now, let's respect 'newNode' (flow) for position, assuming onNodeDragStop updates flow.
                        // But strictly for 'selected', we MUST preserve it or we deselect on every data update.
                        dragging: existingNode.dragging,
                    };
                }
                return newNode;
            }) as Node[];
        });
    }, [baseNodes, setNodes]);

    // Sync selected component/branch without rebuilding all node data.
    useEffect(() => {
        const selectedComponentNodeId =
            selection?.type === 'component' || selection?.type === 'components'
                ? selection.nodeId
                : null;
        const selectedComponentIds =
            selection?.type === 'component'
                ? [selection.componentId]
                : selection?.type === 'components'
                    ? selection.componentIds
                    : [];
        const openComponentId = selection?.type === 'component' ? selection.componentId : undefined;

        setNodes((currentNodes) => {
            let didChange = false;
            const nextNodes = currentNodes.map(node => {
                if (node.type === 'turn') {
                    const data = node.data as { selectedComponentIds?: string[]; openComponentId?: string };
                    const nextSelectedIds = node.id === selectedComponentNodeId ? selectedComponentIds : [];
                    const nextOpenId = node.id === selectedComponentNodeId ? openComponentId : undefined;
                    if (
                        areStringArraysEqual(data.selectedComponentIds, nextSelectedIds) &&
                        data.openComponentId === nextOpenId
                    ) {
                        return node;
                    }
                    didChange = true;
                    return {
                        ...node,
                        data: {
                            ...data,
                            selectedComponentIds: nextSelectedIds,
                            openComponentId: nextOpenId,
                        }
                    };
                }

                return node;
            });

            return didChange ? nextNodes : currentNodes;
        });
    }, [selection, setNodes]);

    // Save positions when dragging stops
    const onNodeDragStop = useCallback((_: React.MouseEvent, _node: Node, nodes: Node[]) => {
        // Handle both single and multi-selection dragging by updating all dragged nodes
        // nodes array contains all nodes that serve as the drag selection
        const currentFlow = flowRef.current;
        const draggedNodes = nodes && nodes.length > 0 ? nodes : [_node];
        const draggedNodeMap = new Map(draggedNodes.map(n => [n.id, n]));

        const updatedSteps = currentFlow.steps?.map(s => {
            const movedNode = draggedNodeMap.get(s.id);
            if (movedNode) {
                return { ...s, position: movedNode.position };
            }
            return s;
        });

        const updatedAnnotations = (currentFlow.annotations || []).map((annotation) => {
            const movedNode = draggedNodeMap.get(annotation.id);
            if (!movedNode) {
                return annotation;
            }

            return {
                ...annotation,
                position: movedNode.position,
            };
        });

        applyFlowUpdate({
            ...currentFlow,
            steps: updatedSteps,
            annotations: updatedAnnotations,
            lastModified: Date.now(),
        });
    }, [applyFlowUpdate]);

    // Connection handler
    const onConnect: OnConnect = useCallback(
        (connection) => {
            // Update persistent flow model
            const newConnection: import('../studio/types').Connection = {
                id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
                source: connection.source,
                sourceHandle: connection.sourceHandle || undefined,
                target: connection.target,
                targetHandle: connection.targetHandle || undefined
            };

            const updatedConnections = [...(flow.connections || []), newConnection];

            applyFlowUpdate({
                ...flow,
                connections: updatedConnections,
                steps: flow.steps,
                lastModified: Date.now()
            });
        },
        [flow, applyFlowUpdate]
    );

    const handleMoveComponentUp = useCallback(() => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        const selectedComponentSelection =
            currentSelection?.type === 'component'
                ? { nodeId: currentSelection.nodeId, componentId: currentSelection.componentId }
                : currentSelection?.type === 'components' && currentSelection.componentIds.length === 1
                    ? { nodeId: currentSelection.nodeId, componentId: currentSelection.componentIds[0] }
                    : null;

        if (selectedComponentSelection) {
            const step = currentFlow.steps?.find(s => s.id === selectedComponentSelection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const componentIndex = step.components.findIndex(c => c.id === selectedComponentSelection.componentId);
                if (componentIndex > 0) {
                    const newComponents = [...step.components];
                    [newComponents[componentIndex - 1], newComponents[componentIndex]] =
                        [newComponents[componentIndex], newComponents[componentIndex - 1]];
                    const updatedSteps = currentFlow.steps?.map(s =>
                        s.id === selectedComponentSelection.nodeId && s.type === 'turn'
                            ? { ...s, components: newComponents }
                            : s
                    );
                    applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
                }
            }
        }
    }, [applyFlowUpdate]); // implementation uses refs

    const handleMoveComponentDown = useCallback(() => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        const selectedComponentSelection =
            currentSelection?.type === 'component'
                ? { nodeId: currentSelection.nodeId, componentId: currentSelection.componentId }
                : currentSelection?.type === 'components' && currentSelection.componentIds.length === 1
                    ? { nodeId: currentSelection.nodeId, componentId: currentSelection.componentIds[0] }
                    : null;

        if (selectedComponentSelection) {
            const step = currentFlow.steps?.find(s => s.id === selectedComponentSelection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const componentIndex = step.components.findIndex(c => c.id === selectedComponentSelection.componentId);
                if (componentIndex < step.components.length - 1) {
                    const newComponents = [...step.components];
                    [newComponents[componentIndex], newComponents[componentIndex + 1]] =
                        [newComponents[componentIndex + 1], newComponents[componentIndex]];
                    const updatedSteps = currentFlow.steps?.map(s =>
                        s.id === selectedComponentSelection.nodeId && s.type === 'turn'
                            ? { ...s, components: newComponents }
                            : s
                    );
                    applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
                }
            }
        }
    }, [applyFlowUpdate]); // implementation uses refs


    // Native React Flow delete handler (supports multi-selection)
    const onNodesDelete = useCallback((deletedNodes: Node[]) => {
        // Filter out nodes that shouldn't be deleted (e.g. Start node)
        // Note: React Flow might have already removed them from the UI, but we need to keep them in data if locked
        // However, usually we should prevent them from being selectable/deletable in the first place.
        // For now, we just proceed with the deletion from data.
        deleteNodesFromFlow(deletedNodes.map((node) => node.id));
    }, [deleteNodesFromFlow]); // flowRef used inside

    const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
        const currentFlow = flowRef.current;
        const deletedIds = new Set(deletedEdges.map(e => e.id));

        const updatedConnections = (currentFlow.connections || []).filter(
            conn => !deletedIds.has(conn.id)
        );

        applyFlowUpdate({
            ...currentFlow,
            connections: updatedConnections,
            lastModified: Date.now()
        });
    }, [applyFlowUpdate]);


    const handleDeleteComponent = useCallback(() => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        if (currentSelection?.type === 'component' || currentSelection?.type === 'components') {
            const selectedComponentIds =
                currentSelection.type === 'component'
                    ? [currentSelection.componentId]
                    : currentSelection.componentIds;
            const updatedSteps = currentFlow.steps?.map(s =>
                s.id === currentSelection.nodeId && s.type === 'turn'
                    ? { ...s, components: s.components.filter(c => !selectedComponentIds.includes(c.id)) }
                    : s
            );
            applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
            handleDeselect();
        }
    }, [applyFlowUpdate, handleDeselect]);

    const moveSelectedBranch = useCallback((direction: 'up' | 'down') => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        if (currentSelection?.type !== 'branch') {
            return;
        }

        let didMove = false;
        const updatedSteps = currentFlow.steps?.map((step) => {
            if (step.id !== currentSelection.nodeId || step.type !== 'condition') {
                return step;
            }

            const currentIndex = step.branches.findIndex((branch) => branch.id === currentSelection.branchId);
            if (currentIndex === -1) {
                return step;
            }

            const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (nextIndex < 0 || nextIndex >= step.branches.length) {
                return step;
            }

            const reorderedBranches = [...step.branches];
            const [movedBranch] = reorderedBranches.splice(currentIndex, 1);
            reorderedBranches.splice(nextIndex, 0, movedBranch);
            didMove = true;

            return {
                ...step,
                branches: reorderedBranches,
            };
        });

        if (!didMove) {
            return;
        }

        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [applyFlowUpdate]);

    const handleDeleteBranch = useCallback(() => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        if (currentSelection?.type !== 'branch') {
            return;
        }

        let didDelete = false;
        const updatedSteps = currentFlow.steps?.map((step) => {
            if (step.id !== currentSelection.nodeId || step.type !== 'condition') {
                return step;
            }

            if (step.branches.length <= 1) {
                return step;
            }

            const nextBranches = step.branches.filter((branch) => branch.id !== currentSelection.branchId);
            if (nextBranches.length === step.branches.length) {
                return step;
            }

            didDelete = true;
            return {
                ...step,
                branches: nextBranches,
            };
        });

        if (!didDelete) {
            return;
        }

        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
        handleDeselect();
    }, [applyFlowUpdate, handleDeselect]);

    const handleCopySelection = useCallback((): boolean => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;
        if (!currentSelection) {
            return false;
        }

        if (currentSelection.type === 'node') {
            const selectedStep = currentFlow.steps?.find((step) => step.id === currentSelection.nodeId);
            if (!selectedStep) {
                return false;
            }

            setActiveClipboard({
                type: 'node',
                step: cloneValue(selectedStep),
                pasteCount: 0,
            });
            return true;
        }

        if (currentSelection.type === 'nodes') {
            const selectedNodeIds = new Set(currentSelection.nodeIds);
            const selectedSteps = (currentFlow.steps || []).filter(
                (step): step is ClipboardNodeStep => selectedNodeIds.has(step.id)
            );

            if (selectedSteps.length === 0) {
                return false;
            }

            setActiveClipboard(selectedSteps.length === 1
                ? {
                    type: 'node',
                    step: cloneValue(selectedSteps[0]),
                    pasteCount: 0,
                }
                : {
                    type: 'nodes',
                    steps: cloneValue(selectedSteps),
                    pasteCount: 0,
                });
            return true;
        }

        if (currentSelection.type === 'component' || currentSelection.type === 'components') {
            const selectedStep = currentFlow.steps?.find((step) => step.id === currentSelection.nodeId && step.type === 'turn');
            if (!selectedStep || selectedStep.type !== 'turn') {
                return false;
            }

            const selectedComponentIds = currentSelection.type === 'component'
                ? [currentSelection.componentId]
                : currentSelection.componentIds;
            const selectedComponentIdSet = new Set(selectedComponentIds);
            const selectedComponents = selectedStep.components.filter((component) => selectedComponentIdSet.has(component.id));
            if (selectedComponents.length === 0) {
                return false;
            }

            setActiveClipboard(selectedComponents.length === 1
                ? {
                    type: 'component',
                    component: cloneValue(selectedComponents[0]),
                }
                : {
                    type: 'components',
                    components: cloneValue(selectedComponents),
                });
            return true;
        }

        const selectedStep = currentFlow.steps?.find((step) => step.id === currentSelection.nodeId && step.type === 'condition');
        if (!selectedStep || selectedStep.type !== 'condition') {
            return false;
        }

        const selectedBranch = selectedStep.branches.find((branch) => branch.id === currentSelection.branchId);
        if (!selectedBranch) {
            return false;
        }

        setActiveClipboard({
            type: 'branch',
            branch: cloneValue(selectedBranch),
        });
        return true;
    }, [setActiveClipboard]);

    const handlePasteSelection = useCallback((): boolean => {
        if (isFlowReadOnly) {
            return false;
        }

        const clipboard = getActiveClipboard();
        if (!clipboard) {
            return false;
        }

        const currentFlow = flowRef.current;
        const currentSteps = currentFlow.steps || [];

        if (clipboard.type === 'node') {
            const nextPasteCount = clipboard.pasteCount + 1;
            const newStep = cloneNodeStepForPaste(clipboard.step, nextPasteCount, currentSteps);
            setActiveClipboard({
                ...clipboard,
                pasteCount: nextPasteCount,
            });

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, newStep],
                lastModified: Date.now(),
            });
            setCanvasSelection({ type: 'node', nodeId: newStep.id });
            setPendingReactFlowSelectedNodeIds([newStep.id]);
            return true;
        }

        if (clipboard.type === 'nodes') {
            const nextPasteCount = clipboard.pasteCount + 1;
            const newSteps = cloneNodeStepsForPaste(clipboard.steps, nextPasteCount, currentSteps);
            setActiveClipboard({
                ...clipboard,
                pasteCount: nextPasteCount,
            });

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, ...newSteps],
                lastModified: Date.now(),
            });
            setCanvasSelection({ type: 'nodes', nodeIds: newSteps.map((step) => step.id) });
            setPendingReactFlowSelectedNodeIds(newSteps.map((step) => step.id));
            return true;
        }

        if (clipboard.type === 'component' || clipboard.type === 'components') {
            const currentSelection = selectionRef.current;
            if (!currentSelection) {
                return false;
            }

            const targetNodeId =
                currentSelection.type === 'component' || currentSelection.type === 'components'
                    ? currentSelection.nodeId
                    : getSingleSelectedNodeId(currentSelection);
            const insertAfterComponentIds =
                currentSelection.type === 'component'
                    ? [currentSelection.componentId]
                    : currentSelection.type === 'components'
                        ? currentSelection.componentIds
                        : [];

            if (!targetNodeId) {
                return false;
            }

            const clipboardComponents = clipboard.type === 'component'
                ? [clipboard.component]
                : clipboard.components;
            let newComponentIds: string[] = [];
            let didPaste = false;
            const updatedSteps = currentSteps.map((step) => {
                if (step.id !== targetNodeId || step.type !== 'turn') {
                    return step;
                }

                const pastedComponents = clipboardComponents.map((component) => cloneComponentForPaste(component));
                const nextComponents = [...step.components];

                if (insertAfterComponentIds.length > 0) {
                    const componentIndices = step.components
                        .map((component, index) => insertAfterComponentIds.includes(component.id) ? index : -1)
                        .filter((index) => index >= 0);
                    if (componentIndices.length === 0) {
                        return step;
                    }
                    const insertAfterIndex = Math.max(...componentIndices);
                    nextComponents.splice(insertAfterIndex + 1, 0, ...pastedComponents);
                } else {
                    nextComponents.push(...pastedComponents);
                }

                newComponentIds = pastedComponents.map((component) => component.id);
                didPaste = true;

                return {
                    ...step,
                    components: nextComponents,
                };
            });

            if (!didPaste || newComponentIds.length === 0) {
                return false;
            }

            applyFlowUpdate({
                ...currentFlow,
                steps: updatedSteps,
                lastModified: Date.now(),
            });
            setCanvasSelection(
                newComponentIds.length === 1
                    ? { type: 'component', nodeId: targetNodeId, componentId: newComponentIds[0] }
                    : { type: 'components', nodeId: targetNodeId, componentIds: newComponentIds }
            );
            setPendingReactFlowSelectedNodeIds([]);
            return true;
        }

        const currentSelection = selectionRef.current;
        if (!currentSelection) {
            return false;
        }

        const targetNodeId =
            currentSelection.type === 'branch'
                ? currentSelection.nodeId
                : getSingleSelectedNodeId(currentSelection);
        const insertAfterBranchId =
            currentSelection.type === 'branch'
                ? currentSelection.branchId
                : null;

        if (!targetNodeId) {
            return false;
        }

        let newBranchId: string | null = null;
        let didPaste = false;
        const updatedSteps = currentSteps.map((step) => {
            if (step.id !== targetNodeId || step.type !== 'condition') {
                return step;
            }

            const pastedBranch = cloneBranchForPaste(clipboard.branch);
            const nextBranches = [...step.branches];

            if (insertAfterBranchId) {
                const branchIndex = step.branches.findIndex((branch) => branch.id === insertAfterBranchId);
                if (branchIndex === -1) {
                    return step;
                }
                nextBranches.splice(branchIndex + 1, 0, pastedBranch);
            } else {
                nextBranches.push(pastedBranch);
            }

            newBranchId = pastedBranch.id;
            didPaste = true;

            return {
                ...step,
                branches: nextBranches,
            };
        });

        if (!didPaste || !newBranchId) {
            return false;
        }

        applyFlowUpdate({
            ...currentFlow,
            steps: updatedSteps,
            lastModified: Date.now(),
        });
        setCanvasSelection({ type: 'branch', nodeId: targetNodeId, branchId: newBranchId });
        setPendingReactFlowSelectedNodeIds([]);
        return true;
    }, [applyFlowUpdate, getActiveClipboard, isFlowReadOnly, setActiveClipboard, setCanvasSelection]);

    // Manual delete trigger for nested selections (cards and branch cards).
    const handleDeleteSelection = useCallback(() => {
        const currentSelection = selectionRef.current;
        if (currentSelection?.type === 'component' || currentSelection?.type === 'components') {
            handleDeleteComponent();
            return;
        }
        if (currentSelection?.type === 'branch') {
            handleDeleteBranch();
        }
        // For nodes, we let React Flow handle it via the Delete key -> onNodesDelete
    }, [handleDeleteBranch, handleDeleteComponent]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Alt') setIsAltPressed(true);

            const target = e.target as HTMLElement | null;
            // Don't trigger if user is typing in an editable field.
            if (
                target &&
                (
                    target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement ||
                    target.isContentEditable
                )
            ) {
                return;
            }

            const currentSelection = selectionRef.current;
            const isMetaOrCtrl = e.metaKey || e.ctrlKey;
            const keyLower = e.key.toLowerCase();

            if (!isMetaOrCtrl && !e.altKey && !e.shiftKey && keyLower === 'c') {
                e.preventDefault();
                onToggleComments?.();
                return;
            }

            if (isCommentModeActive) {
                return;
            }

            if (isMetaOrCtrl && keyLower === 'c' && !e.altKey) {
                const didCopy = handleCopySelection();
                if (didCopy) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
                return;
            }

            if (isMetaOrCtrl && keyLower === 'v' && !e.altKey) {
                const didPaste = handlePasteSelection();
                if (didPaste) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
                return;
            }

            if (!isMetaOrCtrl && !e.altKey && !e.shiftKey) {
                if (keyLower === 's') {
                    e.preventDefault();
                    armPendingToolbarPlacement('start');
                    return;
                }

                if (keyLower === 'a') {
                    e.preventDefault();
                    armPendingToolbarPlacement('turn');
                    return;
                }

                if (keyLower === 'u') {
                    e.preventDefault();
                    armPendingToolbarPlacement('user-turn');
                    return;
                }

                if (keyLower === 'd') {
                    e.preventDefault();
                    armPendingToolbarPlacement('condition');
                    return;
                }

                if (keyLower === 'n') {
                    e.preventDefault();
                    armPendingToolbarPlacement('note');
                    return;
                }

                if (keyLower === 't') {
                    e.preventDefault();
                    armPendingToolbarPlacement('text');
                    return;
                }

                if (keyLower === 'r') {
                    e.preventDefault();
                    armPendingToolbarPlacement('rectangle');
                    return;
                }
            }

            if (e.key === 'Escape') {
                if (pendingToolbarPlacement) {
                    e.preventDefault();
                    cancelPendingToolbarPlacement();
                    return;
                }
                handleDeselect();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                // Only hijack delete for nested cards (React Flow only knows about node deletion).
                if (
                    currentSelection?.type === 'component' ||
                    currentSelection?.type === 'components' ||
                    currentSelection?.type === 'branch'
                ) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    handleDeleteSelection();
                    return;
                }
                // Otherwise let the event bubble to React Flow to handle Node deletion (single or multi)
            } else if (
                currentSelection?.type === 'component' ||
                currentSelection?.type === 'branch' ||
                (currentSelection?.type === 'components' && currentSelection.componentIds.length === 1)
            ) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (currentSelection.type === 'branch') {
                        moveSelectedBranch('up');
                    } else {
                        handleMoveComponentUp();
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (currentSelection.type === 'branch') {
                        moveSelectedBranch('down');
                    } else {
                        handleMoveComponentDown();
                    }
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt') setIsAltPressed(false);
        };

        // Use capture so component-level shortcuts run before React Flow's node delete handler.
        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [armPendingToolbarPlacement, cancelPendingToolbarPlacement, handleCopySelection, handleDeleteSelection, handleDeselect, handleMoveComponentDown, handleMoveComponentUp, handlePasteSelection, isCommentModeActive, moveSelectedBranch, onToggleComments, pendingToolbarPlacement]);

    // Node Cloning Logic
    const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
        if (event.altKey) {
            const originalStep = flow.steps?.find(s => s.id === node.id);
            if (!originalStep) return;

            // Strategy:
            // 1. The node being dragged (Node A, original ID) becomes the "Duplicate" (moving).
            //    - It gets a new label.
            //    - It should have no connections.
            // 2. We place a NEW node (Node B, new ID) at the original position.
            //    - It keeps the original label.
            //    - It receives all of Node A's existing edges.
            //    - This keeps the original graph wiring on the node that stayed in place.

            // 1. Prepare Node B (The "Original" that stays)
            let staticOriginalClone: typeof originalStep;
            const newOriginalId = crypto.randomUUID();

            if (originalStep.type === 'turn') {
                staticOriginalClone = {
                    ...originalStep,
                    id: newOriginalId,
                    // Keep component IDs so handle-based connections remain valid.
                    components: originalStep.components.map(c => ({ ...c })),
                };
            } else if (originalStep.type === 'condition') {
                staticOriginalClone = {
                    ...originalStep,
                    id: newOriginalId,
                    question: materializeConditionQuestion(originalStep.question, originalStep.label),
                    // Keep branch IDs so branch-handle connections remain valid.
                    branches: originalStep.branches.map(b => ({ ...b })),
                };
            } else {
                staticOriginalClone = {
                    ...originalStep,
                    id: newOriginalId,
                };
            }

            // 2. Move Node A's edges to Node B so the dragged copy starts disconnected.
            const currentEdges = flow.connections || [];
            const finalConnections = currentEdges.map((conn) => {
                if (conn.source !== node.id && conn.target !== node.id) {
                    return conn;
                }

                return {
                    ...conn,
                    source: conn.source === node.id ? newOriginalId : conn.source,
                    target: conn.target === node.id ? newOriginalId : conn.target,
                };
            });

            // 3. Update flow
            // - Add Node B (Static Original)
            // - Rename Node A (Dragging) - happens via React Flow dragging? 
            //   No, we should update the label of the *dragged* node (originalStep) to indicate it's new?
            //   Actually, let's just mark the dragged one as "Copy".

            const updatedSteps = [...(flow.steps || [])];

            // Rename the dragged node (original ID)
            const draggedNodeIndex = updatedSteps.findIndex(s => s.id === node.id);
            if (draggedNodeIndex !== -1) {
                const nodeToUpdate = updatedSteps[draggedNodeIndex];
                if (nodeToUpdate.type === 'condition') {
                    updatedSteps[draggedNodeIndex] = {
                        ...nodeToUpdate,
                        label: getNextDuplicateNodeLabel('condition', getVisibleConditionLabel(nodeToUpdate), flow.steps || []),
                        autoLabel: undefined,
                        labelMode: nodeToUpdate.labelMode ?? 'auto',
                        question: materializeConditionQuestion(nodeToUpdate.question, nodeToUpdate.label),
                    };
                } else if (nodeToUpdate.type === 'user-turn') {
                    updatedSteps[draggedNodeIndex] = {
                        ...nodeToUpdate,
                        label: getNextDuplicateNodeLabel('user-turn', getVisibleUserTurnLabel(nodeToUpdate), flow.steps || []),
                        autoLabel: undefined,
                        labelMode: nodeToUpdate.labelMode ?? 'auto',
                    };
                } else if (nodeToUpdate.type === 'start') {
                    updatedSteps[draggedNodeIndex] = {
                        ...nodeToUpdate,
                        label: getNextDuplicateNodeLabel('start', nodeToUpdate.label, flow.steps || []),
                    };
                } else if ('label' in nodeToUpdate) {
                    updatedSteps[draggedNodeIndex] = {
                        ...nodeToUpdate,
                        label: getNextDuplicateNodeLabel(nodeToUpdate.type, nodeToUpdate.label, flow.steps || []),
                    };
                }
            }

            // Add the static original
            updatedSteps.push(staticOriginalClone);

            applyFlowUpdate({
                ...flow,
                steps: updatedSteps,
                connections: finalConnections,
                startStepId: originalStep.type === 'start' && flow.startStepId === node.id
                    ? newOriginalId
                    : flow.startStepId,
                lastModified: Date.now()
            });
        }
    }, [flow, applyFlowUpdate]);

    // Drag and Drop handlers
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            if (
                type !== 'start' &&
                type !== 'turn' &&
                type !== 'user-turn' &&
                type !== 'condition' &&
                type !== 'note' &&
                type !== 'text' &&
                type !== 'rectangle'
            ) {
                return;
            }

            suppressCommentPlacementUntilRef.current = Date.now() + 150;
            createToolbarNodeAtPosition(type, screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            }));
        },
        [createToolbarNodeAtPosition, screenToFlowPosition]
    );

    const handlePaneClick = useCallback((event: React.MouseEvent) => {
        if (isCommentModeActive) {
            if (suppressCommentPlacementUntilRef.current > Date.now()) {
                return;
            }

            if (suppressNextCommentPlacementRef.current) {
                suppressNextCommentPlacementRef.current = false;
                return;
            }

            const placement = getFreeAnchorFromClient(event.clientX, event.clientY);
            if (!placement) return;
            setCommentComposerPlacement(null);
            setPendingCommentPoint(placement.point);
            comments?.startPendingComment(placement.anchor);
            return;
        }

        if (placePendingToolbarPlacementAtClient({ x: event.clientX, y: event.clientY })) {
            return;
        }

        handleDeselect();
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
    }, [comments, getFreeAnchorFromClient, handleDeselect, isCommentModeActive, placePendingToolbarPlacementAtClient]);

    const handleCanvasPointerDownCapture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (!comments?.pendingComment && !comments?.activeThreadId) {
            return;
        }

        const target = event.target as HTMLElement | null;
        if (!target) return;
        if (commentPopoverRef.current?.contains(target)) return;
        if (target.closest('[data-comment-placement-ignore="true"]')) return;
        if (target.closest('[data-comment-pin-id]')) return;

        comments.dismissComposer();
        // Consume this outside click so dismissing a composer never drops a new pin
        // in the same interaction.
        suppressNextCommentPlacementRef.current = true;
    }, [comments]);

    const openCommentThread = useCallback((threadId: string, options?: { reveal?: boolean }) => {
        setCommentComposerPlacement(null);
        onOpenCommentsPanel?.();
        comments?.selectThread(threadId, options);
    }, [comments, onOpenCommentsPanel]);

    const handleCommentPinPointerDown = useCallback((
        event: React.PointerEvent<HTMLButtonElement>,
        renderedPin: RenderedCanvasCommentPin
    ) => {
        if (!comments?.canManageComment(renderedPin.thread.root)) return;
        if (renderedPin.thread.root.status === 'resolved') return;
        if (event.button !== 0 || event.pointerType === 'touch') return;

        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);

        setCommentDragState({
            threadId: renderedPin.thread.id,
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            movedPx: 0,
            originPoint: renderedPin.point,
            draftPoint: renderedPin.point,
            draftAnchor: renderedPin.anchor,
        });
    }, [comments]);

    const handleCommentPinPointerMove = useCallback((
        event: React.PointerEvent<HTMLButtonElement>,
        renderedPin: RenderedCanvasCommentPin
    ) => {
        setCommentDragState((current) => {
            if (!current || current.threadId !== renderedPin.thread.id || current.pointerId !== event.pointerId) {
                return current;
            }

            const movedPx = Math.hypot(event.clientX - current.startClientX, event.clientY - current.startClientY);
            if (movedPx < COMMENT_DRAG_THRESHOLD_PX) {
                return current.movedPx === movedPx ? current : { ...current, movedPx };
            }

            const nextPlacement = getFreeAnchorFromClient(event.clientX, event.clientY);
            if (!nextPlacement) {
                return { ...current, movedPx };
            }

            return {
                ...current,
                movedPx,
                draftPoint: nextPlacement.point,
                draftAnchor: nextPlacement.anchor,
            };
        });
    }, [getFreeAnchorFromClient]);

    const handleCommentPinPointerCancel = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
        if (!commentDragState || commentDragState.pointerId !== event.pointerId) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setCommentDragState(null);
    }, [commentDragState]);

    const handleCommentPinPointerUp = useCallback((
        event: React.PointerEvent<HTMLButtonElement>,
        renderedPin: RenderedCanvasCommentPin
    ) => {
        const current = commentDragState;
        if (!current || current.threadId !== renderedPin.thread.id || current.pointerId !== event.pointerId) {
            return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        event.preventDefault();
        event.stopPropagation();

        if (current.movedPx < COMMENT_DRAG_THRESHOLD_PX) {
            setCommentDragState(null);
            return;
        }

        suppressCommentClickRef.current = {
            threadId: renderedPin.thread.id,
            expiresAt: Date.now() + 300,
        };
        setCommentDragState(null);
        void comments?.moveThreadAnchor(renderedPin.thread.id, current.draftAnchor);
    }, [commentDragState, comments]);

    const connectionLineWithPreview = useCallback((props: ConnectionLineComponentProps) => (
        <ConnectionLine {...props} />
    ), []);

    const renderPreviewOpenMenu = () => {
        const showPreviewCoachmark = Boolean(previewCoachmark && !isPreviewActive && !isPreviewMenuOpen);

        return (
            <div className="relative flex items-center">
                {showPreviewCoachmark ? (
                    <ShellCoachmark
                        message={previewCoachmark!.message}
                        onDismiss={previewCoachmark!.onDismiss}
                        tone="cinematicDark"
                        arrowPlacement="top"
                        className="absolute top-[calc(100%+14px)] right-0 z-[75] w-[214px]"
                        arrowClassName="right-[11px]"
                        data-canvas-shell-zoom-blocker="true"
                        data-comment-placement-ignore="true"
                    />
                ) : null}

                <ShellMenu open={isPreviewMenuOpen} onOpenChange={setIsPreviewMenuOpen}>
                    <ActionTooltip content="Play prototype" disabled={isPreviewActive || showPreviewCoachmark}>
                        <ShellMenuTrigger asChild>
                            <ShellIconButton
                                aria-label="Play prototype"
                                className={`relative flex items-center justify-center w-8 h-8 rounded-md overflow-visible transition-all group ${isPreviewActive
                                    ? "text-shell-accent-text bg-shell-accent-soft ring-1 ring-shell-accent-border"
                                    : showPreviewCoachmark
                                        ? "text-shell-text bg-shell-surface ring-1 ring-shell-accent-border/70 shadow-[0_0_0_4px_rgb(var(--shell-accent)/0.08)]"
                                        : "text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                                    }`}
                                data-comment-placement-ignore="true"
                            >
                                <Play size={16} fill={isPreviewActive ? "currentColor" : "none"} className="mr-[1px]" />
                            </ShellIconButton>
                        </ShellMenuTrigger>
                    </ActionTooltip>
                    <ShellMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-[196px] rounded-xl p-1.5 shadow-[0_20px_48px_rgb(15_23_42/0.18)]"
                        data-canvas-shell-zoom-blocker="true"
                    >
                        <ShellMenuItem
                            size="compact"
                            className="gap-2.5 rounded-lg px-2.5 text-[12px]"
                            onClick={() => {
                                previewCoachmark?.onDismiss();
                                onPreview();
                            }}
                        >
                            <PanelRightOpen size={14} className="text-current opacity-70" />
                            Open here in canvas
                        </ShellMenuItem>
                        <ShellMenuSeparator className="my-1" />
                        <ShellMenuItem
                            size="compact"
                            className="gap-2.5 rounded-lg px-2.5 text-[12px]"
                            onClick={() => {
                                previewCoachmark?.onDismiss();
                                window.open(`/share/${flow.id}`, '_blank');
                            }}
                        >
                            <ExternalLink size={14} className="text-current opacity-70" />
                            Open preview in new tab
                        </ShellMenuItem>
                    </ShellMenuContent>
                </ShellMenu>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col relative bg-shell-canvas">
            {/* Header */}
            {/* Top Left Pill: Back & Title */}
            <div
                ref={leftHeaderPillRef}
                data-canvas-shell-zoom-blocker="true"
                className="absolute top-4 left-4 z-50 flex items-center h-11 gap-1.5 bg-shell-bg dark:bg-shell-surface-subtle px-2 rounded-xl shadow-sm dark:shadow-[0_14px_32px_rgb(0_0_0/0.26)] border border-shell-border/70 dark:border-shell-border/55 backdrop-blur-sm"
            >
                {usesStudioMenuTrigger ? (
                    <UserMenu
                        backItem={{
                            label: backItemLabel ?? (isFlowReadOnly ? 'Go home' : 'Back to dashboard'),
                            onSelect: onBack,
                        }}
                        actionItems={menuActionItems}
                        switchItems={showCommentsToggle ? [{
                            label: 'Show comments',
                            checked: showCommentsToggle.checked,
                            onCheckedChange: showCommentsToggle.onCheckedChange,
                        }] : []}
                        contentAlign="start"
                        showAccountDetails={false}
                        useSectionSeparators={useSectionedUserMenu}
                        trigger={(
                            <button
                                type="button"
                                aria-label={isSignedIn ? 'Open user menu' : 'Open guest menu'}
                                className="flex h-8 items-center gap-1 rounded-lg border border-transparent px-2 text-shell-muted transition-colors hover:border-shell-border/70 hover:bg-shell-surface hover:text-shell-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-accent/20 data-[state=open]:border-shell-border/70 data-[state=open]:bg-shell-surface data-[state=open]:text-shell-text dark:hover:bg-shell-surface dark:data-[state=open]:bg-shell-surface"
                            >
                                {isAuthLoading ? (
                                    <span
                                        aria-hidden="true"
                                        className="h-6 w-6 shrink-0 rounded-full border border-shell-border/70 bg-shell-surface-subtle"
                                    />
                                ) : isSignedIn ? (
                                    <ShellUserAvatar
                                        name={userEmail || 'Signed-in user'}
                                        avatarUrl={userAvatarUrl}
                                        alt="Your profile photo"
                                        fallbackLabel={userInitials}
                                        sizeClassName="h-6 w-6"
                                        textClassName="text-[10px]"
                                    />
                                ) : (
                                    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-shell-border/70 bg-shell-surface-subtle px-2 text-[12px] font-medium text-shell-muted">
                                        <UserRound size={12} className="shrink-0" />
                                        <span>Guest</span>
                                    </span>
                                )}
                                <ChevronDown size={14} className="shrink-0 text-current opacity-80" />
                            </button>
                        )}
                    />
                ) : (
                    <ActionTooltip content="Back to dashboard">
                        <ShellIconButton
                            onClick={onBack}
                            aria-label="Back to dashboard"
                        >
                            <ArrowLeft size={18} />
                        </ShellIconButton>
                    </ActionTooltip>
                )}
                <div className="h-5 w-px bg-shell-chrome-divider" />
                <div
                    ref={titleShellRef}
                    className="relative inline-grid items-center min-w-[60px] overflow-hidden transition-[max-width] duration-200 ease-out"
                    style={{ maxWidth: `${titleSlotMaxWidth}px` }}
                    onMouseEnter={() => setIsTitleHovered(true)}
                    onMouseLeave={() => setIsTitleHovered(false)}
                    onFocusCapture={() => setIsTitleFocused(true)}
                    onBlurCapture={(event) => {
                        if (event.currentTarget.contains(event.relatedTarget as globalThis.Node | null)) {
                            return;
                        }

                        setIsTitleFocused(false);
                    }}
                >
                    <span className="invisible flex items-center gap-2 px-3 py-1 text-sm font-medium whitespace-pre border border-transparent col-start-1 row-start-1">
                        <span>{titleText}</span>
                        {isFlowReadOnly ? <ShareViewOnlyBadge /> : null}
                    </span>
                    {isFlowReadOnly ? (
                        <button
                            type="button"
                            className={cn(
                                'absolute inset-0 flex h-full w-full items-center gap-2 rounded border border-transparent bg-transparent px-3 py-1 text-left text-sm font-medium text-shell-text transition-colors',
                                isTitleExpanded && 'bg-shell-surface/80 dark:bg-shell-surface'
                            )}
                            onClick={() => setIsTitlePinnedOpen((currentValue) => !currentValue)}
                            aria-label={isTitleExpanded ? 'Collapse full project title' : `Show full project title: ${titleText}`}
                            title={titleText}
                        >
                            <span className="min-w-0 flex-1 truncate">{titleText}</span>
                            <ShareViewOnlyBadge />
                        </button>
                    ) : (
                        <input
                            value={flow.title}
                            onChange={(e) => applyFlowUpdate({ ...flow, title: e.target.value, lastModified: Date.now() })}
                            className="absolute inset-0 h-full w-full font-medium text-sm text-shell-text bg-transparent hover:bg-shell-surface-subtle focus:bg-shell-bg border border-transparent focus:border-shell-accent-border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-shell-accent/20 transition-all truncate placeholder:text-shell-muted"
                            placeholder="Untitled flow"
                            title={titleText}
                        />
                    )}
                </div>
            </div>

            {/* Top Right Pill: File, Run & Share */}
            <div
                ref={rightHeaderPillRef}
                data-canvas-shell-zoom-blocker="true"
                className="absolute top-4 right-4 z-50 flex items-center h-11 gap-2 bg-shell-bg dark:bg-shell-surface-subtle px-1.5 rounded-xl shadow-sm dark:shadow-[0_14px_32px_rgb(0_0_0/0.26)] border border-shell-border/70 dark:border-shell-border/55 backdrop-blur-sm"
            >
                {headerAccessory}
                {isFlowReadOnly ? (
                    <>
                        {renderPreviewOpenMenu()}
                        <ShareDialog
                            flow={flow}
                            enabledLinkTypes={['studio']}
                        >
                            <ShellButton size="sm">
                                Share
                            </ShellButton>
                        </ShareDialog>
                    </>
                ) : (
                    <>
                        {/* Export JSON */}
                        <ActionTooltip content="Export JSON">
                            <ShellIconButton
                                onClick={handleExportJSON}
                                aria-label="Export JSON"
                            >
                                <Download size={16} />
                            </ShellIconButton>
                        </ActionTooltip>

                        <div className="h-5 w-px bg-shell-chrome-divider" />

                        {/* Run Menu */}
                        {renderPreviewOpenMenu()}

                        <ShareDialog
                            flow={flow}
                            enabledLinkTypes={['studio']}
                        >
                            <ShellButton size="sm">
                                Share
                            </ShellButton>
                        </ShareDialog>
                    </>
                )}
            </div>

            {/* Canvas Area */}
            <div
                ref={canvasAreaRef}
                className="flex-1 w-full relative overflow-hidden h-full"
                onPointerDownCapture={handleCanvasPointerDownCapture}
                style={{ overscrollBehaviorX: 'none' }}
            >
                <style>{`
                    .react-flow__pane, 
                    .react-flow__selection-pane {
                        cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFF' stroke='%23000' stroke-width='2' d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'%3E%3C/path%3E%3C/svg%3E") 6 3, auto !important;
                    }
                    .react-flow__node.draggable {
                        cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFF' stroke='%23000' stroke-width='2' d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'%3E%3C/path%3E%3C/svg%3E") 6 3, auto !important;
                    }
                    .react-flow__node.draggable.dragging {
                        cursor: grabbing !important;
                    }
                    .is-alt-pressed .react-flow__node:hover,
                    .is-alt-pressed .react-flow__node:hover * {
                        cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFF' stroke='%23000' stroke-width='2' d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'%3E%3Cpath fill='%23000' stroke='%23FFF' stroke-width='1.5' d='M16 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.5a.5.5 0 0 0-.5.5v1.5H14a.5.5 0 0 0 0 1h1.5V18a.5.5 0 0 0 1 0v-1.5H18a.5.5 0 0 0 0-1h-1.5V14a.5.5 0 0 0-.5-.5Z'/%3E%3C/svg%3E") 6 3, copy !important;
                    }
                    .is-placement-active .react-flow__pane,
                    .is-placement-active .react-flow__selection-pane,
                    .is-placement-active .react-flow__node,
                    .is-placement-active .react-flow__node *,
                    .is-placement-active .react-flow__edge-path {
                        cursor: copy !important;
                    }
                    .is-comment-mode .react-flow__node * {
                        pointer-events: none !important;
                    }
                    .is-comment-mode .react-flow__pane,
                    .is-comment-mode .react-flow__selection-pane {
                        cursor: ${COMMENT_PLACEMENT_CURSOR} !important;
                    }
                    .is-comment-mode .react-flow__node {
                        cursor: ${COMMENT_PLACEMENT_CURSOR} !important;
                    }
                    .is-comment-mode .react-flow__node:hover {
                        filter: drop-shadow(0 10px 24px rgb(15 23 42 / 0.08));
                    }
                    .thin-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .thin-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .thin-scrollbar::-webkit-scrollbar-thumb {
                        background-color: rgb(var(--shell-scrollbar-thumb) / 1);
                        border-radius: 3px;
                    }
                    .thin-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: rgb(var(--shell-scrollbar-thumb-hover) / 1);
                    }
                `}</style>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{
                        padding: 0.2,
                        minZoom: 0.2,
                        maxZoom: 1,
                    }}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={isFlowReadOnly || isCommentModeActive ? undefined : onConnect}
                    onConnectStart={isFlowReadOnly || isCommentModeActive ? undefined : onConnectStart}
                    onConnectEnd={isFlowReadOnly || isCommentModeActive ? undefined : onConnectEnd}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onNodeDragStart={isFlowReadOnly || isCommentModeActive ? undefined : onNodeDragStart}
                    onNodesDelete={isFlowReadOnly || isCommentModeActive ? undefined : onNodesDelete}
                    onEdgesDelete={isFlowReadOnly || isCommentModeActive ? undefined : onEdgesDelete}
                    onNodeDragStop={isFlowReadOnly || isCommentModeActive ? undefined : onNodeDragStop}
                    onPaneClick={handlePaneClick}
                    onSelectionStart={isFlowReadOnly || isCommentModeActive ? undefined : handleSelectionStart}
                    onSelectionEnd={isFlowReadOnly || isCommentModeActive ? undefined : handleSelectionEnd}
                    onSelectionChange={onSelectionChange}
                    panOnScroll
                    selectionOnDrag={selectionOnDragEnabled}
                    selectionMode={SelectionMode.Partial}
                    elementsSelectable={!isCommentModeActive}
                    multiSelectionKeyCode={['Shift']}
                    panOnDrag={panOnDragEnabled}
                    zoomOnScroll={isFlowReadOnly ? true : !isAltPressed}
                    deleteKeyCode={isFlowReadOnly || isCommentModeActive ? null : ['Delete', 'Backspace']}
                    nodesDraggable={!isFlowReadOnly && !isCommentModeActive}
                    nodesConnectable={!isFlowReadOnly && !isCommentModeActive}
                    proOptions={{ hideAttribution: true }}
                    minZoom={0.1}
                    maxZoom={2}
                    onDragOver={isFlowReadOnly ? undefined : onDragOver}
                    onDrop={isFlowReadOnly ? undefined : onDrop}
                    connectionLineComponent={connectionLineWithPreview}
                    zIndexMode="manual"
                    className={`bg-shell-studio-canvas ${!isFlowReadOnly && isAltPressed ? 'is-alt-pressed' : ''} ${!isFlowReadOnly && pendingToolbarPlacement ? 'is-placement-active' : ''} ${isCommentModeActive ? 'is-comment-mode' : ''}`}
                >
                    {showSelectionAutoOrganizeAction ? (
                        <NodeToolbar
                            nodeId={multiSelectedNodeIds}
                            isVisible
                            position={Position.Top}
                            align="end"
                            offset={SELECTION_ACTION_TOOLBAR_OFFSET_PX}
                        >
                            <ActionTooltip
                                content={isSelectionLayoutPending ? 'Organizing selection' : 'Organize selection'}
                                disabled={isSelectionLayoutPending}
                            >
                                <span className="block">
                                    <ShellIconButton
                                        type="button"
                                        size="sm"
                                        shape="rounded"
                                        variant="outline"
                                        aria-label="Organize selection"
                                        data-no-dnd="true"
                                        data-canvas-shell-zoom-blocker="true"
                                        disabled={isSelectionLayoutPending}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            void handleAutoOrganizeSelection();
                                        }}
                                        onPointerDown={(event) => event.stopPropagation()}
                                        className="nodrag nopan h-6 w-6 shrink-0 rounded-md border-shell-accent/40 bg-[rgb(var(--shell-node-ai-surface)/1)] text-shell-accent shadow-sm hover:border-shell-accent/65 hover:bg-shell-accent-soft hover:text-shell-accent-text focus-visible:ring-shell-accent/20 disabled:pointer-events-none disabled:opacity-70"
                                    >
                                        <Grid3x3 size={14} className={isSelectionLayoutPending ? 'animate-pulse' : undefined} />
                                    </ShellIconButton>
                                </span>
                            </ActionTooltip>
                        </NodeToolbar>
                    ) : null}

                    {selectedAnnotation && !isFlowReadOnly && !isCommentModeActive ? (
                        <AnnotationToolbar
                            annotation={selectedAnnotation}
                            onTextSizeChange={(size) => handleAnnotationTextSizeChange(selectedAnnotation.id, size)}
                            onRectangleColorChange={(color) => handleAnnotationRectangleColorChange(selectedAnnotation.id, color)}
                            onBringToFront={() => handleMoveAnnotationToFront(selectedAnnotation.id)}
                            onSendToBack={() => handleSendAnnotationToBack(selectedAnnotation.id)}
                            onDelete={() => handleDeleteAnnotation(selectedAnnotation.id)}
                        />
                    ) : null}

                    <Background color="rgb(var(--shell-studio-canvas-grid) / 1)" gap={20} size={2} />

                    {onToggleComments ? (
                        <FloatingToolbar
                            showCreationTools={floatingToolbarVariant === 'full'}
                            onAddStart={() => createToolbarNodeAtPosition('start', getFloatingToolbarNodePlacement('start'))}
                            onAddAiTurn={() => createToolbarNodeAtPosition('turn', getFloatingToolbarNodePlacement('turn'))}
                            onAddUserTurn={() => createToolbarNodeAtPosition('user-turn', getFloatingToolbarNodePlacement('user-turn'))}
                            onAddCondition={() => createToolbarNodeAtPosition('condition', getFloatingToolbarNodePlacement('condition'))}
                            onAddNote={() => createToolbarNodeAtPosition('note', getFloatingToolbarNodePlacement('note'))}
                            onAddText={() => createToolbarNodeAtPosition('text', getFloatingToolbarNodePlacement('text'))}
                            onAddRectangle={() => createToolbarNodeAtPosition('rectangle', getFloatingToolbarNodePlacement('rectangle'))}
                            onToggleComments={() => onToggleComments?.()}
                            isCommentsActive={isCommentModeActive || isCommentsPanelOpen}
                        />
                    ) : null}
                    <ZoomControls />
                </ReactFlow>
                {areCommentsVisible ? (
                    <>
                        <div className="absolute inset-0 z-[96] pointer-events-none">
                            {renderedCommentPins.map((renderedPin) => {
                                const root = renderedPin.thread.root;
                                const isSelected = comments?.activeThreadId === renderedPin.thread.id;
                                const isHovered = comments?.hoveredThreadId === renderedPin.thread.id;
                                const isDragging = commentDragState?.threadId === renderedPin.thread.id;
                                const canShowHoverPreview =
                                    isHovered &&
                                    !isSelected &&
                                    !isDragging &&
                                    !pendingCommentPoint &&
                                    !comments?.pendingComment;
                                const tone = isSelected
                                    ? 'selected'
                                    : root.status === 'resolved'
                                        ? 'resolved'
                                        : 'default';
                                const threadStepId = getCanvasCommentStepId(root);
                                const threadStep = threadStepId
                                    ? flow.steps?.find((step) => step.id === threadStepId) || null
                                    : null;
                                const hoverDetail = threadStepId
                                    ? getStepCommentLabel(threadStep)
                                    : null;

                                return (
                                    <div
                                        key={renderedPin.thread.id}
                                        className={cn(
                                            'absolute pointer-events-none',
                                            isDragging
                                                ? 'z-[118]'
                                                : canShowHoverPreview
                                                    ? 'z-[117]'
                                                    : isSelected
                                                        ? 'z-[114]'
                                                        : isHovered
                                                            ? 'z-[112]'
                                                            : 'z-[110]'
                                        )}
                                        style={{
                                            left: `${renderedPin.point.x}px`,
                                            top: `${renderedPin.point.y - SHARE_COMMENT_PIN_TIP_OFFSET_PX}px`,
                                            transform: `translateX(-${SHARE_COMMENT_PIN_TIP_X_OFFSET_PX}px)`,
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className={cn(
                                                'pointer-events-auto bg-transparent border-0 p-0 transition-transform duration-150 ease-out',
                                                isDragging ? 'scale-110' : isSelected || isHovered ? 'scale-105' : 'scale-100'
                                            )}
                                            style={{ cursor: CANVAS_DEFAULT_CURSOR }}
                                            data-comment-pin-id={renderedPin.thread.id}
                                            onPointerDown={(event) => handleCommentPinPointerDown(event, renderedPin)}
                                            onPointerMove={(event) => handleCommentPinPointerMove(event, renderedPin)}
                                            onPointerUp={(event) => void handleCommentPinPointerUp(event, renderedPin)}
                                            onPointerCancel={handleCommentPinPointerCancel}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                const suppressedClick = suppressCommentClickRef.current;
                                                if (
                                                    suppressedClick &&
                                                    suppressedClick.threadId === renderedPin.thread.id &&
                                                    suppressedClick.expiresAt > Date.now()
                                                ) {
                                                    suppressCommentClickRef.current = null;
                                                    return;
                                                }
                                                if (suppressedClick && suppressedClick.expiresAt <= Date.now()) {
                                                    suppressCommentClickRef.current = null;
                                                }
                                                if (commentDragState?.threadId === renderedPin.thread.id) return;
                                                openCommentThread(renderedPin.thread.id, { reveal: true });
                                            }}
                                            onMouseEnter={() => comments?.setHoveredThreadId(renderedPin.thread.id)}
                                            onMouseLeave={() => comments?.setHoveredThreadId(null)}
                                            onFocus={() => comments?.setHoveredThreadId(renderedPin.thread.id)}
                                            onBlur={() => comments?.setHoveredThreadId(null)}
                                            aria-label={`Open comment by ${root.author_name}`}
                                            >
                                                <ShareCommentPin
                                                    name={root.author_name}
                                                    avatarUrl={root.author_avatar_url}
                                                    tone={tone}
                                                    surfaceTone={commentSurfaceTone}
                                                />
                                            </button>

                                            <CommentThreadHoverPreview
                                                visible={canShowHoverPreview}
                                                ariaLabel={`Preview thread by ${root.author_name}`}
                                                authorName={root.author_name}
                                                authorAvatarUrl={root.author_avatar_url}
                                                isResolved={root.status === 'resolved'}
                                                relativeTimeLabel={formatCommentRelativeTime(renderedPin.thread.latestActivityAt)}
                                                timeTitle={formatCommentDate(renderedPin.thread.latestActivityAt)}
                                                previewText={getCommentExcerpt(root.message, 80)}
                                                detail={hoverDetail}
                                                replyCount={renderedPin.thread.replies.length}
                                                tone={commentSurfaceTone}
                                                style={{
                                                    left:
                                                        SHARE_COMMENT_PIN_WIDTH_PX -
                                                        SHARE_COMMENT_PIN_TIP_X_OFFSET_PX +
                                                        COMMENT_THREAD_HOVER_PREVIEW_GAP_PX,
                                                    top: SHARE_COMMENT_PIN_HEAD_CENTER_OFFSET_PX,
                                                }}
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    openCommentThread(renderedPin.thread.id, { reveal: true });
                                                }}
                                                onMouseEnter={() => comments?.setHoveredThreadId(renderedPin.thread.id)}
                                                onMouseLeave={() => comments?.setHoveredThreadId(null)}
                                                onFocus={() => comments?.setHoveredThreadId(renderedPin.thread.id)}
                                                onBlur={() => comments?.setHoveredThreadId(null)}
                                            />
                                        </div>
                                );
                            })}

                            {pendingCommentPoint ? (
                                <div
                                    className="absolute z-[116]"
                                    data-pending-comment-pin="true"
                                    style={{
                                        left: `${pendingCommentPoint.x}px`,
                                        top: `${pendingCommentPoint.y - SHARE_COMMENT_PIN_TIP_OFFSET_PX}px`,
                                        transform: `translateX(-${SHARE_COMMENT_PIN_TIP_X_OFFSET_PX}px)`,
                                    }}
                                >
                                    <div className="comment-drop-pin-enter">
                                        <ShareCommentPin
                                            name="New comment"
                                            tone="pending"
                                            pending={true}
                                            surfaceTone={commentSurfaceTone}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {commentComposerAnchor && (comments?.pendingComment || comments?.activeThread) ? (
                            <div
                                className="absolute z-[120] pointer-events-auto"
                                style={{
                                    left: `${commentComposerPlacement?.left ?? -9999}px`,
                                    top: `${commentComposerPlacement?.top ?? -9999}px`,
                                    visibility: commentComposerPlacement ? 'visible' : 'hidden',
                                    pointerEvents: commentComposerPlacement ? 'auto' : 'none',
                                }}
                            >
                                <div
                                    ref={commentPopoverRef}
                                    className={cn(
                                        'transition-all duration-150 ease-out',
                                        comments?.pendingComment && commentComposerPlacement
                                            ? 'comment-drop-composer-enter'
                                            : null,
                                        commentComposerPlacement?.side === 'left'
                                            ? 'origin-right'
                                            : 'origin-left'
                                    )}
                                >
                                    {comments?.pendingComment ? (
                                        <CanvasCommentPopover
                                            mode="new"
                                            error={comments.error}
                                            isAuthLoading={comments.isAuthLoading}
                                            userCanComment={comments.userCanComment}
                                            value={comments.newCommentText}
                                            isSubmitting={comments.postingRootComment}
                                            onValueChange={comments.setNewCommentText}
                                            onSubmit={() => void comments.submitPendingComment()}
                                            onClose={comments.dismissPendingComment}
                                            onSignIn={onCommentSignIn}
                                            surfaceTone={commentSurfaceTone}
                                        />
                                    ) : comments?.activeThread ? (
                                        <CanvasCommentPopover
                                            mode="thread"
                                            error={comments.error}
                                            isAuthLoading={comments.isAuthLoading}
                                            userCanComment={comments.userCanComment}
                                            thread={comments.activeThread}
                                            replyDraft={comments.replyDrafts[comments.activeThread.id] || ''}
                                            onReplyDraftChange={(value) => comments.setReplyDraft(comments.activeThread!.id, value)}
                                            onReplySubmit={() => void comments.submitReply(comments.activeThread!.id)}
                                            isReplySubmitting={comments.postingReplyThreadId === comments.activeThread.id}
                                            canManageComment={comments.canManageComment}
                                            canResolveThread={comments.canResolveThread(comments.activeThread)}
                                            editingCommentId={comments.editingCommentId}
                                            editDraft={comments.editDraft}
                                            onStartEditing={comments.startEditingComment}
                                            onEditDraftChange={comments.setEditDraft}
                                            onSaveEdit={(commentId) => void comments.saveEditingComment(commentId)}
                                            onCancelEdit={comments.cancelEditingComment}
                                            savingEditCommentId={comments.savingEditCommentId}
                                            onToggleThreadStatus={() =>
                                                void comments.toggleThreadStatus(
                                                    comments.activeThread!,
                                                    comments.activeThread!.root.status === 'open' ? 'resolved' : 'open'
                                                )
                                            }
                                            isStatusUpdating={comments.updatingStatusThreadId === comments.activeThread.id}
                                            deletingCommentId={comments.deletingCommentId}
                                            onDeleteComment={(comment) =>
                                                void comments.deleteComment(comments.activeThread!, comment)
                                            }
                                            onClose={comments.dismissComposer}
                                            onSignIn={onCommentSignIn}
                                            surfaceTone={commentSurfaceTone}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : null}
                {!isFlowReadOnly && pendingToolbarPlacement?.canvasPosition ? (() => {
                    const preview = getToolbarPlacementPreviewConfig(pendingToolbarPlacement.type);

                    return (
                        <div
                            className="pointer-events-none absolute z-[54]"
                            style={{
                                left: pendingToolbarPlacement.canvasPosition.x,
                                top: pendingToolbarPlacement.canvasPosition.y,
                                transform: 'translate(12px, 12px)',
                            }}
                        >
                            <div className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 shadow-[0_18px_36px_rgb(15_23_42/0.18)] ${preview.borderClassName} ${preview.surfaceClassName}`}>
                                <div className="shrink-0">
                                    {preview.icon}
                                </div>
                                <span className="whitespace-nowrap text-sm font-medium text-shell-text">
                                    {preview.label}
                                </span>
                            </div>
                        </div>
                    );
                })() : null}
                {!isFlowReadOnly && quickAddMenu && quickAddConnectionPreview && (
                    <svg
                        className="pointer-events-none absolute inset-0 z-[55] overflow-visible"
                        width="100%"
                        height="100%"
                        aria-hidden="true"
                    >
                        <FrozenConnectionPreview
                            fromX={quickAddConnectionPreview.fromX}
                            fromY={quickAddConnectionPreview.fromY}
                            fromPosition={quickAddConnectionPreview.fromPosition}
                            toX={quickAddConnectionPreview.toX}
                            toY={quickAddConnectionPreview.toY}
                            toPosition={quickAddConnectionPreview.toPosition}
                            variant={quickAddConnectionPreview.variant}
                        />
                    </svg>
                )}
                {!isFlowReadOnly ? (
                    <ConnectionQuickAddMenu
                        open={Boolean(quickAddMenu)}
                        position={quickAddMenu?.screenPosition || null}
                        onSelect={handleQuickAddSelect}
                        onOptionHover={handleQuickAddOptionHover}
                        onCancel={handleQuickAddCancel}
                    />
                ) : null}
            </div>
        </div>
    );
}
