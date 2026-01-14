import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ScriptEditor } from './ScriptEditor';
import { FlowPreview } from './FlowPreview';
import { FlowToolbar } from './FlowToolbar';
import { Flow } from './types';
import { flowStorage, INITIAL_FLOW } from '@/utils/flowStorage';

export const StudioView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    // Initial State
    const [flow, setFlow] = useState<Flow>(INITIAL_FLOW);

    // Load Flow
    useEffect(() => {
        if (id) {
            const loaded = flowStorage.getFlow(id);
            if (loaded) {
                setFlow(loaded);
            } else {
                // If not found, maybe redirect or show error? 
                // For now, let's just initialize a new one with that ID? 
                // Or better, redirect back to dashboard if invalid.
                // But to be safe let's just create a new one in memory.
                console.warn(`Flow ${id} not found, initializing empty.`);
                setFlow({ ...INITIAL_FLOW, id });
            }
        }
        setIsLoading(false);
    }, [id]);

    // Persistence
    useEffect(() => {
        if (!isLoading && flow.id) {
            flowStorage.saveFlow(flow);
        }
    }, [flow, isLoading]);

    const [isPremium, setIsPremium] = useState(false);
    const [isMobile, setIsMobile] = useState(false);



    const handleBack = () => {
        navigate('/');
    };

    if (isLoading) return <div className="h-full flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-full overflow-hidden flex-col bg-white">
            {/* Toolbar Header */}
            <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-6 w-px bg-gray-200" />
                    <div className="flex flex-col">
                        <input
                            value={flow.title}
                            onChange={(e) => setFlow(prev => ({ ...prev, title: e.target.value }))}
                            className="font-semibold text-gray-700 bg-transparent hover:bg-gray-50 focus:bg-gray-50 px-2 py-0.5 -ml-2 rounded border-none focus:ring-0 text-sm w-64"
                            placeholder="Untitled Conversation"
                        />
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 px-0.5">
                            <span>{flow.blocks.length} steps</span>
                            <span>•</span>
                            <span>Last edited {new Date(flow.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>

                <FlowToolbar
                    flow={flow}
                    onLoadFlow={setFlow}
                    onUpdateFlow={setFlow}

                    isPremium={isPremium}
                    onTogglePremium={() => setIsPremium(!isPremium)}
                    isMobile={isMobile}
                    onToggleMobile={() => setIsMobile(!isMobile)}
                />
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Pane: Editor (Flexible width, min 400px) */}
                <div className="w-[500px] flex-shrink-0 border-r border-gray-200 h-full bg-white z-0">
                    <ScriptEditor flow={flow} onUpdateFlow={setFlow} />
                </div>

                {/* Right Pane: Preview (Fills remaining space) */}
                <div className="flex-1 bg-gray-100 h-full overflow-hidden relative">
                    <FlowPreview flow={flow} isPremium={isPremium} isMobile={isMobile} />
                </div>
            </div>
        </div>
    );
};

export default StudioView;
