import React from 'react';
import { SmartFollowUpNodeData } from '@/types/smartFlow';

interface SmartFollowUpFormProps {
    data: SmartFollowUpNodeData;
    onChange: (data: Partial<SmartFollowUpNodeData>) => void;
}

export const SmartFollowUpForm: React.FC<SmartFollowUpFormProps> = ({ data, onChange }) => {
    // Helper to treat suggestions array as newline-separated string
    const suggestionsText = (data.suggestions || []).join('\n');

    const handleSuggestionsChange = (text: string) => {
        const suggestions = text.split('\n').filter(s => s.trim() !== '');
        onChange({ suggestions });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Follow-up Question
                </label>
                <input
                    type="text"
                    value={data.text || ''}
                    onChange={(e) => onChange({ text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Is there anything else?"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Suggestions
                </label>
                <p className="text-[10px] text-gray-500 mb-1">One suggestion per line</p>
                <textarea
                    rows={4}
                    value={suggestionsText}
                    onChange={(e) => handleSuggestionsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Yes&#10;No&#10;Check Status"
                />
            </div>
        </div>
    );
};
