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
    SelectionMode,
    useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TurnNode } from './nodes/TurnNode';
import { UserTurnNode } from './nodes/UserTurnNode';
import { ConditionNode } from './nodes/ConditionNode';
import { StartNode } from './nodes/StartNode';
import { NoteNode } from './nodes/NoteNode';
import { Flow, Component, ComponentType, Turn, ComponentContent, UserTurn, Condition, Branch, Note } from '../studio/types';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { SelectionState } from './types';
import { ContextToolbar } from './components/ContextToolbar';
import { FloatingToolbar } from './components/FloatingToolbar';
import { ZoomControls } from './components/ZoomControls';
import { ActionTooltip } from './components/ActionTooltip';
import {
    ConnectionLine,
    FrozenConnectionPreview,
    type ConnectionPreviewVariant
} from './components/ConnectionLine';
import { ConnectionQuickAddMenu, QuickAddNodeType } from './components/ConnectionQuickAddMenu';
import { ShareDialog } from '../studio/components/ShareDialog';
import { ArrowLeft, ChevronDown, Download, ExternalLink, PanelRightOpen, Play, Split, StickyNote, UserRound } from 'lucide-react';
import {
    ShellButton,
    ShellIconButton,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuSeparator,
    ShellMenuTrigger,
} from '@/components/shell';
import { UserMenu } from '@/components/layout/UserMenu';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { cn } from '@/utils/cn';
import { CanvasCommentPopover } from '../studio/CanvasCommentPopover';
import {
    getCanvasCommentAnchor,
} from '../studio/canvasComments';
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
    SHARE_COMMENT_PIN_TIP_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX,
} from '../share/components/ShareCommentPin';


