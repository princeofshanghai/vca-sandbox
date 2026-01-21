import { Turn, Component, AIMessageContent, AIPromptGroupContent } from '../studio/types';
import { useState } from 'react';

interface TurnEditorProps {
    turn: Turn;
    onUpdate: (updatedTurn: Turn) => void;
    onClose: () => void;
}

export function TurnEditor({ turn, onUpdate, onClose }: TurnEditorProps) {
    const [expandedComponentId, setExpandedComponentId] = useState<string | null>(null);

    const updateComponent = (componentId: string, updates: Partial<Component>) => {
        const updatedComponents = turn.components.map(comp =>
            comp.id === componentId ? { ...comp, ...updates } : comp
        );
        onUpdate({ ...turn, components: updatedComponents });
    };

    const renderComponentEditor = (component: Component, index: number) => {
        const isExpanded = expandedComponentId === component.id;

        return (
            <div key={component.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Component Header */}
                <button
                    onClick={() => setExpandedComponentId(isExpanded ? null : component.id)}
                    className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between text-left"
                >
                    <div className="text-xs font-medium text-gray-700">
                        {index + 1}. {component.type}
                    </div>
                    <div className="text-xs text-gray-400">
                        {isExpanded ? '▼' : '▶'}
                    </div>
                </button>

                {/* Component Editor */}
                {isExpanded && (
                    <div className="p-3 space-y-3 bg-white">
                        {/* Message Editor */}
                        {component.type === 'message' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Text
                                </label>
                                <textarea
                                    value={(component.content as AIMessageContent).text || ''}
                                    onChange={(e) => updateComponent(component.id, {
                                        content: { text: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows={4}
                                    placeholder="Enter message text..."
                                />
                            </div>
                        )}

                        {/* PromptGroup Editor */}
                        {component.type === 'promptGroup' && (
                            <div className="space-y-3">
                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Title (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={(component.content as AIPromptGroupContent).title || ''}
                                        onChange={(e) => {
                                            const content = component.content as AIPromptGroupContent;
                                            updateComponent(component.id, {
                                                content: { ...content, title: e.target.value }
                                            });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Not sure where to start? You can try:"
                                    />
                                </div>

                                {/* Prompts */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Prompts
                                    </label>
                                    <div className="space-y-2">
                                        {((component.content as AIPromptGroupContent).prompts || []).map((prompt, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={prompt.text}
                                                    onChange={(e) => {
                                                        const content = component.content as AIPromptGroupContent;
                                                        const newPrompts = [...(content.prompts || [])];
                                                        newPrompts[i] = { ...prompt, text: e.target.value };
                                                        updateComponent(component.id, {
                                                            content: { ...content, prompts: newPrompts }
                                                        });
                                                    }}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder={`Prompt ${i + 1}`}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const content = component.content as AIPromptGroupContent;
                                                        const newPrompts = (content.prompts || []).filter((_, index) => index !== i);
                                                        updateComponent(component.id, {
                                                            content: { ...content, prompts: newPrompts }
                                                        });
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Remove prompt"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add Prompt Button */}
                                        <button
                                            onClick={() => {
                                                const content = component.content as AIPromptGroupContent;
                                                const newPrompts = [
                                                    ...(content.prompts || []),
                                                    { text: '', showAiIcon: false }
                                                ];
                                                updateComponent(component.id, {
                                                    content: { ...content, prompts: newPrompts }
                                                });
                                            }}
                                            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                                        >
                                            + Add Prompt
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Edit Turn</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {turn.speaker === 'ai' ? '🤖 AI' : '👤 User'} • {turn.phase || 'No phase'}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Close"
                >
                    ✕
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Label */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Label
                    </label>
                    <input
                        type="text"
                        value={turn.label || ''}
                        onChange={(e) => onUpdate({ ...turn, label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Standard welcome"
                    />
                </div>

                {/* Phase */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phase
                    </label>
                    <select
                        value={turn.phase || 'intent'}
                        onChange={(e) => onUpdate({ ...turn, phase: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="welcome">Welcome</option>
                        <option value="intent">Intent Recognition</option>
                        <option value="info">Information Gathering</option>
                        <option value="action">Action & Result</option>
                    </select>
                </div>

                {/* Components */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                        Components ({turn.components.length})
                    </label>

                    <div className="space-y-2">
                        {turn.components.map((component, index) =>
                            renderComponentEditor(component, index)
                        )}
                    </div>
                </div>

                {/* Locked indicator */}
                {turn.locked && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="text-amber-600">🔒</span>
                        <div className="text-xs text-amber-800">
                            This node cannot be deleted
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
