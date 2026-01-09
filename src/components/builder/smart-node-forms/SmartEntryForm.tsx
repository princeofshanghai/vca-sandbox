import React from 'react';
import { SmartEntryNodeData } from '@/types/smartFlow';

interface SmartEntryFormProps {
    data: SmartEntryNodeData;
    onChange: (data: Partial<SmartEntryNodeData>) => void;
}

export const SmartEntryForm: React.FC<SmartEntryFormProps> = ({ data, onChange }) => {
    const handleGreetingChange = (content: string) => {
        onChange({
            ...data,
            greetingConfig: {
                ...data.greetingConfig,
                props: { ...data.greetingConfig?.props, content }
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Entry Point ID
                </label>
                <input
                    type="text"
                    value={data.entryPointId || ''}
                    onChange={(e) => onChange({ entryPointId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. remove-license"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Greeting Message
                </label>
                <textarea
                    rows={3}
                    value={data.greetingConfig?.props?.content || ''}
                    onChange={(e) => handleGreetingChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Hi there! How can I help?"
                />
            </div>
        </div>
    );
};
