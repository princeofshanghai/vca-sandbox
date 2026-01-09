import React from 'react';
import { SmartResponseNodeData, ComponentConfig } from '@/types/smartFlow';

interface SmartResponseFormProps {
    data: SmartResponseNodeData;
    onChange: (data: Partial<SmartResponseNodeData>) => void;
}

export const SmartResponseForm: React.FC<SmartResponseFormProps> = ({ data, onChange }) => {
    const handlePropChange = (key: string, value: any) => {
        onChange({
            component: {
                ...data.component,
                props: {
                    ...data.component.props,
                    [key]: value
                }
            }
        });
    };

    const handleTypeChange = (type: string) => {
        onChange({
            component: {
                ...data.component,
                type: type as ComponentConfig['type']
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Component Type
                </label>
                <select
                    value={data.component.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="Message">Standard Message</option>
                    <option value="InfoMessage">Info / Warning Card</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Content
                </label>
                <textarea
                    rows={4}
                    value={data.component.props.content || ''}
                    onChange={(e) => handlePropChange('content', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Message text (supports variables like $person)"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Message Style
                </label>
                <select
                    value={data.component.props.type || 'neutral'}
                    onChange={(e) => handlePropChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="neutral">Neutral</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>
            </div>
        </div>
    );
};
