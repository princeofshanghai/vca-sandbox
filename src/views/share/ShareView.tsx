import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Flow } from '@/views/studio/types';
import { FlowPreview } from '@/views/studio/FlowPreview';
import { PreviewSettingsMenu } from '@/views/studio/PreviewSettingsMenu';
import { Loader2, AlertCircle, RotateCcw, Home } from 'lucide-react';
import { INITIAL_FLOW } from '@/utils/flowStorage';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '../studio/components/ShareDialog';

export const ShareView = () => {
    const { id } = useParams<{ id: string }>();
    const [flow, setFlow] = useState<Flow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Display State
    const [isMobile, setIsMobile] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    useEffect(() => {
        const fetchFlow = async () => {
            if (!id) return;

            try {
                const { data, error } = await supabase
                    .from('flows')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error("Flow not found");

                const loadedFlow: Flow = {
                    ...INITIAL_FLOW,
                    id: data.id,
                    title: data.title,
                    blocks: data.content?.blocks || [],
                    steps: data.content?.steps || [],
                    connections: data.content?.connections || [],
                    settings: data.content?.settings || INITIAL_FLOW.settings,
                    lastModified: new Date(data.updated_at).getTime(),
                };

                setFlow(loadedFlow);
            } catch (err: unknown) {
                console.error("Error loading shared flow:", err);
                setError(err instanceof Error ? err.message : "This flow is either private or does not exist.");
            } finally {
                setLoading(false);
            }
        };

        fetchFlow();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
                <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </div>
        );
    }

    if (error || !flow) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E1E1E] p-4">
                <div className="bg-[#2C2C2C] p-8 rounded-2xl shadow-xl border border-white/5 max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <h1 className="text-xl font-semibold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-6">{error || "Unable to load flow."}</p>
                    <a href="/" className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#1E1E1E] overflow-hidden text-white font-sans">
            {/* Header - Figma Style */}
            <div className="h-12 bg-[#2C2C2C] flex items-center justify-between px-4 shrink-0 shadow-md z-50">
                {/* Left: Brand/Context */}
                <div className="flex items-center gap-4">
                    <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors" title="Return to Home">
                        <Home size={20} />
                    </a>
                </div>

                {/* Center: Title */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200">{flow.title}</span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-2 px-3 text-xs font-medium bg-transparent border border-white/20 text-gray-300 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-md transition-colors hidden sm:flex"
                        onClick={() => setResetKey(prev => prev + 1)}
                    >
                        <RotateCcw size={14} />
                        <span>Reset prototype</span>
                    </Button>

                    <PreviewSettingsMenu
                        flow={flow}
                        onUpdateFlow={setFlow}
                        isPremium={isPremium}
                        onTogglePremium={() => setIsPremium(!isPremium)}
                        isMobile={isMobile}
                        onToggleMobile={() => setIsMobile(!isMobile)}
                        darkTheme={true}
                    />

                    <ShareDialog flow={flow}>
                        <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700 h-7 px-3 text-xs font-medium border-0"
                        >
                            Share
                        </Button>
                    </ShareDialog>
                </div>
            </div>

            {/* Main Canvas - "Cinematic" Dark Mode */}
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
                {/* FlowPreview handles its own container/phone frame rendering */}
                {/* We just provide the centered context */}
                <div className="w-full h-full">
                    <FlowPreview
                        key={resetKey}
                        flow={flow}
                        isPremium={isPremium}
                        isMobile={isMobile}
                        variables={{}}
                        desktopPosition="bottom-right"
                    />
                </div>
            </div>
        </div>
    );
};

export default ShareView;
