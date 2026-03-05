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
import { Button } from '@/components/ui/button';
import { ActionTooltip } from './components/ActionTooltip';
import {
    ConnectionLine,
    FrozenConnectionPreview,
    HandleHoverPreview,
    type ConnectionPreviewVariant
} from './components/ConnectionLine';
import { ConnectionQuickAddMenu, QuickAddNodeType } from './components/ConnectionQuickAddMenu';
import {
    CONNECTION_PREVIEW_CARD_HEIGHT_PX,
    CONNECTION_PREVIEW_HOVER_CARD_OFFSET_X_PX
} from './components/connectionPreviewConstants';
import { ShareDialog } from '../studio/components/ShareDialog';
import { ArrowLeft, Play, PanelRightOpen, ExternalLink, Download, Upload, FileJson } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';


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
                title: 'Select an option',
                layout: 'list',
                items: [
                    { id: '1', title: 'Option 1', subtitle: 'Description' },
                    { id: '2', title: 'Option 2', subtitle: 'Description' }
                ]
            };
        case 'confirmationCard':
            return {
                item: {
                    id: 'candidate-1',
                    title: 'Sarah Jenkins',
                    subtitle: 'sarah.j@example.com',
                    visualType: 'avatar'
                },
                confirmLabel: 'Yes, confirm',
                rejectLabel: 'No, not this person'
            };
        case 'checkboxGroup':
            return {
                title: 'Which options apply?',
                description: 'Select all that apply.',
                saveLabel: 'Save',
                options: [
                    { id: '1', label: 'Option 1' },
                    { id: '2', label: 'Option 2' },
                    { id: '3', label: 'Option 3' }
                ]
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
    header?: React.ReactNode;
    mode?: 'edit' | 'share-readonly';
}

const QUICK_CONNECT_CLICK_DISTANCE_PX = 6;
const QUICK_CONNECT_HORIZONTAL_OFFSET_PX = 320;
const HANDLE_HOVER_SUPPRESSION_MS = 900;
const HANDLE_HOVER_SUPPRESSION_MIN_MS = 550;
const HANDLE_HOVER_SUPPRESSION_MOVE_PX = 6;
const NODE_PASTE_OFFSET_PX = 40;
type ConnectionDropBehavior = 'popover' | 'auto-user-turn';

interface ConnectionGestureState {
    sourceNodeId: string;
    sourceHandleId: string | null;
    startClient: { x: number; y: number };
    sourceCanvasPoint: { x: number; y: number } | null;
    dropBehavior: ConnectionDropBehavior;
    previewVariant: ConnectionPreviewVariant;
}

interface QuickAddMenuState {
    sourceNodeId: string;
    sourceHandleId: string | null;
    screenPosition: { x: number; y: number };
    flowPosition: { x: number; y: number };
}

