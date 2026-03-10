import { cn } from '@/utils/cn';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Globe, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Flow } from '../../studio/types';
import { supabase } from '@/lib/supabase';
import { ShellButton, ShellIconButton } from '@/components/shell';

type ShareLinkType = 'prototype' | 'studio';

interface ShareDialogProps {
    children: React.ReactNode;
    flow: Flow;
    onUpdateFlow?: (flow: Flow) => void;
    enabledLinkTypes?: ShareLinkType[];
    title?: string;
    linkLabelOverrides?: Partial<Record<ShareLinkType, string>>;
}

const getShareUrl = (flowId: string, linkType: ShareLinkType) => {
    if (linkType === 'studio') {
        return `${window.location.origin}/share/studio/${flowId}`;
    }

    return `${window.location.origin}/share/${flowId}`;
};

const getIdleButtonLabel = (linkType: ShareLinkType) =>
    linkType === 'studio' ? 'Copy studio link' : 'Copy prototype link';

const getSuccessButtonLabel = (linkType: ShareLinkType) =>
    linkType === 'studio' ? 'Copied studio link!' : 'Copied prototype link!';

export function ShareDialog({
    children,
    flow,
    onUpdateFlow,
    enabledLinkTypes = ['prototype', 'studio'],
    title = 'Share project',
    linkLabelOverrides,
}: ShareDialogProps) {
    const [copyingType, setCopyingType] = useState<ShareLinkType | null>(null);
    const [copiedType, setCopiedType] = useState<ShareLinkType | null>(null);

    const handleCopyLink = async (linkType: ShareLinkType) => {
        setCopyingType(linkType);
        if (!flow.is_public) {
            const { error } = await supabase.from('flows').update({ is_public: true }).eq('id', flow.id);
            if (error) {
                console.error("Error making flow public", error);
                setCopyingType(null);
                return;
            }

            if (onUpdateFlow) {
                onUpdateFlow({ ...flow, is_public: true });
            }
        }

        const url = getShareUrl(flow.id, linkType);
        await navigator.clipboard.writeText(url);

        setCopyingType(null);
        setCopiedType(linkType);
        setTimeout(() => {
            setCopiedType((current) => (current === linkType ? null : current));
        }, 2000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent hideClose className="sm:max-w-[420px] p-0 gap-0 overflow-hidden bg-shell-bg dark:bg-shell-surface border-shell-border shadow-2xl rounded-xl">
                <DialogHeader className="p-3 px-4 border-b border-shell-border flex flex-row items-center justify-between gap-4 h-[52px]">
                    <DialogTitle className="text-[14px] font-medium text-shell-text shrink-0">{title}</DialogTitle>

                    <DialogClose asChild>
                        <ShellIconButton aria-label="Close share dialog" className="-mr-1">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="sr-only">Close</span>
                        </ShellIconButton>
                    </DialogClose>
                </DialogHeader>

                <div className="p-4 space-y-5">
                    {/* Access List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-sm bg-shell-surface-subtle flex items-center justify-center border border-shell-border-subtle shadow-sm">
                                    <Globe size={14} className="text-shell-muted" />
                                </div>
                                <div>
                                    <div className="text-[13px] font-medium text-shell-text">Anyone with link</div>
                                    <div className="text-[11px] text-shell-muted">Public access</div>
                                </div>
                            </div>
                            <span className="text-[12px] text-shell-muted font-medium px-1">can view</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 px-4 border-t border-shell-border">
                    <div className="flex flex-col gap-2">
                        {enabledLinkTypes.map((linkType, index) => {
                            const isCopying = copyingType === linkType;
                            const isCopied = copiedType === linkType;
                            const isPrimary = index === 0;

                            return (
                                <ShellButton
                                    key={linkType}
                                    size="sm"
                                    variant={isPrimary || isCopied ? 'default' : 'outline'}
                                    onClick={() => void handleCopyLink(linkType)}
                                    className={cn(
                                        "w-full shadow-sm transition-all text-[13px] h-9",
                                        isCopied
                                            ? "bg-green-600 hover:bg-green-700 text-white"
                                            : isPrimary
                                                ? ""
                                                : "text-shell-muted-strong"
                                    )}
                                >
                                    {isCopying ? (
                                        <Loader2 size={14} className="animate-spin mr-2" />
                                    ) : null}
                                    {isCopied
                                        ? getSuccessButtonLabel(linkType)
                                        : (linkLabelOverrides?.[linkType] || getIdleButtonLabel(linkType))}
                                </ShellButton>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
