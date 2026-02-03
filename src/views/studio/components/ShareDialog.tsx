import { cn } from '@/utils/cn';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Flow } from '../../studio/types';
import { supabase } from '@/lib/supabase';

interface ShareDialogProps {
    children: React.ReactNode;
    flow: Flow;
    onUpdateFlow?: (flow: Flow) => void;
}

export function ShareDialog({ children, flow }: ShareDialogProps) {
    const [isCopying, setIsCopying] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const handleCopyLink = async () => {
        setIsSharing(true);
        if (!flow.is_public) {
            const { error } = await supabase.from('flows').update({ is_public: true }).eq('id', flow.id);
            if (error) {
                console.error("Error making flow public", error);
                setIsSharing(false);
                return;
            }
        }

        const url = `${window.location.origin}/share/${flow.id}`;
        await navigator.clipboard.writeText(url);

        setIsSharing(false);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent hideClose className="sm:max-w-[420px] p-0 gap-0 overflow-hidden bg-white border-0 shadow-2xl rounded-xl">
                <DialogHeader className="p-3 px-4 border-b flex flex-row items-center justify-between gap-4 h-[52px]">
                    <DialogTitle className="text-[14px] font-medium text-gray-900 shrink-0">Share this prototype</DialogTitle>

                    <DialogClose className="h-8 w-8 -mr-1 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <div className="p-4 space-y-5">
                    {/* Access List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-sm bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                                    <Globe size={14} className="text-gray-500" />
                                </div>
                                <div>
                                    <div className="text-[13px] font-medium text-gray-900">Anyone with link</div>
                                    <div className="text-[11px] text-gray-400">Public access</div>
                                </div>
                            </div>
                            <span className="text-[12px] text-gray-500 font-medium px-1">can view</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 px-4 border-t bg-gray-50/50">
                    <Button
                        onClick={handleCopyLink}
                        className={cn(
                            "w-full shadow-sm font-medium transition-all text-[13px] h-9",
                            isCopying
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                    >
                        {isSharing ? (
                            <Loader2 size={14} className="animate-spin mr-2" />
                        ) : null}
                        {isCopying ? "Copied prototype link!" : "Copy prototype link"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