// Register custom node types
const nodeTypes: NodeTypes = {
    turn: TurnNode,
    'user-turn': UserTurnNode,
    condition: ConditionNode,
    start: StartNode,
    note: NoteNode,
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
    onPreview: () => void;
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
    header?: React.ReactNode;
    mode?: 'edit' | 'share-readonly';
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

type ToolbarPlacementType = QuickAddNodeType | 'note';

interface PendingToolbarPlacementState {
    type: ToolbarPlacementType;
    canvasPosition: { x: number; y: number } | null;
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

const COMMENT_POPUP_EDGE_PADDING_PX = 12;
const COMMENT_POPUP_WIDTH_PX = 400;
const COMMENT_POPUP_NEW_HEIGHT_PX = 104;
const COMMENT_POPUP_THREAD_HEIGHT_PX = 380;
const COMMENT_POPUP_GAP_PX = 8 + 20;
const COMMENT_DRAG_THRESHOLD_PX = 5;
const COMMENT_PLACE_CURSOR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
  <path
    fill="#FFF"
    stroke="#000"
    stroke-width="2"
    stroke-linejoin="round"
    d="M7.5 5.5h13A4.5 4.5 0 0 1 25 10v5.5A4.5 4.5 0 0 1 20.5 20H15l-4.75 4.5a.75.75 0 0 1-1.27-.54V20H7.5A4.5 4.5 0 0 1 3 15.5V10a4.5 4.5 0 0 1 4.5-4.5Z"
  />
</svg>
`.trim();
const COMMENT_PLACEMENT_CURSOR = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    COMMENT_PLACE_CURSOR_SVG
)}") 10 24, crosshair`;

const clampValue = (value: number, min: number, max: number) => {
    if (max < min) return min;
    return Math.min(Math.max(value, min), max);
};

const getAnchoredPopoverPosition = ({
    surfaceRect,
    anchor,
    popoverWidth,
    popoverHeight,
    gapPx = COMMENT_POPUP_GAP_PX,
    anchorOffsetYPx = 0,
}: {
    surfaceRect: DOMRect;
    anchor: CanvasPinPoint;
    popoverWidth: number;
    popoverHeight: number;
    gapPx?: number;
    anchorOffsetYPx?: number;
}): ComposerPlacement => {
    const availableRight = surfaceRect.width - anchor.x;
    const availableLeft = anchor.x;
    const side: ComposerSide =
        availableRight >= popoverWidth + gapPx || availableRight >= availableLeft ? 'right' : 'left';

    const left =
        side === 'right'
            ? clampValue(anchor.x + gapPx, COMMENT_POPUP_EDGE_PADDING_PX, surfaceRect.width - popoverWidth - COMMENT_POPUP_EDGE_PADDING_PX)
            : clampValue(anchor.x - gapPx - popoverWidth, COMMENT_POPUP_EDGE_PADDING_PX, surfaceRect.width - popoverWidth - COMMENT_POPUP_EDGE_PADDING_PX);

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

type ClipboardNodeStep = Turn | UserTurn | Condition | Note;
type CanvasClipboardPayload =
    | { type: 'node'; step: ClipboardNodeStep; pasteCount: number }
    | { type: 'nodes'; steps: ClipboardNodeStep[]; pasteCount: number }
    | { type: 'component'; component: Component }
    | { type: 'components'; components: Component[] }
    | { type: 'branch'; branch: Branch };

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const withCopySuffix = (label: string | undefined, fallback: string): string => {
    const baseLabel = label?.trim() ? label.trim() : fallback;
    if (baseLabel.endsWith(' (Copy)')) {
        return baseLabel;
    }
    return `${baseLabel} (Copy)`;
};

const cloneComponentForPaste = (component: Component): Component => ({
    ...cloneValue(component),
    id: `component-${crypto.randomUUID()}`,
});

const cloneBranchForPaste = (branch: Branch): Branch => ({
    ...cloneValue(branch),
    id: `branch-${crypto.randomUUID()}`,
});

const cloneNodeStepForPaste = (step: ClipboardNodeStep, pasteCount: number): ClipboardNodeStep => {
    const offset = NODE_PASTE_OFFSET_PX * Math.max(1, pasteCount);

    if (step.type === 'turn') {
        const clonedStep = cloneValue(step);
        return {
            ...clonedStep,
            id: crypto.randomUUID(),
            label: withCopySuffix(clonedStep.label, 'AI Turn'),
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
            label: withCopySuffix(clonedStep.label, 'Condition'),
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
            label: withCopySuffix(clonedStep.label, 'User Turn'),
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
        label: withCopySuffix(clonedStep.label, 'Sticky note'),
        position: {
            x: (clonedStep.position?.x ?? 250) + offset,
            y: (clonedStep.position?.y ?? 0) + offset,
        },
    };
};

const cloneNodeStepsForPaste = (steps: ClipboardNodeStep[], pasteCount: number): ClipboardNodeStep[] =>
    steps.map((step) => cloneNodeStepForPaste(step, pasteCount));

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
    onPreview,
    isPreviewActive,
    onToggleComments,
    onOpenCommentsPanel,
    isCommentModeActive: isCommentModeActiveProp = false,
    isCommentsPanelOpen = false,
    comments = null,
    showCommentsToggle,
    mode = 'edit',
}: CanvasEditorProps) {
    const { screenToFlowPosition, setCenter } = useReactFlow();
    const viewport = useViewport();
    const canvasAreaRef = useRef<HTMLDivElement | null>(null);
    const commentPopoverRef = useRef<HTMLDivElement | null>(null);
    const suppressNextCommentPlacementRef = useRef(false);
    const suppressCommentClickRef = useRef<{ threadId: string; expiresAt: number } | null>(null);
    const isReadOnly = mode === 'share-readonly';
    const isCommentModeActive = !isReadOnly && isCommentModeActiveProp;
    const areCommentsVisible = !!comments;

    // Selection state
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [selectionAnchorEl, setSelectionAnchorEl] = useState<HTMLElement | null>(null);
    const [pendingAutoOpenAddComponentNodeId, setPendingAutoOpenAddComponentNodeId] = useState<string | null>(null);
    const [pendingReactFlowSelectedNodeIds, setPendingReactFlowSelectedNodeIds] = useState<string[] | null>(null);

    const selectionRef = useRef<SelectionState | null>(selection);
    const flowRef = useRef(flow);
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

    const applyFlowUpdate = useCallback((nextFlow: Flow) => {
        if (isReadOnly) return;
        onUpdateFlow(nextFlow);
    }, [isReadOnly, onUpdateFlow]);

    useEffect(() => {
        if (!isReadOnly) return;
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
        setPendingToolbarPlacement(null);
    }, [isReadOnly]);

    useEffect(() => {
        selectionRef.current = selection;
    }, [selection]);

    const setCanvasSelection = useCallback((nextSelection: SelectionState | null) => {
        selectionRef.current = nextSelection;
        setSelection(nextSelection);
    }, []);

    useEffect(() => {
        flowRef.current = flow;
    }, [flow]);

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

    const focusNodeWithToolbar = useCallback((nodeId: string, openAddComponentPopover = false) => {
        let attempts = 0;
        const maxAttempts = 24;

        const syncSelectionToNode = () => {
            const nodeEl = document.getElementById(`node-${nodeId}`) as HTMLElement | null;
            if (nodeEl || attempts >= maxAttempts) {
                setCanvasSelection({ type: 'node', nodeId });
                setSelectionAnchorEl(nodeEl);
                setPendingAutoOpenAddComponentNodeId(openAddComponentPopover ? nodeId : null);
                setPendingReactFlowSelectedNodeIds([nodeId]);
                return;
            }

            attempts += 1;
            requestAnimationFrame(syncSelectionToNode);
        };

        requestAnimationFrame(syncSelectionToNode);
    }, [setCanvasSelection]);

    const createToolbarNodeAtPosition = useCallback((type: ToolbarPlacementType, position: { x: number; y: number }) => {
        const currentFlow = flowRef.current;
        const currentSteps = currentFlow.steps || [];

        if (type === 'turn') {
            const aiTurnCount = currentSteps.filter((step) => step.type === 'turn').length + 1;
            const newTurn: Turn = {
                id: crypto.randomUUID(),
                type: 'turn',
                speaker: 'ai',
                label: `AI Turn ${aiTurnCount}`,
                components: [],
                position,
            };

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, newTurn],
                lastModified: Date.now(),
            });
            focusNodeWithToolbar(newTurn.id, true);
            return;
        }

        if (type === 'user-turn') {
            const userTurnCount = currentSteps.filter((step) => step.type === 'user-turn').length + 1;
            const newUserTurn: UserTurn = {
                id: crypto.randomUUID(),
                type: 'user-turn',
                label: `User Turn ${userTurnCount}`,
                inputType: 'text',
                position,
            };

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, newUserTurn],
                lastModified: Date.now(),
            });
            return;
        }

        if (type === 'condition') {
            const conditionCount = currentSteps.filter((step) => step.type === 'condition').length + 1;
            const newCondition: Condition = {
                id: crypto.randomUUID(),
                type: 'condition',
                label: `Condition ${conditionCount}`,
                question: '',
                branches: createDefaultConditionBranches(),
                position,
            };

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, newCondition],
                lastModified: Date.now(),
            });
            return;
        }

        const noteCount = currentSteps.filter((step) => step.type === 'note').length + 1;
        const newNote: Note = {
            id: crypto.randomUUID(),
            type: 'note',
            label: `Sticky note ${noteCount}`,
            content: '',
            position,
        };

        applyFlowUpdate({
            ...currentFlow,
            steps: [...currentSteps, newNote],
            lastModified: Date.now(),
        });
    }, [applyFlowUpdate, focusNodeWithToolbar]);

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
        if (isReadOnly) return;

        const initialCanvasPosition = (
            isCanvasPointerInsideRef.current && lastCanvasPointerClientRef.current
        )
            ? getCanvasPositionFromClient(lastCanvasPointerClientRef.current)
            : null;

        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
        setPendingToolbarPlacement({ type, canvasPosition: initialCanvasPosition });
    }, [getCanvasPositionFromClient, isReadOnly]);

    const placePendingToolbarPlacementAtClient = useCallback((client: { x: number; y: number }) => {
        if (!pendingToolbarPlacement) return false;

        const canvasPosition = getCanvasPositionFromClient(client);
        if (!canvasPosition) return false;

        createToolbarNodeAtPosition(pendingToolbarPlacement.type, screenToFlowPosition(client));
        setPendingToolbarPlacement(null);
        return true;
    }, [createToolbarNodeAtPosition, getCanvasPositionFromClient, pendingToolbarPlacement, screenToFlowPosition]);

    useEffect(() => {
        if (isReadOnly) return;

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
    }, [isReadOnly, updatePendingToolbarPlacementPreview]);

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

    const isEmptyAiTurnNode = useCallback((nodeId: string): boolean => {
        const step = flowRef.current.steps?.find((candidate) => candidate.id === nodeId);
        return Boolean(step && step.type === 'turn' && step.speaker === 'ai' && step.components.length === 0);
    }, []);

    const handleDeselect = useCallback(() => {
        setCanvasSelection(null);
        setSelectionAnchorEl(null);
        setPendingAutoOpenAddComponentNodeId(null);
        setPendingReactFlowSelectedNodeIds([]);
    }, [setCanvasSelection]);

    useEffect(() => {
        if (!isCommentModeActive) return;
        handleDeselect();
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
        setPendingToolbarPlacement(null);
        setPendingAutoOpenAddComponentNodeId(null);
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

        setSelectionAnchorEl(null);
        setPendingAutoOpenAddComponentNodeId(null);
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

    const handleConditionLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'condition'
                ? {
                    ...s,
                    label: newLabel,
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

        if (sourceComponent.type === 'prompt') {
            return 'prompt';
        }

        if (
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
            const aiTurnCount = existingSteps.filter(step => step.type === 'turn').length + 1;
            newStep = {
                id: crypto.randomUUID(),
                type: 'turn',
                speaker: 'ai',
                label: `AI Turn ${aiTurnCount}`,
                components: [],
                position,
            };
        } else if (targetType === 'condition') {
            const conditionCount = existingSteps.filter(step => step.type === 'condition').length + 1;
            newStep = {
                id: crypto.randomUUID(),
                type: 'condition',
                label: `Condition ${conditionCount}`,
                question: '',
                branches: createDefaultConditionBranches(),
                position,
            };
        } else {
            const userTurnCount = existingSteps.filter(step => step.type === 'user-turn').length + 1;
            newStep = {
                id: crypto.randomUUID(),
                type: 'user-turn',
                label: `User Turn ${userTurnCount}`,
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
            focusNodeWithToolbar(newStep.id, true);
        }
    }, [applyFlowUpdate, focusNodeWithToolbar, resolveDefaultUserTurnInputType]);

    const onConnectStart: OnConnectStart = useCallback((event, params) => {
        if (isReadOnly) return;

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
    }, [isReadOnly]);

    const onConnectEnd: OnConnectEnd = useCallback((event, connectionState) => {
        if (isReadOnly) return;

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
    }, [createConnectedNode, isReadOnly, screenToFlowPosition]);

    const handleQuickAddSelect = useCallback((targetType: QuickAddNodeType) => {
        if (isReadOnly) return;
        if (!quickAddMenu) return;

        createConnectedNode({
            sourceNodeId: quickAddMenu.sourceNodeId,
            sourceHandleId: quickAddMenu.sourceHandleId,
            targetType,
            position: quickAddMenu.flowPosition,
        });
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
    }, [quickAddMenu, createConnectedNode, isReadOnly]);

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

    const handleComponentAdd = useCallback((type: ComponentType, targetNodeId?: string) => {
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
        setPendingAutoOpenAddComponentNodeId(null);
    }, [applyFlowUpdate]);

    const getNodeCommentState = useCallback(() => {
        return {
            hasComments: false,
            isActive: false,
            isPlacementMode: isCommentModeActive,
        };
    }, [isCommentModeActive]);

    // Convert flow steps to React Flow nodes
    const baseNodes = useMemo(() => {
        // Use new steps[] if available, otherwise fall back to old blocks[]
        const steps = flow.steps || [];

        if (steps.length === 0) {
            // Fallback: convert old blocks to display (for backward compatibility)
            return flow.blocks.map((block, index) => ({
                id: block.id,
                type: 'turn',
                position: { x: 250, y: index * 150 },
                data: {
                    speaker: block.type as 'user' | 'ai',
                    phase: block.phase,
                    label: block.type === 'ai' && 'variant' in block
                        ? block.variant
                        : undefined,
                    entryPoint: flow.settings.entryPoint,
                    readOnly: isReadOnly,
                    onSelectComponent: handleSelectComponent,
                    onDeselect: handleDeselect,
                },
            }));
        }

        // Use new Turn structure
        return steps.map((step) => {
            const commentState = getNodeCommentState();

            if (step.type === 'turn') {
                return {
                    id: step.id,
                    type: 'turn',
                    position: step.position || { x: 250, y: 0 },
                    data: {
                        speaker: step.speaker,
                        phase: step.phase,
                        label: step.label,
                        components: step.components,
                        entryPoint: flow.settings.entryPoint,
                        readOnly: isReadOnly,
                        commentState,
                        onSelectComponent: handleSelectComponent,
                        onDeselect: handleDeselect,
                        onComponentReorder: handleTurnComponentReorder,
                        onLabelChange: handleTurnLabelChange,
                        onComponentUpdate: handleTurnComponentUpdate,
                    },
                };
            } else if (step.type === 'user-turn') {
                return {
                    id: step.id,
                    type: 'user-turn',
                    position: step.position || { x: 250, y: 0 },
                    data: {
                        label: step.label,
                        inputType: step.inputType || 'button', // Default key
                        triggerValue: step.triggerValue,
                        readOnly: isReadOnly,
                        commentState,
                        onUpdate: handleUserTurnUpdate,
                    }
                };
            } else if (step.type === 'condition') {
                // Condition node
                return {
                    id: step.id,
                    type: 'condition',
                    position: step.position || { x: 250, y: 0 },
                    data: {
                        label: step.label,
                        question: step.question,
                        branches: step.branches,
                        readOnly: isReadOnly,
                        commentState,
                        onLabelChange: handleConditionLabelChange,
                        onQuestionChange: handleConditionQuestionChange,
                        onUpdateBranches: handleConditionUpdateBranches,
                    },
                };
            } else if (step.type === 'note') {
                return {
                    id: step.id,
                    type: 'note',
                    position: step.position || { x: 250, y: 0 },
                    data: {
                        label: step.label,
                        content: step.content,
                        readOnly: isReadOnly,
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
                    data: {},
                    deletable: false, // Start node cannot be deleted
                };
            }
        });
    }, [
        flow.blocks,
        isReadOnly,
        flow.settings.entryPoint,
        flow.steps,
        handleConditionLabelChange,
        handleConditionQuestionChange,
        handleConditionUpdateBranches,
        handleDeselect,
        getNodeCommentState,
        handleNoteContentChange,
        handleNoteLabelChange,
        handleSelectComponent,
        handleTurnComponentReorder,
        handleTurnComponentUpdate,
        handleTurnLabelChange,
        handleUserTurnUpdate,
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
        }
    }, [isCommentModeActive]);

    useEffect(() => {
        if (!commentComposerAnchor) {
            setCommentComposerPlacement(null);
            return;
        }

        const updatePlacement = () => {
            const canvasRect = canvasAreaRef.current?.getBoundingClientRect();
            if (!canvasRect) return;

            const popoverRect = commentPopoverRef.current?.getBoundingClientRect();
            const popoverWidth = popoverRect?.width || COMMENT_POPUP_WIDTH_PX;
            const popoverHeight =
                popoverRect?.height ||
                (comments?.pendingComment ? COMMENT_POPUP_NEW_HEIGHT_PX : COMMENT_POPUP_THREAD_HEIGHT_PX);

            setCommentComposerPlacement(
                getAnchoredPopoverPosition({
                    surfaceRect: canvasRect,
                    anchor: commentComposerAnchor,
                    popoverWidth,
                    popoverHeight,
                    anchorOffsetYPx: -SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX,
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
    }, [commentComposerAnchor, comments?.pendingComment]);

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

            if (suppressNextCommentPlacementRef.current) {
                suppressNextCommentPlacementRef.current = false;
                return;
            }

            const placement = getFreeAnchorFromClient(event.clientX, event.clientY);
            if (!placement) return;

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
        setSelectionAnchorEl(event.currentTarget as HTMLElement);
        setPendingAutoOpenAddComponentNodeId(isEmptyAiTurnNode(node.id) ? node.id : null);
    }, [comments, getFreeAnchorFromClient, isCommentModeActive, isEmptyAiTurnNode, placePendingToolbarPlacementAtClient, setCanvasSelection]);

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
            if (currentSelection?.type !== 'node' || currentSelection.nodeId !== nodeId) {
                setSelectionAnchorEl(null);
            }
            setCanvasSelection({ type: 'node', nodeId });
            return;
        }

        setCanvasSelection({ type: 'nodes', nodeIds: selectedNodeIds });
        setSelectionAnchorEl(null);
        setPendingAutoOpenAddComponentNodeId(null);
    }, [handleDeselect, isCommentModeActive, setCanvasSelection]);

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

    const selectedNodeId = getSingleSelectedNodeId(selection);

    // Save positions when dragging stops
    const onNodeDragStop = useCallback((_: React.MouseEvent, _node: Node, nodes: Node[]) => {
        // Handle both single and multi-selection dragging by updating all dragged nodes
        // nodes array contains all nodes that serve as the drag selection
        const draggedNodes = nodes && nodes.length > 0 ? nodes : [_node];
        const draggedNodeMap = new Map(draggedNodes.map(n => [n.id, n]));

        const updatedSteps = flow.steps?.map(s => {
            const movedNode = draggedNodeMap.get(s.id);
            if (movedNode) {
                return { ...s, position: movedNode.position };
            }
            return s;
        });

        applyFlowUpdate({ ...flow, steps: updatedSteps, lastModified: Date.now() });
    }, [flow, applyFlowUpdate]);

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
            let updatedSteps = flow.steps;

            // SMART LINKING LOGIC:
            // If connecting from a specific prompt handle (starts with 'handle-') to a User Turn,
            // auto-fill the User Turn with that prompt's text.
            // auto-fill the User Turn with that prompt's text or selection item's title.
            if (connection.sourceHandle && connection.sourceHandle.startsWith('handle-')) {
                const sourceNodeId = connection.source;
                const targetNodeId = connection.target;
                const handleId = connection.sourceHandle;

                // Parse component ID from handle
                // Format: handle-{componentId} OR handle-{componentId}-{itemId}
                // We know componentId usually starts with 'component-'

                const sourceStep = flow.steps?.find(s => s.id === sourceNodeId);
                const targetStep = flow.steps?.find(s => s.id === targetNodeId);

                if (sourceStep && sourceStep.type === 'turn' && targetStep && targetStep.type === 'user-turn') {
                    // Try to find matching component
                    const component = sourceStep.components.find(c => handleId.includes(c.id));

                    if (component) {
                        let textToFill = '';

                        if (component.type === 'prompt') {
                            textToFill = (component.content as import('../studio/types').PromptContent).text;
                        } else if (component.type === 'selectionList') {
                            const listContent = component.content as import('../studio/types').SelectionListContent;
                            // Extract item ID from handle: handle-{componentId}-{itemId}
                            // The itemId is the suffix after componentId-
                            const itemId = handleId.split(`${component.id}-`)[1];
                            const item = listContent.items.find(i => i.id === itemId);
                            if (item) {
                                textToFill = item.title;
                            }
                        } else if (component.type === 'confirmationCard') {
                            const confirmationContent = component.content as import('../studio/types').ConfirmationCardContent;
                            if (confirmationContent.showActions === false) {
                                textToFill = '';
                            } else {
                                const actionId = handleId.split(`${component.id}-`)[1];
                                textToFill = actionId === 'reject'
                                    ? (confirmationContent.rejectLabel || 'Cancel')
                                    : (confirmationContent.confirmLabel || 'Confirm');
                            }
                        } else if (component.type === 'checkboxGroup') {
                            const checkboxContent = component.content as import('../studio/types').CheckboxGroupContent;
                            const isSecondaryAction = handleId.endsWith('-secondary');
                            textToFill = isSecondaryAction
                                ? (checkboxContent.secondaryLabel || checkboxContent.cancelLabel || 'Cancel')
                                : (checkboxContent.primaryLabel || checkboxContent.saveLabel || 'Save');
                        }

                        if (textToFill) {
                            // Valid link! Update the User Turn mode and auto-fill readable text.
                            updatedSteps = flow.steps?.map(s => {
                                if (s.id !== targetNodeId || s.type !== 'user-turn') {
                                    return s;
                                }

                                const nextInputType: UserTurn['inputType'] = component.type === 'prompt' ? 'prompt' : 'button';
                                return {
                                    ...s,
                                    label: textToFill,
                                    inputType: nextInputType,
                                    triggerValue: nextInputType === 'button' ? textToFill : s.triggerValue,
                                };
                            });
                        }
                    }
                }
            }

            applyFlowUpdate({
                ...flow,
                connections: updatedConnections,
                steps: updatedSteps,
                lastModified: Date.now()
            });
        },
        [flow, applyFlowUpdate]
    );

    const handleChangeUserTurnInputType = (inputType: 'text' | 'prompt' | 'button') => {
        if (selectedNodeId) {
            const updatedSteps = flow.steps?.map(s =>
                s.id === selectedNodeId && s.type === 'user-turn'
                    ? { ...s, inputType }
                    : s
            );
            applyFlowUpdate({ ...flow, steps: updatedSteps, lastModified: Date.now() });
        }
    };

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
        const currentFlow = flowRef.current;
        const deletedIds = new Set(deletedNodes.map(n => n.id));

        // Filter out nodes that shouldn't be deleted (e.g. Start node)
        // Note: React Flow might have already removed them from the UI, but we need to keep them in data if locked
        // However, usually we should prevent them from being selectable/deletable in the first place.
        // For now, we just proceed with the deletion from data.

        const updatedSteps = (currentFlow.steps || []).filter(s => !deletedIds.has(s.id));

        // Remove connections attached to these nodes
        const updatedConnections = (currentFlow.connections || []).filter(
            conn => !deletedIds.has(conn.source) && !deletedIds.has(conn.target)
        );

        applyFlowUpdate({
            ...currentFlow,
            steps: updatedSteps,
            connections: updatedConnections,
            lastModified: Date.now()
        });

        // If the custom selection was tied to a deleted node, clear it.
        const currentSelection = selectionRef.current;
        if (getSelectionNodeIds(currentSelection).some((nodeId) => deletedIds.has(nodeId))) {
            handleDeselect();
        }
    }, [applyFlowUpdate, handleDeselect]); // flowRef used inside

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
            if (!selectedStep || selectedStep.type === 'start') {
                return false;
            }

            clipboardRef.current = {
                type: 'node',
                step: cloneValue(selectedStep),
                pasteCount: 0,
            };
            return true;
        }

        if (currentSelection.type === 'nodes') {
            const selectedNodeIds = new Set(currentSelection.nodeIds);
            const selectedSteps = (currentFlow.steps || []).filter(
                (step): step is ClipboardNodeStep => selectedNodeIds.has(step.id) && step.type !== 'start'
            );

            if (selectedSteps.length === 0) {
                return false;
            }

            clipboardRef.current = selectedSteps.length === 1
                ? {
                    type: 'node',
                    step: cloneValue(selectedSteps[0]),
                    pasteCount: 0,
                }
                : {
                    type: 'nodes',
                    steps: cloneValue(selectedSteps),
                    pasteCount: 0,
                };
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

            clipboardRef.current = selectedComponents.length === 1
                ? {
                    type: 'component',
                    component: cloneValue(selectedComponents[0]),
                }
                : {
                    type: 'components',
                    components: cloneValue(selectedComponents),
                };
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

        clipboardRef.current = {
            type: 'branch',
            branch: cloneValue(selectedBranch),
        };
        return true;
    }, []);

    const handlePasteSelection = useCallback((): boolean => {
        if (isReadOnly) {
            return false;
        }

        const clipboard = clipboardRef.current;
        if (!clipboard) {
            return false;
        }

        const currentFlow = flowRef.current;
        const currentSteps = currentFlow.steps || [];

        if (clipboard.type === 'node') {
            const nextPasteCount = clipboard.pasteCount + 1;
            const newStep = cloneNodeStepForPaste(clipboard.step, nextPasteCount);
            clipboardRef.current = {
                ...clipboard,
                pasteCount: nextPasteCount,
            };

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, newStep],
                lastModified: Date.now(),
            });
            setCanvasSelection({ type: 'node', nodeId: newStep.id });
            setSelectionAnchorEl(null);
            setPendingReactFlowSelectedNodeIds([newStep.id]);
            return true;
        }

        if (clipboard.type === 'nodes') {
            const nextPasteCount = clipboard.pasteCount + 1;
            const newSteps = cloneNodeStepsForPaste(clipboard.steps, nextPasteCount);
            clipboardRef.current = {
                ...clipboard,
                pasteCount: nextPasteCount,
            };

            applyFlowUpdate({
                ...currentFlow,
                steps: [...currentSteps, ...newSteps],
                lastModified: Date.now(),
            });
            setCanvasSelection({ type: 'nodes', nodeIds: newSteps.map((step) => step.id) });
            setSelectionAnchorEl(null);
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
            setSelectionAnchorEl(null);
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
        setSelectionAnchorEl(null);
        setPendingReactFlowSelectedNodeIds([]);
        return true;
    }, [applyFlowUpdate, isReadOnly, setCanvasSelection]);

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

    const [isAltPressed, setIsAltPressed] = useState(false);

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
            if (!originalStep || originalStep.type === 'start') return;

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
                        label: withCopySuffix(nodeToUpdate.label, 'Condition'),
                        question: materializeConditionQuestion(nodeToUpdate.question, nodeToUpdate.label),
                    };
                } else if (nodeToUpdate.type !== 'start' && 'label' in nodeToUpdate) {
                    const fallbackLabel = nodeToUpdate.type === 'turn'
                        ? 'AI Turn'
                        : nodeToUpdate.type === 'user-turn'
                            ? 'User Turn'
                            : 'Sticky note';
                    updatedSteps[draggedNodeIndex] = {
                        ...nodeToUpdate,
                        label: withCopySuffix(nodeToUpdate.label, fallbackLabel),
                    };
                }
            }

            // Add the static original
            updatedSteps.push(staticOriginalClone);

            applyFlowUpdate({
                ...flow,
                steps: updatedSteps,
                connections: finalConnections,
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

            if (type !== 'turn' && type !== 'user-turn' && type !== 'condition' && type !== 'note') {
                return;
            }

            createToolbarNodeAtPosition(type, screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            }));
        },
        [createToolbarNodeAtPosition, screenToFlowPosition]
    );

    const handlePaneClick = useCallback((event: React.MouseEvent) => {
        if (isCommentModeActive) {
            if (suppressNextCommentPlacementRef.current) {
                suppressNextCommentPlacementRef.current = false;
                return;
            }

            const placement = getFreeAnchorFromClient(event.clientX, event.clientY);
            if (!placement) return;
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
        if (target.closest('[data-comment-pin-id]')) return;

        suppressNextCommentPlacementRef.current = true;
        comments.dismissComposer();
    }, [comments]);

    const openCommentThread = useCallback((threadId: string, options?: { reveal?: boolean }) => {
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

    // Get current input type for toolbar (User Turn)
    const currentUserTurnInputType = selectedNodeId
        ? (flow.steps?.find(s => s.id === selectedNodeId && s.type === 'user-turn') as UserTurn | undefined)?.inputType
        : undefined;

    const renderPreviewOpenMenu = () => (
        <ShellMenu>
            <ActionTooltip content="Play prototype" disabled={isPreviewActive}>
                <ShellMenuTrigger asChild>
                    <ShellIconButton
                        aria-label="Play prototype"
                        className={`flex items-center justify-center w-8 h-8 rounded-md transition-all group ${isPreviewActive
                            ? "text-shell-accent-text bg-shell-accent-soft ring-1 ring-shell-accent-border"
                            : "text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                            }`}
                    >
                        <Play size={16} fill={isPreviewActive ? "currentColor" : "none"} className="mr-[1px]" />
                    </ShellIconButton>
                </ShellMenuTrigger>
            </ActionTooltip>
            <ShellMenuContent align="end" sideOffset={8} className="w-[196px] rounded-xl p-1.5 shadow-[0_20px_48px_rgb(15_23_42/0.18)]">
                <ShellMenuItem
                    size="compact"
                    className="gap-2.5 rounded-lg px-2.5 text-[12px]"
                    onClick={onPreview}
                >
                    <PanelRightOpen size={14} className="text-current opacity-70" />
                    Open here in canvas
                </ShellMenuItem>
                <ShellMenuSeparator className="my-1" />
                <ShellMenuItem
                    size="compact"
                    className="gap-2.5 rounded-lg px-2.5 text-[12px]"
                    onClick={() => window.open(`/share/${flow.id}`, '_blank')}
                >
                    <ExternalLink size={14} className="text-current opacity-70" />
                    Open in new tab
                </ShellMenuItem>
            </ShellMenuContent>
        </ShellMenu>
    );

    return (
        <div className="w-full h-full flex flex-col relative bg-shell-canvas">
            {/* Header */}
            {/* Top Left Pill: Back & Title */}
            <div className="absolute top-4 left-4 z-50 flex items-center h-11 gap-1.5 bg-shell-bg dark:bg-shell-surface-subtle px-2 rounded-xl shadow-sm dark:shadow-[0_14px_32px_rgb(0_0_0/0.26)] border border-shell-border/70 dark:border-shell-border/55 backdrop-blur-sm">
                {isReadOnly ? (
                    <ActionTooltip content="Back to dashboard">
                        <ShellIconButton
                            onClick={onBack}
                            aria-label="Back to dashboard"
                        >
                            <ArrowLeft size={18} />
                        </ShellIconButton>
                    </ActionTooltip>
                ) : (
                    <UserMenu
                        backItem={{ label: 'Back to dashboard', onSelect: onBack }}
                        switchItems={showCommentsToggle ? [{
                            label: 'Show comments',
                            checked: showCommentsToggle.checked,
                            onCheckedChange: showCommentsToggle.onCheckedChange,
                        }] : []}
                        contentAlign="start"
                        showAccountDetails={false}
                        trigger={(
                            <button
                                type="button"
                                aria-label="Open studio menu"
                                className="flex h-8 items-center gap-1 rounded-lg border border-transparent px-2 text-shell-muted transition-colors hover:border-shell-border/70 hover:bg-shell-surface hover:text-shell-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-accent/20 data-[state=open]:border-shell-border/70 data-[state=open]:bg-shell-surface data-[state=open]:text-shell-text dark:hover:bg-shell-surface dark:data-[state=open]:bg-shell-surface"
                            >
                                <img
                                    src="/vca-bug-black.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[19px] w-auto shrink-0 dark:hidden"
                                />
                                <img
                                    src="/vca-bug-white.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="hidden h-[19px] w-auto shrink-0 dark:block"
                                />
                                <ChevronDown size={14} className="shrink-0 text-current opacity-80" />
                            </button>
                        )}
                    />
                )}
                <div className="h-5 w-px bg-shell-chrome-divider" />
                <div className="relative inline-grid items-center min-w-[60px] max-w-[320px]">
                    <span className="invisible px-3 py-1 text-sm font-medium whitespace-pre border border-transparent col-start-1 row-start-1">
                        {flow.title || "Untitled flow"}
                    </span>
                    {isReadOnly ? (
                        <div className="absolute inset-0 w-full h-full font-medium text-sm text-shell-text bg-transparent border border-transparent rounded px-3 py-1 flex items-center truncate">
                            {flow.title || 'Untitled flow'}
                        </div>
                    ) : (
                        <input
                            value={flow.title}
                            onChange={(e) => applyFlowUpdate({ ...flow, title: e.target.value, lastModified: Date.now() })}
                            className="absolute inset-0 w-full h-full font-medium text-sm text-shell-text bg-transparent hover:bg-shell-surface-subtle focus:bg-shell-bg border border-transparent focus:border-shell-accent-border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-shell-accent/20 transition-all truncate placeholder:text-shell-muted"
                            placeholder="Untitled flow"
                        />
                    )}
                </div>
            </div>

            {/* Top Right Pill: File, Run & Share */}
            <div className="absolute top-4 right-4 z-50 flex items-center h-11 gap-2 bg-shell-bg dark:bg-shell-surface-subtle px-1.5 rounded-xl shadow-sm dark:shadow-[0_14px_32px_rgb(0_0_0/0.26)] border border-shell-border/70 dark:border-shell-border/55 backdrop-blur-sm">
                {isReadOnly ? (
                    <>
                        {renderPreviewOpenMenu()}
                        <ShareDialog
                            flow={flow}
                            enabledLinkTypes={['studio', 'prototype']}
                            linkLabelOverrides={{ studio: 'Copy link' }}
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
                            enabledLinkTypes={['studio', 'prototype']}
                            linkLabelOverrides={{ studio: 'Copy link' }}
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
                    onConnect={isReadOnly || isCommentModeActive ? undefined : onConnect}
                    onConnectStart={isReadOnly || isCommentModeActive ? undefined : onConnectStart}
                    onConnectEnd={isReadOnly || isCommentModeActive ? undefined : onConnectEnd}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onNodeDragStart={isReadOnly || isCommentModeActive ? undefined : onNodeDragStart}
                    onNodesDelete={isReadOnly || isCommentModeActive ? undefined : onNodesDelete}
                    onEdgesDelete={isReadOnly || isCommentModeActive ? undefined : onEdgesDelete}
                    onNodeDragStop={isReadOnly || isCommentModeActive ? undefined : onNodeDragStop}
                    onPaneClick={handlePaneClick}
                    onSelectionChange={onSelectionChange}
                    panOnScroll
                    selectionOnDrag={!isReadOnly && !isCommentModeActive}
                    selectionMode={SelectionMode.Partial}
                    elementsSelectable={!isCommentModeActive}
                    multiSelectionKeyCode={['Shift']}
                    panOnDrag={isReadOnly ? true : (isCommentModeActive || isAltPressed)}
                    zoomOnScroll={isReadOnly ? true : !isAltPressed}
                    deleteKeyCode={isReadOnly || isCommentModeActive ? null : ['Delete', 'Backspace']}
                    nodesDraggable={!isReadOnly && !isCommentModeActive}
                    nodesConnectable={!isReadOnly && !isCommentModeActive}
                    proOptions={{ hideAttribution: true }}
                    minZoom={0.1}
                    maxZoom={2}
                    onDragOver={isReadOnly || isCommentModeActive ? undefined : onDragOver}
                    onDrop={isReadOnly || isCommentModeActive ? undefined : onDrop}
                    connectionLineComponent={connectionLineWithPreview}
                    className={`bg-shell-studio-canvas ${!isReadOnly && isAltPressed ? 'is-alt-pressed' : ''} ${!isReadOnly && pendingToolbarPlacement ? 'is-placement-active' : ''} ${isCommentModeActive ? 'is-comment-mode' : ''}`}
                >

                    <Background color="rgb(var(--shell-studio-canvas-grid) / 1)" gap={20} size={2} />
                    {!isReadOnly && !isCommentModeActive && selectedNodeId && (
                        <ContextToolbar
                            selection={{ type: 'node', nodeId: selectedNodeId }}
                            anchorEl={selectionAnchorEl}
                            onAddComponent={(type: ComponentType) => handleComponentAdd(type, selectedNodeId)}
                            onChangeUserTurnInputType={handleChangeUserTurnInputType}
                            currentUserTurnInputType={currentUserTurnInputType}
                            autoOpenAddComponentPopover={pendingAutoOpenAddComponentNodeId === selectedNodeId}
                            onAutoOpenAddComponentHandled={() => setPendingAutoOpenAddComponentNodeId(null)}
                            isAiTurn={flow.steps?.some(s => s.id === selectedNodeId && s.type === 'turn')}
                        />
                    )}

                    {!isReadOnly ? (
                        <FloatingToolbar
                            // FloatingToolbar as seen in Step 72 accepts specific callbacks
                            onAddAiTurn={() => {
                                const aiTurnCount = (flow.steps?.filter(s => s.type === 'turn').length || 0) + 1;
                                const newTurn: Turn = {
                                    id: crypto.randomUUID(),
                                    type: 'turn',
                                    speaker: 'ai',
                                    label: `AI Turn ${aiTurnCount}`,
                                    components: [],
                                    position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                                };
                                applyFlowUpdate({
                                    ...flow,
                                    steps: [...(flow.steps || []), newTurn],
                                    lastModified: Date.now()
                                });
                                focusNodeWithToolbar(newTurn.id, true);
                            }}
                            onAddUserTurn={() => {
                                const userTurnCount = (flow.steps?.filter(s => s.type === 'user-turn').length || 0) + 1;
                                const newUserTurn: UserTurn = {
                                    id: crypto.randomUUID(),
                                    type: 'user-turn',
                                    label: `User Turn ${userTurnCount}`,
                                    inputType: 'text',
                                    position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                                };
                                applyFlowUpdate({
                                    ...flow,
                                    steps: [...(flow.steps || []), newUserTurn],
                                    lastModified: Date.now()
                                });
                            }}
                            onAddCondition={() => {
                                const conditionCount = (flow.steps?.filter(s => s.type === 'condition').length || 0) + 1;
                                const newCondition: Condition = {
                                    id: crypto.randomUUID(),
                                    type: 'condition',
                                    label: `Condition ${conditionCount}`,
                                    question: '',
                                    branches: createDefaultConditionBranches(),
                                    position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                                };
                                applyFlowUpdate({
                                    ...flow,
                                    steps: [...(flow.steps || []), newCondition],
                                    lastModified: Date.now()
                                });
                            }}
                            onAddNote={() => {
                                const noteCount = (flow.steps?.filter(s => s.type === 'note').length || 0) + 1;
                                const newNote: Note = {
                                    id: crypto.randomUUID(),
                                    type: 'note',
                                    label: `Sticky note ${noteCount}`,
                                    content: '',
                                    position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                                };
                                applyFlowUpdate({
                                    ...flow,
                                    steps: [...(flow.steps || []), newNote],
                                    lastModified: Date.now()
                                });
                            }}
                            onToggleComments={() => onToggleComments?.()}
                            isCommentsActive={isCommentModeActive || isCommentsPanelOpen}
                        />
                    ) : null}
                    <ZoomControls />
                </ReactFlow>
                {areCommentsVisible ? (
                    <>
                        <div className="absolute inset-0 z-[108] pointer-events-none">
                            {renderedCommentPins.map((renderedPin) => {
                                const root = renderedPin.thread.root;
                                const isSelected = comments?.activeThreadId === renderedPin.thread.id;
                                const isHovered = comments?.hoveredThreadId === renderedPin.thread.id;
                                const isDragging = commentDragState?.threadId === renderedPin.thread.id;
                                const canDrag =
                                    !!comments?.userCanComment &&
                                    comments.canManageComment(root) &&
                                    root.status === 'open';
                                const tone = isSelected
                                    ? 'selected'
                                    : root.status === 'resolved'
                                        ? 'resolved'
                                        : 'default';

                                return (
                                    <div
                                        key={renderedPin.thread.id}
                                        className={cn(
                                            'absolute -translate-x-1/2 pointer-events-none',
                                            isDragging ? 'z-[118]' : isSelected ? 'z-[114]' : 'z-[110]'
                                        )}
                                        style={{
                                            left: `${renderedPin.point.x}px`,
                                            top: `${renderedPin.point.y - SHARE_COMMENT_PIN_TIP_OFFSET_PX}px`,
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className={cn(
                                                'pointer-events-auto bg-transparent border-0 p-0 transition-transform duration-150 ease-out',
                                                canDrag ? 'cursor-grab' : 'cursor-pointer',
                                                isDragging ? 'cursor-grabbing scale-110' : isSelected || isHovered ? 'scale-105' : 'scale-100'
                                            )}
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
                                            />
                                        </button>
                                    </div>
                                );
                            })}

                            {pendingCommentPoint ? (
                                <div
                                    className="absolute -translate-x-1/2 z-[116]"
                                    style={{
                                        left: `${pendingCommentPoint.x}px`,
                                        top: `${pendingCommentPoint.y - SHARE_COMMENT_PIN_TIP_OFFSET_PX}px`,
                                    }}
                                >
                                    <ShareCommentPin name="New comment" tone="pending" pending={true} />
                                </div>
                            ) : null}
                        </div>

                        {commentComposerAnchor && (comments?.pendingComment || comments?.activeThread) ? (
                            <div
                                className="absolute z-[120] pointer-events-auto"
                                style={{
                                    left: `${commentComposerPlacement?.left ?? COMMENT_POPUP_EDGE_PADDING_PX}px`,
                                    top: `${commentComposerPlacement?.top ?? COMMENT_POPUP_EDGE_PADDING_PX}px`,
                                }}
                            >
                                <div
                                    ref={commentPopoverRef}
                                    className={cn(
                                        'transition-all duration-150 ease-out',
                                        commentComposerPlacement?.side === 'left' ? 'origin-right' : 'origin-left'
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
                                        />
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : null}
                {!isReadOnly && pendingToolbarPlacement?.canvasPosition ? (() => {
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
                {!isReadOnly && quickAddMenu && quickAddConnectionPreview && (
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
                {!isReadOnly ? (
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
