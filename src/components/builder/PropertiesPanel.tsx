import React from 'react';
import { Node } from '@xyflow/react';

interface PropertiesPanelProps {
    selectedNode: Node | null;
    onNodeChange: (id: string, data: Record<string, unknown>) => void;
}

export const PropertiesPanel = ({ selectedNode, onNodeChange }: PropertiesPanelProps) => {
    if (!selectedNode) {
        return (
            <aside className="w-80 bg-white border-l border-gray-200 h-full p-6 flex flex-col items-center justify-center text-center">
                <div className="text-gray-400 mb-2">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">No Node Selected</h3>
                <p className="text-sm text-gray-500 mt-1">Click on a node to edit its properties</p>
            </aside>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onNodeChange(selectedNode.id, {
            ...selectedNode.data,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <aside className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Properties</h2>
                <p className="text-xs text-gray-500 mt-1">Editing {selectedNode.type}</p>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
            </div>
        </aside>
    );
};
