import React from 'react';
import { SmartCollectNodeData, SmartSlot } from '@/types/smartFlow';
import { Plus, Trash2 } from 'lucide-react';

interface SmartCollectFormProps {
    data: SmartCollectNodeData;
    onChange: (data: Partial<SmartCollectNodeData>) => void;
}

export const SmartCollectForm: React.FC<SmartCollectFormProps> = ({ data, onChange }) => {
    const slots = data.slots || [];

    const updateSlot = (index: number, field: keyof SmartSlot, value: any) => {
        const newSlots = [...slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        onChange({ slots: newSlots });
    };

    const addSlot = () => {
        const newSlot: SmartSlot = {
            id: `s-${Date.now()}`,
            variable: 'new_var',
            type: 'text',
            question: 'What is the value?'
        };
        onChange({ slots: [...slots, newSlot] });
    };

    const removeSlot = (index: number) => {
        const newSlots = slots.filter((_, i) => i !== index);
        onChange({ slots: newSlots });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Collection ID
                </label>
                <input
                    type="text"
                    value={data.collectId || ''}
                    onChange={(e) => onChange({ collectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. collect-info"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Slots
                    </label>
                    <button
                        onClick={addSlot}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                        <Plus size={12} /> Add Slot
                    </button>
                </div>

                <div className="space-y-3">
                    {slots.map((slot, index) => (
                        <div key={slot.id || index} className="bg-gray-50 p-3 rounded-md border border-gray-200 relative group">
                            <button
                                onClick={() => removeSlot(index)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>

                            <div className="space-y-2">
                                <div>
                                    <label className="text-[10px] text-gray-500 font-medium">Variable Name</label>
                                    <input
                                        type="text"
                                        value={slot.variable}
                                        onChange={(e) => updateSlot(index, 'variable', e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-medium">Type</label>
                                    <select
                                        value={slot.type}
                                        onChange={(e) => updateSlot(index, 'type', e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="text">Text</option>
                                        <option value="person">Person (Mock)</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-medium">Question</label>
                                    <input
                                        type="text"
                                        value={slot.question}
                                        onChange={(e) => updateSlot(index, 'question', e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {slots.length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 rounded border border-dashed border-gray-200">
                            No slots defined
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
