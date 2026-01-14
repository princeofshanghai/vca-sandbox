
import { Flow, Block, BlockType } from './types';
import { Trash2, MessageSquare, User, Zap, ArrowRight, Activity, GripVertical, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as HoverCard from '@radix-ui/react-hover-card';
import { Message } from '@/components/vca-components/messages/Message';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { MarkdownEditor } from './MarkdownEditor';


interface ScriptEditorProps {
    flow: Flow;
    onUpdateFlow: (newFlow: Flow) => void;
}

export const ScriptEditor = ({ flow, onUpdateFlow }: ScriptEditorProps) => {

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = flow.blocks.findIndex((item) => item.id === active.id);
            const newIndex = flow.blocks.findIndex((item) => item.id === over.id);

            onUpdateFlow({
                ...flow,
                blocks: arrayMove(flow.blocks, oldIndex, newIndex)
            });
        }
    };

    const handleAddBlock = (type: BlockType) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newBlock: any = {
            id: Date.now().toString(),
            type,
        };

        if (type === 'message') {
            newBlock.variant = 'standard';
            newBlock.content = { text: '' };
        } else if (type === 'action') {
            newBlock.content = {
                loadingTitle: 'Processing...',
                successTitle: 'Action Complete',
                successDescription: ''
            };
        } else {
            newBlock.content = '';
        }

        onUpdateFlow({
            ...flow,
            blocks: [...flow.blocks, newBlock as Block]
        });
    };

    const handleUpdateBlock = (id: string, updates: Partial<Block>) => {
        onUpdateFlow({
            ...flow,
            blocks: flow.blocks.map(b => b.id === id ? { ...b, ...updates } as Block : b)
        });
    };

    const handleDeleteBlock = (id: string) => {
        onUpdateFlow({
            ...flow,
            blocks: flow.blocks.filter(b => b.id !== id)
        });
    };

    return (
        <div className="h-full flex flex-col bg-white">


            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {flow.blocks.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
                        <div className="text-gray-400 mb-2">👋 Start your conversation</div>
                        <p className="text-sm text-gray-400">Add a message below to begin</p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={flow.blocks.map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {flow.blocks.map((block, index) => (
                                    <SortableBlockItem
                                        key={block.id}
                                        block={block}
                                        index={index}
                                        onUpdate={(updates: Partial<Block>) => handleUpdateBlock(block.id, updates)}
                                        onDelete={() => handleDeleteBlock(block.id)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                {/* Add Block Controls */}
                <div className="pt-4 pb-20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px flex-1 bg-gray-200"></div>
                        <span className="text-xs font-medium text-gray-400">Add step</span>
                        <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <AddBlockButton
                            icon={MessageSquare}
                            label="AI Message"
                            description="Wait for AI response"
                            color="blue"
                            onClick={() => handleAddBlock('message')}
                        />
                        <AddBlockButton
                            icon={User}
                            label="User Input"
                            description="User types or clicks"
                            color="gray"
                            onClick={() => handleAddBlock('user-input')}
                        />
                        <AddBlockButton
                            icon={Zap}
                            label="Action"
                            description="System operation"
                            color="amber"
                            onClick={() => handleAddBlock('action')}
                        />
                        <AddBlockButton
                            icon={ArrowRight}
                            label="Handoff"
                            description="Connect to agent"
                            color="green"
                            onClick={() => handleAddBlock('handoff')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components

const SortableBlockItem = (props: { block: Block, index: number, onUpdate: (u: Partial<Block>) => void, onDelete: () => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -ml-6 text-gray-300 cursor-grab hover:text-gray-500" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>
            <BlockEditor {...props} />
        </div>
    );
}

const BlockEditor = ({ block, index, onUpdate, onDelete }: {
    block: Block,
    index: number,
    onUpdate: (u: Partial<Block>) => void,
    onDelete: () => void
}) => {
    // Config based on type
    const config = {
        'message': { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'AI Says' },
        'user-input': { icon: User, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: 'User Says' },
        'action': { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'System Action' },
        'handoff': { icon: Activity, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', label: 'Handoff' },
        'system': { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', label: 'System' },
    }[block.type];

    const Icon = config.icon;

    return (
        <div className={cn("group relative bg-white rounded-xl border shadow-sm transition-all hover:shadow-md", config.border)}>
            {/* Header */}
            <div className={cn("flex items-center justify-between px-4 py-3 border-b", config.bg, config.border)}>
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-md bg-white border shadow-sm", config.border)}>
                        <Icon size={14} className={config.color} />
                    </div>
                    <span className={cn("text-sm font-semibold", config.color)}>
                        {config.label}
                    </span>
                    <span className="text-xs text-gray-400 font-mono ml-2">#{index + 1}</span>
                </div>
                <button
                    onClick={onDelete}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete step"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Content Editor */}
            <div className="p-3">
                {/* Variant Switcher for AI Blocks */}
                {block.type === 'message' && (
                    <div className="flex gap-2 mb-3">
                        {(['standard', 'info'] as const).map(variant => (
                            <HoverCard.Root key={variant} openDelay={200} closeDelay={100}>
                                <HoverCard.Trigger asChild>
                                    <button
                                        onClick={() => onUpdate({ variant, content: {} })} // Reset content on switch
                                        className={cn(
                                            "text-xs px-2 py-1 rounded border capitalize transition-colors relative",
                                            block.variant === variant
                                                ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                                                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        {variant === 'standard' ? 'Message' : 'Info message'}
                                    </button>
                                </HoverCard.Trigger>
                                <HoverCard.Portal>
                                    <HoverCard.Content
                                        className="w-[280px] bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
                                        sideOffset={5}
                                        side="top"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-2">
                                                <span className="text-xs font-bold text-gray-900 capitalize">{variant} Variant</span>
                                                <span className="text-[10px] text-gray-400">Preview</span>
                                            </div>

                                            {/* Scaled Preview */}
                                            <div className="origin-top-left scale-[0.8] w-[125%] transform-gpu pointer-events-none select-none">
                                                {variant === 'standard' && (
                                                    <Message
                                                        defaultText="This is a basic AI message."
                                                        showTimestamp={true}
                                                        agentTimestampText="Just now"
                                                        isThinking={false}
                                                    />
                                                )}
                                                {variant === 'info' && (
                                                    <InfoMessage
                                                        title="Info message"
                                                        message="Use this for AI messages that contain detailed explanations and rich content. Comes with sources and user feedback."
                                                        showSources={true}
                                                        sources={[{ text: 'Source', href: '#' }]}
                                                    />
                                                )}

                                            </div>

                                            <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-50">
                                                {variant === 'standard' && "Best for conversational chitchat."}
                                                {variant === 'info' && "Best for long-form answers, context, and sources."}
                                            </p>
                                        </div>
                                        <HoverCard.Arrow className="fill-white" />
                                    </HoverCard.Content>
                                </HoverCard.Portal>
                            </HoverCard.Root>
                        ))}
                    </div>
                )}

                {/* DYNAMIC FORM FIELDS */}

                {/* 1. Standard Message & User Input (Simple Text) */}
                {(block.type === 'user-input' || (block.type === 'message' && block.variant === 'standard')) && (
                    <MarkdownEditor
                        value={typeof block.content === 'string' ? block.content : block.content.text || ''}
                        onChange={(value) => {
                            if (block.type === 'user-input') {
                                onUpdate({ content: value });
                            } else {
                                onUpdate({ content: { ...block.content, text: value } });
                            }
                        }}
                        placeholder={block.type === 'message' ? "Enter what the AI should say..." : "Enter what the user says..."}
                    />
                )}

                {/* 2. Info Card Fields */}
                {block.type === 'message' && block.variant === 'info' && (
                    <div className="space-y-3">
                        <input
                            className="w-full text-sm font-semibold text-gray-900 border-b border-gray-100 pb-1 focus:ring-0 border-0 p-0 placeholder:font-normal"
                            placeholder="Card Title"
                            value={block.content.title || ''}
                            onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } })}
                        />
                        <MarkdownEditor
                            value={block.content.body || ''}
                            onChange={(value) => onUpdate({ content: { ...block.content, body: value } })}
                            placeholder="Body text..."
                            className="w-full"
                        />

                        {/* Sources Editor */}
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-gray-500 block">
                                    Sources
                                </label>
                                <button
                                    onClick={() => {
                                        const currentSources = block.content.sources || [];
                                        onUpdate({ content: { ...block.content, sources: [...currentSources, { text: '', url: '' }] } });
                                    }}
                                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                >
                                    <Plus size={10} />
                                    <span>Add Source</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(block.content.sources || []).map((source, i) => (
                                    <div key={i} className="flex gap-2 items-start group/source">
                                        <div className="flex-1 space-y-1.5">
                                            <input
                                                className="w-full text-sm font-medium border-b border-gray-200 focus:border-blue-400 focus:ring-0 border-0 p-0 placeholder-gray-300 transition-all bg-transparent"
                                                placeholder="Label (e.g. Wiki)"
                                                value={source.text}
                                                onChange={(e) => {
                                                    const newSources = [...(block.content.sources || [])];
                                                    newSources[i] = { ...newSources[i], text: e.target.value };
                                                    onUpdate({ content: { ...block.content, sources: newSources } });
                                                }}
                                            />
                                            <input
                                                className="w-full text-sm text-gray-500 border-b border-gray-100 focus:border-blue-300 focus:ring-0 border-0 p-0 placeholder-gray-300 transition-all bg-transparent"
                                                placeholder="https://..."
                                                value={source.url || ''}
                                                onChange={(e) => {
                                                    const newSources = [...(block.content.sources || [])];
                                                    newSources[i] = { ...newSources[i], url: e.target.value };
                                                    onUpdate({ content: { ...block.content, sources: newSources } });
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newSources = [...(block.content.sources || [])];
                                                newSources.splice(i, 1);
                                                onUpdate({ content: { ...block.content, sources: newSources } });
                                            }}
                                            className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover/source:opacity-100 transition-all"
                                            title="Remove source"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {(block.content.sources || []).length === 0 && (
                                <div className="text-center py-2 border border-dashed border-gray-100 rounded text-[10px] text-gray-300">
                                    No sources added
                                </div>
                            )}
                        </div>

                        {/* Feedback Toggle */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            <input
                                type="checkbox"
                                id={`feedback-${block.id}`}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={block.content.showFeedback !== false} // Default to true if undefined, match InfoMessage default
                                onChange={(e) => onUpdate({ content: { ...block.content, showFeedback: e.target.checked } })}
                            />
                            <label htmlFor={`feedback-${block.id}`} className="text-xs font-medium text-gray-500 select-none cursor-pointer">
                                Show Feedback
                            </label>
                        </div>
                    </div>
                )}

                {/* 3. Action Fields (Simulated) */}
                {block.type === 'action' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start State</label>
                            <input
                                className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                placeholder="Loading Title (e.g. Removing user...)"
                                value={(block.content as { loadingTitle?: string }).loadingTitle || ''}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e) => onUpdate({ content: { ...block.content as any, loadingTitle: e.target.value } })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End State</label>
                            <input
                                className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                placeholder="Success Title (e.g. User Removed)"
                                value={(block.content as { successTitle?: string }).successTitle || ''}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e) => onUpdate({ content: { ...block.content as any, successTitle: e.target.value } })}
                            />
                            <MarkdownEditor
                                value={(block.content as { successDescription?: string }).successDescription || ''}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(value) => onUpdate({ content: { ...block.content as any, successDescription: value } })}
                                placeholder="Success Description..."
                                className="w-full"
                            />
                        </div>
                    </div>
                )}

                {/* 4. Handoff (Simple Text) */}
                {block.type === 'handoff' && (
                    <textarea
                        value={block.content as string}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="Description..."
                        className="w-full text-sm text-gray-700 placeholder-gray-400 bg-white border-0 focus:ring-0 p-0 resize-none min-h-[40px]"
                    />
                )}

            </div>

            {/* Prompts Section */}
            {block.type === 'message' && (
                <div className="px-3 pb-3 pt-0 mt-2">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-500 block">
                            Prompts (optional)
                        </label>
                        <button
                            onClick={() => {
                                const currentPrompts = block.metadata?.prompts || [];
                                onUpdate({
                                    metadata: {
                                        ...block.metadata,
                                        prompts: [...currentPrompts, '']
                                    }
                                });
                            }}
                            className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                            <Plus size={10} />
                            <span>Add</span>
                        </button>
                    </div>

                    <div className="space-y-2">
                        {(block.metadata?.prompts || []).map((prompt, i) => (
                            <div key={i} className="flex items-center gap-2 group/prompt">
                                <input
                                    className="flex-1 bg-blue-50 border-0 rounded-full px-3 py-1 text-sm text-blue-700 placeholder-blue-300 focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                                    placeholder="Prompt text..."
                                    value={prompt}
                                    onChange={(e) => {
                                        const newPrompts = [...(block.metadata?.prompts || [])];
                                        newPrompts[i] = e.target.value;
                                        onUpdate({ metadata: { ...block.metadata, prompts: newPrompts } });
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const newPrompts = [...(block.metadata?.prompts || [])];
                                        newPrompts.splice(i, 1);
                                        onUpdate({ metadata: { ...block.metadata, prompts: newPrompts } });
                                    }}
                                    className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover/prompt:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {(block.metadata?.prompts || []).length === 0 && (
                        <div
                            className="text-center py-3 border border-dashed border-gray-100 rounded-lg text-xs text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-blue-200 hover:text-blue-500 transition-all"
                            onClick={() => {
                                const currentPrompts = block.metadata?.prompts || [];
                                onUpdate({
                                    metadata: {
                                        ...block.metadata,
                                        prompts: [...currentPrompts, '']
                                    }
                                });
                            }}
                        >
                            + Add prompt
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AddBlockButton = ({ icon: Icon, label, description, color, onClick }: { icon: React.ElementType, label: string, description: string, color: string, onClick: () => void }) => {
    const colorClasses = {
        blue: "hover:border-blue-300 hover:bg-blue-50 text-blue-600",
        gray: "hover:border-gray-300 hover:bg-gray-100 text-gray-600",
        amber: "hover:border-amber-300 hover:bg-amber-50 text-amber-600",
        green: "hover:border-green-300 hover:bg-green-50 text-green-600",
    }[color as string] || "";

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-start p-4 rounded-xl border border-gray-200 bg-white transition-all text-left group",
                colorClasses
            )}
        >
            <div className="flex items-center gap-2 mb-1">
                <Icon size={16} />
                <span className="font-semibold text-sm text-gray-900">{label}</span>
            </div>
            <span className="text-xs text-gray-400">{description}</span>
        </button>
    );
};
