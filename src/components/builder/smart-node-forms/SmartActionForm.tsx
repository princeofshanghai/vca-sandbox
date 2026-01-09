import React from 'react';
import { SmartActionNodeData } from '@/types/smartFlow';

interface SmartActionFormProps {
    data: SmartActionNodeData;
    onChange: (data: Partial<SmartActionNodeData>) => void;
}

export const SmartActionForm: React.FC<SmartActionFormProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Action ID
                </label>
                <input
                    type="text"
                    value={data.actionId || ''}
                    onChange={(e) => onChange({ actionId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="e.g. remove_license_api"
                />
                <p className="text-[10px] text-gray-500">
                    The system action identifier to execute.
                </p>
            </div>
        </div>
    );
};