interface HoverHandlePreviewState {
    x: number;
    y: number;
    variant: ConnectionPreviewVariant;
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
    | { type: 'component'; component: Component }
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
    mode = 'edit',
}: CanvasEditorProps) {
    const { screenToFlowPosition } = useReactFlow();
    const canvasAreaRef = useRef<HTMLDivElement | null>(null);
    const isReadOnly = mode === 'share-readonly';

    // Selection state
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [selectionAnchorEl, setSelectionAnchorEl] = useState<HTMLElement | null>(null);

    const selectionRef = useRef<SelectionState | null>(selection);
    const flowRef = useRef(flow);
    const clipboardRef = useRef<CanvasClipboardPayload | null>(null);
    const connectionGestureRef = useRef<ConnectionGestureState | null>(null);
    const hoverPreviewSuppressionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hoverPreviewSuppressionOriginRef = useRef<{ x: number; y: number } | null>(null);
    const hoverPreviewSuppressionStartedAtRef = useRef<number>(0);
    const [connectionPreviewVariant, setConnectionPreviewVariant] = useState<ConnectionPreviewVariant | null>(null);
    const [isHandleHoverPreviewSuppressed, setIsHandleHoverPreviewSuppressed] = useState(false);
    const [hoverHandlePreview, setHoverHandlePreview] = useState<HoverHandlePreviewState | null>(null);
    const [quickAddMenu, setQuickAddMenu] = useState<QuickAddMenuState | null>(null);
    const [quickAddConnectionPreview, setQuickAddConnectionPreview] = useState<QuickAddConnectionPreviewState | null>(null);

    const applyFlowUpdate = useCallback((nextFlow: Flow) => {
        if (isReadOnly) return;
        onUpdateFlow(nextFlow);
    }, [isReadOnly, onUpdateFlow]);

    useEffect(() => {
        if (!isReadOnly) return;
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
        setConnectionPreviewVariant(null);
        setHoverHandlePreview(null);
    }, [isReadOnly]);

    useEffect(() => {
        selectionRef.current = selection;
    }, [selection]);

    useEffect(() => {
        flowRef.current = flow;
    }, [flow]);

    useEffect(() => {
        return () => {
            if (hoverPreviewSuppressionTimeoutRef.current) {
                clearTimeout(hoverPreviewSuppressionTimeoutRef.current);
                hoverPreviewSuppressionTimeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isHandleHoverPreviewSuppressed) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const origin = hoverPreviewSuppressionOriginRef.current;
            if (!origin) {
                setIsHandleHoverPreviewSuppressed(false);
                return;
            }

            const elapsedMs = Date.now() - hoverPreviewSuppressionStartedAtRef.current;
            if (elapsedMs < HANDLE_HOVER_SUPPRESSION_MIN_MS) {
                return;
            }

            const distance = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
            if (distance < HANDLE_HOVER_SUPPRESSION_MOVE_PX) {
                return;
            }

            if (hoverPreviewSuppressionTimeoutRef.current) {
                clearTimeout(hoverPreviewSuppressionTimeoutRef.current);
                hoverPreviewSuppressionTimeoutRef.current = null;
            }
            hoverPreviewSuppressionOriginRef.current = null;
            setIsHandleHoverPreviewSuppressed(false);
        };

        window.addEventListener('pointermove', handlePointerMove, true);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove, true);
        };
    }, [isHandleHoverPreviewSuppressed]);

    useEffect(() => {
        if (isHandleHoverPreviewSuppressed || connectionPreviewVariant || quickAddMenu) {
            setHoverHandlePreview(null);
        }
    }, [connectionPreviewVariant, isHandleHoverPreviewSuppressed, quickAddMenu]);

    useEffect(() => {
        if (isReadOnly) {
            setHoverHandlePreview(null);
            return;
        }

        const canvasEl = canvasAreaRef.current;
        if (!canvasEl) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            if (isHandleHoverPreviewSuppressed || connectionPreviewVariant || quickAddMenu) {
                return;
            }

            const target = (event.target as HTMLElement | null)?.closest('.flow-create-handle') as HTMLElement | null;
            if (!target || !canvasEl.contains(target)) {
                setHoverHandlePreview(null);
                return;
            }

            const canvasRect = canvasEl.getBoundingClientRect();
            const handleRect = target.getBoundingClientRect();
            const x = handleRect.left + handleRect.width / 2 - canvasRect.left;
            const y = handleRect.top + handleRect.height / 2 - canvasRect.top;
            const variant: ConnectionPreviewVariant = target.classList.contains('flow-create-handle-accent')
                ? 'accent'
                : 'neutral';

            setHoverHandlePreview((current) => {
                if (
                    current &&
                    current.variant === variant &&
                    Math.abs(current.x - x) < 0.5 &&
                    Math.abs(current.y - y) < 0.5
                ) {
                    return current;
                }

                return { x, y, variant };
            });
        };

        const handlePointerLeave = () => {
            setHoverHandlePreview(null);
        };

        canvasEl.addEventListener('pointermove', handlePointerMove, true);
        canvasEl.addEventListener('pointerleave', handlePointerLeave, true);

        return () => {
            canvasEl.removeEventListener('pointermove', handlePointerMove, true);
            canvasEl.removeEventListener('pointerleave', handlePointerLeave, true);
        };
    }, [connectionPreviewVariant, isHandleHoverPreviewSuppressed, isReadOnly, quickAddMenu]);

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

    const handleImportJSON = () => {
        if (isReadOnly) return;

        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target?.result as string);

                    // Validate basic structure
                    if (!importedData.steps || !importedData.settings) {
                        alert('Invalid flow file format. Missing required fields.');
                        return;
                    }

                    // Update flow with imported data
                    const updatedFlow: Flow = {
                        ...flow,
                        title: importedData.title || flow.title,
                        description: importedData.description,
                        settings: importedData.settings,
                        steps: importedData.steps,
                        connections: importedData.connections || [],
                        lastModified: Date.now(),
                    };

                    applyFlowUpdate(updatedFlow);

                } catch (error) {
                    console.error('Error importing flow:', error);
                    alert('Failed to import flow. Please check the file format.');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    };

    const handleDeselect = useCallback(() => {
        setSelection(null);
        setSelectionAnchorEl(null);
    }, []);

    const handleSelectComponent = useCallback((nodeId: string, componentId: string, anchorEl: HTMLElement) => {
        // Keep card selection sticky so Delete consistently targets the card.
        setSelection({ type: 'component', nodeId, componentId });
        setSelectionAnchorEl(anchorEl);
    }, []);

    const handleSelectBranch = useCallback((nodeId: string, branchId: string, anchorEl: HTMLElement) => {
        setSelection({ type: 'branch', nodeId, branchId });
        setSelectionAnchorEl(anchorEl);
    }, []);

    const handleTurnLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'turn'
                ? { ...s, label: newLabel }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleTurnComponentUpdate = useCallback((nodeId: string, componentId: string, updates: Partial<Component>) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s => {
            if (s.id === nodeId && s.type === 'turn') {
                return {
                    ...s,
                    components: s.components.map(c =>
                        c.id === componentId
                            ? { ...c, ...updates }
                            : c
                    )
                };
            }
            return s;
        });
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

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
    }, [onUpdateFlow]);

    const handleUserTurnUpdate = useCallback((nodeId: string, updates: Partial<UserTurn>) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'user-turn'
                ? { ...s, ...updates }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleConditionLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'condition'
                ? { ...s, label: newLabel }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleConditionUpdateBranches = useCallback((nodeId: string, branches: Branch[]) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'condition'
                ? { ...s, branches }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleNoteLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'note'
                ? { ...s, label: newLabel }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleNoteContentChange = useCallback((nodeId: string, newContent: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'note'
                ? { ...s, content: newContent }
                : s
        );
        applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

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
                components: [{
                    id: crypto.randomUUID(),
                    type: 'message',
                    content: getDefaultContent('message'),
                }],
                position,
            };
        } else if (targetType === 'condition') {
            const conditionCount = existingSteps.filter(step => step.type === 'condition').length + 1;
            newStep = {
                id: crypto.randomUUID(),
                type: 'condition',
                label: `Condition ${conditionCount}`,
                branches: [
                    { id: crypto.randomUUID(), condition: 'Yes' },
                    { id: crypto.randomUUID(), condition: 'No' },
                ],
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
    }, [onUpdateFlow, resolveDefaultUserTurnInputType]);

    const getQuickConnectPosition = useCallback((sourceNodeId: string) => {
        const sourceStep = flowRef.current.steps?.find(step => step.id === sourceNodeId);
        const sourcePosition = sourceStep?.position || { x: 250, y: 0 };

        return {
            x: sourcePosition.x + QUICK_CONNECT_HORIZONTAL_OFFSET_PX,
            y: sourcePosition.y,
        };
    }, []);

    const onConnectStart: OnConnectStart = useCallback((event, params) => {
        if (isReadOnly) return;

        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);

        if (params.handleType !== 'source' || !params.nodeId) {
            connectionGestureRef.current = null;
            setConnectionPreviewVariant(null);
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
            setConnectionPreviewVariant(null);
            return;
        }

        const startClient = getClientPositionFromPointerEvent(event);
        if (!startClient) {
            connectionGestureRef.current = null;
            setConnectionPreviewVariant(null);
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
            previewVariant,
        };
        setConnectionPreviewVariant(previewVariant);
    }, [isReadOnly]);

    const onConnectEnd: OnConnectEnd = useCallback((event, connectionState) => {
        if (isReadOnly) return;

        const gesture = connectionGestureRef.current;
        connectionGestureRef.current = null;
        setConnectionPreviewVariant(null);

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
            // Simple click creation is handled directly on the handle click event.
            // We only use connect-end for drag-release affordances.
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

    const handleQuickCreateFromHandle = useCallback((
        sourceNodeId: string,
        sourceHandleId: string | null,
        sourceHandleEl?: HTMLElement | null,
        pointerClient?: { x: number; y: number }
    ) => {
        if (isReadOnly) return;

        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);

        if (hoverPreviewSuppressionTimeoutRef.current) {
            clearTimeout(hoverPreviewSuppressionTimeoutRef.current);
            hoverPreviewSuppressionTimeoutRef.current = null;
        }
        hoverPreviewSuppressionOriginRef.current = pointerClient || null;
        hoverPreviewSuppressionStartedAtRef.current = Date.now();
        setIsHandleHoverPreviewSuppressed(true);
        hoverPreviewSuppressionTimeoutRef.current = setTimeout(() => {
            hoverPreviewSuppressionOriginRef.current = null;
            hoverPreviewSuppressionStartedAtRef.current = 0;
            setIsHandleHoverPreviewSuppressed(false);
            hoverPreviewSuppressionTimeoutRef.current = null;
        }, HANDLE_HOVER_SUPPRESSION_MS);

        let position = getQuickConnectPosition(sourceNodeId);
        if (sourceHandleEl) {
            const handleRect = sourceHandleEl.getBoundingClientRect();
            const handleCenter = {
                x: handleRect.left + handleRect.width / 2,
                y: handleRect.top + handleRect.height / 2,
            };

            const previewTopLeft = {
                x: handleCenter.x + CONNECTION_PREVIEW_HOVER_CARD_OFFSET_X_PX,
                y: handleCenter.y - CONNECTION_PREVIEW_CARD_HEIGHT_PX / 2,
            };

            position = screenToFlowPosition(previewTopLeft);
        }

        createConnectedNode({
            sourceNodeId,
            sourceHandleId,
            targetType: 'user-turn',
            position,
        });
    }, [createConnectedNode, getQuickConnectPosition, isReadOnly, screenToFlowPosition]);

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
                        onSelectComponent: handleSelectComponent,
                        onDeselect: handleDeselect,
                        onComponentReorder: handleTurnComponentReorder,
                        onLabelChange: handleTurnLabelChange,
                        onComponentUpdate: handleTurnComponentUpdate,
                        onQuickCreateFromHandle: handleQuickCreateFromHandle,
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
                        branches: step.branches,
                        selectedBranchId: undefined,
                        readOnly: isReadOnly,
                        onLabelChange: handleConditionLabelChange,
                        onUpdateBranches: handleConditionUpdateBranches,
                        onSelectBranch: handleSelectBranch,
                        onDeselect: handleDeselect,
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
        handleConditionUpdateBranches,
        handleDeselect,
        handleNoteContentChange,
        handleNoteLabelChange,
        handleSelectBranch,
        handleSelectComponent,
        handleTurnComponentReorder,
        handleTurnComponentUpdate,
        handleTurnLabelChange,
        handleQuickCreateFromHandle,
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

    // Handle node clicks natively from React Flow
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        // Just Update selection state
        // React Flow handles the visual 'selected' prop automatically
        setSelection({ type: 'node', nodeId: node.id });
        setSelectionAnchorEl(event.currentTarget as HTMLElement);
    }, []);

    // Sync edges when flow model changes
    useEffect(() => {
        setEdges(initialEdges as Edge[]);
    }, [initialEdges, setEdges]);

    // Sync node data when flow changes
    useEffect(() => {
        setNodes((currentNodes) => {
            // Create a map of current node states to preserve transient state not in 'flow'
            // (like React Flow's internal 'selected' state, or dragging position before commit)
            const currentNodeMap = new Map(currentNodes.map(n => [n.id, n]));

            return baseNodes.map(newNode => {
                const existingNode = currentNodeMap.get(newNode.id);
                if (existingNode) {
                    const existingData = existingNode.data as { selectedComponentId?: string; selectedBranchId?: string } | undefined;
                    let nextData: unknown = newNode.data;

                    if (newNode.type === 'turn') {
                        nextData = {
                            ...(newNode.data as Record<string, unknown>),
                            selectedComponentId: existingData?.selectedComponentId,
                        };
                    } else if (newNode.type === 'condition') {
                        nextData = {
                            ...(newNode.data as Record<string, unknown>),
                            selectedBranchId: existingData?.selectedBranchId,
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
        const selectedComponentNodeId = selection?.type === 'component' ? selection.nodeId : null;
        const selectedComponentId = selection?.type === 'component' ? selection.componentId : undefined;
        const selectedBranchNodeId = selection?.type === 'branch' ? selection.nodeId : null;
        const selectedBranchId = selection?.type === 'branch' ? selection.branchId : undefined;

        setNodes((currentNodes) => {
            let didChange = false;
            const nextNodes = currentNodes.map(node => {
                if (node.type === 'turn') {
                    const data = node.data as { selectedComponentId?: string };
                    const nextSelected = node.id === selectedComponentNodeId ? selectedComponentId : undefined;
                    if (data.selectedComponentId === nextSelected) {
                        return node;
                    }
                    didChange = true;
                    return {
                        ...node,
                        data: { ...data, selectedComponentId: nextSelected }
                    };
                }

                if (node.type === 'condition') {
                    const data = node.data as { selectedBranchId?: string };
                    const nextSelected = node.id === selectedBranchNodeId ? selectedBranchId : undefined;
                    if (data.selectedBranchId === nextSelected) {
                        return node;
                    }
                    didChange = true;
                    return {
                        ...node,
                        data: { ...data, selectedBranchId: nextSelected }
                    };
                }

                return node;
            });

            return didChange ? nextNodes : currentNodes;
        });
    }, [selection, setNodes]);

    const selectedNodeId = selection?.type === 'node' ? selection.nodeId : null;

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
    }, [flow, onUpdateFlow]);

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
                            const actionId = handleId.split(`${component.id}-`)[1];
                            textToFill = actionId === 'reject'
                                ? (confirmationContent.rejectLabel || 'No, not this person')
                                : (confirmationContent.confirmLabel || 'Yes, confirm');
                        }

                        if (textToFill) {
                            // Valid link! Update the User Turn input type.
                            updatedSteps = flow.steps?.map(s =>
                                s.id === targetNodeId
                                    ? {
                                        ...s,
                                        label: textToFill, // Auto-fill label
                                        inputType: component.type === 'prompt' ? 'prompt' : 'button' // Selection acts like button? or text?
                                    }
                                    : s
                            );
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
        [flow, onUpdateFlow]
    );

    const handleComponentAdd = (type: ComponentType) => {
        if (selection?.type === 'node') {
            // Find the turn and add component
            const step = flow.steps?.find(s => s.id === selection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const newComponent: Component = {
                    id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type,
                    content: getDefaultContent(type)
                };
                const updatedSteps = flow.steps?.map(s =>
                    s.id === selection.nodeId && s.type === 'turn'
                        ? { ...s, components: [...s.components, newComponent] }
                        : s
                );
                applyFlowUpdate({ ...flow, steps: updatedSteps, lastModified: Date.now() });
            }
        }
    };

    const handleChangeUserTurnInputType = (inputType: 'text' | 'prompt' | 'button') => {
        if (selection?.type === 'node') {
            const updatedSteps = flow.steps?.map(s =>
                s.id === selection.nodeId && s.type === 'user-turn'
                    ? { ...s, inputType }
                    : s
            );
            applyFlowUpdate({ ...flow, steps: updatedSteps, lastModified: Date.now() });
        }
    };

    const handleMoveComponentUp = useCallback(() => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        if (currentSelection?.type === 'component') {
            const step = currentFlow.steps?.find(s => s.id === currentSelection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const componentIndex = step.components.findIndex(c => c.id === currentSelection.componentId);
                if (componentIndex > 0) {
                    const newComponents = [...step.components];
                    [newComponents[componentIndex - 1], newComponents[componentIndex]] =
                        [newComponents[componentIndex], newComponents[componentIndex - 1]];
                    const updatedSteps = currentFlow.steps?.map(s =>
                        s.id === currentSelection.nodeId && s.type === 'turn'
                            ? { ...s, components: newComponents }
                            : s
                    );
                    applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
                }
            }
        }
    }, [onUpdateFlow]); // implementation uses refs

    const handleMoveComponentDown = useCallback(() => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        if (currentSelection?.type === 'component') {
            const step = currentFlow.steps?.find(s => s.id === currentSelection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const componentIndex = step.components.findIndex(c => c.id === currentSelection.componentId);
                if (componentIndex < step.components.length - 1) {
                    const newComponents = [...step.components];
                    [newComponents[componentIndex], newComponents[componentIndex + 1]] =
                        [newComponents[componentIndex + 1], newComponents[componentIndex]];
                    const updatedSteps = currentFlow.steps?.map(s =>
                        s.id === currentSelection.nodeId && s.type === 'turn'
                            ? { ...s, components: newComponents }
                            : s
                    );
                    applyFlowUpdate({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
                }
            }
        }
    }, [onUpdateFlow]); // implementation uses refs


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
        if (currentSelection && deletedIds.has(currentSelection.nodeId)) {
            handleDeselect();
        }
    }, [onUpdateFlow, handleDeselect]); // flowRef used inside

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
    }, [onUpdateFlow]);


    const handleDeleteComponent = useCallback(() => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        if (currentSelection?.type === 'component') {
            const updatedSteps = currentFlow.steps?.map(s =>
                s.id === currentSelection.nodeId && s.type === 'turn'
                    ? { ...s, components: s.components.filter(c => c.id !== currentSelection.componentId) }
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

        if (currentSelection.type === 'component') {
            const selectedStep = currentFlow.steps?.find((step) => step.id === currentSelection.nodeId && step.type === 'turn');
            if (!selectedStep || selectedStep.type !== 'turn') {
                return false;
            }

            const selectedComponent = selectedStep.components.find((component) => component.id === currentSelection.componentId);
            if (!selectedComponent) {
                return false;
            }

            clipboardRef.current = {
                type: 'component',
                component: cloneValue(selectedComponent),
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
            setSelection({ type: 'node', nodeId: newStep.id });
            setSelectionAnchorEl(null);
            return true;
        }

        if (clipboard.type === 'component') {
            const currentSelection = selectionRef.current;
            if (!currentSelection) {
                return false;
            }

            const targetNodeId =
                currentSelection.type === 'component' || currentSelection.type === 'node'
                    ? currentSelection.nodeId
                    : null;
            const insertAfterComponentId =
                currentSelection.type === 'component'
                    ? currentSelection.componentId
                    : null;

            if (!targetNodeId) {
                return false;
            }

            let newComponentId: string | null = null;
            let didPaste = false;
            const updatedSteps = currentSteps.map((step) => {
                if (step.id !== targetNodeId || step.type !== 'turn') {
                    return step;
                }

                const pastedComponent = cloneComponentForPaste(clipboard.component);
                const nextComponents = [...step.components];

                if (insertAfterComponentId) {
                    const componentIndex = step.components.findIndex((component) => component.id === insertAfterComponentId);
                    if (componentIndex === -1) {
                        return step;
                    }
                    nextComponents.splice(componentIndex + 1, 0, pastedComponent);
                } else {
                    nextComponents.push(pastedComponent);
                }

                newComponentId = pastedComponent.id;
                didPaste = true;

                return {
                    ...step,
                    components: nextComponents,
                };
            });

            if (!didPaste || !newComponentId) {
                return false;
            }

            applyFlowUpdate({
                ...currentFlow,
                steps: updatedSteps,
                lastModified: Date.now(),
            });
            setSelection({ type: 'component', nodeId: targetNodeId, componentId: newComponentId });
            setSelectionAnchorEl(null);
            return true;
        }

        const currentSelection = selectionRef.current;
        if (!currentSelection) {
            return false;
        }

        const targetNodeId =
            currentSelection.type === 'branch' || currentSelection.type === 'node'
                ? currentSelection.nodeId
                : null;
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
        setSelection({ type: 'branch', nodeId: targetNodeId, branchId: newBranchId });
        setSelectionAnchorEl(null);
        return true;
    }, [applyFlowUpdate, isReadOnly]);

    // Manual delete trigger for nested selections (cards and branch cards).
    const handleDeleteSelection = useCallback(() => {
        const currentSelection = selectionRef.current;
        if (currentSelection?.type === 'component') {
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

            if (e.key === 'Escape') {
                handleDeselect();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                // Only hijack delete for nested cards (React Flow only knows about node deletion).
                if (currentSelection?.type === 'component' || currentSelection?.type === 'branch') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    handleDeleteSelection();
                    return;
                }
                // Otherwise let the event bubble to React Flow to handle Node deletion (single or multi)
            } else if (currentSelection?.type === 'component' || currentSelection?.type === 'branch') {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (currentSelection.type === 'component') {
                        handleMoveComponentUp();
                    } else {
                        moveSelectedBranch('up');
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (currentSelection.type === 'component') {
                        handleMoveComponentDown();
                    } else {
                        moveSelectedBranch('down');
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
    }, [handleCopySelection, handleDeleteSelection, handleDeselect, handleMoveComponentDown, handleMoveComponentUp, handlePasteSelection, moveSelectedBranch]);

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
                if (nodeToUpdate.type !== 'start' && 'label' in nodeToUpdate) {
                    updatedSteps[draggedNodeIndex] = {
                        ...nodeToUpdate,
                        label: `${nodeToUpdate.label} (Copy)`
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
    }, [flow, onUpdateFlow]);

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

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            if (type === 'turn') {
                const aiTurnCount = (flow.steps?.filter(s => s.type === 'turn').length || 0) + 1;
                const newTurn: Turn = {
                    id: crypto.randomUUID(),
                    type: 'turn',
                    speaker: 'ai',
                    label: `AI Turn ${aiTurnCount}`,
                    components: [{
                        id: crypto.randomUUID(),
                        type: 'message',
                        content: getDefaultContent('message')
                    }],
                    position
                };
                applyFlowUpdate({
                    ...flow,
                    steps: [...(flow.steps || []), newTurn],
                    lastModified: Date.now()
                });
            } else if (type === 'note') {
                const noteCount = (flow.steps?.filter(s => s.type === 'note').length || 0) + 1;
                const newNote: Note = {
                    id: crypto.randomUUID(),
                    type: 'note',
                    label: `Sticky note ${noteCount}`,
                    content: '',
                    position
                };
                applyFlowUpdate({
                    ...flow,
                    steps: [...(flow.steps || []), newNote],
                    lastModified: Date.now()
                });
            } else if (type === 'user-turn') {
                const userTurnCount = (flow.steps?.filter(s => s.type === 'user-turn').length || 0) + 1;
                const newUserTurn: UserTurn = {
                    id: crypto.randomUUID(),
                    type: 'user-turn',
                    label: `User Turn ${userTurnCount}`,
                    inputType: 'text',
                    position
                };
                applyFlowUpdate({
                    ...flow,
                    steps: [...(flow.steps || []), newUserTurn],
                    lastModified: Date.now()
                });
            } else if (type === 'condition') {
                const conditionCount = (flow.steps?.filter(s => s.type === 'condition').length || 0) + 1;
                const newCondition: Condition = {
                    id: crypto.randomUUID(),
                    type: 'condition',
                    label: `Condition ${conditionCount}`,
                    branches: [
                        { id: crypto.randomUUID(), condition: 'Yes' },
                        { id: crypto.randomUUID(), condition: 'No' },
                    ],
                    position
                };
                applyFlowUpdate({
                    ...flow,
                    steps: [...(flow.steps || []), newCondition],
                    lastModified: Date.now()
                });
            }
        },
        [flow, onUpdateFlow, screenToFlowPosition]
    );

    const handlePaneClick = useCallback(() => {
        handleDeselect();
        setQuickAddMenu(null);
        setQuickAddConnectionPreview(null);
    }, [handleDeselect]);

    const connectionLineWithPreview = useCallback((props: ConnectionLineComponentProps) => (
        <ConnectionLine {...props} />
    ), []);

    // Get current input type for toolbar (User Turn)
    const currentUserTurnInputType = selectedNodeId
        ? (flow.steps?.find(s => s.id === selectedNodeId && s.type === 'user-turn') as UserTurn | undefined)?.inputType
        : undefined;

    // Get current branches for toolbar (Condition Node)
    const currentBranches = selectedNodeId
        ? (flow.steps?.find(s => s.id === selectedNodeId && s.type === 'condition') as Condition | undefined)?.branches
        : undefined;

    const handleUpdateBranches = (branches: Branch[]) => {
        if (selectedNodeId) {
            const updatedSteps = flow.steps?.map(s =>
                s.id === selectedNodeId && s.type === 'condition'
                    ? { ...s, branches }
                    : s
            );
            applyFlowUpdate({ ...flow, steps: updatedSteps, lastModified: Date.now() });
        }
    };

    return (
        <div className="w-full h-full flex flex-col relative bg-shell-canvas">
            {/* Header */}
            {/* Top Left Pill: Back & Title */}
            <div className="absolute top-4 left-4 z-50 flex items-center h-11 gap-1.5 bg-shell-bg px-2 rounded-xl shadow-sm border border-shell-border/70 backdrop-blur-sm">
                <ActionTooltip content={isReadOnly ? 'Back to home' : 'Back to dashboard'}>
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center p-2 text-shell-muted hover:text-shell-text transition-colors rounded-md hover:bg-shell-surface"
                    >
                        <ArrowLeft size={18} />
                    </button>
                </ActionTooltip>
                <div className="h-5 w-px bg-shell-border-subtle" />
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
            <div className="absolute top-4 right-4 z-50 flex items-center h-11 gap-2 bg-shell-bg px-1.5 rounded-xl shadow-sm border border-shell-border/70 backdrop-blur-sm">
                {isReadOnly ? (
                    <>
                        <DropdownMenu>
                            <ActionTooltip content="Play prototype" disabled={isPreviewActive}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={`flex items-center justify-center w-8 h-8 rounded-md transition-all group ${isPreviewActive
                                            ? "text-shell-accent-text bg-shell-accent-soft ring-1 ring-shell-accent-border"
                                            : "text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                                            }`}
                                    >
                                        <Play size={16} fill={isPreviewActive ? "currentColor" : "none"} className="mr-[1px]" />
                                    </button>
                                </DropdownMenuTrigger>
                            </ActionTooltip>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={onPreview} className="gap-2">
                                    <PanelRightOpen size={14} className="text-shell-muted" />
                                    Preview in canvas
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => window.open(`/share/${flow.id}`, '_blank')}
                                    className="gap-2"
                                >
                                    <ExternalLink size={14} className="text-shell-muted" />
                                    Open prototype
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <ShareDialog
                            flow={flow}
                            enabledLinkTypes={['studio', 'prototype']}
                            linkLabelOverrides={{ studio: 'Copy link' }}
                        >
                            <Button
                                size="sm"
                                className="bg-shell-accent text-white hover:bg-shell-accent-hover border-0"
                            >
                                Share
                            </Button>
                        </ShareDialog>
                    </>
                ) : (
                    <>
                        {/* File Menu (Export/Import) */}
                        <DropdownMenu>
                            <ActionTooltip content="File options">
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="flex items-center justify-center w-8 h-8 rounded-md transition-all text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                                    >
                                        <FileJson size={16} />
                                    </button>
                                </DropdownMenuTrigger>
                            </ActionTooltip>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleExportJSON} className="gap-2">
                                    <Download size={14} className="text-shell-muted" />
                                    Export JSON
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleImportJSON} className="gap-2">
                                    <Upload size={14} className="text-shell-muted" />
                                    Import JSON
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-5 w-px bg-shell-border-subtle" />

                        {/* Run Menu */}
                        <DropdownMenu>
                            <ActionTooltip content="Play prototype" disabled={isPreviewActive}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={`flex items-center justify-center w-8 h-8 rounded-md transition-all group ${isPreviewActive
                                            ? "text-shell-accent-text bg-shell-accent-soft ring-1 ring-shell-accent-border"
                                            : "text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                                            }`}
                                    >
                                        <Play size={16} fill={isPreviewActive ? "currentColor" : "none"} className="mr-[1px]" />
                                    </button>
                                </DropdownMenuTrigger>
                            </ActionTooltip>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={onPreview} className="gap-2">
                                    <PanelRightOpen size={14} className="text-shell-muted" />
                                    Preview in canvas
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => window.open(`/share/${flow.id}`, '_blank')}
                                    className="gap-2"
                                >
                                    <ExternalLink size={14} className="text-shell-muted" />
                                    Open prototype
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <ShareDialog
                            flow={flow}
                            enabledLinkTypes={['studio', 'prototype']}
                            linkLabelOverrides={{ studio: 'Copy link' }}
                        >
                            <Button
                                size="sm"
                                className="bg-shell-accent text-white hover:bg-shell-accent-hover border-0"
                            >
                                Share
                            </Button>
                        </ShareDialog>
                    </>
                )}
            </div>

            {/* Canvas Area */}
            <div ref={canvasAreaRef} className="flex-1 w-full relative overflow-hidden h-full">
                <style>{`
                    .react-flow__pane, 
                    .react-flow__selection-pane {
                        cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFF' stroke='%23000' stroke-width='2' d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'%3E%3C/path%3E%3C/svg%3E") 6 3, auto !important;
                    }
                    .is-alt-pressed .react-flow__node:hover,
                    .is-alt-pressed .react-flow__node:hover * {
                        cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFF' stroke='%23000' stroke-width='2' d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'%3E%3Cpath fill='%23000' stroke='%23FFF' stroke-width='1.5' d='M16 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.5a.5.5 0 0 0-.5.5v1.5H14a.5.5 0 0 0 0 1h1.5V18a.5.5 0 0 0 1 0v-1.5H18a.5.5 0 0 0 0-1h-1.5V14a.5.5 0 0 0-.5-.5Z'/%3E%3C/svg%3E") 6 3, copy !important;
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
                    onConnect={isReadOnly ? undefined : onConnect}
                    onConnectStart={isReadOnly ? undefined : onConnectStart}
                    onConnectEnd={isReadOnly ? undefined : onConnectEnd}
                    onNodeClick={onNodeClick}
                    onNodeDragStart={isReadOnly ? undefined : onNodeDragStart}
                    onNodesDelete={isReadOnly ? undefined : onNodesDelete}
                    onEdgesDelete={isReadOnly ? undefined : onEdgesDelete}
                    onNodeDragStop={isReadOnly ? undefined : onNodeDragStop}
                    onPaneClick={handlePaneClick}
                    panOnScroll
                    selectionOnDrag={!isReadOnly}
                    selectionMode={SelectionMode.Partial}
                    multiSelectionKeyCode={null}
                    panOnDrag={isReadOnly ? true : isAltPressed}
                    zoomOnScroll={isReadOnly ? true : !isAltPressed}
                    deleteKeyCode={isReadOnly ? null : ['Delete', 'Backspace']}
                    nodesDraggable={!isReadOnly}
                    nodesConnectable={!isReadOnly}
                    proOptions={{ hideAttribution: true }}
                    minZoom={0.1}
                    maxZoom={2}
                    onDragOver={isReadOnly ? undefined : onDragOver}
                    onDrop={isReadOnly ? undefined : onDrop}
                    connectionLineComponent={connectionLineWithPreview}
                    className={`bg-shell-canvas ${!isReadOnly && isAltPressed ? 'is-alt-pressed' : ''}`}
                >

                    <Background color="rgb(var(--shell-canvas-grid) / 1)" gap={20} size={2} />
                    {!isReadOnly && selectedNodeId && (
                        <ContextToolbar
                            selection={{ type: 'node', nodeId: selectedNodeId }}
                            anchorEl={selectionAnchorEl}
                            onAddComponent={(type: ComponentType) => handleComponentAdd(type)}
                            onChangeUserTurnInputType={handleChangeUserTurnInputType}
                            currentUserTurnInputType={currentUserTurnInputType}
                            currentBranches={currentBranches}
                            onUpdateBranches={handleUpdateBranches}
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
                                    components: [{
                                        id: crypto.randomUUID(),
                                        type: 'message',
                                        content: getDefaultContent('message')
                                    }],
                                    position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                                };
                                applyFlowUpdate({
                                    ...flow,
                                    steps: [...(flow.steps || []), newTurn],
                                    lastModified: Date.now()
                                });
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
                                    branches: [
                                        { id: crypto.randomUUID(), condition: 'Yes' },
                                        { id: crypto.randomUUID(), condition: 'No' }
                                    ],
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
                        />
                    ) : null}
                    <ZoomControls />
                </ReactFlow>
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
                {!isReadOnly && hoverHandlePreview && !isHandleHoverPreviewSuppressed && !connectionPreviewVariant && !quickAddMenu && (
                    <svg
                        className="pointer-events-none absolute inset-0 z-[60] overflow-visible"
                        width="100%"
                        height="100%"
                        aria-hidden="true"
                    >
                        <HandleHoverPreview
                            x={hoverHandlePreview.x}
                            y={hoverHandlePreview.y}
                            variant={hoverHandlePreview.variant}
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
