import { useState } from 'react';
import { Plus, MessageSquare, HelpCircle, Split, AlertCircle, Command, MousePointerClick, X, Eye, Edit3 } from 'lucide-react';
import { ProtoNode } from './types';
import Message from '@/components/vca-components/messages/Message';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { ChatWidgetFrame } from './ChatWidgetFrame';

interface DirectEditorProps {
    nodes: ProtoNode[];
    onAddNode: (type: 'message' | 'question' | 'choice' | 'info' | 'prompt' | 'action') => void;
    onUpdateNode: (id: string, updates: Partial<ProtoNode>) => void;
    onDrillDown: (nodeId: string, optionId: string) => void;
}

const ComponentPicker = ({ onSelect, onClose }: { onSelect: (type: any) => void, onClose: () => void }) => {
    const categories = [
        {
            title: 'Communication',
            items: [
                { type: 'message', label: 'Bot Message', icon: MessageSquare, desc: 'Standard text bubble', color: 'bg-gray-100 text-gray-600' },
                { type: 'info', label: 'Info Message', icon: AlertCircle, desc: 'System alert or notice', color: 'bg-blue-100 text-blue-600' },
                { type: 'question', label: 'Ask Question', icon: HelpCircle, desc: 'Collect user input', color: 'bg-indigo-100 text-indigo-600' },
            ]
        },
        {
            title: 'Interaction',
            items: [
                { type: 'prompt', label: 'Prompt Chips', icon: MousePointerClick, desc: 'Quick reply suggestions', color: 'bg-pink-100 text-pink-600' },
                { type: 'choice', label: 'Branch Choice', icon: Split, desc: 'Fork the conversation', color: 'bg-orange-100 text-orange-600' },
            ]
        },
        {
            title: 'System',
            items: [
                { type: 'action', label: 'Action', icon: Command, desc: 'Trigger API or Tool', color: 'bg-purple-100 text-purple-600' },
            ]
        }
    ];

    return (
        <div className="absolute inset-x-0 bottom-0 top-auto z-50 bg-white border-t border-gray-200 shadow-2xl rounded-t-2xl p-6 animate-in slide-in-from-bottom-10 duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Insert Component</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories.map((cat, i) => (
                    <div key={i} className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cat.title}</h4>
                        <div className="space-y-2">
                            {cat.items.map((item) => (
                                <button
                                    key={item.type}
                                    onClick={() => onSelect(item.type)}
                                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left group"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color} group-hover:scale-110 transition-transform`}>
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                                        <div className="text-xs text-gray-500">{item.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const DirectEditor = ({ nodes, onAddNode, onUpdateNode, onDrillDown }: DirectEditorProps) => {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    return (
        <div className="space-y-6 pb-24 relative min-h-[500px]">
            {/* Header / Toggle */}
            <div className="flex items-center justify-between mb-8">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Start of Conversation</span>
                <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                    <button
                        onClick={() => setPreviewMode(false)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${!previewMode ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Edit3 size={14} />
                        Builder
                    </button>
                    <button
                        onClick={() => setPreviewMode(true)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${previewMode ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Eye size={14} />
                        Preview
                    </button>
                </div>
            </div>

            {nodes.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-sm text-gray-400">Empty Flow path</p>
                </div>
            )}

            {/* PREVIEW MODE CONTAINER (High Fidelity) */}
            {previewMode ? (
                <div className="py-8">
                    <ChatWidgetFrame>
                        <div className="space-y-6">
                            {nodes.map((node) => (
                                <div key={node.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">

                                    {/* Bot Message (Base) */}
                                    {(node.type === 'message' || node.type === 'question') && (
                                        <div className="space-y-3">
                                            <Message
                                                defaultText={node.content}
                                                type={node.type === 'question' ? 'ai' : 'ai'}
                                            />

                                            {/* Compound: Prompts */}
                                            {node.prompts && (
                                                <div className="pl-0">
                                                    <PromptGroup
                                                        prompts={node.prompts.map(p => ({
                                                            text: p,
                                                            showAiIcon: false
                                                        }))}
                                                    />
                                                </div>
                                            )}

                                            {/* Compound: Info Card */}
                                            {node.info && (
                                                <InfoMessage
                                                    title={node.info.title}
                                                    message={node.info.message}
                                                    type="default"
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Standalone Nodes (Legacy/Extra) */}
                                    {node.type === 'info' && <InfoMessage message={node.content} title="System Notice" />}

                                    {node.type === 'choice' && (
                                        <div className="space-y-4">
                                            <Message defaultText={node.content || 'Please choose an option:'} type="ai" />
                                            <div className="flex flex-wrap gap-2">
                                                {node.options?.map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => onDrillDown(node.id, opt.id)}
                                                        className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-50 shadow-sm transition-colors"
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ChatWidgetFrame>
                </div>
            ) : (
                // WRAPPED BUILDER MODE (Standard List)
                <div>
                    {nodes.map((node) => (
                        <div key={node.id} className="group relative animate-in fade-in slide-in-from-bottom-2 duration-300 mb-6">
                            {/* ... (Existing Builder Card Logic - Keeping unchanged for now, but in reality we would update it to edit compound fields too) ... */}
                            <div className={`p-4 rounded-2xl border-2 transition-all ${node.type === 'question' ? 'bg-white border-indigo-100 hover:border-indigo-300 shadow-sm'
                                : node.type === 'choice' ? 'bg-orange-50/50 border-orange-100 hover:border-orange-300 shadow-sm'
                                    : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                                }`}>
                                {/* Simplified Builder Content for Prototype Speed */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                                        <MessageSquare size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs uppercase font-bold text-gray-400 mb-1 tracking-wider">Node Content</div>
                                        <textarea
                                            value={node.content}
                                            onChange={(e) => onUpdateNode(node.id, { content: e.target.value })}
                                            className="w-full text-lg text-gray-900 border-none focus:ring-0 p-0 resize-none bg-transparent placeholder-gray-300"
                                            rows={2}
                                        />
                                        {/* Mock Compound Controls */}
                                        {node.prompts && (
                                            <div className="mt-2 flex gap-2">
                                                {node.prompts.map(p => (
                                                    <span key={p} className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full border border-pink-100">{p}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Add Button */}
                            <div className="h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-10 left-0 right-0 z-10">
                                <div className="flex gap-2">
                                    <button onClick={() => onAddNode('message')} className="bg-gray-900 text-white rounded-full p-1.5 shadow-lg"><Plus size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Action Button for Picker - Only in Builder Mode */}
            {!previewMode && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${pickerOpen ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <button
                        onClick={() => setPickerOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 font-medium text-sm"
                    >
                        <Plus size={18} />
                        <span>Insert Component</span>
                    </button>
                </div>
            )}

            {/* The Picker Overlay */}
            {pickerOpen && (
                <>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200" onClick={() => setPickerOpen(false)} />
                    <ComponentPicker
                        onClose={() => setPickerOpen(false)}
                        onSelect={(type) => {
                            onAddNode(type);
                            setPickerOpen(false);
                        }}
                    />
                </>
            )}
        </div>
    );
};
