import { useState } from 'react';
import { ENTRY_POINTS, EntryPointId } from '@/utils/entryPoints';
import { Flow } from '@/views/studio/types';
import { Button } from '@/components/ui/button';

interface NewFlowDialogProps {
    onCreateFlow: (flow: Flow) => void;
    onClose: () => void;
}

// Define explicit order for display
const ENTRY_POINT_ORDER: EntryPointId[] = [
    'flagship',
    'admin-center',
    'recruiter',
    'campaign-manager',
    'sales-navigator',
    'learning'
];

export function NewFlowDialog({ onCreateFlow, onClose }: NewFlowDialogProps) {
    const [selectedEntryPoint, setSelectedEntryPoint] = useState<EntryPointId>('flagship');

    const handleCreate = () => {
        // Import here to avoid circular dependency
        import('@/utils/flowCreation').then(({ createNewFlow }) => {
            const newFlow = createNewFlow(selectedEntryPoint);
            onCreateFlow(newFlow);
            onClose();
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-[1px]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[320px] p-5 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Create project</h2>

                <div className="space-y-1 mb-6">
                    <label className="block text-xs font-medium text-gray-500 mb-2 px-1">
                        Choose entry point
                    </label>

                    {ENTRY_POINT_ORDER.map((id) => {
                        const config = ENTRY_POINTS[id];
                        // Skip if config is missing (safety check)
                        if (!config) return null;

                        return (
                            <label
                                key={id}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all border ${selectedEntryPoint === id
                                    ? 'bg-blue-50/50 border-blue-100 text-blue-700'
                                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100 text-gray-600'
                                    }`}
                            >
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${selectedEntryPoint === id ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                                    }`}>
                                    {selectedEntryPoint === id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <input
                                    type="radio"
                                    name="entryPoint"
                                    value={id}
                                    checked={selectedEntryPoint === id}
                                    onChange={(e) => setSelectedEntryPoint(e.target.value as EntryPointId)}
                                    className="hidden" // Hide native radio
                                />
                                <span className="text-xs font-medium">{config.productName}</span>
                            </label>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 border border-gray-200 h-8 font-normal"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium"
                    >
                        Create project
                    </Button>
                </div>
            </div>
        </div>
    );
}
