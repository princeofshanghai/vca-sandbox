import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Flag, RotateCcw, Split } from 'lucide-react';
import { ShellButton, ShellPopoverContent } from '@/components/shell';
import { cn } from '@/utils/cn';

interface EndOfFlowBannerProps {
    onRestart: () => void;
    onRestartFromPath?: () => void;
    className?: string;
}

export function EndOfFlowBanner({
    onRestart,
    onRestartFromPath,
    className,
}: EndOfFlowBannerProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const shouldShowRestartOptions = !!onRestartFromPath;

    const handleRestart = () => {
        setIsMenuOpen(false);
        onRestart();
    };

    const handleRestartFromPath = () => {
        if (!onRestartFromPath) return;

        setIsMenuOpen(false);
        onRestartFromPath();
    };

    return (
        <div
            className={cn(
                'w-full animate-in fade-in-0 slide-in-from-bottom-2 rounded-xl border border-shell-success-border bg-shell-success-soft px-4 py-3 shadow-sm duration-300',
                className
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-1.5 text-shell-success-text">
                    <Flag size={13} className="shrink-0" />
                    <p className="min-w-0 text-[13px] font-medium">End of flow</p>
                </div>

                {shouldShowRestartOptions ? (
                    <Popover.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <Popover.Trigger asChild>
                            <ShellButton
                                variant="outline"
                                size="compact"
                                className="shrink-0 gap-1.5 border-shell-border bg-shell-bg text-shell-muted-strong shadow-sm hover:bg-shell-surface hover:text-shell-text"
                                aria-expanded={isMenuOpen}
                            >
                                Restart from...
                                <ChevronDown
                                    size={12}
                                    className={cn('shrink-0 transition-transform', isMenuOpen ? 'rotate-180' : '')}
                                />
                            </ShellButton>
                        </Popover.Trigger>

                        <ShellPopoverContent
                            tone="default"
                            side="top"
                            align="end"
                            sideOffset={10}
                            collisionPadding={12}
                            className="w-[220px] border-shell-border bg-shell-bg p-1.5"
                        >
                            <div className="flex flex-col gap-1">
                                <ShellButton
                                    variant="ghost"
                                    size="compact"
                                    onClick={handleRestart}
                                    className="h-auto justify-start gap-2 rounded-lg px-2.5 py-2 text-left"
                                >
                                    <RotateCcw size={12} className="shrink-0" />
                                    From beginning
                                </ShellButton>

                                <ShellButton
                                    variant="ghost"
                                    size="compact"
                                    onClick={handleRestartFromPath}
                                    className="h-auto justify-start gap-2 rounded-lg px-2.5 py-2 text-left"
                                >
                                    <Split size={12} className="shrink-0" />
                                    From a path
                                </ShellButton>
                            </div>
                        </ShellPopoverContent>
                    </Popover.Root>
                ) : (
                    <ShellButton
                        variant="outline"
                        size="compact"
                        onClick={onRestart}
                        className="shrink-0 gap-1.5 border-shell-border bg-shell-bg text-shell-muted-strong shadow-sm hover:bg-shell-surface hover:text-shell-text"
                    >
                        <RotateCcw size={12} className="shrink-0" />
                        Restart
                    </ShellButton>
                )}
            </div>
        </div>
    );
}
