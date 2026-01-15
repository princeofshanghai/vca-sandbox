
import { Flow, Block, BlockType, AIBlock, AIBlockVariant, AIMessageContent, AIInfoContent, AIActionContent } from './types';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, User, GripVertical, Plus } from 'lucide-react';
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
import { MarkdownEditor } from './MarkdownEditor';
import { VariantButton } from './VariantButton';


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

        if (type === 'ai') {
            newBlock.variant = 'message';
            newBlock.content = { text: '' };
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

                    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                        <AddBlockButton
                            icon={User}
                            label="User turn"
                            description="User asks something"
                            color="gray"
                            onClick={() => handleAddBlock('user')}
                        />
                        <AddBlockButton
                            icon={AITurnIcon}
                            label="AI turn"
                            description="AI responds to user"
                            color="blue"
                            onClick={() => handleAddBlock('ai')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const AITurnIcon = ({ size, className }: { size?: number, className?: string }) => {
    // Map numerical size to 'sm' | 'md' | 'lg'
    const vcaSize = size && size >= 24 ? 'md' : 'sm';
    return <VcaIcon icon="signal-ai" size={vcaSize} className={className} />;
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
    const isAI = block.type === 'ai';

    const config = isAI ? {
        icon: AITurnIcon,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        label: 'AI Turn'
    } : {
        icon: User,
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        label: 'User Turn'
    };

    const Icon = config.icon;

    // Helper to switch AI variants with default content
    const handleVariantChange = (variant: AIBlockVariant) => {
        let defaultContent = {};
        if (variant === 'message') defaultContent = { text: '' };
        if (variant === 'info') defaultContent = { title: '', body: '', sources: [], showFeedback: true };
        if (variant === 'action') defaultContent = { loadingTitle: '', successTitle: '' };


        onUpdate({
            variant,
            content: defaultContent
        } as Partial<AIBlock>);
    };

    return (
        <div className={cn("group relative bg-white rounded-xl border shadow-sm transition-all hover:shadow-md", config.border)}>
            {/* Header */}
            <div className={cn("flex items-center justify-between px-4 py-3 border-b", config.bg, config.border)}>
                <div className="flex items-center gap-2">
                    <Icon size={14} className={config.color} />
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
                {isAI && (
                    <div className="flex gap-2 mb-3 pb-3 border-b border-gray-50 overflow-x-auto">
                        {(['message', 'info', 'action'] as const).map(variant => (
                            <VariantButton
                                key={variant}
                                variant={variant}
                                isSelected={(block as AIBlock).variant === variant}
                                onClick={() => handleVariantChange(variant)}
                            />
                        ))}
                    </div>
                )}


                {/* DYNAMIC FORM FIELDS */}

                {/* 1. User Input */}
                {block.type === 'user' && (
                    <MarkdownEditor
                        value={block.content}
                        onChange={(value) => onUpdate({ content: value })}
                        placeholder="Enter what the user says..."
                    />
                )}

                {/* 2. AI Message (Standard) */}
                {block.type === 'ai' && block.variant === 'message' && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Message</label>
                        <MarkdownEditor
                            value={(block.content as AIMessageContent).text || ''}
                            onChange={(value) => onUpdate({ content: { ...(block.content as AIMessageContent), text: value } })}
                            placeholder="Enter what the AI should say..."
                        />
                    </div>
                )}

                {/* 3. AI Info Card */}
                {block.type === 'ai' && block.variant === 'info' && (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Title (optional)</label>
                            <input
                                className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                placeholder="Ex. Here's what you need to know"
                                value={(block.content as AIInfoContent).title || ''}
                                onChange={(e) => onUpdate({ content: { ...block.content, title: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Message</label>
                            <MarkdownEditor
                                value={(block.content as AIInfoContent).body || ''}
                                onChange={(value) => onUpdate({ content: { ...block.content, body: value } })}
                                placeholder="Ex. To park a license in LinkedIn Recruiter..."
                                className="w-full"
                            />
                        </div>

                        {/* Sources Editor */}
                        <div className="pt-2 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    const currentContent = block.content as AIInfoContent;
                                    const currentSources = currentContent.sources || [];
                                    onUpdate({ content: { ...currentContent, sources: [...currentSources, { text: '', url: '' }] } });
                                }}
                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium py-2 rounded transition-colors"
                            >
                                <Plus size={14} />
                                <span>Add source</span>
                            </button>

                            <div className="space-y-3">
                                {((block.content as AIInfoContent).sources || []).map((source, i) => (
                                    <div key={i} className="flex gap-2 items-start group/source w-full">
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                className="w-1/3 text-sm font-medium text-gray-900 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white"
                                                placeholder="Label"
                                                value={source.text}
                                                onChange={(e) => {
                                                    const currentContent = block.content as AIInfoContent;
                                                    const newSources = [...(currentContent.sources || [])];
                                                    newSources[i] = { ...newSources[i], text: e.target.value };
                                                    onUpdate({ content: { ...currentContent, sources: newSources } });
                                                }}
                                            />
                                            <input
                                                className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white"
                                                placeholder="https://..."
                                                value={source.url || ''}
                                                onChange={(e) => {
                                                    const currentContent = block.content as AIInfoContent;
                                                    const newSources = [...(currentContent.sources || [])];
                                                    newSources[i] = { ...newSources[i], url: e.target.value };
                                                    onUpdate({ content: { ...currentContent, sources: newSources } });
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const currentContent = block.content as AIInfoContent;
                                                const newSources = [...(currentContent.sources || [])];
                                                newSources.splice(i, 1);
                                                onUpdate({ content: { ...currentContent, sources: newSources } });
                                            }}
                                            className="text-gray-300 hover:text-red-500 p-2 mt-0.5 opacity-0 group-hover/source:opacity-100 transition-all"
                                            title="Remove source"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Toggle */}
                        {/* Feedback Toggle */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-3">
                            <Checkbox
                                id={`feedback-${block.id}`}
                                checked={(block.content as AIInfoContent).showFeedback !== false}
                                onCheckedChange={(checked) => onUpdate({ content: { ...block.content, showFeedback: checked as boolean } })}
                            />
                            <label htmlFor={`feedback-${block.id}`} className="text-xs font-medium text-gray-500 select-none cursor-pointer">
                                User feedback
                            </label>
                        </div>
                    </div>
                )}

                {/* 4. AI Action (Simulated) */}
                {block.type === 'ai' && block.variant === 'action' && (
                    <div className="space-y-6">
                        {/* In Progress */}
                        <div className="space-y-3">
                            <span className="text-sm font-semibold text-gray-900 block border-b border-gray-100 pb-2">
                                In progress
                            </span>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">Title</label>
                                <input
                                    className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                    placeholder="Ex. Removing user..."
                                    value={(block.content as AIActionContent).loadingTitle || ''}
                                    onChange={(e) => onUpdate({ content: { ...block.content, loadingTitle: e.target.value } as AIActionContent })}
                                />
                            </div>
                        </div>

                        {/* Success      */}
                        <div className="space-y-3">
                            <span className="text-sm font-semibold text-gray-900 block border-b border-gray-100 pb-2">
                                Success
                            </span>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">Title</label>
                                <input
                                    className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                    placeholder="Ex. User removed from Flexis Recruiter"
                                    value={(block.content as AIActionContent).successTitle || ''}
                                    onChange={(e) => onUpdate({ content: { ...block.content, successTitle: e.target.value } as AIActionContent })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">Message</label>
                                <MarkdownEditor
                                    value={(block.content as AIActionContent).successDescription || ''}
                                    onChange={(value) => onUpdate({ content: { ...block.content, successDescription: value } as AIActionContent })}
                                    placeholder="Ex. You can view the updates in the Users & License Management tab in Admin Center."
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}



            </div>

            {/* Prompts Section (Only available on message blocks) */}
            {isAI && (block as AIBlock).variant === 'message' && (
                <div className="px-3 pb-3 pt-0 mt-2">
                    <button
                        onClick={() => {
                            const currentPrompts = (block as AIBlock).metadata?.prompts || [];
                            onUpdate({
                                metadata: {
                                    ...(block as AIBlock).metadata,
                                    prompts: [...currentPrompts, '']
                                }
                            });
                        }}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium py-2 rounded transition-colors mb-2"
                    >
                        <Plus size={14} />
                        <span>Add prompt</span>
                    </button>

                    <div className="space-y-2">
                        {((block as AIBlock).metadata?.prompts || []).map((prompt, i) => (
                            <div key={i} className="flex items-center gap-2 group/prompt">
                                <input
                                    className="flex-1 bg-blue-50 border-0 rounded-full px-3 py-1 text-sm text-blue-700 placeholder-blue-300 focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                                    placeholder="Prompt text..."
                                    value={prompt}
                                    onChange={(e) => {
                                        const newPrompts = [...((block as AIBlock).metadata?.prompts || [])];
                                        newPrompts[i] = e.target.value;
                                        onUpdate({ metadata: { ...(block as AIBlock).metadata, prompts: newPrompts } });
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const newPrompts = [...((block as AIBlock).metadata?.prompts || [])];
                                        newPrompts.splice(i, 1);
                                        onUpdate({ metadata: { ...(block as AIBlock).metadata, prompts: newPrompts } });
                                    }}
                                    className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover/prompt:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
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
                "flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 bg-white transition-all text-center group hover:shadow-md",
                colorClasses
            )}
        >
            <div className="p-3 rounded-full bg-gray-50 group-hover:bg-white border border-gray-100 mb-3 transition-colors">
                <Icon size={24} />
            </div>
            <span className="font-semibold text-sm text-gray-900 mb-1">{label}</span>
            <span className="text-xs text-gray-400">{description}</span>
        </button>
    );
};
