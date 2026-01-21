import { useState } from 'react';
import { ENTRY_POINTS, EntryPointId } from '@/utils/entryPoints';
import { Flow } from '@/views/studio/types';

interface NewFlowDialogProps {
    onCreateFlow: (flow: Flow) => void;
    onClose: () => void;
}

export function NewFlowDialog({ onCreateFlow, onClose }: NewFlowDialogProps) {
    const [selectedEntryPoint, setSelectedEntryPoint] = useState<EntryPointId>('admin-center');

    const handleCreate = () => {
        // Import here to avoid circular dependency
        import('@/utils/flowCreation').then(({ createNewFlow }) => {
            const newFlow = createNewFlow(selectedEntryPoint);
            onCreateFlow(newFlow);
            onClose();
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Create new conversation</h2>

                <div className="space-y-2 mb-6">
                    <label className="block text-xs font-medium text-gray-600 mb-3">
                        Entry Point
                    </label>

                    {Object.entries(ENTRY_POINTS).map(([id, config]) => (
                        <label
                            key={id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition ${selectedEntryPoint === id
                                    ? 'bg-blue-50 text-blue-900'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="entryPoint"
                                value={id}
                                checked={selectedEntryPoint === id}
                                onChange={(e) => setSelectedEntryPoint(e.target.value as EntryPointId)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">{config.productName}</span>
                        </label>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Create flow
                    </button>
                </div>
            </div>
        </div>
    );
}
