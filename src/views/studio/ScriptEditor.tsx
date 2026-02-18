import { Flow, Block, BlockType, AIBlock, AIBlockVariant, AIMessageContent, AIInfoContent, AIStatusContent, FlowPhase } from './types';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, User, GripVertical, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RichTextEditor } from '../studio-canvas/components/RichTextEditor';
import { ActionBlockEditor } from './ActionBlockEditor';
import { VariantButton } from './VariantButton';
import { LifecycleCanvas } from './LifecycleCanvas';


interface ScriptEditorProps {
    flow: Flow;
    onUpdateFlow: (newFlow: Flow) => void;
}

export const ScriptEditor = ({ flow, onUpdateFlow }: ScriptEditorProps) => {

    const handleAddBlock = (phase: FlowPhase, type: BlockType, variant?: AIBlockVariant) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newBlock: any = {
            id: Date.now().toString(),
            type,
            phase,
        };

        if (type === 'ai') {
            newBlock.variant = variant || 'message';

            // Set initial content based on variant
            if (newBlock.variant === 'message') newBlock.content = { text: '' };
            if (newBlock.variant === 'info') newBlock.content = { body: '', sources: [], showFeedback: true };
            if (newBlock.variant === 'status') newBlock.content = { loadingTitle: '', successTitle: '' };
        } else {
            newBlock.content = ''; // User content
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
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
                <LifecycleCanvas
                    flow={flow}
                    onUpdateFlow={onUpdateFlow}
                    onAddBlock={handleAddBlock}
                    renderBlock={(block, index) => (
                        <SortableBlockItem
                            key={block.id}
                            block={block}
                            index={index}
                            onUpdate={(updates: Partial<Block>) => handleUpdateBlock(block.id, updates)}
                            onDelete={() => handleDeleteBlock(block.id)}
                        />
                    )}
                />
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

export const SortableBlockItem = (props: { block: Block, index: number, onUpdate: (u: Partial<Block>) => void, onDelete: () => void }) => {
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
        if (variant === 'info') defaultContent = { body: '', sources: [], showFeedback: true };
        if (variant === 'status') defaultContent = { loadingTitle: '', successTitle: '' };


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
                        {(['message', 'info', 'status'] as const).map(variant => (
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
                    <RichTextEditor
                        value={block.content}
                        onChange={(value) => onUpdate({ content: value })}
                        placeholder="Enter what the user says..."
                    />
                )}

                {/* 2. AI Message (Standard) */}
                {block.type === 'ai' && block.variant === 'message' && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Message</label>
                        <RichTextEditor
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
                            <label className="text-xs font-medium text-gray-500">Message</label>
                            <RichTextEditor
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
                {block.type === 'ai' && block.variant === 'status' && (
                    <div className="p-3 border rounded-lg bg-gray-50">
                        <ActionBlockEditor
                            content={block.content as AIStatusContent}
                            onChange={(newContent) => onUpdate({ content: newContent })}
                        />
                    </div>
                )}
            </div>

            {/* Prompts Section (Only available on message blocks) */}
            {
                isAI && (block as AIBlock).variant === 'message' && (
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
                )
            }
        </div >
    );
};


