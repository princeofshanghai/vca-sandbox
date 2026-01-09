import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { SmartEntryForm, SmartCollectForm, SmartActionForm, SmartResponseForm, SmartFollowUpForm } from './smart-node-forms';

interface PropertiesPanelProps {
    selectedNode: Node | null;
    onNodeChange: (id: string, data: Record<string, unknown>) => void;
    selectedEdge: Edge | null;
    onEdgeChange: (id: string, data: Record<string, unknown>) => void;
}

export const PropertiesPanel = ({ selectedNode, onNodeChange, selectedEdge, onEdgeChange }: PropertiesPanelProps) => {

    // Helper to update node data
    const handleNodeUpdate = (data: Record<string, unknown>) => {
        if (selectedNode) {
            onNodeChange(selectedNode.id, { ...selectedNode.data, ...data });
        }
    };

    // Helper for legacy generic inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (selectedNode) {
            onNodeChange(selectedNode.id, {
                ...selectedNode.data,
                [e.target.name]: e.target.value,
            });
        }
    };

    // Edge updates
    const handleEdgeChangeEvents = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (selectedEdge) {
            onEdgeChange(selectedEdge.id, {
                ...selectedEdge.data,
                [e.target.name]: e.target.value,
            });
        }
    };

    // Case 1: Nothing Selected
    if (!selectedNode && !selectedEdge) {
        return null;
    }

    // Case 2: Edge Selected
    if (selectedEdge) {
        return (
            <aside className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Connection</h2>
                    <p className="text-xs text-gray-500 mt-1">Editing Edge</p>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Keywords
                        </label>
                        <p className="text-[10px] text-gray-500 mb-1">Comma adjusted (e.g. bill, invoice)</p>
                        <input
                            type="text"
                            name="keywords"
                            value={(selectedEdge.data?.keywords as string) || ''}
                            onChange={handleEdgeChangeEvents}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="bill, invoice, cost..."
                        />
                    </div>
                </div>
            </aside>
        );
    }

    // Case 3: Node Selected
    if (selectedNode) {
        return (
            <aside className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Properties</h2>
                    <p className="text-xs text-gray-500 mt-1">Editing {selectedNode.type}</p>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto flex-1">

                    {/* Smart Node Forms */}
                    {selectedNode.type === 'smart-entry' && (
                        <SmartEntryForm
                            data={selectedNode.data as any}
                            onChange={handleNodeUpdate}
                        />
                    )}

                    {selectedNode.type === 'smart-collect' && (
                        <SmartCollectForm
                            data={selectedNode.data as any}
                            onChange={handleNodeUpdate}
                        />
                    )}

                    {selectedNode.type === 'smart-action' && (
                        <SmartActionForm
                            data={selectedNode.data as any}
                            onChange={handleNodeUpdate}
                        />
                    )}

                    {selectedNode.type === 'smart-response' && (
                        <SmartResponseForm
                            data={selectedNode.data as any}
                            onChange={handleNodeUpdate}
                        />
                    )}

                    {selectedNode.type === 'smart-follow-up' && (
                        <SmartFollowUpForm
                            data={selectedNode.data as any}
                            onChange={handleNodeUpdate}
                        />
                    )}

                    {/* Check if it is a Smart Node type, if not show generic label editor (Legacy) */}
                    {!selectedNode.type?.startsWith('smart-') && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Label
                                </label>
                                <input
                                    type="text"
                                    name="label"
                                    value={(selectedNode.data.label as string) || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {selectedNode.type === 'message' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Message Content
                                    </label>
                                    <textarea
                                        name="content"
                                        rows={4}
                                        value={(selectedNode.data.content as string) || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Type the bot's message..."
                                    />
                                </div>
                            )}

                            {selectedNode.type === 'start' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Disclaimer Text
                                        </label>
                                        <textarea
                                            name="disclaimerText"
                                            rows={2}
                                            value={(selectedNode.data.disclaimerText as string) || ''}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Greeting Message
                                        </label>
                                        <textarea
                                            name="greetingText"
                                            rows={3}
                                            value={(selectedNode.data.greetingText as string) || ''}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Initial Prompts
                                        </label>
                                        <textarea
                                            name="initialPrompts"
                                            rows={4}
                                            value={(selectedNode.data.initialPrompts as string) || ''}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                                This is a legacy node type. Consider replacing with Smart Nodes.
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        );
    }

    return null;
};
